import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ReadingSettingsContent } from './reading-settings-content';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ReadingSettings } from '@/types/reading';

interface ReadingSettingsSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ReadingSettings;
  onSettingsChange: (settings: ReadingSettings) => void;
}

export const ReadingSettingsSidebar: React.FC<ReadingSettingsSidebarProps> = ({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent data-settings-sidebar>
          <DrawerHeader className="text-left">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-xl font-semibold">阅读设置侧栏</DrawerTitle>
                <DrawerDescription>
                  自定义您的阅读体验，调整字体、主题和布局选项。
                </DrawerDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DrawerHeader>
          <ReadingSettingsContent
            settings={settings}
            onSettingsChange={onSettingsChange}
            isMobile={true}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80" data-settings-sidebar>
        <SheetHeader>
          <SheetTitle>阅读设置侧栏</SheetTitle>
          <SheetDescription>自定义您的阅读体验，调整字体、主题和布局选项。</SheetDescription>
        </SheetHeader>
        <ReadingSettingsContent
          settings={settings}
          onSettingsChange={onSettingsChange}
          isMobile={false}
        />
      </SheetContent>
    </Sheet>
  );
};

