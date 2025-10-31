/**
 * 全局共享的基础类型定义
 * 这些类型在多个模块间复用，适合集中管理
 */

// 文件相关类型
export type FileFormat = 'txt' | 'epub';

// 主题相关类型
export type ThemeType = 'light' | 'dark' | 'sepia' | 'green';

// 文本对齐类型
export type TextAlign = 'left' | 'center' | 'justify';

// 页面类型
export type PageType = 'library' | 'favorites';

