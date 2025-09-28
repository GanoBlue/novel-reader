import React from 'react';
import { X, BookOpen, Settings, RotateCcw, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ReadingStats } from './reading-stats';
import { useIsMobile } from '@/hooks/use-mobile';

interface SideMenuProps {
  book: {
    title: string;
    author: string;
  };
  isAutoScrolling: boolean;
  onClose: () => void;
  onToggleAutoScroll: () => void;
  onNavigateHome: () => void;
  onOpenSettings: () => void;
  onOpenChapters: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  book,
  isAutoScrolling,
  onClose,
  onToggleAutoScroll,
  onNavigateHome,
  onOpenSettings,
  onOpenChapters,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? 'w-full' : 'w-80'} bg-background ${isMobile ? '' : 'border-l'}`}>
      <div className={`${isMobile ? 'p-6' : 'p-4'}`}>
        {/* 移动端显示关闭按钮，桌面端不显示（Sheet 自带关闭按钮） */}
        {isMobile && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-xl">菜单</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}

        <div className={`space-y-${isMobile ? '6' : '4'}`}>
          {/* 书籍信息 */}
          <Card className={`${isMobile ? 'p-6' : 'p-4'}`}>
            <h3 className={`font-medium mb-2 ${isMobile ? 'text-lg' : ''}`}>{book.title}</h3>
            <p className={`text-sm text-muted-foreground mb-3 ${isMobile ? 'text-base' : ''}`}>
              {book.author}
            </p>
            <Button
              variant="outline"
              size={isMobile ? 'default' : 'sm'}
              className="w-full"
              onClick={onNavigateHome}
            >
              返回书架
            </Button>
          </Card>

          {/* 阅读控制 */}
          <Card className={`${isMobile ? 'p-6' : 'p-4'}`}>
            <h3 className={`font-medium mb-3 ${isMobile ? 'text-lg' : ''}`}>阅读控制</h3>
            <div className="space-y-2">
              <Button
                variant={isAutoScrolling ? 'default' : 'outline'}
                size={isMobile ? 'default' : 'sm'}
                className="w-full justify-start"
                onClick={onToggleAutoScroll}
              >
                {isAutoScrolling ? (
                  <>
                    <RotateCw className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} mr-2`} />
                    停止自动滚动
                  </>
                ) : (
                  <>
                    <RotateCcw className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} mr-2`} />
                    开始自动滚动
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* 快速操作 */}
          <Card className={`${isMobile ? 'p-6' : 'p-4'}`}>
            <h3 className={`font-medium mb-3 ${isMobile ? 'text-lg' : ''}`}>快速操作</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size={isMobile ? 'default' : 'sm'}
                className="w-full justify-start"
                onClick={onOpenChapters}
              >
                <BookOpen className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} mr-2`} />
                章节导航
              </Button>
              <Button
                variant="outline"
                size={isMobile ? 'default' : 'sm'}
                className="w-full justify-start"
                onClick={onOpenSettings}
              >
                <Settings className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} mr-2`} />
                阅读设置
              </Button>
            </div>
          </Card>

          {/* 阅读统计 */}
          <Card className={`${isMobile ? 'p-6' : 'p-4'}`}>
            <h3 className={`font-medium mb-2 ${isMobile ? 'text-lg' : ''}`}>阅读统计</h3>
            <div className="space-y-2">
              <ReadingStats />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

