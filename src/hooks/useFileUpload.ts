import { useCallback } from 'react'
import { processUploadedFiles, type ProcessedBook } from '@/utils/fileProcessor'

export interface UseFileUploadOptions {
  onSuccess?: (books: ProcessedBook[]) => void
  onError?: (error: string) => void
}

export function useFileUpload({ onSuccess, onError }: UseFileUploadOptions = {}) {
  const handleFileUpload = useCallback(
    async (files: File[]) => {
      try {
        const processedBooks = await processUploadedFiles(files)

        if (processedBooks.length > 0) {
          console.log('处理了', processedBooks.length, '个文件:', processedBooks)

          // 调用成功回调
          if (onSuccess) {
            onSuccess(processedBooks)
          } else {
            // 默认显示成功提示
            alert(`成功导入 ${processedBooks.length} 本书籍！`)
          }
        } else {
          const errorMsg = '没有有效的文件可以导入'
          if (onError) {
            onError(errorMsg)
          } else {
            alert(errorMsg)
          }
        }
      } catch (error) {
        const errorMsg = '文件处理失败，请重试'
        console.error('文件处理错误:', error)

        if (onError) {
          onError(errorMsg)
        } else {
          alert(errorMsg)
        }
      }
    },
    [onSuccess, onError],
  )

  return { handleFileUpload }
}

