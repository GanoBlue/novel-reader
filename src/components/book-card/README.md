# BookCard 组件架构

这个文件夹包含了所有与 BookCard 相关的组件，按照功能模块组织。

## 文件结构

```
book-card/
├── book-card.tsx             # 主组件 - 书籍卡片展示
├── book-cover.tsx            # 书籍封面组件
├── book-favorite.tsx   # 操作按钮（设置、收藏）
├── book-progress-info.tsx    # 进度信息组件
├── book-list-info.tsx        # 列表模式信息组件
├── text-with-tooltip.tsx     # 文本溢出提示组件
├── index.ts                  # 统一导出文件
└── README.md                 # 说明文档
```

## 组件职责

### book-card.tsx

- 主组件，负责整体布局和状态管理
- 支持网格模式和列表模式切换
- 集成所有子组件

### book-cover.tsx

- 书籍封面显示
- 支持不同尺寸（small/medium/large）
- 支持点击事件

### book-favorite.tsx

- 统一的收藏组件
- 支持按钮模式（网格）和指示器模式（列表）
- 悬停显示交互效果
- 防止事件冒泡
- 支持点击操作

### book-progress-info.tsx

- 显示阅读进度、时间、次数等信息
- 进度条显示（支持 small/medium 尺寸）
- 收藏时间显示
- 支持只显示进度部分：`showOnlyProgress={true}`

### text-with-tooltip.tsx

- 文本溢出检测和提示
- 内部管理溢出检测逻辑
- 可复用的文本组件

```typescript
// TextWithTooltip 使用示例
<TextWithTooltip text={title} className="text-sm font-medium">
  <h3>{title}</h3>
</TextWithTooltip>

// BookProgressInfo 只显示进度示例
<BookProgressInfo
  currentChapter={5}
  progress={75}
  showOnlyProgress={true}
  progressSize="small"
  className="mt-2"
/>

// 收藏组件使用示例
<BookFavorite
  isFavorite={true}
  onFavorite={() => toggleFavorite(book.id)}
  variant="indicator"        // 列表模式
  showLabel={true}          // 显示"已收藏"文本
  className="ml-2"
/>

// 或者按钮模式（网格）
<BookFavorite
  isFavorite={true}
  onFavorite={() => toggleFavorite(book.id)}
  variant="button"          // 网格模式
  className="absolute top-2 right-2"
/>
```

## 使用方式

```typescript
// 推荐：统一导入
import { BookCard, BookCover, BookActionButtons } from './book-card';

// 或者分别导入
import { BookCard } from './book-card/BookCard';
import { BookCover } from './book-card/book-cover';
```

## 设计原则

1. **单一职责**：每个组件只负责一个功能
2. **组合优于继承**：通过组合构建复杂组件
3. **可复用性**：组件可以在不同场景下复用
4. **类型安全**：完整的 TypeScript 类型支持
5. **易于测试**：组件解耦，便于单元测试
