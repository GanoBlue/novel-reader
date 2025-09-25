import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookStore } from '@/store/book-store';
import { loadBookContentDB } from '@/services/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { InteractiveProgress } from '@/components/ui/interactive-progress';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Home,
  Menu,
  X,
  RotateCcw,
  RotateCw,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { FlipReader } from '@/components/read-page/flip-reader';
import { ReadingStats } from '@/components/read-page/reading-stats';
import { ChapterNavigation } from '@/components/read-page/chapter-navigation';
import {
  readingSettingsService,
  type ReadingSettings,
  defaultReadingSettings,
} from '@/services/reading-settings';
import { readingProgressService } from '@/services/reading-progress';
import { Virtuoso } from 'react-virtuoso';

export default function ReadPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { getBookById } = useBookStore();

  // 状态管理
  const [book, setBook] = useState<any>(null);
  const [content, setContent] = useState<string>('');
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showChapters, setShowChapters] = useState<boolean>(false);
  const [settings, setSettings] = useState<ReadingSettings>(defaultReadingSettings);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);

  // 引用
  const contentRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);
  const lastScrollTime = useRef<number>(0);
  const virtuosoRef = useRef<any>(null);

  // 文本按段拆分与段起始位置索引（用于精确保存进度）
  const paragraphs = useMemo(() => {
    if (!content) return [];
    return content.split('\n').filter((p) => p.trim() !== ''); // 过滤空段落
  }, [content]);

  const paragraphStarts = useMemo(() => {
    if (!content) return [];
    let acc = 0;
    const starts: number[] = [];
    content.split('\n').forEach((p) => {
      if (p.trim() !== '') {
        starts.push(acc);
      }
      acc += p.length + 1;
    });
    return starts;
  }, [content]);

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
      const bookContent = await loadBookContentDB(Number(bookId));
      if (bookContent) {
        setContent(bookContent);

        // 恢复阅读位置
        const savedProgress = readingProgressService.get(Number(bookId));
        if (savedProgress) {
          setCurrentPosition(savedProgress.position);
          console.log('恢复阅读进度:', savedProgress.progress + '%');
        } else {
          setCurrentPosition(0);
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

  // 保存阅读进度
  const saveProgress = useCallback(
    (position: number) => {
      if (!book || !content || !bookId) return;

      const progress = Math.round((position / content.length) * 100);

      // 更新本地状态
      setCurrentPosition(position);

      // 保存到本地存储
      readingProgressService.update(Number(bookId), position, content.length);

      console.log('保存阅读进度:', progress + '%');
    },
    [book, content, bookId],
  );

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    if (!contentRef.current || !content) return;

    const element = contentRef.current;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    // 计算当前阅读位置
    const progress = scrollTop / (scrollHeight - clientHeight);
    const position = Math.floor(progress * content.length);

    // 防抖保存进度
    const now = Date.now();
    if (now - lastScrollTime.current > 1000) {
      saveProgress(position);
      lastScrollTime.current = now;
    }
  }, [content, saveProgress]);

  // 自动滚动功能
  const startAutoScroll = useCallback(() => {
    if (!contentRef.current || isAutoScrolling) return;

    setIsAutoScrolling(true);
    let scrollPosition = contentRef.current.scrollTop;

    const scroll = () => {
      if (!contentRef.current || !isAutoScrolling) return;

      scrollPosition += settings.autoScrollSpeed;
      contentRef.current.scrollTop = scrollPosition;

      // 检查是否到达底部
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollTop >= scrollHeight - clientHeight - 10) {
        stopAutoScroll();
        return;
      }

      autoScrollRef.current = requestAnimationFrame(scroll);
    };

    autoScrollRef.current = requestAnimationFrame(scroll);
  }, [isAutoScrolling, settings.autoScrollSpeed]);

  const stopAutoScroll = useCallback(() => {
    setIsAutoScrolling(false);
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  // 键盘事件处理
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (showSettings || showMenu) return;

      switch (event.code) {
        case 'Escape':
          if (isAutoScrolling) {
            stopAutoScroll();
          } else {
            navigate('/');
          }
          break;
        case 'ArrowLeft':
        case 'PageUp':
          if (contentRef.current) {
            contentRef.current.scrollBy(0, -window.innerHeight * 0.8);
          }
          break;
        case 'ArrowRight':
        case 'PageDown':
          if (contentRef.current) {
            contentRef.current.scrollBy(0, window.innerHeight * 0.8);
          }
          break;
        case 'Space':
          event.preventDefault();
          if (isAutoScrolling) {
            stopAutoScroll();
          } else {
            startAutoScroll();
          }
          break;
        case 'KeyS':
          setShowSettings(true);
          break;
        case 'KeyM':
          setShowMenu(true);
          break;
        case 'KeyC':
          setShowChapters(true);
          break;
      }
    },
    [
      showSettings,
      showMenu,
      showChapters,
      isAutoScrolling,
      navigate,
      startAutoScroll,
      stopAutoScroll,
    ],
  );

  // 格式化文本内容
  const formatContent = useCallback((text: string) => {
    if (!text) return '';

    // 简单的文本格式化
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {line || '\u00A0'} {/* 非断行空格，保持空行 */}
      </p>
    ));
  }, []);

  // 计算阅读进度
  const getProgress = useCallback(() => {
    if (!content) return 0;
    return Math.round((currentPosition / content.length) * 100);
  }, [currentPosition, content]);

  // 处理进度条值变化
  const handleProgressChange = useCallback(
    (progress: number) => {
      if (!content || !virtuosoRef.current) return;

      // 计算目标位置
      const targetPosition = Math.floor((progress / 100) * content.length);

      // 计算目标段落索引
      const targetParagraphIndex = Math.floor((progress / 100) * paragraphs.length);

      // 跳转到目标位置
      virtuosoRef.current.scrollToIndex({
        index: Math.max(0, Math.min(targetParagraphIndex, paragraphs.length - 1)),
        align: 'start',
        behavior: 'smooth',
      });

      // 更新进度
      saveProgress(targetPosition);
    },
    [content, paragraphs.length, saveProgress],
  );

  // 加载设置
  const loadSettings = useCallback(() => {
    const savedSettings = readingSettingsService.get();
    setSettings(savedSettings);
  }, []);

  // 保存设置
  const saveSettings = useCallback((newSettings: ReadingSettings) => {
    setSettings(newSettings);
    readingSettingsService.save(newSettings);
  }, []);

  // 初始化
  useEffect(() => {
    loadSettings();
    loadBookData();
  }, [loadSettings, loadBookData]);

  // 键盘事件监听
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 清理自动滚动
  useEffect(() => {
    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
      }
    };
  }, []);

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

  if (!book || !content) {
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
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <Home className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-semibold text-sm truncate max-w-xs">{book.title}</h1>
              <p className="text-xs text-muted-foreground">{book.author}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setShowMenu(!showMenu)}>
              <Menu className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 进度条 */}
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>阅读进度</span>
            <span>{getProgress()}%</span>
          </div>
          <InteractiveProgress
            value={getProgress()}
            onValueChange={handleProgressChange}
            className="h-1"
          />
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex">
        {/* 阅读内容 */}
        <div className="flex-1">
          {settings.readingMode === 'scroll' ? (
            <div
              className="max-w-4xl mx-auto h-full"
              style={readingSettingsService.generateStyles(settings)}
            >
              {paragraphs.length > 0 ? (
                <Virtuoso
                  ref={virtuosoRef}
                  style={{
                    height: 'calc(100vh - 120px)',
                    minHeight: '400px',
                    // 隐藏滚动条
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none', // IE/Edge
                  }}
                  className="[&::-webkit-scrollbar]:hidden" // Chrome/Safari
                  totalCount={paragraphs.length}
                  itemContent={(index) => (
                    <div className="px-4 py-2" style={{ minHeight: '3rem' }}>
                      <p className="mb-4 leading-relaxed whitespace-pre-wrap">
                        {paragraphs[index]}
                      </p>
                    </div>
                  )}
                  // 使用固定高度提高滚动条精度
                  fixedItemHeight={48}
                  // 虚拟列表性能配置（优化滚动顺滑度）
                  overscan={5} // 减少预渲染项目，提高响应性
                  increaseViewportBy={100} // 减少视口扩展，提高滚动精度
                  // 滚动行为配置
                  followOutput={false} // 不跟随输出，避免意外滚动
                  alignToBottom={false} // 不底部对齐，保持正常阅读体验
                  // 事件处理
                  atBottomStateChange={(atBottom) => {
                    if (atBottom) {
                      // 到底部时记为已读到末尾
                      saveProgress(Math.max(0, content.length - 1));
                    }
                  }}
                  rangeChanged={({ startIndex, endIndex }) => {
                    // 改进进度计算：使用可见范围的中间位置
                    const midIndex = Math.floor((startIndex + endIndex) / 2);
                    const pos = paragraphStarts[midIndex] ?? paragraphStarts[startIndex] ?? 0;

                    // 减少防抖延迟，提高进度条顺滑度
                    const now = Date.now();
                    if (now - lastScrollTime.current > 100) {
                      saveProgress(pos);
                      lastScrollTime.current = now;
                    }
                  }}
                  // 添加实时滚动监听，提供更流畅的进度更新
                  onScroll={(e) => {
                    const target = e.target as HTMLElement;
                    const scrollTop = target.scrollTop;
                    const scrollHeight = target.scrollHeight;
                    const clientHeight = target.clientHeight;

                    if (scrollHeight > clientHeight) {
                      const progress = scrollTop / (scrollHeight - clientHeight);
                      const position = Math.floor(progress * content.length);

                      // 实时更新进度，提供更顺滑的体验
                      const now = Date.now();
                      if (now - lastScrollTime.current > 50) {
                        saveProgress(position);
                        lastScrollTime.current = now;
                      }
                    }
                  }}
                  // 初始位置恢复
                  initialTopMostItemIndex={Math.floor(
                    (currentPosition / content.length) * paragraphs.length,
                  )}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">正在加载内容...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full">
              <FlipReader
                content={content}
                currentPosition={currentPosition}
                onPositionChange={saveProgress}
                settings={settings}
              />
            </div>
          )}
        </div>

        {/* 侧边菜单 */}
        {showMenu && (
          <div className="w-80 bg-background border-l">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">阅读菜单</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowMenu(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-medium mb-2">快速操作</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        if (settings.readingMode === 'scroll' && virtuosoRef.current) {
                          // 虚拟列表模式：跳转到开头
                          virtuosoRef.current.scrollToIndex({
                            index: 0,
                            align: 'start',
                            behavior: 'smooth',
                          });
                          saveProgress(0);
                        } else if (contentRef.current) {
                          // 翻页模式：使用原有的滚动逻辑
                          contentRef.current.scrollTo(0, 0);
                        }
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      回到开头
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        if (settings.readingMode === 'scroll' && virtuosoRef.current) {
                          // 虚拟列表模式：跳转到最后
                          virtuosoRef.current.scrollToIndex({
                            index: paragraphs.length - 1,
                            align: 'end',
                            behavior: 'smooth',
                          });
                          saveProgress(Math.max(0, content.length - 1));
                        } else if (contentRef.current) {
                          // 翻页模式：使用原有的滚动逻辑
                          const { scrollHeight, clientHeight } = contentRef.current;
                          contentRef.current.scrollTo(0, scrollHeight - clientHeight);
                        }
                      }}
                    >
                      <RotateCw className="h-4 w-4 mr-2" />
                      跳到最后
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setShowChapters(true)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      章节导航
                    </Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium mb-2">自动滚动</h3>
                  <div className="space-y-2">
                    <Button
                      variant={isAutoScrolling ? 'default' : 'outline'}
                      size="sm"
                      className="w-full"
                      onClick={isAutoScrolling ? stopAutoScroll : startAutoScroll}
                    >
                      {isAutoScrolling ? '停止自动滚动' : '开始自动滚动'}
                    </Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium mb-2">阅读统计</h3>
                  <div className="space-y-2">
                    <ReadingStats />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* 章节导航面板 */}
        {showChapters && (
          <ChapterNavigation
            content={content}
            currentPosition={currentPosition}
            onNavigateToChapter={saveProgress}
            onClose={() => setShowChapters(false)}
          />
        )}

        {/* 设置面板 */}
        {showSettings && (
          <div className="w-80 bg-background border-l">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">阅读设置</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* 字体大小 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    字体大小: {settings.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={settings.fontSize}
                    onChange={(e) =>
                      saveSettings({
                        ...settings,
                        fontSize: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>

                {/* 行间距 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    行间距: {settings.lineHeight}
                  </label>
                  <input
                    type="range"
                    min="1.2"
                    max="2.0"
                    step="0.1"
                    value={settings.lineHeight}
                    onChange={(e) =>
                      saveSettings({
                        ...settings,
                        lineHeight: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>

                {/* 字体选择 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">字体</label>
                  <select
                    value={settings.fontFamily}
                    onChange={(e) =>
                      saveSettings({
                        ...settings,
                        fontFamily: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    {readingSettingsService.options.fonts.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 主题选择 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">主题</label>
                  <div className="grid grid-cols-2 gap-2">
                    {readingSettingsService.options.themes.map((theme) => (
                      <Button
                        key={theme.value}
                        variant={settings.theme === theme.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                          saveSettings({
                            ...settings,
                            theme: theme.value as any,
                          })
                        }
                        title={theme.description}
                      >
                        {theme.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 阅读模式 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">阅读模式</label>
                  <div className="space-y-2">
                    {readingSettingsService.options.modes.map((mode) => (
                      <Button
                        key={mode.value}
                        variant={settings.readingMode === mode.value ? 'default' : 'outline'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() =>
                          saveSettings({
                            ...settings,
                            readingMode: mode.value as any,
                          })
                        }
                        title={mode.description}
                      >
                        {mode.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 文本对齐 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">文本对齐</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'left', label: '左对齐' },
                      { value: 'center', label: '居中' },
                      { value: 'justify', label: '两端对齐' },
                    ].map((align) => (
                      <Button
                        key={align.value}
                        variant={settings.textAlign === align.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                          saveSettings({
                            ...settings,
                            textAlign: align.value as any,
                          })
                        }
                      >
                        {align.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 重置设置 */}
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      saveSettings(defaultReadingSettings);
                      toast.success('设置已重置');
                    }}
                  >
                    重置设置
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2 bg-background/95 backdrop-blur rounded-lg border px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (settings.readingMode === 'scroll' && virtuosoRef.current) {
                // 虚拟列表模式：向上滚动
                virtuosoRef.current.scrollBy({
                  top: -window.innerHeight * 0.8,
                  behavior: 'smooth',
                });
              } else if (contentRef.current) {
                // 翻页模式：使用原有的滚动逻辑
                contentRef.current.scrollBy(0, -window.innerHeight * 0.8);
              }
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={isAutoScrolling ? stopAutoScroll : startAutoScroll}
          >
            {isAutoScrolling ? '暂停' : '自动'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (settings.readingMode === 'scroll' && virtuosoRef.current) {
                // 虚拟列表模式：向下滚动
                virtuosoRef.current.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
              } else if (contentRef.current) {
                // 翻页模式：使用原有的滚动逻辑
                contentRef.current.scrollBy(0, window.innerHeight * 0.8);
              }
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

