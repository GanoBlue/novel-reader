import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Settings, Grid, List, Heart, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BookCard } from '@/components/BookCard'
import { FileUpload } from '@/components/FileUpload'
import { useBooks, type PageType } from '@/hooks/use-books'

interface BookPageProps {
  pageType: PageType
}

// 页面配置
const pageConfig = {
  library: {
    title: '我的书架',
    searchPlaceholder: '搜索书架中的图书',
    importButton: true,
    emptyTitle: '书架空空如也',
    emptyDescription: '还没有添加任何图书，从书城导入或本地上传吧',
    emptyButton: '导入图书',
  },
  favorites: {
    title: '我的收藏',
    searchPlaceholder: '搜索收藏的图书',
    importButton: false,
    emptyTitle: '收藏夹空空如也',
    emptyDescription: '还没有收藏任何图书，从书架选择心仪的图书收藏吧',
    emptyButton: '去书架看看',
  },
} as const

function AddBookCard({
  displayMode,
  onFileSelect,
}: {
  displayMode?: 'grid' | 'list'
  onFileSelect?: (files: File[]) => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (file) =>
          file.type === 'text/plain' ||
          file.type === 'application/epub+zip' ||
          file.name.endsWith('.txt') ||
          file.name.endsWith('.epub'),
      )

      if (droppedFiles.length > 0 && onFileSelect) {
        onFileSelect(droppedFiles)
      }
    },
    [onFileSelect],
  )

  const handleClick = useCallback(() => {
    if (!onFileSelect) return

    // 创建隐藏的文件输入框
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.txt,.epub,text/plain,application/epub+zip'

    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []).filter(
        (file) =>
          file.type === 'text/plain' ||
          file.type === 'application/epub+zip' ||
          file.name.endsWith('.txt') ||
          file.name.endsWith('.epub'),
      )

      if (files.length > 0) {
        onFileSelect(files)
      }
    }

    input.click()
  }, [onFileSelect])

  if (displayMode === 'list') {
    return (
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-16">
            <div className="text-center">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <BookOpen className="text-sm text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 font-medium">
                {isDragOver ? '释放文件以上传' : '添加新书'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {isDragOver ? '支持 TXT 和 EPUB' : '拖拽或点击添加'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`border-2 border-dashed transition-colors cursor-pointer ${
        isDragOver
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <CardContent className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Plus className="text-2xl text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">{isDragOver ? '释放文件以上传' : '添加新书'}</p>
          <p className="text-sm text-gray-400 mt-1">
            {isDragOver ? '支持 TXT 和 EPUB' : '拖拽或点击添加'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function BookPage({ pageType }: BookPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const navigate = useNavigate()
  const { books, toggleFavorite, handleRead, handleSettings, allBooks } = useBooks({ pageType })
  const config = pageConfig[pageType]

  // 处理收藏/取消收藏
  const handleToggleFavorite = useCallback(
    (bookId: number) => {
      toggleFavorite(bookId)
    },
    [toggleFavorite],
  )

  // 统计信息
  const totalBooks = pageType === 'library' ? allBooks.length : books.length
  const totalFavorites = allBooks.filter((book) => book.isFavorite).length
  const recentRead = allBooks.filter((book) => book.lastRead).length

  // 处理跳转到书架
  const handleGoToLibrary = useCallback(() => {
    navigate('/library')
  }, [navigate])

  // 处理文件上传成功
  const handleUploadSuccess = useCallback((files: File[]) => {
    // 这里可以添加成功提示或其他逻辑
    console.log('文件上传成功:', files)
    // 刷新书籍列表
    window.location.reload()
  }, [])

  const handleUploadError = useCallback((error: string) => {
    console.error('文件上传错误:', error)
    // 这里可以显示错误提示
  }, [])

  const handleUploadProgress = useCallback(
    (progress: { fileName: string; progress: number; status: string }[]) => {
      console.log('上传进度:', progress)
    },
    [],
  )

  return (
    <div className="space-y-6">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-800">{config.title}</h1>
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  {config.searchPlaceholder}
                </Button>
                {config.importButton && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    导入图书
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 统计信息栏 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <span>共 {totalBooks} 本图书</span>
              {pageType === 'library' && (
                <>
                  <span>收藏: {totalFavorites}</span>
                  <span>最近阅读: {recentRead}</span>
                </>
              )}
              {pageType === 'favorites' && (
                <>
                  <span>收藏夹：默认收藏夹</span>
                  <span>最近收藏：{books[0]?.title || '无'}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-6">
        {books.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    {...book}
                    variant={pageType}
                    displayMode="grid"
                    onRead={() => handleRead(book.id)}
                    onFavorite={() => handleToggleFavorite(book.id)}
                    onSettings={() => handleSettings(book.id)}
                  />
                ))}
                {pageType === 'library' && (
                  <FileUpload
                    displayMode="grid"
                    variant="card"
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                    onUploadProgress={handleUploadProgress}
                    simulateUpload={true}
                    uploadSpeed={30} // 30 KB/s
                    chunkSize={5} // 5 KB
                  />
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    {...book}
                    variant={pageType}
                    displayMode="list"
                    onRead={() => handleRead(book.id)}
                    onFavorite={() => handleToggleFavorite(book.id)}
                    onSettings={() => handleSettings(book.id)}
                    className="p-4"
                  />
                ))}
                {pageType === 'library' && (
                  <FileUpload
                    displayMode="list"
                    variant="card"
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                    onUploadProgress={handleUploadProgress}
                    simulateUpload={true}
                    uploadSpeed={30} // 30 KB/s
                    chunkSize={5} // 5 KB
                  />
                )}
              </div>
            )}
          </>
        ) : (
          /* 空状态提示 */
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">{config.emptyTitle}</h3>
            <p className="text-gray-500 mb-6">{config.emptyDescription}</p>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={
                pageType === 'favorites'
                  ? handleGoToLibrary
                  : () => console.log('导入图书功能待实现')
              }
            >
              {config.emptyButton}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

