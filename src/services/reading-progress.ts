// 阅读进度服务
// 负责保存和恢复用户的阅读进度
// 使用新的存储架构，进度信息直接存储在书籍对象中

import storage from './storage';
import type { ReadingProgress } from '@/types/book';
import { useBookStore } from '@/store/book-store';
import type { Book } from '@/types/book';

// 辅助函数：计算并累加阅读时长
const calculateAndAccumulateReadingTime = (
  progress: ReadingProgress,
  book: Book,
): { newReadingTime: number; newTotalTime: number } => {
  if (!progress.sessionStartTime) {
    return {
      newReadingTime: progress.readingTime || 0,
      newTotalTime: book.totalTime || 0,
    };
  }

  const sessionStart = new Date(progress.sessionStartTime);
  const sessionDurationMinutes = Math.floor(
    (new Date().getTime() - sessionStart.getTime()) / (1000 * 60),
  );

  if (sessionDurationMinutes <= 0) {
    return {
      newReadingTime: progress.readingTime || 0,
      newTotalTime: book.totalTime || 0,
    };
  }

  return {
    newReadingTime: (progress.readingTime || 0) + sessionDurationMinutes,
    newTotalTime: (book.totalTime || 0) + sessionDurationMinutes,
  };
};

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

// 开始阅读会话（记录开始时间，增加阅读次数）
export const startReadingSession = async (bookId: number): Promise<void> => {
  try {
    const book = await storage.getBook(bookId);
    if (!book) {
      console.error('书籍不存在:', bookId);
      return;
    }

    const now = new Date().toISOString();
    const existingProgress = book.readingProgress;

    // 如果之前有未结束的会话，先结束它（计算并累加时长）
    if (existingProgress?.sessionStartTime) {
      const { newReadingTime, newTotalTime } = calculateAndAccumulateReadingTime(
        existingProgress,
        book,
      );
      existingProgress.readingTime = newReadingTime;
      book.totalTime = newTotalTime;
    }

    // 检查是否需要增加阅读次数（仅在会话开始时间不存在时增加，避免重复增加）
    let readCount = book.readCount || 0;
    if (!existingProgress?.sessionStartTime) {
      readCount += 1; // 只有在新会话开始时才增加阅读次数
    }

    // 创建或更新阅读进度，记录会话开始时间
    const newProgress: ReadingProgress = {
      bookId,
      paraOffset: existingProgress?.paraOffset || 0,
      progress: existingProgress?.progress || 0,
      lastReadAt: now,
      readingTime: existingProgress?.readingTime || 0,
      currentChapter: existingProgress?.currentChapter,
      sessionStartTime: now, // 记录新的会话开始时间
    };

    // 更新 store（会自动保存到 IndexedDB）
    useBookStore.getState().updateBook(bookId, {
      readingProgress: newProgress,
      readCount,
      totalTime: book.totalTime || 0,
    });
  } catch (error) {
    console.error('开始阅读会话失败:', error);
    throw error;
  }
};

// 结束阅读会话（计算本次阅读时长并累加）
export const endReadingSession = async (bookId: number): Promise<void> => {
  try {
    const book = await storage.getBook(bookId);
    if (!book || !book.readingProgress) {
      return;
    }

    const progress = book.readingProgress;
    if (!progress.sessionStartTime) {
      return; // 没有会话开始时间，跳过
    }

    // 计算并累加阅读时长
    const { newReadingTime, newTotalTime } = calculateAndAccumulateReadingTime(progress, book);

    // 更新阅读进度（清除会话开始时间）
    const updatedProgress: ReadingProgress = {
      ...progress,
      readingTime: newReadingTime,
      sessionStartTime: undefined, // 清除会话开始时间
    };

    // 更新 store（会自动保存到 IndexedDB）
    useBookStore.getState().updateBook(bookId, {
      readingProgress: updatedProgress,
      totalTime: newTotalTime,
    });
  } catch (error) {
    console.error('结束阅读会话失败:', error);
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

    // 如果还没有会话开始时间，则设置为当前时间（防止第一次更新时没有会话）
    const sessionStartTime = existingProgress?.sessionStartTime || now;

    const newProgress: ReadingProgress = {
      bookId,
      paraOffset,
      progress,
      lastReadAt: now,
      readingTime: existingProgress?.readingTime || 0, // 保持现有阅读时长，不在这里累加
      currentChapter,
      sessionStartTime, // 保持会话开始时间
    };

    // 更新 store（会自动保存到 IndexedDB）
    useBookStore.getState().updateBook(bookId, {
      readingProgress: newProgress,
    });
  } catch (error) {
    console.error('更新阅读进度失败:', error);
    throw error;
  }
};

// 导出进度服务
export const readingProgressService = {
  get: getReadingProgress,
  update: updateReadingProgress,
  startSession: startReadingSession,
  endSession: endReadingSession,
};

