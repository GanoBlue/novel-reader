import React from 'react'
import { FileUpload } from './FileUpload'

/**
 * 上传演示组件
 * 用于测试不同上传速度和配置的上传功能
 */
export function UploadDemo() {
  const handleUploadSuccess = (files: File[]) => {
    console.log('上传成功:', files)
    alert(`成功上传 ${files.length} 个文件！`)
  }

  const handleUploadError = (error: string) => {
    console.error('上传错误:', error)
    alert(`上传失败: ${error}`)
  }

  const handleUploadProgress = (
    progress: { fileName: string; progress: number; status: string }[],
  ) => {
    console.log('上传进度:', progress)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">文件上传演示</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 快速上传 */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">快速上传 (100 KB/s)</h3>
          <FileUpload
            simulateUpload={true}
            uploadSpeed={100} // 100 KB/s
            chunkSize={20} // 20 KB
            maxFiles={3}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            onUploadProgress={handleUploadProgress}
          />
        </div>

        {/* 中等速度上传 */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">中等速度 (50 KB/s)</h3>
          <FileUpload
            simulateUpload={true}
            uploadSpeed={50} // 50 KB/s
            chunkSize={10} // 10 KB
            maxFiles={5}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            onUploadProgress={handleUploadProgress}
          />
        </div>

        {/* 慢速上传 */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">慢速上传 (10 KB/s)</h3>
          <FileUpload
            simulateUpload={true}
            uploadSpeed={10} // 10 KB/s
            chunkSize={2} // 2 KB
            maxFiles={2}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            onUploadProgress={handleUploadProgress}
          />
        </div>
      </div>

      {/* 配置说明 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">配置说明</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-700">上传速度</h4>
            <p className="text-gray-600">控制模拟上传速度，单位为 KB/s</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• 10 KB/s: 慢速上传</li>
              <li>• 50 KB/s: 中等速度</li>
              <li>• 100 KB/s: 快速上传</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">分块大小</h4>
            <p className="text-gray-600">每次上传的数据块大小，单位为 KB</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• 2 KB: 小块，更新频繁</li>
              <li>• 10 KB: 中等块</li>
              <li>• 20 KB: 大块，更新较少</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">测试建议</h4>
            <p className="text-gray-600">使用不同配置测试上传体验</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• 测试大文件上传</li>
              <li>• 测试多文件同时上传</li>
              <li>• 测试取消上传功能</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">使用说明</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>选择任意一个上传区域</li>
          <li>拖拽或点击选择文件（支持 TXT 和 EPUB）</li>
          <li>观察进度条显示上传进度</li>
          <li>测试不同速度的上传体验</li>
          <li>尝试取消上传功能</li>
          <li>查看控制台了解详细进度信息</li>
        </ol>
      </div>
    </div>
  )
}

