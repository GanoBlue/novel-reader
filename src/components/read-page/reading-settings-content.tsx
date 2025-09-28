import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { readingSettingsService, defaultReadingSettings } from '@/services/reading-settings';
import type { ReadingSettings } from '@/types/reading';
import { toast } from 'sonner';

interface ReadingSettingsContentProps {
  settings: ReadingSettings;
  onSettingsChange: (settings: ReadingSettings) => void;
  isMobile?: boolean;
}

export const ReadingSettingsContent: React.FC<ReadingSettingsContentProps> = ({
  settings,
  onSettingsChange,
  isMobile = false,
}) => {
  const labelClass = isMobile ? 'text-base font-medium' : 'text-sm font-medium';
  const buttonSize = isMobile ? 'default' : 'sm';
  const sliderClass = isMobile ? 'w-full h-2' : 'w-full';
  const selectTriggerClass = isMobile ? 'w-full h-12 text-base' : 'w-full';
  const containerClass = isMobile ? 'grid gap-6 px-4' : 'grid flex-1 auto-rows-min gap-6 px-4';
  const itemClass = isMobile ? 'space-y-2' : 'grid gap-3';

  // 主题样式函数
  const getThemeStyle = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return {
          bg: 'bg-white',
          text: 'text-gray-900',
          border: 'border-gray-300',
          dot: 'bg-gray-400',
        };
      case 'dark':
        return {
          bg: 'bg-gray-900',
          text: 'text-white',
          border: 'border-gray-700',
          dot: 'bg-gray-600',
        };
      case 'sepia':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-900',
          border: 'border-amber-300',
          dot: 'bg-amber-500',
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          text: 'text-green-900',
          border: 'border-green-300',
          dot: 'bg-green-500',
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-300',
          dot: 'bg-gray-400',
        };
    }
  };

  return (
    <div className={containerClass}>
      {isMobile ? (
        // 移动端布局
        <>
          {/* 字体大小 */}
          <div className={itemClass}>
            <Label className={labelClass}>字体大小: {settings.fontSize}px</Label>
            <Slider
              value={[settings.fontSize]}
              onValueChange={(value) =>
                onSettingsChange({
                  ...settings,
                  fontSize: value[0],
                })
              }
              min={12}
              max={24}
              step={1}
              className={sliderClass}
            />
          </div>

          {/* 行间距 */}
          <div className={itemClass}>
            <Label className={labelClass}>行间距: {settings.lineHeight}</Label>
            <Slider
              value={[settings.lineHeight]}
              onValueChange={(value) =>
                onSettingsChange({
                  ...settings,
                  lineHeight: value[0],
                })
              }
              min={1.2}
              max={2.0}
              step={0.1}
              className={sliderClass}
            />
          </div>

          {/* 字体选择 */}
          <div className={itemClass}>
            <Label className={labelClass}>字体</Label>
            <Select
              value={settings.fontFamily}
              onValueChange={(value) =>
                onSettingsChange({
                  ...settings,
                  fontFamily: value,
                })
              }
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {readingSettingsService.options.fonts.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 主题选择 */}
          <div className={itemClass}>
            <Label className={labelClass}>主题</Label>
            <div className="flex flex-wrap gap-2">
              {readingSettingsService.options.themes.map((theme) => {
                const themeStyle = getThemeStyle(theme.value);
                const isSelected = settings.theme === theme.value;

                return (
                  <Button
                    key={theme.value}
                    variant={isSelected ? 'default' : 'outline'}
                    size={buttonSize}
                    className={`${
                      isSelected ? `${themeStyle.bg} ${themeStyle.text} ${themeStyle.border}` : ''
                    }`}
                    onClick={() =>
                      onSettingsChange({
                        ...settings,
                        theme: theme.value as any,
                      })
                    }
                    title={theme.description}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${themeStyle.dot}`} />
                      {theme.label}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* 阅读模式 */}
          <div className={itemClass}>
            <Label className={labelClass}>阅读模式</Label>
            <div className="space-y-2">
              {readingSettingsService.options.modes.map((mode) => (
                <Button
                  key={mode.value}
                  variant={settings.readingMode === mode.value ? 'default' : 'outline'}
                  size={buttonSize}
                  className="w-full justify-start"
                  onClick={() =>
                    onSettingsChange({
                      ...settings,
                      readingMode: mode.value as any,
                    })
                  }
                  title={mode.description}
                >
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 文本对齐 */}
          <div className={itemClass}>
            <Label className={labelClass}>文本对齐</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'left', label: '左对齐' },
                { value: 'center', label: '居中' },
                { value: 'justify', label: '两端对齐' },
              ].map((align) => (
                <Button
                  key={align.value}
                  variant={settings.textAlign === align.value ? 'default' : 'outline'}
                  size={buttonSize}
                  onClick={() =>
                    onSettingsChange({
                      ...settings,
                      textAlign: align.value as any,
                    })
                  }
                >
                  {align.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 页面边距 */}
          <div className={itemClass}>
            <Label className={labelClass}>页面边距: {settings.paddingHorizontal}px</Label>
            <Slider
              value={[settings.paddingHorizontal]}
              onValueChange={(value) =>
                onSettingsChange({
                  ...settings,
                  paddingHorizontal: value[0],
                })
              }
              min={0}
              max={50}
              step={5}
              className={sliderClass}
            />
          </div>

          {/* 重置设置 */}
          <div>
            <Button
              variant="outline"
              size={buttonSize}
              className="w-full"
              onClick={() => {
                onSettingsChange(defaultReadingSettings);
                toast.success('设置已重置');
              }}
            >
              重置设置
            </Button>
          </div>
        </>
      ) : (
        // 桌面端布局
        <div className="grid gap-3">
          {/* 字体大小 */}
          <Label className={labelClass}>字体大小: {settings.fontSize}px</Label>
          <Slider
            value={[settings.fontSize]}
            onValueChange={(value) =>
              onSettingsChange({
                ...settings,
                fontSize: value[0],
              })
            }
            min={12}
            max={24}
            step={1}
            className={sliderClass}
          />

          {/* 行间距 */}
          <Label className={labelClass}>行间距: {settings.lineHeight}</Label>
          <Slider
            value={[settings.lineHeight]}
            onValueChange={(value) =>
              onSettingsChange({
                ...settings,
                lineHeight: value[0],
              })
            }
            min={1}
            max={2.0}
            step={0.1}
            className={sliderClass}
          />

          {/* 字体选择 */}
          <Label className={labelClass}>字体</Label>
          <Select
            value={settings.fontFamily}
            onValueChange={(value) =>
              onSettingsChange({
                ...settings,
                fontFamily: value,
              })
            }
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {readingSettingsService.options.fonts.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 主题选择 */}
          <div className={itemClass}>
            <Label className={labelClass}>主题</Label>
            <div className="grid grid-cols-2 gap-2">
              {readingSettingsService.options.themes.map((theme) => {
                const themeStyle = getThemeStyle(theme.value);
                const isSelected = settings.theme === theme.value;

                return (
                  <Button
                    key={theme.value}
                    variant={isSelected ? 'default' : 'outline'}
                    size={buttonSize}
                    className={`${
                      isSelected ? `${themeStyle.bg} ${themeStyle.text} ${themeStyle.border}` : ''
                    }`}
                    onClick={() =>
                      onSettingsChange({
                        ...settings,
                        theme: theme.value as any,
                      })
                    }
                    title={theme.description}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${themeStyle.dot}`} />
                      {theme.label}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* 阅读模式 */}
          <div className={itemClass}>
            <Label className={labelClass}>阅读模式</Label>
            <div className="space-y-2">
              {readingSettingsService.options.modes.map((mode) => (
                <Button
                  key={mode.value}
                  variant={settings.readingMode === mode.value ? 'default' : 'outline'}
                  size={buttonSize}
                  className="w-full justify-start"
                  onClick={() =>
                    onSettingsChange({
                      ...settings,
                      readingMode: mode.value as any,
                    })
                  }
                  title={mode.description}
                >
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 文本对齐 */}
          <div className={itemClass}>
            <Label className={labelClass}>文本对齐</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'left', label: '左对齐' },
                { value: 'center', label: '居中' },
                { value: 'justify', label: '两端对齐' },
              ].map((align) => (
                <Button
                  key={align.value}
                  variant={settings.textAlign === align.value ? 'default' : 'outline'}
                  size={buttonSize}
                  onClick={() =>
                    onSettingsChange({
                      ...settings,
                      textAlign: align.value as any,
                    })
                  }
                >
                  {align.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 页面边距 */}
          <Label className={labelClass}>页面边距: {settings.paddingHorizontal}px</Label>
          <Slider
            value={[settings.paddingHorizontal]}
            onValueChange={(value) =>
              onSettingsChange({
                ...settings,
                paddingHorizontal: value[0],
              })
            }
            min={0}
            max={50}
            step={5}
            className={sliderClass}
          />

          {/* 重置设置 */}
          <div>
            <Button
              variant="outline"
              size={buttonSize}
              className="w-full"
              onClick={() => {
                onSettingsChange(defaultReadingSettings);
                toast.success('设置已重置');
              }}
            >
              重置设置
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
