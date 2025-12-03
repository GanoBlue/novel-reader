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
  autoScroll: false,
  autoScrollSpeed: 1,
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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

// 字体选项（优先使用系统字体，Web Fonts 按需加载）
export const fontOptions = [
  {
    value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    label: '系统默认',
    needsLoad: false,
  },
  {
    value: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", sans-serif',
    label: '苹方/雅黑',
    needsLoad: false,
  },
  {
    value: '"SimSun", "宋体", serif',
    label: '宋体',
    needsLoad: false,
  },
  {
    value: '"SimHei", "黑体", sans-serif',
    label: '黑体',
    needsLoad: false,
  },
  {
    value: 'Georgia, "Times New Roman", serif',
    label: 'Georgia',
    needsLoad: false,
  },
  {
    value: 'Arial, Helvetica, sans-serif',
    label: 'Arial',
    needsLoad: false,
  },
  // 在线字体 - 中文
  {
    value: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    label: '思源黑体',
    needsLoad: true,
  },
  {
    value: '"Noto Serif SC", "Songti SC", "SimSun", serif',
    label: '思源宋体',
    needsLoad: true,
  },
  {
    value: '"Ma Shan Zheng", cursive',
    label: '马善政楷体',
    needsLoad: true,
  },
  {
    value: '"ZCOOL XiaoWei", serif',
    label: '站酷小薇体',
    needsLoad: true,
  },
  {
    value: '"ZCOOL QingKe HuangYou", cursive',
    label: '站酷庆科黄油体',
    needsLoad: true,
  },
  {
    value: '"Long Cang", cursive',
    label: '龙藏体',
    needsLoad: true,
  },
  {
    value: '"Liu Jian Mao Cao", cursive',
    label: '刘建毛草体',
    needsLoad: true,
  },
  {
    value: '"Zhi Mang Xing", cursive',
    label: '志莽行书',
    needsLoad: true,
  },
  // 在线字体 - 英文
  {
    value: '"Merriweather", serif',
    label: 'Merriweather',
    needsLoad: true,
  },
  {
    value: '"Lora", serif',
    label: 'Lora',
    needsLoad: true,
  },
  {
    value: '"Crimson Text", serif',
    label: 'Crimson Text',
    needsLoad: true,
  },
  {
    value: '"Playfair Display", serif',
    label: 'Playfair Display',
    needsLoad: true,
  },
  {
    value: '"EB Garamond", serif',
    label: 'EB Garamond',
    needsLoad: true,
  },
  {
    value: '"Libre Baskerville", serif',
    label: 'Libre Baskerville',
    needsLoad: true,
  },
];

// 主题选项
export const themeOptions = [
  { value: 'light', label: '浅色', description: '白色背景，黑色文字' },
  { value: 'dark', label: '深色', description: '黑色背景，白色文字' },
  { value: 'sepia', label: '护眼', description: '米色背景，棕色文字' },
  { value: 'green', label: '绿色', description: '绿色背景，深绿文字' },
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
  },
};

