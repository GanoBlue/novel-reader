/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { storageService } from '@/services/storage';
// 书籍类型定义
export interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  currentChapter: number;
  totalChapters: number;
  progress: number;
  lastRead?: string;
  totalTime?: number;
  readCount?: number;
  favoriteDate?: string;
  isFavorite?: boolean;
}

// 页面类型定义
export type PageType = 'library' | 'favorites';

// Store接口定义
interface BookStore {
  books: Book[];
  toggleFavorite: (bookId: number) => void;
  batchToggleFavorite: (bookIds: number[], favorite: boolean) => void;
  addBooks: (newBooks: Book[]) => void;
  addBook: (newBook: Book) => void;
  removeBook: (bookId: number) => void;
  getBooksByType: (pageType: PageType) => Book[];
  getBookById: (bookId: number) => Book | undefined;
}

// 初始化时迁移数据到新存储系统
storageService.migrateData();

// 创建zustand store
export const useBookStore = create<BookStore>()(
  immer((set, get) => ({
    books: storageService.loadBooks(),

    // 切换收藏状态
    toggleFavorite: (bookId: number) => {
      set((state) => {
        const updatedBooks = state.books.map((book) => {
          if (book.id === bookId) {
            const newFavoriteState = !book.isFavorite;
            return {
              ...book,
              isFavorite: newFavoriteState,
              favoriteDate: newFavoriteState ? new Date().toISOString().split('T')[0] : undefined,
            };
          }
          return book;
        });

        // 保存到storage service
        storageService.saveBooks(updatedBooks);

        return { books: updatedBooks };
      });

      // 记录操作日志
      const book = get().getBookById(bookId);
      console.log(`${book?.isFavorite ? '取消收藏' : '收藏'}图书:`, book?.title);
    },

    // 批量切换收藏状态
    batchToggleFavorite: (bookIds: number[], favorite: boolean) => {
      set((state) => {
        const updatedBooks = state.books.map((book) => {
          if (bookIds.includes(book.id)) {
            return {
              ...book,
              isFavorite: favorite,
              favoriteDate: favorite ? new Date().toISOString().split('T')[0] : undefined,
            };
          }
          return book;
        });

        // 保存到storage service
        storageService.saveBooks(updatedBooks);

        return { books: updatedBooks };
      });

      // 记录批量操作日志
      console.log(`${favorite ? '批量收藏' : '批量取消收藏'} ${bookIds.length} 本图书`);
    },

    // 根据页面类型获取书籍
    getBooksByType: (pageType: PageType) => {
      const { books } = get();
      if (pageType === 'favorites') {
        return books.filter((book) => book.isFavorite);
      }
      return books;
    },

    // 添加多本书籍
    addBooks: (newBooks: Book[]) => {
      set((state) => {
        const existingIds = new Set(state.books.map((book) => book.id));
        const uniqueNewBooks = newBooks.filter((book) => !existingIds.has(book.id));

        if (uniqueNewBooks.length === 0) {
          console.log('没有新书籍需要添加');
          return state;
        }

        const updatedBooks = [...state.books, ...uniqueNewBooks];
        console.log(`成功添加 ${uniqueNewBooks.length} 本新书籍`);

        // 保存到storage service
        storageService.saveBooks(updatedBooks);

        return { books: updatedBooks };
      });
    },

    // 添加单本书籍
    addBook: (newBook: Book) => {
      set((state) => {
        const existingBook = state.books.find((book) => book.id === newBook.id);

        if (existingBook) {
          console.log('书籍已存在，跳过添加:', newBook.title);
          return state;
        }

        const updatedBooks = [...state.books, newBook];
        console.log('成功添加新书籍:', newBook.title);

        // 保存到storage service
        storageService.saveBooks(updatedBooks);

        return { books: updatedBooks };
      });
    },

    // 删除书籍
    removeBook: (bookId: number) => {
      set((state) => {
        const bookToRemove = state.books.find((book) => book.id === bookId);

        if (!bookToRemove) {
          console.log('要删除的书籍不存在:', bookId);
          return state;
        }

        const updatedBooks = state.books.filter((book) => book.id !== bookId);
        console.log('成功删除书籍:', bookToRemove.title);

        // 保存到storage service
        storageService.saveBooks(updatedBooks);

        return { books: updatedBooks };
      });
    },

    // 根据ID获取单本书籍
    getBookById: (bookId: number) => {
      const { books } = get();
      return books.find((book) => book.id === bookId);
    },
  })),
);
