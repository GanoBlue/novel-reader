import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Home, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InteractiveProgress } from '@/components/ui/interactive-progress';
import { ReadingSettingsSidebar } from './reading-settings-sidebar';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { Book } from '@/types/book';
import type { ReadingSettings } from '@/types/reading';

interface AutoHideHeaderProps {
  book: Book;
  onNavigateHome: () => void;
  // 面板状态
  showSettings: boolean;
  // 面板控制
  onSettingsToggle: () => void;
  // 设置相关
  settings: ReadingSettings;
  onSettingsChange: (settings: ReadingSettings) => void;
  // 进度相关
  progress: number;
  onProgressChange: (progress: number) => void;
}

export const AutoHideHeader: React.FC<AutoHideHeaderProps> = ({
  book,
  onNavigateHome,
  showSettings,
  onSettingsToggle,
  settings,
  onSettingsChange,
  progress,
  onProgressChange,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [hasShownInitially, setHasShownInitially] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  // 可编辑进度数字的状态
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [editProgressValue, setEditProgressValue] = useState('');
  const progressInputRef = useRef<HTMLInputElement>(null);

  // 统一的清除隐藏定时器函数
  const clearHideTimeout = useCallback(() => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
  }, [hideTimeout]);

  // 首次进入时显示2秒后隐藏
  useEffect(() => {
    if (!hasShownInitially) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setHasShownInitially(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasShownInitially]);

  // 统一：点击阅读区域切换顶部栏显示/隐藏（移动端与桌面端一致）
  const handleGlobalClick = useCallback(
    (e: MouseEvent) => {
      // 编辑进度期间不处理全局点击
      if (isEditingProgress) return;

      // 焦点位于可编辑元素时不处理
      const active = document.activeElement as Element | null;
      if (active && active.matches('input, textarea, [contenteditable="true"]')) return;

      const target = e.target as Element;
      // 点击头部不处理
      if (target.closest('[data-header]')) return;
      // 点击阅读设置侧栏不处理
      if (target.closest('[data-settings-sidebar]')) return;
      // 排除常见交互元素，避免影响正常操作
      const interactiveSelector =
        'button, input, textarea, select, a, [role="button"], [contenteditable="true"]';
      if (target.closest(interactiveSelector)) return;

      // 切换显示/隐藏
      setIsVisible((prev) => !prev);
      clearHideTimeout();
    },
    [clearHideTimeout, isEditingProgress],
  );

  useEffect(() => {
    document.addEventListener('click', handleGlobalClick, { passive: true });
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [handleGlobalClick]);

  // 清理定时器
  useEffect(() => {
    return () => {
      clearHideTimeout();
    };
  }, [hideTimeout]);

  // 开始编辑进度
  const handleProgressClick = useCallback(() => {
    setIsEditingProgress(true);
    setEditProgressValue(progress.toFixed(2));
  }, [progress]);

  // 完成编辑进度
  const handleProgressSubmit = useCallback(() => {
    const newValue = parseFloat(editProgressValue);
    if (!isNaN(newValue) && newValue >= 0 && newValue <= 100) {
      // 只有当新值与当前进度不同时才触发更新
      if (Math.abs(newValue - progress) > 0.01) {
        onProgressChange(newValue);
      }
    }
    setIsEditingProgress(false);
  }, [editProgressValue, progress, onProgressChange]);

  // 取消编辑进度
  const handleProgressCancel = useCallback(() => {
    setIsEditingProgress(false);
    setEditProgressValue('');
  }, []);

  // 处理输入框按键
  const handleProgressKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        // Enter 键提交，会检查内容是否改变
        handleProgressSubmit();
      } else if (e.key === 'Escape') {
        // Escape 键取消编辑
        handleProgressCancel();
      }
    },
    [handleProgressSubmit, handleProgressCancel],
  );

  // 自动聚焦到输入框
  useEffect(() => {
    if (isEditingProgress && progressInputRef.current) {
      progressInputRef.current.focus();
      progressInputRef.current.select();
    }
  }, [isEditingProgress]);

  const headerClassName = useMemo(() => {
    const baseClasses =
      'fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b transition-all duration-300';
    const visibilityClasses = isVisible ? 'translate-y-0' : '-translate-y-full';

    return `${baseClasses} ${visibilityClasses}`;
  }, [isVisible]);

  return (
    <>
      <div className={headerClassName} data-header>
        <div className="flex items-center px-4 py-2">
          {/* 左侧：返回按钮和书籍信息 - 按内容自适应 */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onNavigateHome}>
              <Home className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-semibold text-sm truncate max-w-xs">{book.title}</h1>
              <p className="text-xs text-muted-foreground truncate max-w-xs">{book.author}</p>
            </div>
          </div>

          {/* 中间：进度条和数字标签 - 进度条自动宽度 */}
          <div className="flex items-center space-x-3 flex-1 mx-4">
            <div className="flex-1">
              <InteractiveProgress
                value={progress}
                onValueChange={onProgressChange}
                className="h-2"
              />
            </div>

            {/* 可编辑的进度数字 - 按内容自适应，足够容纳两位小数 */}
            <div className="text-center">
              {isEditingProgress ? (
                <Input
                  ref={progressInputRef}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={editProgressValue}
                  onChange={(e) => setEditProgressValue(e.target.value)}
                  onBlur={handleProgressSubmit}
                  onKeyDown={handleProgressKeyDown}
                  className="h-6 text-xs text-center w-16 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.00"
                />
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors px-1 py-0.5 rounded hover:bg-muted/50"
                      onClick={handleProgressClick}
                    >
                      {progress.toFixed(2)}%
                    </span>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>点击编辑进度</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* 右侧：设置按钮 - 按内容自适应 */}
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onSettingsToggle}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 响应式侧边栏 - 设置 */}
      <ReadingSettingsSidebar
        open={showSettings}
        onOpenChange={onSettingsToggle}
        settings={settings}
        onSettingsChange={onSettingsChange}
      />
    </>
  );
};

