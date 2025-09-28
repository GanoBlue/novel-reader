import { useCallback } from 'react';
import { useBookStore } from '@/store/book-store';
import type { Book } from '@/types/book';
import type { PageType } from '@/types/common';

// 钩子参数类型
interface UseBooksOptions {
  pageType: PageType;
}

// 使用书籍数据的hooks
export function useBooks({ pageType }: UseBooksOptions) {
  // 从store获取数据和方法
  const {
    books: allBooks,
    isLoading,
    toggleFavorite,
    getBooksByType,
    getBookById,
    batchToggleFavorite,
    addBook,
    removeBook,
  } = useBookStore();

  // 根据页面类型获取书籍
  const books = getBooksByType(pageType);

  // 收藏/取消收藏处理函数
  const handleToggleFavorite = useCallback(
    (bookId: number) => {
      toggleFavorite(bookId);
    },
    [toggleFavorite],
  );

  return {
    books,
    allBooks,
    isLoading,
    toggleFavorite: handleToggleFavorite,
    getBookById, // 暴露这个方法，方便组件获取单本书籍信息
    batchToggleFavorite, // 批量收藏/取消收藏
    addBook, // 添加书籍
    removeBook, // 删除书籍
  };
}

// 导出类型，方便其他文件使用
export type { Book, PageType };

