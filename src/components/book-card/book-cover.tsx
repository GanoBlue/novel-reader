import React from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookCoverProps {
  cover: string;
  size: 'small' | 'medium' | 'large';
  onClick?: (e?: React.MouseEvent) => void;
  className?: string;
}

/**
 * 书籍封面组件
 * 根据不同尺寸显示不同大小的封面
 */
export function BookCover({ cover, size = 'medium', onClick, className }: BookCoverProps) {
  const sizeClasses = {
    small: 'w-12 h-16',
    medium: 'w-20 h-28',
    large: 'w-24 h-32',
  };

  const iconSizes = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-3xl',
  };

  return (
    <div
      className={cn(
        'bg-gradient-to-br rounded-lg flex items-center justify-center shadow-md',
        sizeClasses[size],
        cover,
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      <BookOpen className={cn('text-white', iconSizes[size])} />
    </div>
  );
}

