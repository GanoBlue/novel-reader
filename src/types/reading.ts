/**
 * 阅读相关类型定义
 * 集中管理阅读设置、进度等相关类型
 */

import type { ThemeType, ReadingMode, TextAlign } from './common';

// 阅读设置
export interface ReadingSettings {
  fontSize: number;
  lineHeight: number;
  theme: ThemeType;
  readingMode: ReadingMode;
  autoScroll: boolean;
  autoScrollSpeed: number;
  fontFamily: string;
  textAlign: TextAlign;
  paddingHorizontal: number;
}
