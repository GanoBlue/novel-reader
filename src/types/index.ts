/**
 * 小说阅读器数据模型类型定义
 * 提供完整的TypeScript类型支持，确保数据结构的一致性
 */

// 图书模型接口
export interface Book {
  /** 唯一标识符 */
  id: string
  /** 书名 */
  title: string
  /** 作者 */
  author: string
  /** 封面图片URL（可选） */
  cover?: string
  /** 文件格式 */
  format: 'txt' | 'epub'
  /** 文件大小（字节） */
  fileSize: number
  /** 总章节数 */
  totalChapters: number
  /** 当前阅读章节 */
  currentChapter: number
  /** 阅读进度（0-100） */
  progress: number
  /** 最后阅读时间 */
  lastReadAt: Date
  /** 创建时间 */
  createdAt: Date
  /** 章节列表 */
  chapters: Chapter[]
}

// 章节模型接口
export interface Chapter {
  /** 唯一标识符 */
  id: string
  /** 所属图书ID */
  bookId: string
  /** 章节标题 */
  title: string
  /** 章节内容 */
  content: string
  /** 章节顺序 */
  order: number
  /** 是否已阅读 */
  isRead: boolean
  /** 阅读进度（0-100） */
  readProgress: number
}

// 阅读设置模型接口
export interface ReadingSettings {
  /** 字体大小 */
  fontSize: number
  /** 行间距 */
  lineHeight: number
  /** 阅读模式 */
  readingMode: 'single' | 'double'
  /** 主题 */
  theme: 'default' | 'sepia' | 'dark' | 'green'
  /** 夜间模式 */
  nightMode: boolean
  /** 自动保存 */
  autoSave: boolean
  /** 启用分享 */
  shareEnabled: boolean
}

// 导入历史模型接口
export interface ImportHistory {
  /** 唯一标识符 */
  id: string
  /** 文件名 */
  fileName: string
  /** 文件大小（字节） */
  fileSize: number
  /** 文件格式 */
  format: 'txt' | 'epub'
  /** 导入状态 */
  status: 'success' | 'failed' | 'processing'
  /** 导入时间 */
  importedAt: Date
  /** 关联的图书ID（可选） */
  bookId?: string
}

// 搜索过滤器接口
export interface SearchFilters {
  /** 搜索关键词 */
  keyword: string
  /** 作者过滤 */
  author?: string
  /** 格式过滤 */
  format?: 'txt' | 'epub'
  /** 排序方式 */
  sortBy: 'title' | 'author' | 'lastRead' | 'progress' | 'created'
  /** 排序方向 */
  sortOrder: 'asc' | 'desc'
}

// 应用状态接口
export interface AppState {
  /** 当前激活的图书 */
  currentBook?: Book
  /** 当前阅读的章节 */
  currentChapter?: Chapter
  /** 阅读设置 */
  readingSettings: ReadingSettings
  /** 图书列表 */
  books: Book[]
  /** 导入历史 */
  importHistory: ImportHistory[]
  /** 应用加载状态 */
  isLoading: boolean
  /** 错误信息 */
  error?: string
}

// 文件解析结果接口
export interface FileParseResult {
  /** 图书信息 */
  book: Omit<Book, 'id' | 'chapters'>
  /** 章节列表 */
  chapters: Omit<Chapter, 'id' | 'bookId'>[]
  /** 元数据（EPUB专用） */
  metadata?: {
    description?: string
    publisher?: string
    publishDate?: string
    isbn?: string
  }
}

// 存储服务接口
export interface StorageService {
  /** 获取所有图书 */
  getBooks(): Promise<Book[]>
  /** 保存图书 */
  saveBook(book: Book): Promise<void>
  /** 删除图书 */
  deleteBook(bookId: string): Promise<void>
  /** 获取阅读设置 */
  getReadingSettings(): Promise<ReadingSettings>
  /** 保存阅读设置 */
  saveReadingSettings(settings: ReadingSettings): Promise<void>
  /** 获取导入历史 */
  getImportHistory(): Promise<ImportHistory[]>
  /** 添加导入历史 */
  addImportHistory(history: ImportHistory): Promise<void>
}

// 文件服务接口
export interface FileService {
  /** 解析TXT文件 */
  parseTxtFile(file: File): Promise<FileParseResult>
  /** 解析EPUB文件 */
  parseEpubFile(file: File): Promise<FileParseResult>
  /** 验证文件格式 */
  validateFile(file: File): { valid: boolean; format?: 'txt' | 'epub'; error?: string }
}

// 工具类型
export type ThemeType = ReadingSettings['theme']
export type ReadingMode = ReadingSettings['readingMode']
export type FileFormat = Book['format']
export type ImportStatus = ImportHistory['status']
export type SortBy = SearchFilters['sortBy']
export type SortOrder = SearchFilters['sortOrder']
