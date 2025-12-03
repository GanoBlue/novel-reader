import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
// 用于解压 .txt.gz 文本（仅在本地解析，不上传）
import pako from 'pako';
import { Plus, Search, Settings, Grid, List, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookCard } from './book-card';
import { useBooks } from '@/hooks/use-books';
import type { PageType } from '@/types/common';
import { Upload } from 'antd';
import { toast } from 'sonner';
import type { UploadProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import storage from '@/services/storage';
import { useI18n } from '@/services/i18n';
import { parseEpubFileToBlocks, extractEpubMetadata } from '@/services/epub';
import { debounce } from '@/lib/utils';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const { books, toggleFavorite, addBook, removeBook, isLoading } = useBooks({
    pageType,
  });
  const navigate = useNavigate();
  const { t } = useI18n();

  const config = pageConfig[pageType];

  // 创建防抖更新函数
  const debouncedUpdate = useRef(
    debounce((value: string) => {
      setDebouncedSearchQuery(value);
    }, 300),
  ).current;

  // 当搜索输入变化时，使用防抖更新实际搜索关键词
  useEffect(() => {
    debouncedUpdate(searchQuery);
    // 清理函数：组件卸载时取消待执行的防抖调用
    return () => {
      debouncedUpdate.cancel();
    };
  }, [searchQuery, debouncedUpdate]);

  // 清除搜索（立即清除，不使用防抖）
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    debouncedUpdate.cancel(); // 取消待执行的防抖调用
  }, [debouncedUpdate]);

  // 搜索过滤书籍（使用防抖后的搜索关键词）
  const filteredBooks = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return books;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    return books.filter((book) => {
      const titleMatch = book.title.toLowerCase().includes(query);
      const authorMatch = book.author.toLowerCase().includes(query);
      return titleMatch || authorMatch;
    });
  }, [books, debouncedSearchQuery]);

  // 按最近阅读时间排序（有阅读记录的优先，然后按时间倒序）
  const sortedBooks = useMemo(() => {
    return [...filteredBooks].sort((a, b) => {
      const aLastRead = a.readingProgress?.lastReadAt;
      const bLastRead = b.readingProgress?.lastReadAt;

      // 如果都没有阅读记录，保持原顺序
      if (!aLastRead && !bLastRead) return 0;
      // 有阅读记录的排在前面
      if (!aLastRead) return 1;
      if (!bLastRead) return -1;
      // 都有阅读记录，按时间倒序（最近阅读的在前）
      return new Date(bLastRead).getTime() - new Date(aLastRead).getTime();
    });
  }, [filteredBooks]);

  // 尝试以多种常见编码解码二进制到字符串（优先utf-8，回退gb18030、big5）
  const decodeArrayBufferWithFallback = useCallback(async (buf: ArrayBuffer): Promise<string> => {
    const encodings = ['utf-8', 'gb18030', 'big5'] as const;
    for (const enc of encodings) {
      try {
        // 某些环境可能不支持部分编码，构造失败会抛错
        const decoder = new TextDecoder(enc as unknown as string, { fatal: false });
        const text = decoder.decode(new Uint8Array(buf));
        // 简单启发式：若utf-8解码后包含大量替换字符，可继续尝试其他编码
        const replacementRatio = (text.match(/\uFFFD/g)?.length ?? 0) / Math.max(1, text.length);
        if (replacementRatio < 0.01 || enc !== 'utf-8') {
          return text;
        }
      } catch {
        // 不支持该编码或解码失败，尝试下一个
      }
    }
    // 所有编码都失败则回退为空串
    return '';
  }, []);

  // 自定义上传处理 - 添加到zustand store
  const customRequest: UploadProps['customRequest'] = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (options: any) => {
      const { file, onSuccess, onError } = options;

      try {
        // 验证文件格式
        const fileName = (file as File).name;
        const lower = fileName.toLowerCase();
        const isTxt = lower.endsWith('.txt');
        const isTxtGz = lower.endsWith('.txt.gz');
        const isEpub = lower.endsWith('.epub');

        if (!isTxt && !isTxtGz && !isEpub) {
          toast.error(`文件 ${fileName} 格式不支持，请选择 .txt/.txt.gz 或 .epub 格式的文件`);
          onError?.(new Error('文件格式不支持'));
          return;
        }

        // 读取文本内容（txt/.txt.gz 读取正文；epub此处先跳过，仅入库元信息）
        let textContent: string | undefined;
        if (isTxt || isTxtGz) {
          const fr = new FileReader();
          // 统一用二进制读取，便于 gzip 解压与多编码尝试
          fr.onload = async () => {
            try {
              const arrayBuf = fr.result as ArrayBuffer;
              const rawBuf = isTxtGz ? pako.ungzip(new Uint8Array(arrayBuf)).buffer : arrayBuf;
              // 多编码自动识别解码
              textContent = await decodeArrayBufferWithFallback(rawBuf);
            } catch (e) {
              toast.error('文本解码失败');
              onError?.(new Error('文本解码失败'));
              return;
            }

            // 创建新书籍对象并添加到zustand store（仅元信息）
            const newBook = {
              id: Date.now(), // 使用时间戳作为ID
              title: fileName.replace(/\.(txt|txt\.gz|epub)$/i, ''), // 移除扩展名作为标题
              author: '未知作者', // 默认作者
              cover: `from-${['blue', 'green', 'purple', 'red', 'yellow'][Math.floor(Math.random() * 5)]}-400 to-${['blue', 'green', 'purple', 'red', 'yellow'][Math.floor(Math.random() * 5)]}-600`, // 随机封面颜色
              format: 'txt' as const,
              fileSize: file.size,
              currentChapter: 1,
              totalChapters: 1,
              totalTime: 0,
              readCount: 0,
              isFavorite: false,
              addDate: new Date().toISOString(),
            };
            addBook(newBook);

            // 将正文写入 IndexedDB
            if (textContent) {
              storage.saveBookContent(newBook.id, textContent).catch(() => {
                console.warn('保存正文到 IndexedDB 失败');
              });
            }

            toast.success(`${fileName} 导入成功！`);
            onSuccess?.(newBook);
          };
          fr.onerror = () => {
            toast.error('读取文件失败');
            onError?.(new Error('读取失败'));
          };
          fr.readAsArrayBuffer(file as File);
          return;
        }
        // 非txt（如epub）解析为 Blocks 并入库
        // 先提取 EPUB 元数据（标题、作者、封面）
        let epubMetadata;
        try {
          epubMetadata = await extractEpubMetadata(file as File);
        } catch (e) {
          console.warn('EPUB 元数据提取失败，使用默认值:', e);
          epubMetadata = {};
        }

        // 生成默认封面（如果没有提取到封面）
        const getDefaultCover = () => {
          const colors = ['blue', 'green', 'purple', 'red', 'yellow'];
          const color1 = colors[Math.floor(Math.random() * colors.length)];
          const color2 = colors[Math.floor(Math.random() * colors.length)];
          return `from-${color1}-400 to-${color2}-600`;
        };

        const newBook = {
          id: Date.now(), // 使用时间戳作为ID
          title: epubMetadata.title || fileName.replace(/\.(txt|txt\.gz|epub)$/i, ''), // 使用 EPUB 标题或文件名
          author: epubMetadata.author || '未知作者', // 使用 EPUB 作者或默认值
          cover: epubMetadata.cover || getDefaultCover(), // 使用 EPUB 封面或随机渐变
          format: 'epub' as const,
          fileSize: file.size,
          currentChapter: 1,
          totalChapters: 1,
          totalTime: 0,
          readCount: 0,
          isFavorite: false,
          addDate: new Date().toISOString(),
        };

        // 添加到zustand store
        addBook(newBook);

        try {
          const parsedContent = await parseEpubFileToBlocks(file as File);
          const payload = JSON.stringify({
            __type: 'blocks',
            blocks: parsedContent.blocks,
            chapters: parsedContent.chapters,
          });
          await storage.saveBookContent(newBook.id, payload);
        } catch (e) {
          console.error(e);
          toast.error((e as Error).message);
          onError?.(new Error('EPUB 解析失败，仅保存元信息'));
          return;
        }

        toast.success(`${fileName} 导入成功！`);
        onSuccess?.(newBook);
      } catch (error) {
        toast.error('导入失败，请重试');
        onError?.(error as Error);
      }
    },
    [addBook],
  );

  // 上传前的验证：
  // - 支持 .txt /.txt.gz /.epub
  // - 限制文件大小，避免阻塞主线程
  const beforeUpload = useCallback((file: File) => {
    const lower = file.name.toLowerCase();
    const isValidFormat =
      lower.endsWith('.txt') || lower.endsWith('.txt.gz') || lower.endsWith('.epub');

    if (!isValidFormat) {
      toast.error('只支持 .txt、.txt.gz 和 .epub 格式的文件！');
      return false;
    }

    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      toast.error('文件大小不能超过 50MB！');
      return false;
    }

    return true;
  }, []);

  // 覆盖阅读行为：跳转到阅读器
  const openReader = useCallback(
    (bookId: number) => {
      navigate(`/read/${bookId}`);
    },
    [navigate],
  );

  return (
    <div className="space-y-2">
      {/* 顶部导航栏 */}
      <div className="border-b border-border">
        <div className="mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-8 flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                {pageType === 'library' ? t('library_title') : t('favorites_title')}
              </h1>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder={config.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {config.importButton && (
                <Upload
                  name="file"
                  multiple
                  accept=".txt,.txt.gz,.epub"
                  customRequest={customRequest}
                  showUploadList={false}
                >
                  <Button className="mr-2">
                    <Plus />
                    {t('import_book')}
                  </Button>
                </Upload>
              )}
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

      {/* 主要内容区域 */}
      <div className="px-6">
        {isLoading ? (
          /* 加载状态 */
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">正在加载书架...</h3>
            <p className="text-muted-foreground">从本地存储中读取您的图书</p>
          </div>
        ) : sortedBooks.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {sortedBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    {...book}
                    variant={pageType}
                    displayMode="grid"
                    onRead={() => openReader(book.id)}
                    onFavorite={() => toggleFavorite(book.id)}
                    onDelete={() => removeBook(book.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    {...book}
                    variant={pageType}
                    displayMode="list"
                    onRead={() => openReader(book.id)}
                    onFavorite={() => toggleFavorite(book.id)}
                    onDelete={() => removeBook(book.id)}
                    className="p-4"
                  />
                ))}
              </div>
            )}
          </>
        ) : debouncedSearchQuery.trim() ? (
          /* 搜索无结果 */
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-3xl text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">未找到相关书籍</h3>
            <p className="text-muted-foreground mb-6">
              没有找到与"{debouncedSearchQuery}"相关的书籍，请尝试其他关键词
            </p>
            <Button variant="outline" onClick={clearSearch}>
              清除搜索
            </Button>
          </div>
        ) : (
          /* 空状态提示 */
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-3xl text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">{config.emptyTitle}</h3>
            <p className="text-muted-foreground mb-6">{config.emptyDescription}</p>
            {pageType === 'library' && (
              <Upload
                name="file"
                multiple
                accept=".txt,.txt.gz,.epub"
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

