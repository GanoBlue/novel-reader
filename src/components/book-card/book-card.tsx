import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useBookStore } from '@/store/book-store';
import { BookCover, BookFavorite, BookProgressInfo, TextWithTooltip } from '.';
import { formatTime } from '@/lib/time-utils';

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  cover: string;
  currentChapter: number;
  totalChapters: number;
  readingProgress?: {
    progress: number;
    paraOffset: number;
    lastReadAt: string;
    readingTime: number;
    currentChapter?: string;
  };
  variant?: 'library' | 'favorites' | 'history';
  displayMode?: 'grid' | 'list';
  lastRead?: string;
  totalTime?: number;
  readCount?: number;
  favoriteDate?: string;
  isFavorite?: boolean;
  onRead?: () => void;
  onFavorite?: () => void;
  className?: string;
}

export default function BookCard({
  id,
  title,
  author,
  cover,
  currentChapter,
  readingProgress,
  variant = 'library',
  displayMode = 'grid',
  totalTime,
  readCount,
  favoriteDate,
  isFavorite: propIsFavorite,
  onRead,
  onFavorite,
  className,
}: BookCardProps) {
  // 从store获取书籍的最新状态
  const { getBookById } = useBookStore();
  const book = getBookById(id);
  const currentIsFavorite = book?.isFavorite ?? propIsFavorite ?? false;
  // 网格模式
  if (displayMode === 'grid') {
    return (
      <Card
        className={cn('group hover:shadow-lg transition-shadow cursor-pointer relative', className)}
        onClick={onRead}
      >
        <CardContent className="pl-4 pr-4 -mb-2">
          {/* 右上角操作按钮 */}
          <BookFavorite
            isFavorite={currentIsFavorite}
            onFavorite={onFavorite}
            className="absolute top-2 right-2"
            variant="button"
          />

          {/* 书籍封面 */}
          <div className="flex items-center justify-center mb-3">
            <BookCover cover={cover} size="medium" />
          </div>

          <div className="text-center">
            {/* 标题 */}
            <TextWithTooltip
              text={title}
              className="font-medium text-foreground text-sm mb-1 group-hover:text-primary transition-colors"
            >
              <h3>{title}</h3>
            </TextWithTooltip>

            {/* 作者 */}
            <TextWithTooltip text={author} className="text-xs text-muted-foreground mb-2">
              <p>{author}</p>
            </TextWithTooltip>

            {/* 进度信息 */}
            <BookProgressInfo
              currentChapter={currentChapter}
              progress={readingProgress?.progress || 0}
              totalTime={totalTime}
              readCount={readCount}
              variant={variant}
              favoriteDate={favoriteDate}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 列表模式 - 更紧凑的布局
  return (
    <Card
      className={cn('hover:shadow-md transition-shadow cursor-pointer', className)}
      onClick={onRead}
    >
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          {/* 书籍封面 */}
          <BookCover
            cover={cover}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRead?.();
            }}
          />

          {/* 书籍信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              {/* 标题 */}
              <TextWithTooltip
                text={title}
                className="font-medium text-foreground text-sm cursor-pointer"
                maxWidth="max-w-[1000px]"
              >
                <h3
                  onClick={(e) => {
                    e.stopPropagation();
                    onRead?.();
                  }}
                >
                  {title}
                </h3>
              </TextWithTooltip>

              <span className="text-sm text-muted-foreground">·</span>

              {/* 作者 */}
              <TextWithTooltip
                text={author}
                className="text-sm text-muted-foreground"
                maxWidth="max-w-[120px]"
              >
                <span>{author}</span>
              </TextWithTooltip>

              {/* 收藏状态指示器 */}
              <BookFavorite
                isFavorite={currentIsFavorite}
                onFavorite={onFavorite}
                variant="indicator"
                showLabel={true}
              />
            </div>

            {/* 进度信息 */}
            <BookProgressInfo
              currentChapter={currentChapter}
              progress={readingProgress?.progress || 0}
              totalTime={totalTime}
              readCount={readCount}
              progressSize="small"
              displayMode="list"
              className="mt-2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

