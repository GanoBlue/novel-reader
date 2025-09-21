import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useBookStore } from '@/store/book-store'

// 演示批量收藏功能的组件
export function BatchFavoriteDemo() {
  const [selectedBooks, setSelectedBooks] = useState<number[]>([])
  const { batchToggleFavorite, books } = useBookStore()

  const handleBookSelect = (bookId: number) => {
    setSelectedBooks((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId],
    )
  }

  const handleBatchFavorite = (favorite: boolean) => {
    if (selectedBooks.length === 0) return
    batchToggleFavorite(selectedBooks, favorite)
    setSelectedBooks([])
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">批量收藏演示</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {books.slice(0, 3).map((book) => (
          <label key={book.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedBooks.includes(book.id)}
              onChange={() => handleBookSelect(book.id)}
              className="rounded"
            />
            <span className="text-sm">{book.title}</span>
          </label>
        ))}
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={() => handleBatchFavorite(true)}
          disabled={selectedBooks.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          批量收藏 ({selectedBooks.length})
        </Button>
        <Button
          onClick={() => handleBatchFavorite(false)}
          disabled={selectedBooks.length === 0}
          variant="outline"
          className="text-red-600 border-red-600"
        >
          批量取消收藏
        </Button>
      </div>

      {selectedBooks.length > 0 && (
        <p className="text-sm text-gray-600 mt-2">已选择 {selectedBooks.length} 本书进行批量操作</p>
      )}
    </div>
  )
}
