import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Home, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InteractiveProgress } from '@/components/ui/interactive-progress';
import { ReadingSettingsSidebar } from './reading-settings-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { debounce } from 'lodash-es';
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
  const [isInitialPeriod, setIsInitialPeriod] = useState(true);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  // 可编辑进度数字的状态
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [editProgressValue, setEditProgressValue] = useState('');
  const progressInputRef = useRef<HTMLInputElement>(null);

  // 使用现有的移动端检测 hook
  const isMobile = useIsMobile();

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
        setIsInitialPeriod(false); // 初始期结束，可以开始监听鼠标
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasShownInitially]);

  // 全局鼠标移动处理（仅用于检测鼠标是否在窗口顶部）
  const handleGlobalMouseMove = useCallback(
    debounce((e: MouseEvent) => {
      // 初始期内不响应鼠标移动
      if (isInitialPeriod) return;

      const currentY = e.clientY;
      const showThreshold = isMobile ? 60 : 20;

      // 只有当头部隐藏且鼠标在窗口顶部时才显示
      if (!isVisible && currentY < showThreshold) {
        setIsVisible(true);
        clearHideTimeout();
      }
    }, 16), // 约60fps
    [isVisible, isInitialPeriod, isMobile, hideTimeout],
  );

  // 全局鼠标移动监听器
  const mouseMoveRef = useRef(handleGlobalMouseMove);
  mouseMoveRef.current = handleGlobalMouseMove;

  useEffect(() => {
    const handler = (e: MouseEvent) => mouseMoveRef.current(e);
    document.addEventListener('mousemove', handler, { passive: true });
    return () => document.removeEventListener('mousemove', handler);
  }, []);

  // 移动端点击页面切换显示/隐藏
  const handleMobileClick = useCallback(
    (e: MouseEvent) => {
      // 只在移动端处理
      if (!isMobile) return;

      // 检查是否点击了头部组件本身
      const target = e.target as Element;
      if (target.closest('[data-header]')) {
        return; // 点击头部组件不处理
      }

      // 切换显示状态
      setIsVisible((prev) => !prev);
      clearHideTimeout();
    },
    [isMobile, clearHideTimeout],
  );

  useEffect(() => {
    if (isMobile) {
      document.addEventListener('click', handleMobileClick, { passive: true });
      return () => document.removeEventListener('click', handleMobileClick);
    }
  }, [isMobile, handleMobileClick]);

  // 清理定时器
  useEffect(() => {
    return () => {
      clearHideTimeout();
    };
  }, [hideTimeout]);

  // 鼠标离开头部组件时延迟隐藏
  const handleMouseLeave = useCallback(() => {
    if (!isInitialPeriod) {
      // 设置延迟隐藏，给用户视觉停留时间
      const timeout = setTimeout(() => {
        setIsVisible(false);
        setHideTimeout(null);
      }, 500);
      setHideTimeout(timeout);
    }
  }, [isInitialPeriod]);

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
      <div className={headerClassName} onMouseLeave={handleMouseLeave} data-header>
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
                <span
                  className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors px-1 py-0.5 rounded hover:bg-muted/50"
                  onClick={handleProgressClick}
                  title="点击编辑进度"
                >
                  {progress.toFixed(2)}%
                </span>
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

