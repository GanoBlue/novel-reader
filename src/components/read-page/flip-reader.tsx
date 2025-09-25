import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FlipReaderProps {
  content: string;
  currentPosition: number;
  onPositionChange: (position: number) => void;
  settings: {
    fontSize: number;
    lineHeight: number;
    theme: string;
  };
}

interface Page {
  content: string;
  startPosition: number;
  endPosition: number;
}

export const FlipReader: React.FC<FlipReaderProps> = ({
  content,
  currentPosition,
  onPositionChange,
  settings,
}) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 计算页面内容
  const calculatePages = useCallback(() => {
    if (!content || !containerRef.current) return [];

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 创建临时元素来测量文本
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    tempElement.style.width = `${containerWidth}px`;
    tempElement.style.fontSize = `${settings.fontSize}px`;
    tempElement.style.lineHeight = `${settings.lineHeight}`;
    tempElement.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    tempElement.style.padding = '20px';
    tempElement.style.boxSizing = 'border-box';

    document.body.appendChild(tempElement);

    const calculatedPages: Page[] = [];
    let currentPos = 0;
    let pageIndex = 0;

    while (currentPos < content.length) {
      // 尝试添加文本直到超出容器高度
      let testPos = currentPos;
      let lastValidPos = currentPos;

      // 按段落分割，避免在句子中间断页
      const paragraphs = content.slice(currentPos).split('\n');
      let accumulatedText = '';

      for (let i = 0; i < paragraphs.length; i++) {
        const testText = accumulatedText + paragraphs[i] + (i < paragraphs.length - 1 ? '\n' : '');
        tempElement.textContent = testText;

        if (tempElement.scrollHeight <= containerHeight) {
          lastValidPos = currentPos + testText.length;
          accumulatedText = testText;
        } else {
          break;
        }
      }

      // 如果没有找到合适的断点，强制分页
      if (lastValidPos === currentPos) {
        // 按字符逐步增加，找到合适的断点
        let charPos = currentPos;
        while (charPos < content.length && charPos - currentPos < 1000) {
          const testText = content.slice(currentPos, charPos + 1);
          tempElement.textContent = testText;

          if (tempElement.scrollHeight <= containerHeight) {
            lastValidPos = charPos + 1;
            charPos++;
          } else {
            break;
          }
        }
      }

      if (lastValidPos > currentPos) {
        calculatedPages.push({
          content: content.slice(currentPos, lastValidPos),
          startPosition: currentPos,
          endPosition: lastValidPos,
        });
        currentPos = lastValidPos;
        pageIndex++;
      } else {
        // 防止无限循环
        break;
      }
    }

    document.body.removeChild(tempElement);
    return calculatedPages;
  }, [content, settings.fontSize, settings.lineHeight]);

  // 初始化页面
  useEffect(() => {
    const calculatedPages = calculatePages();
    setPages(calculatedPages);

    // 找到当前阅读位置对应的页面
    const targetPageIndex = calculatedPages.findIndex(
      (page) => currentPosition >= page.startPosition && currentPosition < page.endPosition,
    );

    if (targetPageIndex !== -1) {
      setCurrentPageIndex(targetPageIndex);
    }
  }, [content, settings, calculatePages, currentPosition]);

  // 翻页动画
  const flipPage = useCallback(
    (direction: 'prev' | 'next') => {
      if (isTransitioning) return;

      setIsTransitioning(true);

      const newIndex =
        direction === 'next'
          ? Math.min(currentPageIndex + 1, pages.length - 1)
          : Math.max(currentPageIndex - 1, 0);

      if (newIndex !== currentPageIndex) {
        setCurrentPageIndex(newIndex);

        // 通知父组件位置变化
        const newPage = pages[newIndex];
        if (newPage) {
          onPositionChange(newPage.startPosition);
        }
      }

      // 动画完成后重置状态
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    },
    [currentPageIndex, pages, isTransitioning, onPositionChange],
  );

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'ArrowLeft' || event.code === 'PageUp') {
        event.preventDefault();
        flipPage('prev');
      } else if (event.code === 'ArrowRight' || event.code === 'PageDown') {
        event.preventDefault();
        flipPage('next');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [flipPage]);

  // 触摸手势处理
  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      const touch = event.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;

      const handleTouchMove = (moveEvent: TouchEvent) => {
        const moveTouch = moveEvent.touches[0];
        const deltaX = moveTouch.clientX - startX;
        const deltaY = moveTouch.clientY - startY;

        // 水平滑动距离大于垂直滑动距离时，处理翻页
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            flipPage('prev');
          } else {
            flipPage('next');
          }

          document.removeEventListener('touchmove', handleTouchMove);
          document.removeEventListener('touchend', handleTouchEnd);
        }
      };

      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    },
    [flipPage],
  );

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在计算页面...</p>
        </div>
      </div>
    );
  }

  const currentPage = pages[currentPageIndex];
  const prevPage = pages[currentPageIndex - 1];
  const nextPage = pages[currentPageIndex + 1];

  return (
    <div className="relative h-full overflow-hidden">
      {/* 页面容器 */}
      <div ref={containerRef} className="relative w-full h-full" onTouchStart={handleTouchStart}>
        {/* 上一页 */}
        {prevPage && (
          <div
            className={`absolute inset-0 transition-transform duration-300 ${
              isTransitioning ? '-translate-x-full' : 'translate-x-0'
            }`}
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              padding: '20px',
              boxSizing: 'border-box',
            }}
          >
            <div className="prose prose-lg max-w-none h-full overflow-hidden">
              {prevPage.content.split('\n').map((line, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {line || '\u00A0'}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* 当前页 */}
        <div
          className={`absolute inset-0 transition-transform duration-300 ${
            isTransitioning ? 'translate-x-full' : 'translate-x-0'
          }`}
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          <div className="prose prose-lg max-w-none h-full overflow-hidden">
            {currentPage.content.split('\n').map((line, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {line || '\u00A0'}
              </p>
            ))}
          </div>
        </div>

        {/* 下一页 */}
        {nextPage && (
          <div
            className="absolute inset-0 translate-x-full"
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              padding: '20px',
              boxSizing: 'border-box',
            }}
          >
            <div className="prose prose-lg max-w-none h-full overflow-hidden">
              {nextPage.content.split('\n').map((line, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {line || '\u00A0'}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 翻页按钮 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-4 bg-background/95 backdrop-blur rounded-lg border px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => flipPage('prev')}
            disabled={currentPageIndex === 0 || isTransitioning}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentPageIndex + 1} / {pages.length}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => flipPage('next')}
            disabled={currentPageIndex === pages.length - 1 || isTransitioning}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 页面指示器 */}
      <div className="absolute top-4 right-4">
        <div className="bg-background/95 backdrop-blur rounded-lg border px-3 py-1">
          <span className="text-xs text-muted-foreground">
            第 {currentPageIndex + 1} 页，共 {pages.length} 页
          </span>
        </div>
      </div>
    </div>
  );
};

