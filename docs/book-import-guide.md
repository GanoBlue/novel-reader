# 书籍导入指南

## 概述

本指南说明如何使用书籍导入服务导入 EPUB 和 TXT 文件，以及如何正确保存和加载章节元数据。

## 导入 EPUB 文件

### 基本用法

```typescript
import { importEpubFile } from '@/services/book-import';
import { useBookStore } from '@/store/book-store';

// 在组件中使用
const handleFileUpload = async (file: File) => {
  try {
    // 导入 EPUB 文件
    const book = await importEpubFile(file);

    // 添加到书籍列表
    useBookStore.getState().addBook(book);

    console.log('导入成功:', book.title);
    console.log('章节数量:', book.totalChapters);
  } catch (error) {
    console.error('导入失败:', error);
  }
};
```

### 导入流程

1. **提取元数据**: 从 EPUB 文件中提取标题、作者、封面
2. **解析内容**: 将 EPUB 章节解析为 blocks 数组和章节元数据
3. **创建书籍对象**: 生成包含基本信息的 Book 对象
4. **保存内容**: 将 blocks 和 chapters 以 JSON 格式保存到 IndexedDB
5. **保存元数据**: 将书籍基本信息保存到 IndexedDB

### 数据结构

导入后的数据结构：

```typescript
// 书籍元数据（存储在 books 表）
{
  id: 1234567890,
  title: "示例小说",
  author: "作者名",
  cover: "data:image/jpeg;base64,...",
  format: "epub",
  fileSize: 1024000,
  currentChapter: 0,
  totalChapters: 10,
  addDate: "2024-01-01",
  isFavorite: false
}

// 书籍内容（存储在 bookContents 表）
{
  bookId: 1234567890,
  content: JSON.stringify({
    __type: "blocks",
    blocks: [
      { id: "b1", type: "html", html: "<h3>第一章</h3>", tag: "h3" },
      { id: "b2", type: "paragraph", text: "内容..." },
      // ... 更多 blocks
    ],
    chapters: [
      {
        id: "ch1",
        title: "第一章",
        index: 0,
        blockStartIndex: 0,
        blockEndIndex: 5
      },
      // ... 更多章节
    ]
  }),
  savedAt: "2024-01-01T12:00:00.000Z",
  size: 102400
}
```

## 导入 TXT 文件

### 基本用法

```typescript
import { importTxtFile } from '@/services/book-import';

const handleTxtUpload = async (file: File) => {
  try {
    const book = await importTxtFile(file);
    useBookStore.getState().addBook(book);
  } catch (error) {
    console.error('导入失败:', error);
  }
};
```

### TXT 文件处理

- TXT 文件按行分割为段落
- 每行转换为一个 `ParagraphBlock`
- 不生成章节元数据（`chapters` 字段为空）
- `totalChapters` 设置为 1

## 自动格式识别

使用 `importBookFile` 函数自动识别文件格式：

```typescript
import { importBookFile } from '@/services/book-import';

const handleFileUpload = async (file: File) => {
  try {
    // 自动识别 .epub 或 .txt 格式
    const book = await importBookFile(file);
    useBookStore.getState().addBook(book);
  } catch (error) {
    if (error.message.includes('不支持的文件格式')) {
      console.error('只支持 EPUB 和 TXT 格式');
    }
  }
};
```

## 在阅读页面加载内容

### 加载书籍内容和章节

```typescript
import storage from '@/services/storage';
import type { StoredBookContent } from '@/types/storage';

const loadBook = async (bookId: number) => {
  // 加载书籍内容
  const bookContent = await storage.getBookContent(bookId);

  if (bookContent) {
    const parsed: StoredBookContent = JSON.parse(bookContent);

    // 提取 blocks
    const blocks = parsed.blocks;

    // 提取章节元数据（如果存在）
    const chapters = parsed.chapters || [];

    console.log('加载了', blocks.length, '个内容块');
    console.log('加载了', chapters.length, '个章节');

    return { blocks, chapters };
  }
};
```

### 章节导航

```typescript
// 跳转到指定章节
const jumpToChapter = (chapterIndex: number) => {
  const chapter = chapters[chapterIndex];
  if (chapter) {
    // 滚动到章节起始位置
    scrollToBlockIndex(chapter.blockStartIndex);
  }
};

// 获取当前章节
const getCurrentChapter = (currentBlockIndex: number) => {
  return chapters.find(
    (ch) => currentBlockIndex >= ch.blockStartIndex && currentBlockIndex < ch.blockEndIndex,
  );
};

// 获取某个章节的所有内容
const getChapterBlocks = (chapterIndex: number) => {
  const chapter = chapters[chapterIndex];
  if (chapter) {
    return blocks.slice(chapter.blockStartIndex, chapter.blockEndIndex);
  }
  return [];
};
```

## 完整示例：文件上传组件

```typescript
import React, { useRef } from 'react';
import { importBookFile } from '@/services/book-import';
import { useBookStore } from '@/store/book-store';
import { toast } from 'sonner';

export function BookUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addBook } = useBookStore();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // 显示加载提示
      toast.loading('正在导入书籍...');

      // 导入书籍
      const book = await importBookFile(file);

      // 添加到书籍列表
      addBook(book);

      // 显示成功提示
      toast.success(`成功导入《${book.title}》`);

      // 清空文件选择
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('导入失败:', error);
      toast.error('导入失败: ' + error.message);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".epub,.txt"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button onClick={() => fileInputRef.current?.click()}>选择文件</button>
    </div>
  );
}
```

## 错误处理

### 常见错误

1. **文件格式不支持**

```typescript
try {
  await importBookFile(file);
} catch (error) {
  if (error.message.includes('不支持的文件格式')) {
    // 处理格式错误
  }
}
```

2. **EPUB 解析失败**

```typescript
try {
  await importEpubFile(file);
} catch (error) {
  if (error.message.includes('EPUB 解析失败')) {
    // 文件可能损坏或格式不正确
  }
}
```

3. **存储失败**

```typescript
try {
  await importBookFile(file);
} catch (error) {
  if (error.message.includes('存储失败')) {
    // IndexedDB 可能已满或不可用
  }
}
```

## 性能优化建议

1. **大文件处理**: 对于大型 EPUB 文件，考虑显示进度条
2. **并发限制**: 避免同时导入多个文件
3. **内存管理**: 导入完成后及时释放文件对象
4. **错误恢复**: 导入失败时清理部分保存的数据

## 相关文件

- `src/services/book-import.ts` - 书籍导入服务
- `src/services/epub.ts` - EPUB 解析服务
- `src/services/storage.ts` - 存储服务
- `src/store/book-store.ts` - 书籍状态管理
- `src/pages/Read.tsx` - 阅读页面

