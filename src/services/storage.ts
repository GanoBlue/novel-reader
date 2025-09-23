/* eslint-disable @typescript-eslint/no-explicit-any */
import { Book } from '@/store/book-store';

// localStorage键名常量
export const STORAGE_KEYS = {
  BOOKS: 'novel-reader-books',
  SETTINGS: 'novel-reader-settings',
  THEME: 'novel-reader-theme',
  UPLOAD_HISTORY: 'novel-reader-uploads',
} as const;

// 存储服务类
export class StorageService {
  private static instance: StorageService;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // 通用存储方法
  private setItem<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to save to localStorage (${key}):`, error);
      return false;
    }
  }

  // 通用读取方法
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Failed to load from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  // 清除指定key的数据
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove from localStorage (${key}):`, error);
      return false;
    }
  }

  // 清除所有应用相关数据
  clearAllAppData(): boolean {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      console.log('All app data cleared from localStorage');
      return true;
    } catch (error) {
      console.error('Failed to clear app data:', error);
      return false;
    }
  }

  // 书籍数据存储
  saveBooks(books: Book[]): boolean {
    return this.setItem(STORAGE_KEYS.BOOKS, books);
  }

  loadBooks(): Book[] {
    const defaultBooks: Book[] = [];

    return this.getItem(STORAGE_KEYS.BOOKS, defaultBooks);
  }

  // 应用设置存储
  saveSettings(settings: Record<string, any>): boolean {
    return this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  loadSettings(): Record<string, any> {
    return this.getItem(STORAGE_KEYS.SETTINGS, {});
  }

  // 数据迁移方法（用于版本升级）
  migrateData(): void {
    try {
      // 检查是否有旧版本数据需要迁移
      const oldBooksKey = 'uploadedBooks';
      const oldBooksData = localStorage.getItem(oldBooksKey);

      if (oldBooksData) {
        const oldBooks = JSON.parse(oldBooksData);
        const currentBooks = this.loadBooks();

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

        // 保存合并后的数据
        this.saveBooks(mergedBooks);
        console.log('数据迁移完成，已将旧数据合并到新格式');

        // 删除旧数据
        localStorage.removeItem(oldBooksKey);
      }
    } catch (error) {
      console.error('数据迁移失败:', error);
    }
  }

  // 检查存储配额
  checkStorageQuota(): { used: number; quota: number; percentage: number } {
    try {
      const used = new Blob(Object.values(localStorage)).size;
      const quota = 5 * 1024 * 1024; // 假设5MB配额
      const percentage = Math.round((used / quota) * 100);

      return { used, quota, percentage };
    } catch (error) {
      console.error('检查存储配额失败:', error);
      return { used: 0, quota: 0, percentage: 0 };
    }
  }
}

// 导出便捷方法
export const storageService = StorageService.getInstance();
