import { useState, useCallback } from 'react'
import { FilePond, registerPlugin } from 'react-filepond'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size'
import 'filepond/dist/filepond.min.css'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X } from 'lucide-react'
import { filterValidFiles } from '@/utils/fileProcessor'
import { cn } from '@/lib/utils'

// 注册 FilePond 插件
registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize)

interface FileUploadProps {
  onUploadSuccess?: (files: File[]) => void
  onUploadError?: (errorMessage: string) => void
  maxFiles?: number
  maxSize?: number // 字节
  className?: string
  variant?: 'card' | 'compact'
  displayMode?: 'grid' | 'list'
  simulateUpload?: boolean // 是否模拟上传
  uploadSpeed?: number // 模拟上传速度 (KB/s)
  chunkSize?: number // 分块大小 (KB)
}

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'uploading' | 'completed' | 'error' | 'cancelled'
  error?: string
}

export function FileUpload({
  onUploadSuccess,
  onUploadError,
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB
  className,
  variant = 'card',
  displayMode = 'grid',
  simulateUpload = true,
  uploadSpeed = 50, // 50 KB/s
  chunkSize = 10, // 10 KB
}: FileUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [pond, setPond] = useState<any>(null)

  const handleProcessFile = useCallback(
    async (error: any, file: any) => {
      if (error) {
        console.error('文件处理错误:', error)
        return
      }

      // 所有文件处理完成后调用成功回调
      if (pond) {
        const allFiles = pond.getFiles()
        const allFilesCompleted = allFiles.every((f: any) => {
          // 检查上传状态和模拟状态
          const uploadFile = uploadFiles.find((uf) => uf.id === f.id)
          return uploadFile?.status === 'completed' || f.status === 5
        })

        if (allFilesCompleted) {
          const files = allFiles.map((f: any) => f.file)
          onUploadSuccess?.(files)
        }
      }
    },
    [pond, onUploadSuccess, uploadFiles],
  )

  const handleAddFile = useCallback(
    async (error: any, file: any) => {
      if (error) {
        onUploadError?.(error.body || error.message || '文件添加失败')
        return
      }

      // 验证文件类型
      const fileObjects = [file.file]
      const validFiles = filterValidFiles(fileObjects)

      if (validFiles.length === 0) {
        onUploadError?.('文件格式不支持，只支持 TXT 和 EPUB 格式')
        // 从 FilePond 中移除无效文件
        if (pond) {
          pond.removeFile(file.id)
        }
        return
      }

      // 初始化上传状态
      const uploadFile: UploadFile = {
        file: file.file,
        id: file.id,
        progress: 0,
        status: 'uploading',
      }

      setUploadFiles((prev) => [...prev, uploadFile])
      setIsUploading(true)
      setCancelled(false)

      // 模拟上传过程
      if (simulateUpload) {
        simulateFileUpload(file, uploadFile, uploadSpeed, chunkSize)
      }
    },
    [onUploadError, pond, simulateUpload, uploadSpeed, chunkSize],
  )

  // 模拟文件上传函数
  const simulateFileUpload = useCallback(
    async (fileItem: any, uploadFile: UploadFile, speed: number, chunk: number) => {
      const file = uploadFile.file
      const totalSize = file.size
      let uploadedSize = 0

      const updateProgress = () => {
        uploadedSize += chunk * 1024 // KB 转字节
        const progress = Math.min((uploadedSize / totalSize) * 100, 100)

        setUploadFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, progress: Math.round(progress) } : f)),
        )

        // 更新 FilePond 的进度
        if (pond) {
          const filepondFile = pond.getFiles().find((f: any) => f.id === uploadFile.id)
          if (filepondFile) {
            filepondFile.setMetadata('progress', progress)
          }
        }
      }

      const uploadInterval = setInterval(
        () => {
          if (cancelled) {
            clearInterval(uploadInterval)
            return
          }

          updateProgress()

          if (uploadedSize >= totalSize) {
            clearInterval(uploadInterval)
            // 上传完成
            setUploadFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id ? { ...f, progress: 100, status: 'completed' } : f,
              ),
            )
          }
        },
        (chunk * 1024) / speed,
      ) // 根据速度计算间隔时间
    },
    [pond, cancelled],
  )

  const handleCancel = useCallback(() => {
    setCancelled(true)
    setIsUploading(false)
    if (pond) {
      pond.removeFiles()
    }
    setUploadFiles([])
  }, [pond])

  const getFilePondStyles = () => {
    if (variant === 'compact') {
      return {
        height: '120px',
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
      }
    }
    return {
      border: 'none',
    }
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-4', className)}>
        <FilePond
          ref={(ref) => setPond(ref)}
          files={[]}
          allowMultiple={true}
          maxFiles={maxFiles}
          maxFileSize={`${Math.floor(maxSize / 1024 / 1024)}MB`}
          acceptedFileTypes={['text/plain', 'application/epub+zip']}
          onaddfile={handleAddFile}
          onprocessfile={handleProcessFile}
          stylePanelLayout="compact"
          styleLoadIndicatorPosition="center bottom"
          styleProgressIndicatorPosition="right bottom"
          styleButtonRemoveItemPosition="left bottom"
          styleButtonProcessItemPosition="right bottom"
          credits={false}
          stylePanelAspectRatio="1:1"
          {...getFilePondStyles()}
        />

        {/* 上传进度显示 */}
        {uploadFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">上传进度</h4>
            {uploadFiles.map((uploadFile) => (
              <div key={uploadFile.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{uploadFile.file.name}</span>
                  <span className="text-gray-500">{uploadFile.progress}%</span>
                </div>
                <Progress value={uploadFile.progress} className="h-2" />
                {uploadFile.status === 'error' && uploadFile.error && (
                  <p className="text-xs text-red-600">{uploadFile.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 控制按钮 */}
        {isUploading && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleCancel} disabled={cancelled}>
              <X className="h-4 w-4 mr-2" />
              取消上传
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Card variant for use in BookPage
  return (
    <Card className={cn('h-full', className)}>
      <CardContent
        className={cn(
          'p-6 h-full flex flex-col items-center justify-center',
          displayMode === 'list' && 'p-4',
        )}
      >
        <div className="w-full h-full">
          <FilePond
            ref={(ref) => setPond(ref)}
            files={[]}
            allowMultiple={true}
            maxFiles={maxFiles}
            maxFileSize={`${Math.floor(maxSize / 1024 / 1024)}MB`}
            acceptedFileTypes={['text/plain', 'application/epub+zip']}
            onaddfile={handleAddFile}
            onprocessfile={handleProcessFile}
            stylePanelLayout="integrated"
            styleLoadIndicatorPosition="center bottom"
            styleProgressIndicatorPosition="right bottom"
            styleButtonRemoveItemPosition="left bottom"
            styleButtonProcessItemPosition="right bottom"
            credits={false}
            {...getFilePondStyles()}
          />

          {/* 上传进度显示 */}
          {uploadFiles.length > 0 && (
            <div className="space-y-3 mt-4">
              <h4 className="text-sm font-medium text-gray-700">上传进度</h4>
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{uploadFile.file.name}</span>
                    <span className="text-gray-500">{uploadFile.progress}%</span>
                  </div>
                  <Progress value={uploadFile.progress} className="h-2" />
                  {uploadFile.status === 'error' && uploadFile.error && (
                    <p className="text-xs text-red-600">{uploadFile.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 控制按钮 */}
          {isUploading && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={handleCancel} disabled={cancelled}>
                <X className="h-4 w-4 mr-2" />
                取消上传
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

