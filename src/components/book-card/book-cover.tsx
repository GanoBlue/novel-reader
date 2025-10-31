import React from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookCoverProps {
  cover: string; // 可以是 CSS 渐变类名（如 "from-blue-400 to-green-600"）或图片 URL/Data URL
  size: 'small' | 'medium' | 'large';
  onClick?: (e?: React.MouseEvent) => void;
  className?: string;
}

/**
 * 书籍封面组件
 * 支持两种封面格式：
 * 1. CSS 渐变类名（如 "from-blue-400 to-green-600"）- 用于 TXT 文件或没有封面的 EPUB
 * 2. 图片 URL/Data URL - 用于有封面的 EPUB
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

  // 判断是否是图片 URL（Data URL 或 http/https）
  const isImageUrl =
    cover.startsWith('data:') || cover.startsWith('http://') || cover.startsWith('https://');

  if (isImageUrl) {
    // 显示图片封面
    return (
      <div
        className={cn(
          'rounded-lg shadow-md overflow-hidden bg-gray-100',
          sizeClasses[size],
          onClick && 'cursor-pointer',
          className,
        )}
        onClick={onClick}
      >
        <img
          src={cover}
          alt="书籍封面"
          className="w-full h-full object-cover"
          onError={(e) => {
            // 如果图片加载失败，回退到默认渐变
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.className = cn(
                'bg-gradient-to-br rounded-lg flex items-center justify-center shadow-md',
                sizeClasses[size],
                'from-blue-400 to-green-600',
                onClick && 'cursor-pointer',
                className,
              );
              const icon = document.createElement('div');
              icon.innerHTML = `<svg class="${iconSizes[size]} text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>`;
              parent.appendChild(icon);
            }
          }}
        />
      </div>
    );
  }

  // 显示渐变封面（默认）
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

