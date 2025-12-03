import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookStore } from '@/store/book-store';
import storage from '@/services/storage';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import BlockVirtualReader, {
  BlockVirtualReaderRef,
} from '@/components/read-page/block-virtual-reader';
import type { Block } from '@/types/block';
import type { ChapterMetadata } from '@/types/book';
import { AutoHideHeader } from '@/components/read-page/auto-hide-header';
import { ChapterNavigation } from '@/components/read-page/chapter-navigation';
import { ChapterNavigationErrorBoundary } from '@/components/read-page/chapter-navigation-error-boundary';
import { readingSettingsService, defaultReadingSettings } from '@/services/reading-settings';
import type { ReadingSettings } from '@/types/reading';
import { readingProgressService } from '@/services/reading-progress';
import { debounce, throttle } from 'lodash-es';

export default function Read() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { getBookById } = useBookStore();

  // 状态管理
  const [book, setBook] = useState<any>(null);
  const [blocks, setBlocks] = useState<Block[]>([]); // Block 列表（统一格式）
  const [chapters, setChapters] = useState<ChapterMetadata[]>([]); // 章节元数据
  const [currentIndex, setCurrentIndex] = useState<number>(0); // 当前在页面中央显示的文字的索引
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settings, setSettings] = useState<ReadingSettings>(defaultReadingSettings);
  const [showChapterNav, setShowChapterNav] = useState<boolean>(false); // 章节导航侧边栏显示状态
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0); // 当前章节索引

  // 引用
  const readerRef = useRef<BlockVirtualReaderRef>(null);

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
            // 加载章节元数据（如果存在）
            if (Array.isArray(parsed.chapters)) {
              setChapters(parsed.chapters as ChapterMetadata[]);
            }
          } else {
            // 纯文本，转换为 Block 格式
            const lines = String(bookContent).split('\n');
            setBlocks(
              lines.map((t, i) => ({ id: `p-${i}`, type: 'paragraph', text: t })) as Block[],
            );
          }
        } catch {
          // 解析失败，当作纯文本处理
          const lines = String(bookContent).split('\n');
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
      if (!book || !bookId || !blocks.length) return;

      if (index <= 0) return;

      // 直接使用index保存进度
      await readingProgressService.update(Number(bookId), index, blocks.length);
    },
    [book, bookId, blocks.length],
  );

  // 创建防抖保存函数
  const debouncedSaveProgress = useCallback(
    debounce((index: number) => {
      saveProgress(index).catch(console.error);
    }, 500),
    [saveProgress],
  );

  // 使用二分查找优化章节索引查找性能
  const findChapterIndex = useCallback(
    (blockIndex: number): number => {
      if (chapters.length === 0) return -1;

      // 二分查找：找到最后一个 blockStartIndex <= blockIndex 的章节
      let left = 0;
      let right = chapters.length - 1;
      let result = -1;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (chapters[mid].blockStartIndex <= blockIndex) {
          result = mid;
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      return result;
    },
    [chapters],
  );

  // 更新章节索引（节流处理）
  const updateChapterIndex = useCallback(
    (blockIndex: number) => {
      if (chapters.length === 0) return;

      try {
        // 使用二分查找快速定位章节
        const chapterIndex = findChapterIndex(blockIndex);

        // 使用函数式更新，只在章节真正改变时更新状态
        setCurrentChapterIndex((prevIndex) => {
          if (chapterIndex !== -1 && chapterIndex !== prevIndex) {
            return chapterIndex;
          } else if (chapterIndex === -1 && chapters.length > 0 && prevIndex !== 0) {
            return 0;
          }
          return prevIndex;
        });
      } catch (err) {
        console.error('[ChapterNav] 更新当前章节索引失败:', err);
      }
    },
    [chapters, findChapterIndex],
  );

  // 创建节流函数用于更新章节索引
  const throttledUpdateChapterIndex = useCallback(
    throttle((blockIndex: number) => {
      updateChapterIndex(blockIndex);
    }, 200), // 每 200ms 最多执行一次
    [updateChapterIndex],
  );

  // 处理范围变化
  const handleRangeChanged = useCallback(
    (range: { startIndex: number; endIndex: number }) => {
      // 更新本地状态，确保UI响应
      setCurrentIndex(range.startIndex);

      // 防抖保存进度
      debouncedSaveProgress(range.startIndex);

      // 节流更新章节索引
      throttledUpdateChapterIndex(range.endIndex);
    },
    [debouncedSaveProgress, throttledUpdateChapterIndex],
  );

  // 计算阅读进度（保留小数点后两位）
  const getProgress = useCallback(() => {
    if (!blocks.length) return 0;
    return parseFloat(((currentIndex / blocks.length) * 100).toFixed(2));
  }, [currentIndex, blocks.length]);

  // 处理进度条值变化
  const handleProgressChange = useCallback(
    (progress: number) => {
      if (!blocks.length) return;
      readerRef.current?.scrollToProgress(progress);
    },
    [blocks.length],
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

  // 打开章节导航侧边栏
  const handleOpenChapterNav = useCallback(() => {
    setShowChapterNav(true);
  }, []);

  // 关闭章节导航侧边栏
  const handleCloseChapterNav = useCallback(() => {
    setShowChapterNav(false);
  }, []);

  // 处理章节选择（跳转到指定章节）
  const handleChapterSelect = useCallback(
    (chapterIndex: number) => {
      // 验证章节索引
      if (chapterIndex < 0 || chapterIndex >= chapters.length) {
        console.warn(`[ChapterNav] 无效的章节索引: ${chapterIndex}`);
        toast.error('无法跳转到该章节');
        return;
      }

      const chapter = chapters[chapterIndex];
      const targetIndex = chapter.blockStartIndex;

      // 验证目标索引
      if (targetIndex < 0 || targetIndex >= blocks.length) {
        console.warn(`[ChapterNav] 无效的目标索引: ${targetIndex}`);
        toast.error('章节位置无效');
        return;
      }

      // 检查章节是否为空
      if (chapter.blockStartIndex === chapter.blockEndIndex) {
        toast.warning('该章节内容为空');
      }

      // 跳转到章节起始位置
      try {
        readerRef.current?.scrollToIndex(targetIndex);
      } catch (err) {
        console.error('[ChapterNav] 跳转失败:', err);
        toast.error('跳转失败，请重试');
        return;
      }

      // 关闭侧边栏
      setShowChapterNav(false);
    },
    [chapters, blocks.length],
  );

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
    if (!book || !bookId || !blocks.length) return;

    if (currentIndex > 0) {
      await readingProgressService
        .update(Number(bookId), currentIndex, blocks.length)
        .catch(console.error);
    }
    // 结束阅读会话，计算并累加阅读时长
    await readingProgressService.endSession(Number(bookId)).catch(console.error);
  }, [book, bookId, currentIndex, blocks.length]);

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

  if (!book || !blocks.length) {
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
        onOpenChapterNav={handleOpenChapterNav}
        hasChapters={chapters.length > 0}
      />

      <div className="w-full h-full" style={readingSettingsService.generateStyles(settings)}>
        <BlockVirtualReader
          ref={readerRef}
          blocks={blocks}
          currentIndex={currentIndex}
          settings={settings}
          onRangeChanged={handleRangeChanged}
        />
      </div>

      {/* 章节导航侧边栏 */}
      {chapters.length > 0 && (
        <ChapterNavigationErrorBoundary>
          <ChapterNavigation
            chapters={chapters}
            currentChapterIndex={currentChapterIndex}
            onChapterSelect={handleChapterSelect}
            isOpen={showChapterNav}
            onClose={handleCloseChapterNav}
          />
        </ChapterNavigationErrorBoundary>
      )}
    </div>
  );
}

