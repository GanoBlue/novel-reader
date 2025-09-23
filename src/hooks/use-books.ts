import { useCallback } from 'react'
import { useBookStore, type Book, type PageType } from '@/store/book-store'

// 钩子参数类型
interface UseBooksOptions {
  pageType: PageType
}

// 使用书籍数据的hooks
export function useBooks({ pageType }: UseBooksOptions) {
  // 从store获取数据和方法
  const {
    books: allBooks,
    toggleFavorite,
    getBooksByType,
    getBookById,
    batchToggleFavorite,
    addBooks,
    addBook,
    removeBook,
  } = useBookStore()

  // 根据页面类型获取书籍
  const books = getBooksByType(pageType)

  // 收藏/取消收藏处理函数
  const handleToggleFavorite = useCallback(
    (bookId: number) => {
      toggleFavorite(bookId)
    },
    [toggleFavorite],
  )

  // 阅读处理函数
  const handleRead = useCallback((bookId: number) => {
    console.log('开始阅读图书:', bookId)
  }, [])

  // 设置处理函数
  const handleSettings = useCallback((bookId: number) => {
    console.log('打开图书设置:', bookId)
  }, [])

  return {
    books,
    allBooks,
    toggleFavorite: handleToggleFavorite,
    handleRead,
    handleSettings,
    getBookById, // 暴露这个方法，方便组件获取单本书籍信息
    batchToggleFavorite, // 批量收藏/取消收藏
    addBooks, // 批量添加书籍
    addBook, // 添加单本书籍
    removeBook, // 删除书籍
  }
}

// 导出类型，方便其他文件使用
export type { Book, PageType }

