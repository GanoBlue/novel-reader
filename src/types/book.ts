/**
 * 图书相关类型定义
 * 集中管理图书相关的所有类型
 */

import type { FileFormat, ThemeType, TextAlign } from './common';

// 阅读进度信息
export interface ReadingProgress {
  bookId: number;
  paraOffset: number; // 段落偏移量
  progress: number; // 0-100 的百分比进度
  lastReadAt: string; // ISO 时间字符串
  readingTime: number; // 阅读时长（分钟）
  currentChapter?: string; // 当前章节标题
  sessionStartTime?: string; // 当前阅读会话开始时间（ISO 时间字符串）
}

// 图书基础信息
export interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  format?: FileFormat;
  fileSize?: number;
  currentChapter: number;
  totalChapters: number;
  totalTime?: number;
  readCount?: number;
  favoriteDate?: string;
  isFavorite?: boolean;
  addDate: string; // 添加日期
  description?: string; // 书籍描述
  readingProgress?: ReadingProgress; // 阅读进度信息
}

// 章节信息
export interface Chapter {
  id: string;
  bookId: number;
  title: string;
  content: string;
  order: number;
  isRead: boolean;
  readProgress: number;
}

