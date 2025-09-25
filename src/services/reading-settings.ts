// 阅读设置服务
// 负责保存和恢复用户的阅读偏好设置

export interface ReadingSettings {
  fontSize: number;
  lineHeight: number;
  theme: 'light' | 'dark' | 'sepia' | 'green';
  readingMode: 'scroll' | 'flip';
  autoScroll: boolean;
  autoScrollSpeed: number;
  // 新增设置项
  fontFamily: string;
  textAlign: 'left' | 'center' | 'justify';
  marginHorizontal: number;
  marginVertical: number;
  brightness: number;
  contrast: number;
}

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
  marginHorizontal: 20,
  marginVertical: 20,
  brightness: 100,
  contrast: 100,
};

// 设置键名
const SETTINGS_KEY = 'novel-reader-settings';

// 获取阅读设置
export const getReadingSettings = (): ReadingSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // 合并默认设置，确保新添加的设置项有默认值
      return { ...defaultReadingSettings, ...parsed };
    }
  } catch (error) {
    console.error('读取阅读设置失败:', error);
  }
  return defaultReadingSettings;
};

// 保存阅读设置
export const saveReadingSettings = (settings: ReadingSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('保存阅读设置失败:', error);
  }
};

// 重置阅读设置
export const resetReadingSettings = (): void => {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('重置阅读设置失败:', error);
  }
};

// 更新单个设置项
export const updateReadingSetting = <K extends keyof ReadingSettings>(
  key: K,
  value: ReadingSettings[K],
): ReadingSettings => {
  const currentSettings = getReadingSettings();
  const newSettings = { ...currentSettings, [key]: value };
  saveReadingSettings(newSettings);
  return newSettings;
};

// 主题样式生成器
export const generateThemeStyles = (settings: ReadingSettings): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
    fontFamily: settings.fontFamily,
    textAlign: settings.textAlign,
    padding: `${settings.marginVertical}px ${settings.marginHorizontal}px`,
    filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`,
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

// 导出设置服务
export const readingSettingsService = {
  get: getReadingSettings,
  save: saveReadingSettings,
  reset: resetReadingSettings,
  update: updateReadingSetting,
  generateStyles: generateThemeStyles,
  options: {
    fonts: fontOptions,
    themes: themeOptions,
    modes: readingModeOptions,
  },
};

