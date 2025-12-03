import React, { useEffect, useRef, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ChapterMetadata } from '@/types/book';

interface ChapterNavigationProps {
  chapters: ChapterMetadata[];
  currentChapterIndex: number;
  onChapterSelect: (chapterIndex: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Memoized chapter item component for performance optimization
const ChapterItem = React.memo<{
  chapter: ChapterMetadata;
  index: number;
  isCurrent: boolean;
  onClick: (index: number, event: React.MouseEvent<HTMLButtonElement>) => void;
  forwardedRef?: React.Ref<HTMLButtonElement>;
}>(({ chapter, index, isCurrent, onClick, forwardedRef }) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
    onClick(index, event);
  };

  return (
    <button
      ref={forwardedRef}
      onClick={handleClick}
      className={cn(
        'w-full text-left px-4 py-3 rounded-lg transition-colors ml-2 mr-2',
        'hover:bg-muted/50',
        'focus:outline-none',
        isCurrent && 'bg-primary/5 text-primary font-medium',
      )}
    >
      <span className="text-sm flex-1 line-clamp-2">{chapter.title}</span>
    </button>
  );
});

ChapterItem.displayName = 'ChapterItem';

// Virtual scrolling component for large chapter lists
const VirtualChapterList: React.FC<{
  chapters: ChapterMetadata[];
  currentChapterIndex: number;
  onChapterClick: (index: number, event: React.MouseEvent<HTMLButtonElement>) => void;
  currentChapterRef: React.RefObject<HTMLButtonElement>;
}> = ({ chapters, currentChapterIndex, onChapterClick, currentChapterRef }) => {
  const ITEM_HEIGHT = 56; // Approximate height of each chapter item in pixels
  const BUFFER_SIZE = 5; // Number of items to render above and below visible area
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 20 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
      const end = Math.min(
        chapters.length,
        Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE,
      );

      setVisibleRange({ start, end });
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => container.removeEventListener('scroll', handleScroll);
  }, [chapters.length]);

  const visibleChapters = useMemo(() => {
    return chapters.slice(visibleRange.start, visibleRange.end).map((chapter, idx) => ({
      chapter,
      index: visibleRange.start + idx,
    }));
  }, [chapters, visibleRange]);

  const totalHeight = chapters.length * ITEM_HEIGHT;
  const offsetY = visibleRange.start * ITEM_HEIGHT;

  return (
    <div ref={containerRef} className="flex-1 overflow-auto -mx-4 px-4">
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }} className="space-y-1 pr-4">
          {visibleChapters.map(({ chapter, index }) => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              index={index}
              isCurrent={currentChapterIndex === index}
              onClick={onChapterClick}
              forwardedRef={currentChapterIndex === index ? currentChapterRef : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const ChapterNavigation: React.FC<ChapterNavigationProps> = ({
  chapters,
  currentChapterIndex,
  onChapterSelect,
  isOpen,
  onClose,
}) => {
  const currentChapterRef = useRef<HTMLButtonElement>(null);

  // Cache chapter metadata to avoid repeated calculations
  const chapterCount = useMemo(() => chapters.length, [chapters.length]);
  const useVirtualScrolling = useMemo(() => chapterCount > 100, [chapterCount]);

  // Handle empty chapters list
  if (chapterCount === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              章节目录
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">暂无章节信息</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Auto-scroll to current chapter when sidebar opens
  useEffect(() => {
    if (isOpen && currentChapterRef.current) {
      // Use setTimeout to ensure the DOM is fully rendered
      setTimeout(() => {
        currentChapterRef.current?.scrollIntoView({
          behavior: 'auto',
          block: 'nearest',
        });
      }, 150);
    }
  }, [isOpen]);

  const handleChapterClick = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    // Remove focus from button to prevent focus ring
    event.currentTarget.blur();
    onChapterSelect(index);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            章节目录
          </SheetTitle>
        </SheetHeader>

        {useVirtualScrolling ? (
          // Use virtual scrolling for large chapter lists (> 100 chapters)
          <VirtualChapterList
            chapters={chapters}
            currentChapterIndex={currentChapterIndex}
            onChapterClick={handleChapterClick}
            currentChapterRef={currentChapterRef}
          />
        ) : (
          // Use regular ScrollArea for smaller chapter lists
          <ScrollArea className="flex-1 mt-4 -mx-4 px-4">
            <div className="space-y-1 pr-4">
              {chapters.map((chapter, index) => (
                <ChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  index={index}
                  isCurrent={currentChapterIndex === index}
                  onClick={handleChapterClick}
                  forwardedRef={currentChapterIndex === index ? currentChapterRef : undefined}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
};

