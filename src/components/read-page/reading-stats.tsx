import React from 'react';
import { Card } from '@/components/ui/card';
import { readingProgressService } from '@/services/reading-progress';
import { Clock, BookOpen, TrendingUp, Calendar } from 'lucide-react';

export const ReadingStats: React.FC = () => {
  const stats = readingProgressService.getStats();

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">阅读统计</h3>

      {/* 总体统计 */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{stats.totalBooks}</p>
              <p className="text-sm text-muted-foreground">已读书籍</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{formatTime(stats.totalReadingTime)}</p>
              <p className="text-sm text-muted-foreground">总阅读时间</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{stats.averageProgress}%</p>
              <p className="text-sm text-muted-foreground">平均进度</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{stats.recentlyRead.length}</p>
              <p className="text-sm text-muted-foreground">最近阅读</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 最近阅读的书籍 */}
      {stats.recentlyRead.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">最近阅读</h4>
          <div className="space-y-2">
            {stats.recentlyRead.map((book, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">
                    {book.currentChapter || '未知章节'}
                  </p>
                  <p className="text-xs text-muted-foreground">进度: {book.progress}%</p>
                </div>
                <div className="text-xs text-muted-foreground">{formatDate(book.lastReadAt)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 阅读建议 */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-medium mb-2 text-blue-800">阅读建议</h4>
        <div className="text-sm text-blue-700 space-y-1">
          {stats.totalBooks === 0 && <p>• 开始阅读第一本书吧！</p>}
          {stats.averageProgress < 50 && stats.totalBooks > 0 && (
            <p>• 尝试完成更多书籍，提高阅读完成率</p>
          )}
          {stats.totalReadingTime < 3600 && <p>• 每天坚持阅读30分钟，养成良好的阅读习惯</p>}
          {stats.recentlyRead.length === 0 && stats.totalBooks > 0 && <p>• 继续阅读未完成的书籍</p>}
        </div>
      </Card>
    </div>
  );
};

