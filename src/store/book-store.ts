/* eslint-disable no-unused-vars */
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
// 书籍类型定义
export interface Book {
  id: number
  title: string
  author: string
  cover: string
  currentChapter: number
  totalChapters: number
  progress: number
  lastRead?: string
  totalTime?: string
  readCount?: number
  favoriteDate?: string
  isFavorite?: boolean
}

// 页面类型定义
export type PageType = 'library' | 'favorites'

// Store接口定义
interface BookStore {
  books: Book[]
  toggleFavorite: (bookId: number) => void
  batchToggleFavorite: (bookIds: number[], favorite: boolean) => void
  addBooks: (newBooks: Book[]) => void
  addBook: (newBook: Book) => void
  removeBook: (bookId: number) => void
  getBooksByType: (pageType: PageType) => Book[]
  getBookById: (bookId: number) => Book | undefined
}

// 模拟的初始图书数据
const mockBooks: Book[] = [
  {
    id: 1,
    title: '斗破苍穹',
    author: '天蚕土豆',
    cover: 'from-blue-400 to-blue-600',
    currentChapter: 156,
    totalChapters: 208,
    progress: 75,
    lastRead: '2024-01-15',
    totalTime: '45小时',
    readCount: 12,
    isFavorite: true,
    favoriteDate: '2024-01-10',
  },
  {
    id: 2,
    title: '完美世界',
    author: '辰东',
    cover: 'from-green-400 to-green-600',
    currentChapter: 89,
    totalChapters: 178,
    progress: 50,
    lastRead: '2024-01-14',
    totalTime: '32小时',
    readCount: 8,
    isFavorite: false,
  },
  {
    id: 3,
    title: '遮天',
    author: '辰东',
    cover: 'from-purple-400 to-purple-600',
    currentChapter: 203,
    totalChapters: 245,
    progress: 83,
    lastRead: '2024-01-13',
    totalTime: '68小时',
    readCount: 15,
    isFavorite: true,
    favoriteDate: '2024-01-08',
  },
  {
    id: 4,
    title: '诛仙',
    author: '萧鼎',
    cover: 'from-red-400 to-red-600',
    currentChapter: 45,
    totalChapters: 156,
    progress: 29,
    lastRead: '2024-01-12',
    totalTime: '18小时',
    readCount: 5,
    isFavorite: false,
  },
  {
    id: 5,
    title: '择天记',
    author: '猫腻',
    cover: 'from-yellow-400 to-yellow-600',
    currentChapter: 67,
    totalChapters: 134,
    progress: 50,
    lastRead: '2024-01-11',
    totalTime: '25小时',
    readCount: 7,
    isFavorite: true,
    favoriteDate: '2024-01-05',
  },
]

// 创建zustand store
export const useBookStore = create<BookStore>()(
  immer((set, get) => ({
    books: mockBooks,

    // 切换收藏状态
    toggleFavorite: (bookId: number) => {
      set((state) => {
        const updatedBooks = state.books.map((book) => {
          if (book.id === bookId) {
            const newFavoriteState = !book.isFavorite
            return {
              ...book,
              isFavorite: newFavoriteState,
              favoriteDate: newFavoriteState ? new Date().toISOString().split('T')[0] : undefined,
            }
          }
          return book
        })

        return { books: updatedBooks }
      })

      // 记录操作日志
      const book = get().getBookById(bookId)
      console.log(`${book?.isFavorite ? '取消收藏' : '收藏'}图书:`, book?.title)
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
            }
          }
          return book
        })

        return { books: updatedBooks }
      })

      // 记录批量操作日志
      console.log(`${favorite ? '批量收藏' : '批量取消收藏'} ${bookIds.length} 本图书`)
    },

    // 根据页面类型获取书籍
    getBooksByType: (pageType: PageType) => {
      const { books } = get()
      if (pageType === 'favorites') {
        return books.filter((book) => book.isFavorite)
      }
      return books
    },

    // 添加多本书籍
    addBooks: (newBooks: Book[]) => {
      set((state) => {
        const existingIds = new Set(state.books.map((book) => book.id))
        const uniqueNewBooks = newBooks.filter((book) => !existingIds.has(book.id))

        if (uniqueNewBooks.length === 0) {
          console.log('没有新书籍需要添加')
          return state
        }

        const updatedBooks = [...state.books, ...uniqueNewBooks]
        console.log(`成功添加 ${uniqueNewBooks.length} 本新书籍`)

        return { books: updatedBooks }
      })
    },

    // 添加单本书籍
    addBook: (newBook: Book) => {
      set((state) => {
        const existingBook = state.books.find((book) => book.id === newBook.id)

        if (existingBook) {
          console.log('书籍已存在，跳过添加:', newBook.title)
          return state
        }

        const updatedBooks = [...state.books, newBook]
        console.log('成功添加新书籍:', newBook.title)

        return { books: updatedBooks }
      })
    },

    // 删除书籍
    removeBook: (bookId: number) => {
      set((state) => {
        const bookToRemove = state.books.find((book) => book.id === bookId)

        if (!bookToRemove) {
          console.log('要删除的书籍不存在:', bookId)
          return state
        }

        const updatedBooks = state.books.filter((book) => book.id !== bookId)
        console.log('成功删除书籍:', bookToRemove.title)

        return { books: updatedBooks }
      })
    },

    // 根据ID获取单本书籍
    getBookById: (bookId: number) => {
      const { books } = get()
      return books.find((book) => book.id === bookId)
    },
  })),
)

