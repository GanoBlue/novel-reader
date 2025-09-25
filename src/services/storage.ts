/* eslint-disable @typescript-eslint/no-explicit-any */
import { Book } from '@/store/book-store';
import {
  saveBooksListDB,
  loadBooksListDB,
  type BookMetaRecord,
  saveSettingsDB,
  loadSettingsDB,
} from '@/services/db';

// 存储服务类 - 完全基于 IndexedDB，去除 localStorage
export class StorageService {
  private static instance: StorageService;
  private settingsCache: Record<string, any> | null = null; // 内存缓存，避免每次都异步查询

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // 书籍数据存储 - 直接写入 IndexedDB
  async saveBooks(books: Book[]): Promise<boolean> {
    try {
      await saveBooksListDB(books as unknown as BookMetaRecord[]);
      return true;
    } catch (error) {
      console.error('保存书籍元数据到 IndexedDB 失败：', error);
      return false;
    }
  }

  // 从 IndexedDB 异步读取全部书籍元数据
  async loadBooks(): Promise<Book[]> {
    try {
      const list = await loadBooksListDB();
      return (list ?? []) as unknown as Book[];
    } catch (error) {
      console.error('从 IndexedDB 读取书籍元数据失败：', error);
      return [];
    }
  }

  // 设置读写（基于 IndexedDB），并带有轻量内存缓存
  loadSettings(): Record<string, any> {
    // 尽量同步返回缓存，首次为空时返回空对象；I18n 首次渲染可得到默认值
    return this.settingsCache ?? {};
  }

  async loadSettingsAsync(): Promise<Record<string, any>> {
    try {
      const s = (await loadSettingsDB()) as Record<string, any>;
      this.settingsCache = s;
      return s;
    } catch (error) {
      console.error('读取设置失败：', error);
      this.settingsCache = this.settingsCache ?? {};
      return this.settingsCache;
    }
  }

  async saveSettings(settings: Record<string, any>): Promise<boolean> {
    try {
      await saveSettingsDB(settings);
      this.settingsCache = settings;
      return true;
    } catch (error) {
      console.error('保存设置失败：', error);
      return false;
    }
  }

  // 设置便捷API：读取单个键（同步从缓存读取，不存在返回默认值）
  getSetting<T = unknown>(key: string, defaultValue: T): T {
    const s = this.settingsCache ?? {};
    return (s[key] as T) ?? defaultValue;
  }

  // 设置便捷API：写入单个键（合并到缓存并异步落盘）
  async setSetting<T = unknown>(key: string, value: T): Promise<void> {
    const s = (await this.loadSettingsAsync()) as Record<string, any>;
    s[key] = value;
    await this.saveSettings(s);
  }

  // 数据迁移方法（用于版本升级）- 从 localStorage 迁移到 IndexedDB
  async migrateData(): Promise<void> {
    try {
      // 检查是否有旧版本数据需要迁移
      const oldBooksKey = 'uploadedBooks';
      const oldBooksData = localStorage.getItem(oldBooksKey);

      if (oldBooksData) {
        const oldBooks = JSON.parse(oldBooksData);
        const currentBooks = await this.loadBooks();

        // 将旧数据合并到新数据中
        const mergedBooks = [...currentBooks];

        oldBooks.forEach((oldBook: any) => {
          // 检查是否已存在
          const exists = mergedBooks.some((book) => book.title === oldBook.name);
          if (!exists) {
            mergedBooks.push({
              id: Date.now() + Math.random(),
              title: oldBook.name.replace(/\.(txt|epub)$/i, ''),
              author: '未知作者',
              cover: `from-${['blue', 'green', 'purple', 'red', 'yellow'][Math.floor(Math.random() * 5)]}-400 to-${['blue', 'green', 'purple', 'red', 'yellow'][Math.floor(Math.random() * 5)]}-600`,
              currentChapter: 1,
              totalChapters: 1,
              progress: 0,
              lastRead: new Date().toISOString().split('T')[0],
              totalTime: 0,
              readCount: 0,
              isFavorite: false,
            });
          }
        });

        // 保存合并后的数据到 IndexedDB
        await this.saveBooks(mergedBooks);
        console.log('数据迁移完成，已将旧数据合并到 IndexedDB');

        // 删除旧数据
        localStorage.removeItem(oldBooksKey);
      }
    } catch (error) {
      console.error('数据迁移失败:', error);
    }
  }
}

// 导出便捷方法
export const storageService = StorageService.getInstance();

