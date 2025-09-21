export interface ProcessedBook {
  id: number
  title: string
  author: string
  cover: string
  currentChapter: number
  totalChapters: number
  progress: number
  lastRead: string
  totalTime: string
  readCount: number
  isFavorite: boolean
  content: string
}

/**
 * 处理上传的文件并转换为书籍格式
 * @param files 上传的文件列表
 * @returns 处理后的书籍数组
 */
export async function processUploadedFiles(files: File[]): Promise<ProcessedBook[]> {
  const processFile = async (file: File): Promise<ProcessedBook | null> => {
    const fileName = file.name.replace(/\.(txt|epub)$/i, '')
    const author = '未知作者' // 可以从文件内容中提取

    try {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        // 处理 TXT 文件
        const text = await file.text()
        const chapterCount = Math.ceil(text.length / 10000) // 简单估算章节数
        const wordCount = text.length

        return {
          id: Date.now() + Math.random(),
          title: fileName,
          author: author,
          cover: 'from-blue-400 to-blue-600',
          currentChapter: 1,
          totalChapters: chapterCount,
          progress: 0,
          lastRead: new Date().toISOString().split('T')[0],
          totalTime: `${Math.ceil(wordCount / 300)}分钟`, // 估算阅读时间
          readCount: 0,
          isFavorite: false,
          content: text, // 存储文件内容
        }
      } else if (file.type === 'application/epub+zip' || file.name.endsWith('.epub')) {
        // 处理 EPUB 文件
        return {
          id: Date.now() + Math.random(),
          title: fileName,
          author: author,
          cover: 'from-green-400 to-green-600',
          currentChapter: 1,
          totalChapters: 1, // EPUB 需要专门解析
          progress: 0,
          lastRead: new Date().toISOString().split('T')[0],
          totalTime: '未知',
          readCount: 0,
          isFavorite: false,
          content: `EPUB 文件: ${fileName}`, // 占位符
        }
      }
      return null // 不支持的文件类型
    } catch (error) {
      console.error(`处理文件 ${file.name} 时出错:`, error)
      return null
    }
  }

  const processedBooks: ProcessedBook[] = []
  for (const file of files) {
    const book = await processFile(file)
    if (book) {
      processedBooks.push(book)
    }
  }

  return processedBooks
}

/**
 * 验证文件是否为支持的格式
 * @param file 要验证的文件
 * @returns 是否为支持的文件格式
 */
export function isValidFileType(file: File): boolean {
  return (
    file.type === 'text/plain' ||
    file.type === 'application/epub+zip' ||
    file.name.endsWith('.txt') ||
    file.name.endsWith('.epub')
  )
}

/**
 * 过滤文件，只保留支持的格式
 * @param files 文件列表
 * @returns 过滤后的文件列表
 */
export function filterValidFiles(files: File[]): File[] {
  return files.filter(isValidFileType)
}

/**
 * 获取文件大小的格式化字符串
 * @param bytes 文件大小（字节）
 * @returns 格式化的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
