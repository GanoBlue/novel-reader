import { useState, useCallback } from 'react';
import { Plus, Search, Settings, Grid, List, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/BookCard';
import { useBooks, type PageType } from '@/hooks/use-books';
import { Upload, message } from 'antd';
import type { UploadProps } from 'antd';

interface BookPageProps {
  pageType: PageType;
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
} as const;

export function BookPage({ pageType }: BookPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { books, toggleFavorite, handleRead, handleSettings, allBooks } = useBooks({
    pageType,
  });
  const config = pageConfig[pageType];

  // 处理收藏/取消收藏
  const handleToggleFavorite = useCallback(
    (bookId: number) => {
      toggleFavorite(bookId);
    },
    [toggleFavorite],
  );

  // 统计信息
  const totalBooks = pageType === 'library' ? allBooks.length : books.length;
  const totalFavorites = allBooks.filter((book) => book.isFavorite).length;
  const recentRead = allBooks.filter((book) => book.lastRead).length;

  // 自定义上传处理 - 直接保存到 localStorage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customRequest: UploadProps['customRequest'] = useCallback((options: any) => {
    const { file, onSuccess, onError } = options;

    try {
      // 验证文件格式
      const fileName = (file as File).name;
      const extension = fileName.toLowerCase().split('.').pop();

      if (extension !== 'txt' && extension !== 'epub') {
        message.error(`文件 ${fileName} 格式不支持，请选择 .txt 或 .epub 格式的文件`);
        onError?.(new Error('文件格式不支持'));
        return;
      }

      // 保存文件信息到 localStorage
      const fileData = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: fileName,
        size: (file as File).size,
        type: extension,
        uploadTime: new Date().toISOString(),
      };

      // 获取现有的文件列表
      const existingFiles = JSON.parse(localStorage.getItem('uploadedBooks') || '[]');
      existingFiles.push(fileData);
      localStorage.setItem('uploadedBooks', JSON.stringify(existingFiles));

      // 模拟上传延迟
      setTimeout(() => {
        message.success(`${fileName} 导入成功！`);
        onSuccess?.(fileData);
      }, 500);
    } catch (error) {
      message.error('导入失败，请重试');
      onError?.(error as Error);
    }
  }, []);

  // 上传前的验证
  const beforeUpload = useCallback((file: File) => {
    const extension = file.name.toLowerCase().split('.').pop();
    const isValidFormat = extension === 'txt' || extension === 'epub';

    if (!isValidFormat) {
      message.error('只支持 .txt 和 .epub 格式的文件！');
      return false;
    }

    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      message.error('文件大小不能超过 50MB！');
      return false;
    }

    return true;
  }, []);

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
                  <Upload
                    name="file"
                    multiple
                    accept=".txt,.epub"
                    customRequest={customRequest}
                    beforeUpload={beforeUpload}
                    showUploadList={{ showPreviewIcon: false, showDownloadIcon: false }}
                  >
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      导入图书
                    </Button>
                  </Upload>
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
            {pageType === 'library' && (
              <Upload
                name="file"
                multiple
                accept=".txt,.epub"
                customRequest={customRequest}
                beforeUpload={beforeUpload}
                showUploadList={{ showPreviewIcon: false, showDownloadIcon: false }}
              >
                <Button className="bg-blue-600 hover:bg-blue-700">{config.emptyButton}</Button>
              </Upload>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

