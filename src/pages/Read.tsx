import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookStore } from '@/store/book-store';
import storage from '@/services/storage';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import FlipReader, { FlipReaderRef } from '../components/read-page/flip-reader';
import VirtualReader, { VirtualReaderRef } from '@/components/read-page/virtual-reader';
import { AutoHideHeader } from '@/components/read-page/auto-hide-header';
import { readingSettingsService, defaultReadingSettings } from '@/services/reading-settings';
import type { ReadingSettings } from '@/types/reading';
import { readingProgressService } from '@/services/reading-progress';
import { debounce } from 'lodash-es';

export default function Read() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { getBookById } = useBookStore();

  // 状态管理
  const [book, setBook] = useState<any>(null);
  const [content, setContent] = useState<string>(''); // 仅用于FlipReader和ChapterNavigation
  const [paragraphs, setParagraphs] = useState<string[]>([]); // 主要数据存储
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0); // 当前居中文字的index
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settings, setSettings] = useState<ReadingSettings>(defaultReadingSettings);

  // 引用
  const virtualReaderRef = useRef<VirtualReaderRef>(null);
  const flipReaderRef = useRef<FlipReaderRef>(null);

  // 加载书籍数据
  const loadBookData = useCallback(async () => {
    if (!bookId) return;
    try {
      setIsLoading(true);

      // 获取书籍元数据
      const bookData = getBookById(Number(bookId));
      if (!bookData) {
        toast.error('书籍不存在');
        navigate('/');
        return;
      }

      setBook(bookData);

      // 加载书籍内容
      const bookContent = await storage.getBookContent(Number(bookId));
      if (bookContent) {
        // 设置content（仅用于FlipReader和ChapterNavigation）
        setContent(bookContent);
        // 转换为段落数组（主要数据存储）
        const bookParagraphs = bookContent.split('\n');
        setParagraphs(bookParagraphs);

        // 恢复阅读位置（使用index）
        const savedProgress = await readingProgressService.get(Number(bookId));
        if (savedProgress) {
          // 直接使用保存的index
          const targetIndex = savedProgress.paraOffset;

          console.log('恢复阅读进度:', {
            paraOffset: savedProgress.paraOffset,
            progress: savedProgress.progress,
          });

          setCurrentPosition(savedProgress.progress / 100);
          setCurrentIndex(targetIndex);
        } else {
          setCurrentPosition(0);
          setCurrentIndex(0);
        }
      } else {
        toast.error('无法加载书籍内容');
      }
    } catch (error) {
      console.error('加载书籍失败:', error);
      toast.error('加载书籍失败');
    } finally {
      setIsLoading(false);
    }
  }, [bookId, getBookById, navigate]);

  // 保存阅读进度（使用index）
  const saveProgress = useCallback(
    async (index: number) => {
      if (!book || !bookId || !paragraphs.length) return;

      // 直接使用index保存进度
      await readingProgressService.update(Number(bookId), index, paragraphs.length);
    },
    [book, bookId, paragraphs.length],
  );

  // 创建防抖保存函数
  const debouncedSaveProgress = useCallback(
    debounce((index: number) => {
      saveProgress(index).catch(console.error);
    }, 500),
    [saveProgress],
  );

  // 处理范围变化
  const handleRangeChanged = useCallback(
    (range: { startIndex: number; endIndex: number }) => {
      // 更新本地状态，确保UI响应
      const relativePosition = range.endIndex / paragraphs.length;
      setCurrentPosition(relativePosition);
      setCurrentIndex(range.startIndex);

      debouncedSaveProgress(range.startIndex);
    },
    [paragraphs.length, debouncedSaveProgress],
  );

  // 计算阅读进度（保留小数点后两位）
  const getProgress = useCallback(() => {
    if (!paragraphs.length) return 0;
    return parseFloat(((currentIndex / paragraphs.length) * 100).toFixed(2));
  }, [currentIndex, paragraphs.length]);

  // 处理进度条值变化
  const handleProgressChange = useCallback(
    (progress: number) => {
      if (!paragraphs.length) return;

      // 使用VirtualReader的scrollToProgress方法
      if (virtualReaderRef.current) {
        virtualReaderRef.current.scrollToProgress(progress);
      }
    },
    [paragraphs.length],
  );

  // 加载设置
  const loadSettings = useCallback(async () => {
    const savedSettings = await readingSettingsService.get();
    setSettings(savedSettings);
  }, []);

  // 保存设置
  const saveSettings = useCallback(async (newSettings: ReadingSettings) => {
    setSettings(newSettings);
    await readingSettingsService.save(newSettings);
  }, []);

  // 初始化
  useEffect(() => {
    loadSettings();
    loadBookData();
  }, [loadSettings, loadBookData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在加载书籍...</p>
        </div>
      </div>
    );
  }

  if (!book || !paragraphs.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">书籍加载失败</p>
          <Button onClick={() => navigate('/')}>返回首页</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      {/* 自动隐藏的顶部栏 */}
      <AutoHideHeader
        book={book}
        onNavigateHome={() => navigate('/')}
        showSettings={showSettings}
        onSettingsToggle={() => setShowSettings(!showSettings)}
        settings={settings}
        onSettingsChange={saveSettings}
        progress={getProgress()}
        onProgressChange={handleProgressChange}
      />

      {/* 阅读内容 */}
      {settings.readingMode === 'scroll' ? (
        <div className="w-full h-full" style={readingSettingsService.generateStyles(settings)}>
          {paragraphs.length > 0 ? (
            <VirtualReader
              ref={virtualReaderRef}
              paragraphs={paragraphs}
              currentIndex={currentIndex}
              settings={settings}
              onRangeChanged={handleRangeChanged}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">正在加载内容...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full" style={readingSettingsService.generateStyles(settings)}>
          {paragraphs.length > 0 ? (
            <FlipReader
              ref={flipReaderRef}
              paragraphs={paragraphs}
              currentIndex={currentIndex}
              settings={settings}
              onRangeChanged={handleRangeChanged}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">正在加载内容...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

