import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BookFavoriteProps {
  isFavorite: boolean;
  onFavorite?: () => void;
  className?: string;
  variant?: 'button' | 'indicator'; // button: 悬停按钮, indicator: 状态指示器
  showLabel?: boolean; // 是否显示"已收藏"文本
}

/**
 * 书籍收藏组件
 * 支持按钮模式（网格）和指示器模式（列表）
 */
export function BookFavorite({
  isFavorite,
  onFavorite,
  className,
  variant = 'button',
  showLabel = false,
}: BookFavoriteProps) {
  if (variant === 'indicator') {
    // 列表模式：显示收藏状态指示器（支持点击）
    return (
      <div className={cn('flex items-center ml-2', className)}>
        <button
          className={cn(
            'flex items-center space-x-1 hover:opacity-80 transition-opacity  cursor-pointer',
            isFavorite ? 'text-destructive' : 'text-muted-foreground hover:text-destructive',
          )}
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.();
          }}
        >
          <Heart className={cn('h-3 w-3', isFavorite && 'fill-current')} />
          {isFavorite && showLabel && <span className="text-xs">已收藏</span>}
        </button>
      </div>
    );
  }

  // 网格模式：悬停显示收藏按钮
  return (
    <div
      className={cn(
        'flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity',
        className,
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 w-8 p-0 cursor-pointer',
          isFavorite
            ? 'text-destructive hover:text-destructive/80'
            : 'text-muted-foreground hover:text-destructive',
        )}
        onClick={(e) => {
          e.stopPropagation();
          onFavorite?.();
        }}
      >
        <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
      </Button>
    </div>
  );
}
