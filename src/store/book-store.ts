/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import storage from '@/services/storage';
// 书籍类型定义
import type { Book } from '@/types/book';

import type { PageType } from '@/types/common';

// Store接口定义
interface BookStore {
  books: Book[];
  isLoading: boolean; // 添加加载状态
  toggleFavorite: (bookId: number) => void;
  batchToggleFavorite: (bookIds: number[], favorite: boolean) => void;
  addBook: (newBook: Book) => void;
  removeBook: (bookId: number) => void;
  updateBook: (bookId: number, updates: Partial<Book>, skipSave?: boolean) => void; // 更新书籍信息
  getBooksByType: (pageType: PageType) => Book[];
  getBookById: (bookId: number) => Book | undefined;
  initializeBooks: () => Promise<void>; // 添加初始化方法
}

// 创建zustand store
export const useBookStore = create<BookStore>()(
  immer((set, get) => ({
    books: [],
    isLoading: true,

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

        // 保存到 IndexedDB - 更新单本书籍
        const updatedBook = updatedBooks.find((book) => book.id === bookId);
        if (updatedBook) {
          storage.saveBook(updatedBook).catch(console.error);
        }

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

        // 保存到 IndexedDB - 批量更新书籍
        updatedBooks.forEach((book) => {
          if (bookIds.includes(book.id)) {
            storage.saveBook(book).catch(console.error);
          }
        });

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

        // 保存到 IndexedDB - 添加新书籍
        storage.saveBook(newBook).catch(console.error);

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

        // 保存到 IndexedDB - 删除书籍与正文
        storage.deleteBook(bookId).catch(console.error);
        storage.deleteBookContent(bookId).catch(console.error);

        return { books: updatedBooks };
      });
    },

    // 根据ID获取单本书籍
    getBookById: (bookId: number) => {
      const { books } = get();
      return books.find((book) => book.id === bookId);
    },

    // 更新书籍信息（用于同步进度等）
    updateBook: (bookId: number, updates: Partial<Book>, skipSave = false) => {
      set((state) => {
        const updatedBooks = state.books.map((book) => {
          if (book.id === bookId) {
            return { ...book, ...updates };
          }
          return book;
        });

        // 如果有书籍被更新，保存到 IndexedDB（除非明确跳过）
        if (!skipSave) {
          const updatedBook = updatedBooks.find((book) => book.id === bookId);
          if (updatedBook) {
            storage.saveBook(updatedBook).catch(console.error);
          }
        }

        return { books: updatedBooks };
      });
    },

    // 初始化书籍数据 - 从 IndexedDB 异步加载
    initializeBooks: async () => {
      set((state) => ({ ...state, isLoading: true }));

      try {
        // 从 IndexedDB 加载书籍数据
        const books = await storage.getAllBooks();
        set((state) => ({ ...state, books, isLoading: false }));

        console.log(`成功加载 ${books.length} 本书籍`);
      } catch (error) {
        console.error('初始化书籍数据失败:', error);
        set((state) => ({ ...state, books: [], isLoading: false }));
      }
    },
  })),
);

// 应用启动时自动初始化书籍数据
useBookStore.getState().initializeBooks();

