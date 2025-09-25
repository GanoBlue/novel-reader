// 阅读进度服务
// 负责保存和恢复用户的阅读进度

export interface ReadingProgress {
  bookId: number;
  position: number; // 字符位置
  progress: number; // 百分比进度 (0-100)
  lastReadAt: string; // ISO 日期字符串
  readingTime: number; // 阅读时长（秒）
  currentChapter?: string; // 当前章节标题
}

// 进度存储键名
const PROGRESS_KEY = 'novel-reader-progress';

// 获取所有阅读进度
export const getAllReadingProgress = (): Record<number, ReadingProgress> => {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('读取阅读进度失败:', error);
  }
  return {};
};

// 获取特定书籍的阅读进度
export const getReadingProgress = (bookId: number): ReadingProgress | null => {
  const allProgress = getAllReadingProgress();
  return allProgress[bookId] || null;
};

// 保存阅读进度
export const saveReadingProgress = (progress: ReadingProgress): void => {
  try {
    const allProgress = getAllReadingProgress();
    allProgress[progress.bookId] = progress;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
  } catch (error) {
    console.error('保存阅读进度失败:', error);
  }
};

// 更新阅读进度
export const updateReadingProgress = (
  bookId: number,
  position: number,
  contentLength: number,
  currentChapter?: string,
): void => {
  const progress = Math.round((position / contentLength) * 100);
  const now = new Date().toISOString();

  // 获取现有进度
  const existingProgress = getReadingProgress(bookId);
  const readingTime = existingProgress ? existingProgress.readingTime + 1 : 1; // 简单递增，实际应该计算时间差

  const newProgress: ReadingProgress = {
    bookId,
    position,
    progress,
    lastReadAt: now,
    readingTime,
    currentChapter,
  };

  saveReadingProgress(newProgress);
};

// 删除阅读进度
export const deleteReadingProgress = (bookId: number): void => {
  try {
    const allProgress = getAllReadingProgress();
    delete allProgress[bookId];
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
  } catch (error) {
    console.error('删除阅读进度失败:', error);
  }
};

// 清除所有阅读进度
export const clearAllReadingProgress = (): void => {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch (error) {
    console.error('清除阅读进度失败:', error);
  }
};

// 获取阅读统计
export const getReadingStats = () => {
  const allProgress = getAllReadingProgress();
  const books = Object.values(allProgress);

  const totalBooks = books.length;
  const totalReadingTime = books.reduce((sum, book) => sum + book.readingTime, 0);
  const averageProgress =
    books.length > 0
      ? Math.round(books.reduce((sum, book) => sum + book.progress, 0) / books.length)
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

