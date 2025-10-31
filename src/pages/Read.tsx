import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookStore } from '@/store/book-store';
import storage from '@/services/storage';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import VirtualReader, { VirtualReaderRef } from '@/components/read-page/virtual-reader';
import BlockVirtualReader, {
  BlockVirtualReaderRef,
} from '@/components/read-page/block-virtual-reader';
import type { Block } from '@/types/block';
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
  const [paragraphs, setParagraphs] = useState<string[]>([]); // 文本段落
  const [blocks, setBlocks] = useState<Block[] | null>(null); // Block 列表（EPUB等）
  const [currentIndex, setCurrentIndex] = useState<number>(0); // 当前在页面中央显示的文字的索引
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settings, setSettings] = useState<ReadingSettings>(defaultReadingSettings);

  // 引用
  const virtualReaderRef = useRef<VirtualReaderRef>(null);
  const blockReaderRef = useRef<BlockVirtualReaderRef>(null);

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
        // 支持两种内容：纯文本（txt）或 Blocks(JSON)
        try {
          const parsed = JSON.parse(bookContent);
          if (parsed && parsed.__type === 'blocks' && Array.isArray(parsed.blocks)) {
            setBlocks(parsed.blocks as Block[]);
          } else {
            const lines = String(bookContent).split('\n');
            setParagraphs(lines);
            // 统一为 Block 渲染
            setBlocks(
              lines.map((t, i) => ({ id: `p-${i}`, type: 'paragraph', text: t })) as Block[],
            );
          }
        } catch {
          const lines = String(bookContent).split('\n');
          setParagraphs(lines);
          setBlocks(lines.map((t, i) => ({ id: `p-${i}`, type: 'paragraph', text: t })) as Block[]);
        }

        // 恢复阅读位置（使用index）
        const savedProgress = await readingProgressService.get(Number(bookId));
        if (savedProgress) {
          // 直接使用保存的index
          const targetIndex = savedProgress.paraOffset;
          setCurrentIndex(targetIndex);
        } else {
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
      if (!book || !bookId) return;

      // 计算内容总长度：优先使用 blocks，否则使用 paragraphs
      const contentLength = blocks ? blocks.length : paragraphs.length;
      if (!contentLength || index <= 0) return;

      // 直接使用index保存进度
      await readingProgressService.update(Number(bookId), index, contentLength);
    },
    [book, bookId, blocks, paragraphs.length],
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
      setCurrentIndex(range.startIndex);

      debouncedSaveProgress(range.startIndex);
    },
    [paragraphs.length, debouncedSaveProgress],
  );

  // 计算阅读进度（保留小数点后两位）
  const getProgress = useCallback(() => {
    const total = blocks ? blocks.length : paragraphs.length;
    if (!total) return 0;
    return parseFloat(((currentIndex / total) * 100).toFixed(2));
  }, [currentIndex, paragraphs.length, blocks]);

  // 处理进度条值变化
  const handleProgressChange = useCallback(
    (progress: number) => {
      const total = blocks ? blocks.length : paragraphs.length;
      if (!total) return;

      if (blocks) {
        blockReaderRef.current?.scrollToProgress(progress);
      } else {
        virtualReaderRef.current?.scrollToProgress(progress);
      }
    },
    [paragraphs.length, blocks],
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

  // 开始阅读会话（进入页面时）
  useEffect(() => {
    if (bookId) {
      readingProgressService.startSession(Number(bookId)).catch(console.error);
    }
  }, [bookId]);

  // 保存进度并结束会话（提取公共逻辑）
  const saveProgressAndEndSession = useCallback(async () => {
    if (!book || !bookId) return;

    const contentLength = blocks ? blocks.length : paragraphs.length;
    if (contentLength > 0 && currentIndex > 0) {
      await readingProgressService
        .update(Number(bookId), currentIndex, contentLength)
        .catch(console.error);
    }
    // 结束阅读会话，计算并累加阅读时长
    await readingProgressService.endSession(Number(bookId)).catch(console.error);
  }, [book, bookId, currentIndex, blocks, paragraphs.length]);

  // 页面离开时保存进度并结束阅读会话
  useEffect(() => {
    return () => {
      saveProgressAndEndSession();
    };
  }, [saveProgressAndEndSession]);

  // 处理页面可见性变化（用户切换标签页等）
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && bookId) {
        // 页面隐藏时，保存进度并结束会话
        saveProgressAndEndSession();
      } else if (!document.hidden && bookId) {
        // 页面重新可见时，开始新的会话
        readingProgressService.startSession(Number(bookId)).catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [bookId, saveProgressAndEndSession]);

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

  if (!book || (!blocks && !paragraphs.length)) {
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

      <div className="w-full h-full" style={readingSettingsService.generateStyles(settings)}>
        {blocks ? (
          <BlockVirtualReader
            ref={blockReaderRef}
            blocks={blocks}
            currentIndex={currentIndex}
            settings={settings}
            onRangeChanged={handleRangeChanged}
          />
        ) : paragraphs.length > 0 ? (
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
    </div>
  );
}

