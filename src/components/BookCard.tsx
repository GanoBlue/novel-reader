import { BookOpen, Settings, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useBookStore } from '@/store/book-store'

interface BookCardProps {
  id: number
  title: string
  author: string
  cover: string
  currentChapter: number
  totalChapters: number
  progress: number
  variant?: 'library' | 'favorites' | 'history'
  displayMode?: 'grid' | 'list'
  lastRead?: string
  totalTime?: string
  readCount?: number
  favoriteDate?: string
  isFavorite?: boolean
  onRead?: () => void
  onFavorite?: () => void
  onSettings?: () => void
  className?: string
}

export function BookCard({
  id,
  title,
  author,
  cover,
  currentChapter,
  progress,
  variant = 'library',
  displayMode = 'grid',
  totalTime,
  readCount,
  favoriteDate,
  isFavorite: propIsFavorite,
  onRead,
  onFavorite,
  onSettings,
  className,
}: BookCardProps) {
  // 从store获取书籍的最新状态
  const { getBookById } = useBookStore()
  const book = getBookById(id)
  const currentIsFavorite = book?.isFavorite ?? propIsFavorite ?? false
  // 网格模式
  if (displayMode === 'grid') {
    return (
      <Card
        className={cn('group hover:shadow-lg transition-shadow cursor-pointer relative', className)}
        onClick={onRead}
      >
        <CardContent className="p-6">
          {/* 右上角操作按钮 */}
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* 设置按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation()
                onSettings?.()
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* 收藏按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 w-8 p-0',
                currentIsFavorite
                  ? 'text-red-500 hover:text-red-700'
                  : 'text-gray-400 hover:text-red-500',
              )}
              onClick={(e) => {
                e.stopPropagation()
                onFavorite?.()
              }}
            >
              <Heart className={cn('h-4 w-4', currentIsFavorite && 'fill-current')} />
            </Button>
          </div>

          <div className="flex items-center justify-center mb-4">
            <div
              className={cn(
                'w-24 h-32 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-md',
                cover,
              )}
            >
              <BookOpen className="text-white text-3xl" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mb-3">{author}</p>

            {/* 进度信息 */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>第 {currentChapter} 章</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* 额外信息（历史页面显示） */}
            {variant === 'history' && totalTime && readCount && (
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 mb-3">
                <span>时长: {totalTime}</span>
                <span>阅读: {readCount} 次</span>
              </div>
            )}

            {/* 收藏时间（收藏页面显示） */}
            {variant === 'favorites' && favoriteDate && (
              <div className="text-xs text-gray-500 mb-3">收藏时间: {favoriteDate}</div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // 列表模式 - 更紧凑的布局
  return (
    <Card
      className={cn('hover:shadow-md transition-shadow cursor-pointer', className)}
      onClick={onRead}
    >
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-800 truncate">{title}</h3>
              <span className="text-sm text-gray-500">·</span>
              <span className="text-sm text-gray-600 truncate">{author}</span>

              {/* 收藏状态指示器 */}
              <div className="flex items-center ml-2">
                <Heart
                  className={cn(
                    'h-3 w-3',
                    currentIsFavorite ? 'text-red-500 fill-current' : 'text-gray-400',
                  )}
                />
                {currentIsFavorite && <span className="text-xs text-red-500 ml-1">已收藏</span>}
              </div>

              {variant === 'history' && totalTime && readCount && (
                <>
                  <span className="text-xs text-gray-500 ml-2">时长: {totalTime}</span>
                  <span className="text-xs text-gray-500">阅读: {readCount} 次</span>
                </>
              )}
              {variant === 'favorites' && favoriteDate && (
                <span className="text-xs text-gray-500 ml-2">收藏时间: {favoriteDate}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                第 {currentChapter} 章 • {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-1.5 mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
