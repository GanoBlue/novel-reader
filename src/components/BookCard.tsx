import { BookOpen, Settings, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useBookStore } from '@/store/book-store';

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  cover: string;
  currentChapter: number;
  totalChapters: number;
  progress: number;
  variant?: 'library' | 'favorites' | 'history';
  displayMode?: 'grid' | 'list';
  lastRead?: string;
  totalTime?: number;
  readCount?: number;
  favoriteDate?: string;
  isFavorite?: boolean;
  onRead?: () => void;
  onFavorite?: () => void;
  onSettings?: () => void;
  className?: string;
}

export function BookCard({
  id,
  title,
  author,
  cover,
  currentChapter,
  progress,
  variant = 'library',
  displayMode = 'grid',
  totalTime,
  readCount,
  favoriteDate,
  isFavorite: propIsFavorite,
  onRead,
  onFavorite,
  onSettings,
  className,
}: BookCardProps) {
  // 从store获取书籍的最新状态
  const { getBookById } = useBookStore();
  const book = getBookById(id);
  const currentIsFavorite = book?.isFavorite ?? propIsFavorite ?? false;

  // 格式化时间显示
  const formatTime = (minutes: number | undefined): string => {
    if (!minutes || minutes === 0) return '0分钟';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) {
      return `${mins}分钟`;
    } else if (mins === 0) {
      return `${hours}小时`;
    } else {
      return `${hours}小时${mins}分钟`;
    }
  };
  // 网格模式
  if (displayMode === 'grid') {
    return (
      <Card
        className={cn('group hover:shadow-lg transition-shadow cursor-pointer relative', className)}
        onClick={onRead}
      >
        <CardContent className="p-4">
          {/* 右上角操作按钮 */}
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* 设置按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onSettings?.();
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* 收藏按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 w-8 p-0',
                currentIsFavorite
                  ? 'text-destructive hover:text-destructive/80'
                  : 'text-muted-foreground hover:text-destructive',
              )}
              onClick={(e) => {
                e.stopPropagation();
                onFavorite?.();
              }}
            >
              <Heart className={cn('h-4 w-4', currentIsFavorite && 'fill-current')} />
            </Button>
          </div>

          <div className="flex items-center justify-center mb-3">
            <div
              className={cn(
                'w-20 h-28 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-md',
                cover,
              )}
            >
              <BookOpen className="text-white text-2xl" />
            </div>
          </div>
          <div className="text-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-medium text-foreground text-sm mb-1 group-hover:text-primary transition-colors truncate cursor-help max-w-full">
                    {title}
                  </h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs break-words">{title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-muted-foreground mb-2 truncate cursor-help max-w-full">
                    {author}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs break-words">{author}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* 进度信息 */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>第 {currentChapter} 章</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* 阅读信息 */}
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground mb-3">
              <span>时长: {formatTime(totalTime)}</span>
              <span>阅读: {readCount} 次</span>
            </div>

            {/* 收藏时间（收藏页面显示） */}
            {variant === 'favorites' && favoriteDate && (
              <div className="text-xs text-muted-foreground mb-3">收藏时间: {favoriteDate}</div>
            )}
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
          <div
            className={cn(
              'w-12 h-16 bg-gradient-to-br rounded flex items-center justify-center shadow-sm flex-shrink-0',
              cover,
            )}
            onClick={(e) => {
              e.stopPropagation();
              onRead?.();
            }}
          >
            <BookOpen className="text-white text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="font-medium text-foreground text-sm truncate cursor-help">
                      {title}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs break-words">{title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-sm text-muted-foreground">·</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground truncate cursor-help">
                      {author}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs break-words">{author}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* 收藏状态指示器 */}
              <div className="flex items-center ml-2">
                <Heart
                  className={cn(
                    'h-3 w-3',
                    currentIsFavorite ? 'text-destructive fill-current' : 'text-muted-foreground',
                  )}
                />
                {currentIsFavorite && <span className="text-xs text-destructive ml-1">已收藏</span>}
              </div>

              {variant === 'history' && totalTime && readCount && (
                <>
                  <span className="text-xs text-muted-foreground ml-2">
                    时长: {formatTime(totalTime)}
                  </span>
                  <span className="text-xs text-muted-foreground">阅读: {readCount} 次</span>
                </>
              )}
              {variant === 'favorites' && favoriteDate && (
                <span className="text-xs text-muted-foreground ml-2">收藏时间: {favoriteDate}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                第 {currentChapter} 章 • {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-1 mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
