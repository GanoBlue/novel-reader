import { Progress } from '@/components/ui/progress';
import { formatTime } from '@/lib/time-utils';

interface BookProgressInfoProps {
  currentChapter: number;
  progress: number;
  totalTime?: number;
  readCount?: number;
  variant?: 'library' | 'favorites' | 'history';
  favoriteDate?: string;
  className?: string;
  progressSize?: 'small' | 'medium'; // 进度条大小
  displayMode?: 'grid' | 'list'; // 显示模式
}

/**
 * 书籍进度信息组件
 * 显示章节进度、阅读进度、阅读时长和次数等信息
 */
export function BookProgressInfo({
  currentChapter,
  progress,
  totalTime,
  readCount,
  variant = 'library',
  favoriteDate,
  className,
  progressSize = 'medium',
  displayMode = 'grid',
}: BookProgressInfoProps) {
  const progressHeight = progressSize === 'small' ? 'h-1' : 'h-2';

  return (
    <div className={className}>
      {/* 进度信息 */}
      <div className={displayMode === 'list' ? 'mb-2' : 'mb-3'}>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>第 {currentChapter} 章</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className={progressHeight} />
      </div>

      {/* 阅读信息 */}
      {(totalTime !== undefined || readCount !== undefined) && (
        <div
          className={`flex items-center ${displayMode === 'list' ? 'space-x-3' : 'justify-center space-x-4'} text-xs text-muted-foreground ${displayMode === 'list' ? 'mb-1' : 'mb-3'}`}
        >
          {totalTime !== undefined && <span>时长: {formatTime(totalTime)}</span>}
          {readCount !== undefined && <span>阅读: {readCount} 次</span>}
        </div>
      )}

      {/* 收藏时间（收藏页面显示） */}
      {variant === 'favorites' && favoriteDate && (
        <div className="text-xs text-muted-foreground mb-3">收藏时间: {favoriteDate}</div>
      )}
    </div>
  );
}

