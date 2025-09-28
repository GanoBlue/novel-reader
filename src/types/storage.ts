/**
 * 存储服务相关类型定义
 * 定义数据存储层的接口和类型
 */

import type { Book } from './book';
import type { ReadingSettings } from './reading';

// 存储服务接口
export interface StorageService {
  // 图书相关
  getAllBooks(): Promise<Book[]>;
  getBook(bookId: number): Promise<Book | undefined>;
  saveBook(book: Book): Promise<void>;
  deleteBook(bookId: number): Promise<void>;

  // 书籍内容相关
  saveBookContent(bookId: number, content: string): Promise<void>;
  getBookContent(bookId: number): Promise<string | undefined>;
  deleteBookContent(bookId: number): Promise<void>;

  // 设置相关
  saveSetting(key: string, value: any): Promise<void>;
  getSetting(key: string): Promise<any>;
  getAllSettings(): Promise<any[]>;

  // 初始化示例数据
  initializeSampleData(): Promise<void>;
}

