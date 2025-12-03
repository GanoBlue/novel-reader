# 存储格式文档

## 概述

本文档描述了 novel-reader 应用的书籍内容存储格式，特别是对章节元数据的支持。

## StoredBookContent 格式

书籍内容以 JSON 格式存储在 IndexedDB 中，使用 `StoredBookContent` 接口定义：

```typescript
interface StoredBookContent {
  __type: 'blocks';
  blocks: Block[]; // 扁平化的内容 blocks 数组
  chapters?: ChapterMetadata[]; // 章节元数据（可选，用于章节导航）
}
```

## 字段说明

### `__type`

- **类型**: `'blocks'`
- **必需**: 是
- **说明**: 标识内容格式类型，用于区分不同的存储格式

### `blocks`

- **类型**: `Block[]`
- **必需**: 是
- **说明**: 扁平化的内容块数组，包含所有可渲染的内容片段

Block 类型包括：

- `ParagraphBlock`: 纯文本段落
- `HtmlBlock`: HTML 格式内容（h1-h6, p, div 等）
- `ImageBlock`: 图片
- `VideoBlock`: 视频
- `EmbedBlock`: 嵌入式组件

### `chapters`

- **类型**: `ChapterMetadata[]`
- **必需**: 否
- **说明**: 章节元数据数组，用于章节导航和跳转

ChapterMetadata 结构：

```typescript
interface ChapterMetadata {
  id: string; // 章节唯一标识符（来自 EPUB spine）
  title: string; // 章节标题（来自 <title> 元素）
  index: number; // 章节序号（从 0 开始）
  blockStartIndex: number; // 该章节在 blocks 数组中的起始索引
  blockEndIndex: number; // 该章节在 blocks 数组中的结束索引（不包含）
}
```

## 示例

### 包含章节元数据的 EPUB 书籍

```json
{
  "__type": "blocks",
  "blocks": [
    {
      "id": "b1",
      "type": "html",
      "html": "<h3>第一章 开始</h3>",
      "tag": "h3"
    },
    {
      "id": "b2",
      "type": "paragraph",
      "text": "这是第一章的内容..."
    },
    {
      "id": "b3",
      "type": "html",
      "html": "<h3>第二章 发展</h3>",
      "tag": "h3"
    },
    {
      "id": "b4",
      "type": "paragraph",
      "text": "这是第二章的内容..."
    }
  ],
  "chapters": [
    {
      "id": "ch1",
      "title": "第一章 开始",
      "index": 0,
      "blockStartIndex": 0,
      "blockEndIndex": 2
    },
    {
      "id": "ch2",
      "title": "第二章 发展",
      "index": 1,
      "blockStartIndex": 2,
      "blockEndIndex": 4
    }
  ]
}
```

### 不包含章节元数据的 TXT 书籍（向后兼容）

```json
{
  "__type": "blocks",
  "blocks": [
    {
      "id": "p-0",
      "type": "paragraph",
      "text": "第一行文本"
    },
    {
      "id": "p-1",
      "type": "paragraph",
      "text": "第二行文本"
    }
  ]
}
```

## 使用流程

### 1. 保存书籍内容

```typescript
import { importEpubFile } from '@/services/book-import';

// 导入 EPUB 文件（自动解析并保存章节元数据）
const book = await importEpubFile(file);
```

### 2. 加载书籍内容

```typescript
import storage from '@/services/storage';

// 加载书籍内容
const bookContent = await storage.getBookContent(bookId);

if (bookContent) {
  const parsed = JSON.parse(bookContent);

  if (parsed.__type === 'blocks') {
    // 提取 blocks
    const blocks = parsed.blocks;

    // 提取章节元数据（如果存在）
    const chapters = parsed.chapters || [];

    // 使用 blocks 和 chapters 渲染内容
  }
}
```

## 章节索引映射

章节元数据通过 `blockStartIndex` 和 `blockEndIndex` 将章节映射到 blocks 数组：

```typescript
// 获取某个章节的所有 blocks
const chapterBlocks = blocks.slice(chapter.blockStartIndex, chapter.blockEndIndex);

// 跳转到某个章节
const scrollToChapter = (chapterIndex: number) => {
  const chapter = chapters[chapterIndex];
  scrollToBlockIndex(chapter.blockStartIndex);
};
```

## 向后兼容性

- `chapters` 字段是可选的，不影响现有的 TXT 文件或旧版本的 EPUB 文件
- 如果 `chapters` 不存在，应用仍然可以正常显示内容，只是没有章节导航功能
- 所有书籍内容都使用统一的 `blocks` 数组格式，确保渲染逻辑的一致性

## 性能考虑

- **扁平化结构**: 所有内容 blocks 存储在单一数组中，避免深层嵌套，提高访问速度
- **索引映射**: 使用数组索引而非 ID 查找，O(1) 时间复杂度
- **按需加载**: 章节元数据体积小，可以快速加载用于导航，而不需要解析整个内容
- **增量渲染**: 配合虚拟滚动，只渲染可见区域的 blocks

## 相关文件

- `src/types/storage.ts` - StoredBookContent 接口定义
- `src/types/book.ts` - ChapterMetadata 接口定义
- `src/types/block.ts` - Block 类型定义
- `src/services/storage.ts` - 存储服务实现
- `src/services/epub.ts` - EPUB 解析服务
- `src/services/book-import.ts` - 书籍导入服务
- `src/pages/Read.tsx` - 阅读页面（加载和使用章节元数据）

