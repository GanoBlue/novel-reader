import React, {
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useMemo,
} from 'react';
import type { ReadingSettings } from '@/types/reading';
import { useIsMobile } from '@/hooks/use-mobile';

interface FlipReaderProps {
  paragraphs: string[];
  currentIndex: number;
  settings: ReadingSettings;
  onRangeChanged: (range: { startIndex: number; endIndex: number }) => void;
  onPageChange?: (pageIndex: number) => void;
}

export interface FlipReaderRef {
  goToPage: (pageIndex: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

interface PageContent {
  paragraphs: string[];
  startIndex: number;
  endIndex: number;
}

const FlipReader = forwardRef<FlipReaderRef, FlipReaderProps>(
  ({ paragraphs, currentIndex, settings, onRangeChanged, onPageChange }, ref) => {
    const isMobile = useIsMobile();
    const containerRef = useRef<HTMLDivElement>(null);

    const [isTwoColumn, setIsTwoColumn] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [pages, setPages] = useState<PageContent[]>([]);

    // 触摸相关状态
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const [touchCurrent, setTouchCurrent] = useState<{ x: number; y: number } | null>(null);
    const [slideOffset, setSlideOffset] = useState(0);

    // 计算是否应该使用双栏布局
    const shouldUseTwoColumn = useCallback(() => {
      if (!containerRef.current) return false;
      const [width, height] = [containerRef.current.offsetWidth, containerRef.current.offsetHeight];

      if (width < 960) return false;
      if (width < height * 1.2) return false;
      return true;
    }, []);

    // 简单的页面分组 - 避免复杂计算
    const generatePages = useCallback(() => {
      const newPages: PageContent[] = [];
      let currentIndex = 0;

      // 使用简单的固定大小分组，避免DOM测量
      const itemsPerPage = isTwoColumn ? 15 : 30;

      while (currentIndex < paragraphs.length) {
        const endIndex = Math.min(currentIndex + itemsPerPage, paragraphs.length);
        newPages.push({
          paragraphs: paragraphs.slice(currentIndex, endIndex),
          startIndex: currentIndex,
          endIndex,
        });
        currentIndex = endIndex;
      }

      setPages(newPages);
    }, [paragraphs, isTwoColumn]);

    // 翻页方法
    const nextPage = useCallback(() => {
      if (currentPage < pages.length - 1 && !isTransitioning) {
        setIsTransitioning(true);
        setCurrentPage((prev) => prev + 1);

        if (onPageChange) {
          onPageChange(currentPage + 1);
        }

        // 通知范围变化
        const page = pages[currentPage + 1];
        if (page) {
          onRangeChanged({
            startIndex: page.startIndex,
            endIndex: page.endIndex,
          });
        }

        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }
    }, [currentPage, pages, isTransitioning, onPageChange, onRangeChanged]);

    const prevPage = useCallback(() => {
      if (currentPage > 0 && !isTransitioning) {
        setIsTransitioning(true);
        setCurrentPage((prev) => prev - 1);

        if (onPageChange) {
          onPageChange(currentPage - 1);
        }

        // 通知范围变化
        const page = pages[currentPage - 1];
        if (page) {
          onRangeChanged({
            startIndex: page.startIndex,
            endIndex: page.endIndex,
          });
        }

        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }
    }, [currentPage, pages, isTransitioning, onPageChange, onRangeChanged]);

    const goToPage = useCallback(
      (pageIndex: number) => {
        if (pageIndex >= 0 && pageIndex < pages.length && !isTransitioning) {
          setIsTransitioning(true);
          setCurrentPage(pageIndex);

          if (onPageChange) {
            onPageChange(pageIndex);
          }

          // 通知范围变化
          const page = pages[pageIndex];
          if (page) {
            onRangeChanged({
              startIndex: page.startIndex,
              endIndex: page.endIndex,
            });
          }

          setTimeout(() => {
            setIsTransitioning(false);
          }, 300);
        }
      },
      [pages, isTransitioning, onPageChange, onRangeChanged],
    );

    // 暴露方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        goToPage,
        nextPage,
        prevPage,
      }),
      [goToPage, nextPage, prevPage],
    );

    // 触摸事件处理
    const handleTouchStart = useCallback(
      (e: React.TouchEvent) => {
        if (isTransitioning) return;
        const touch = e.touches[0];
        setTouchStart({ x: touch.clientX, y: touch.clientY });
        setTouchCurrent({ x: touch.clientX, y: touch.clientY });
      },
      [isTransitioning],
    );

    const handleTouchMove = useCallback(
      (e: React.TouchEvent) => {
        if (!touchStart || isTransitioning) return;
        e.preventDefault();

        const touch = e.touches[0];
        setTouchCurrent({ x: touch.clientX, y: touch.clientY });

        const deltaX = touch.clientX - touchStart.x;
        const deltaY = Math.abs(touch.clientY - touchStart.y);

        if (Math.abs(deltaX) > deltaY) {
          setSlideOffset(deltaX);
        }
      },
      [touchStart, isTransitioning],
    );

    const handleTouchEnd = useCallback(() => {
      if (!touchStart || !touchCurrent || isTransitioning) return;

      const deltaX = touchCurrent.x - touchStart.x;
      const deltaY = Math.abs(touchCurrent.y - touchStart.y);
      const threshold = 50;

      if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          prevPage();
        } else {
          nextPage();
        }
      }

      setTouchStart(null);
      setTouchCurrent(null);
      setSlideOffset(0);
    }, [touchStart, touchCurrent, isTransitioning, prevPage, nextPage]);

    // 键盘事件处理
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (isTransitioning) return;

        switch (e.key) {
          case 'ArrowLeft':
          case 'PageUp':
            e.preventDefault();
            prevPage();
            break;
          case 'ArrowRight':
          case 'PageDown':
            e.preventDefault();
            nextPage();
            break;
        }
      },
      [isTransitioning, prevPage, nextPage],
    );

    // 鼠标事件处理
    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        if (isTransitioning) return;

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const clickX = e.clientX - rect.left;
        const containerWidth = rect.width;

        if (clickX < containerWidth / 3) {
          prevPage();
        } else if (clickX > (containerWidth * 2) / 3) {
          nextPage();
        }
      },
      [isTransitioning, prevPage, nextPage],
    );

    // 初始化页面
    useEffect(() => {
      generatePages();
    }, [generatePages]);

    // 根据当前阅读位置计算对应的页面
    useEffect(() => {
      if (pages.length > 0 && currentIndex >= 0) {
        // 找到包含当前索引的页面
        const targetPage = pages.findIndex(
          (page) => currentIndex >= page.startIndex && currentIndex < page.endIndex,
        );

        if (targetPage !== -1) {
          setCurrentPage(targetPage);
        } else {
          // 如果找不到对应页面，根据位置比例计算
          const progress = currentIndex / paragraphs.length;
          const targetPageIndex = Math.floor(progress * pages.length);
          setCurrentPage(Math.min(targetPageIndex, pages.length - 1));
        }
      }
    }, [pages, currentIndex, paragraphs.length]);

    // 更新双栏状态
    useEffect(() => {
      const shouldUse = shouldUseTwoColumn();
      if (shouldUse !== isTwoColumn) {
        setIsTwoColumn(shouldUse);
        setTimeout(() => {
          generatePages();
          // 保持当前页面位置，重新计算对应页面
          if (pages.length > 0 && currentIndex >= 0) {
            const targetPage = pages.findIndex(
              (page) => currentIndex >= page.startIndex && currentIndex < page.endIndex,
            );
            if (targetPage !== -1) {
              setCurrentPage(targetPage);
            }
          }
        }, 100);
      }
    }, [shouldUseTwoColumn, isTwoColumn, generatePages, currentIndex, pages]);

    // 当段落内容变化时重置状态
    useEffect(() => {
      setIsTransitioning(false);
      // 只有在内容完全变化时才重置到第一页
      if (paragraphs.length > 0) {
        setCurrentPage(0);
      }
    }, [paragraphs.length]);

    // 渲染页面内容
    const renderPageContent = (pageContent: PageContent, isLeftColumn = false) => {
      return (
        <div
          className={`flex-1 ${isTwoColumn && isLeftColumn ? 'pr-2' : isTwoColumn ? 'pl-2' : ''}`}
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            fontFamily: settings.fontFamily,
            textAlign: settings.textAlign,
            paddingLeft: `${settings.paddingHorizontal}px`,
            paddingRight: `${settings.paddingHorizontal}px`,
          }}
        >
          {pageContent.paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-4 whitespace-pre-wrap">
              {paragraph || '\u00A0'}
            </p>
          ))}
        </div>
      );
    };

    if (pages.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">正在加载...</div>
        </div>
      );
    }

    const currentPageContent = pages[currentPage];
    const prevPageContent = currentPage > 0 ? pages[currentPage - 1] : null;
    const nextPageContent = currentPage < pages.length - 1 ? pages[currentPage + 1] : null;

    return (
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        tabIndex={0}
        style={{ outline: 'none' }}
      >
        {/* 页面容器 */}
        <div
          className="relative w-full h-full"
          style={{
            transform: `translateX(${slideOffset}px)`,
            transition: isTransitioning ? 'transform 0.3s ease-out' : 'none',
          }}
        >
          {/* 上一页 */}
          {prevPageContent && (
            <div
              className="absolute inset-0 flex"
              style={{
                transform: 'translateX(-100%)',
                zIndex: 1,
              }}
            >
              {isTwoColumn ? (
                <>
                  {renderPageContent(prevPageContent, true)}
                  {renderPageContent(prevPageContent, false)}
                </>
              ) : (
                renderPageContent(prevPageContent)
              )}
            </div>
          )}

          {/* 当前页 */}
          <div className="absolute inset-0 flex" style={{ zIndex: 2 }}>
            {isTwoColumn ? (
              <>
                {renderPageContent(currentPageContent, true)}
                {renderPageContent(currentPageContent, false)}
              </>
            ) : (
              renderPageContent(currentPageContent)
            )}
          </div>

          {/* 下一页 */}
          {nextPageContent && (
            <div
              className="absolute inset-0 flex"
              style={{
                transform: 'translateX(100%)',
                zIndex: 1,
              }}
            >
              {isTwoColumn ? (
                <>
                  {renderPageContent(nextPageContent, true)}
                  {renderPageContent(nextPageContent, false)}
                </>
              ) : (
                renderPageContent(nextPageContent)
              )}
            </div>
          )}
        </div>

        {/* 页面指示器 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentPage + 1} / {pages.length}
        </div>

        {/* 翻页按钮 */}
        {!isMobile && (
          <>
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity"
              onClick={prevPage}
              disabled={currentPage === 0 || isTransitioning}
            >
              ←
            </button>
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity"
              onClick={nextPage}
              disabled={currentPage === pages.length - 1 || isTransitioning}
            >
              →
            </button>
          </>
        )}
      </div>
    );
  },
);

FlipReader.displayName = 'FlipReader';

export default FlipReader;
