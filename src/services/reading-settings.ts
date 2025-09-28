// 阅读设置服务
// 负责保存和恢复用户的阅读偏好设置
// 使用 IndexedDB 存储，支持监听机制

import config from './config';

import type { ReadingSettings } from '@/types/reading';

// 默认阅读设置
export const defaultReadingSettings: ReadingSettings = {
  fontSize: 18,
  lineHeight: 1.6,
  theme: 'light',
  readingMode: 'scroll',
  autoScroll: false,
  autoScrollSpeed: 1,
  fontFamily: 'system-ui',
  textAlign: 'left',
  paddingHorizontal: 5,
};

// 设置键名
const SETTINGS_KEY = 'reading-settings';

// 获取阅读设置
export const getReadingSettings = async (): Promise<ReadingSettings> => {
  try {
    const stored = await config.get(SETTINGS_KEY);
    if (stored) {
      // 合并默认设置，确保新添加的设置项有默认值
      return { ...defaultReadingSettings, ...(stored as ReadingSettings) };
    }
  } catch (error) {
    console.error('读取阅读设置失败:', error);
  }

  // 如果没有存储的设置，获取当前全局主题作为初始主题
  const getCurrentTheme = (): 'light' | 'dark' => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      return 'dark';
    }
    return 'light';
  };

  return {
    ...defaultReadingSettings,
    theme: getCurrentTheme(),
  };
};

// 保存阅读设置
export const saveReadingSettings = async (settings: ReadingSettings): Promise<void> => {
  try {
    await config.set(SETTINGS_KEY, settings);
  } catch (error) {
    console.error('保存阅读设置失败:', error);
    throw error;
  }
};

// 重置阅读设置
export const resetReadingSettings = async (): Promise<void> => {
  try {
    await config.reset(SETTINGS_KEY);
  } catch (error) {
    console.error('重置阅读设置失败:', error);
    throw error;
  }
};

// 更新单个设置项
export const updateReadingSetting = async <K extends keyof ReadingSettings>(
  key: K,
  value: ReadingSettings[K],
): Promise<ReadingSettings> => {
  const currentSettings = await getReadingSettings();
  const newSettings = { ...currentSettings, [key]: value };
  await saveReadingSettings(newSettings);
  return newSettings;
};

// 主题样式生成器
export const generateThemeStyles = (settings: ReadingSettings): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
    fontFamily: settings.fontFamily,
    textAlign: settings.textAlign,
    paddingLeft: `${settings.paddingHorizontal}px`,
    paddingRight: `${settings.paddingHorizontal}px`,
  };

  // 根据主题设置背景色和文字颜色
  switch (settings.theme) {
    case 'dark':
      return {
        ...baseStyles,
        backgroundColor: '#1a1a1a',
        color: '#e5e5e5',
      };
    case 'sepia':
      return {
        ...baseStyles,
        backgroundColor: '#f4f1ea',
        color: '#5c4b37',
      };
    case 'green':
      return {
        ...baseStyles,
        backgroundColor: '#e8f5e8',
        color: '#2d5016',
      };
    case 'light':
    default:
      return {
        ...baseStyles,
        backgroundColor: '#ffffff',
        color: '#000000',
      };
  }
};

// 字体选项
export const fontOptions = [
  { value: 'system-ui', label: '系统默认' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'PingFang SC', label: '苹方' },
  { value: 'Microsoft YaHei', label: '微软雅黑' },
  { value: 'SimSun', label: '宋体' },
  { value: 'SimHei', label: '黑体' },
];

// 主题选项
export const themeOptions = [
  { value: 'light', label: '浅色', description: '白色背景，黑色文字' },
  { value: 'dark', label: '深色', description: '黑色背景，白色文字' },
  { value: 'sepia', label: '护眼', description: '米色背景，棕色文字' },
  { value: 'green', label: '绿色', description: '绿色背景，深绿文字' },
];

// 阅读模式选项
export const readingModeOptions = [
  { value: 'scroll', label: '滚动模式', description: '连续滚动阅读' },
  { value: 'flip', label: '翻页模式', description: '分页翻页阅读' },
];

// 添加配置监听器
export const addSettingsListener = (listener: (settings: ReadingSettings) => void): void => {
  config.addListener(SETTINGS_KEY, listener);
};

// 移除配置监听器
export const removeSettingsListener = (listener: (settings: ReadingSettings) => void): void => {
  config.removeListener(SETTINGS_KEY, listener);
};

// 导出设置服务
export const readingSettingsService = {
  get: getReadingSettings,
  save: saveReadingSettings,
  reset: resetReadingSettings,
  update: updateReadingSetting,
  generateStyles: generateThemeStyles,
  addListener: addSettingsListener,
  removeListener: removeSettingsListener,
  options: {
    fonts: fontOptions,
    themes: themeOptions,
    modes: readingModeOptions,
  },
};

