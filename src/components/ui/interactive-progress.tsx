import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

interface InteractiveProgressProps {
  value: number;
  onValueChange?: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

export function InteractiveProgress({
  value,
  onValueChange,
  className,
  disabled = false,
}: InteractiveProgressProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const progressRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !onValueChange || !progressRef.current) return;

      event.preventDefault();
      setIsDragging(true);

      const rect = progressRef.current.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const newValue = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
      onValueChange(newValue);
    },
    [disabled, onValueChange],
  );

  const handleMouseMove = React.useCallback(
    (event: MouseEvent) => {
      if (!isDragging || disabled || !onValueChange || !progressRef.current) return;

      const rect = progressRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const newValue = Math.max(0, Math.min(100, (mouseX / rect.width) * 100));
      onValueChange(newValue);
    },
    [isDragging, disabled, onValueChange],
  );

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <ProgressPrimitive.Root
      ref={progressRef}
      data-slot="progress"
      className={cn(
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full cursor-pointer',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      onMouseDown={handleMouseDown}
      title={`${Math.round(value)}%`}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all duration-150 ease-out"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

