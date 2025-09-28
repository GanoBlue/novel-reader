// 阅读进度服务
// 负责保存和恢复用户的阅读进度
// 使用新的存储架构，进度信息直接存储在书籍对象中

import storage from './storage';
import type { ReadingProgress } from '@/types/book';

// 获取特定书籍的阅读进度
export const getReadingProgress = async (bookId: number): Promise<ReadingProgress | null> => {
  try {
    const book = await storage.getBook(bookId);
    if (!book || !book.readingProgress) {
      return null;
    }
    return book.readingProgress;
  } catch (error) {
    console.error('获取阅读进度失败:', error);
    return null;
  }
};

// 保存阅读进度
export const saveReadingProgress = async (progress: ReadingProgress): Promise<void> => {
  try {
    const book = await storage.getBook(progress.bookId);
    if (!book) {
      console.error('书籍不存在:', progress.bookId);
      return;
    }

    // 更新书籍的阅读进度信息
    const updatedBook = {
      ...book,
      readingProgress: progress,
      lastReadDate: progress.lastReadAt.split('T')[0], // 转换为日期格式
    };

    await storage.saveBook(updatedBook);
  } catch (error) {
    console.error('保存阅读进度失败:', error);
    throw error;
  }
};

// 更新阅读进度
export const updateReadingProgress = async (
  bookId: number,
  paraOffset: number, // 段落偏移量
  contentLength: number, // 内容总长度
  currentChapter?: string,
): Promise<void> => {
  try {
    const book = await storage.getBook(bookId);
    if (!book) {
      console.error('书籍不存在:', bookId);
      return;
    }

    const progress = Number(((paraOffset * 100) / contentLength).toFixed(2));
    const now = new Date().toISOString();
    // 获取现有进度
    const existingProgress = book.readingProgress;
    const readingTime = existingProgress ? existingProgress.readingTime + 1 : 1; // 简单递增，实际应该计算时间差

    const newProgress: ReadingProgress = {
      bookId,
      paraOffset,
      progress,
      lastReadAt: now,
      readingTime,
      currentChapter,
    };

    // 更新书籍的阅读进度信息
    const updatedBook = {
      ...book,
      readingProgress: newProgress,
      lastReadDate: now.split('T')[0],
    };

    await storage.saveBook(updatedBook);
  } catch (error) {
    console.error('更新阅读进度失败:', error);
    throw error;
  }
};

// 获取所有阅读进度
export const getAllReadingProgress = async (): Promise<Record<number, ReadingProgress>> => {
  try {
    const books = await storage.getAllBooks();
    const result: Record<number, ReadingProgress> = {};

    books.forEach((book) => {
      if (book.readingProgress) {
        result[book.id] = book.readingProgress;
      }
    });

    return result;
  } catch (error) {
    console.error('读取阅读进度失败:', error);
    return {};
  }
};

// 删除阅读进度
export const deleteReadingProgress = async (bookId: number): Promise<void> => {
  try {
    const book = await storage.getBook(bookId);
    if (!book) {
      console.error('书籍不存在:', bookId);
      return;
    }

    // 清除阅读进度信息
    const updatedBook = {
      ...book,
      readingProgress: undefined,
      lastReadDate: undefined,
    };

    await storage.saveBook(updatedBook);
  } catch (error) {
    console.error('删除阅读进度失败:', error);
    throw error;
  }
};

// 清除所有阅读进度
export const clearAllReadingProgress = async (): Promise<void> => {
  try {
    const books = await storage.getAllBooks();

    // 批量更新所有书籍，清除阅读进度
    for (const book of books) {
      if (book.readingProgress) {
        const updatedBook = {
          ...book,
          readingProgress: undefined,
          lastReadDate: undefined,
        };
        await storage.saveBook(updatedBook);
      }
    }
  } catch (error) {
    console.error('清除阅读进度失败:', error);
    throw error;
  }
};

// 获取阅读统计
export const getReadingStats = async () => {
  try {
    const allProgress = await getAllReadingProgress();
    const books = Object.values(allProgress);

    const totalBooks = books.length;
    const totalReadingTime = books.reduce((sum, book) => sum + book.readingTime, 0);
    const averageProgress =
      books.length > 0
        ? Math.round(books.reduce((sum, book) => sum + (book.progress || 0), 0) / books.length)
        : 0;

    // 最近阅读的书籍
    const recentlyRead = books
      .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())
      .slice(0, 5);

    return {
      totalBooks,
      totalReadingTime,
      averageProgress,
      recentlyRead,
    };
  } catch (error) {
    console.error('获取阅读统计失败:', error);
    return {
      totalBooks: 0,
      totalReadingTime: 0,
      averageProgress: 0,
      recentlyRead: [],
    };
  }
};

// 导出进度服务
export const readingProgressService = {
  getAll: getAllReadingProgress,
  get: getReadingProgress,
  save: saveReadingProgress,
  update: updateReadingProgress,
  delete: deleteReadingProgress,
  clear: clearAllReadingProgress,
  getStats: getReadingStats,
};

