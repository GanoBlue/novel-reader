# 小说阅读器 (Novel Reader)

一个现代化的Web小说阅读器应用，支持TXT和EPUB格式文件，提供优秀的阅读体验。

## ✨ 特性

- 📚 **多格式支持** - 支持TXT和EPUB格式小说文件
- 🎨 **多种主题** - 默认、护眼、夜间、绿色主题可选
- 📖 **智能阅读** - 自动章节识别、阅读进度保存
- 🔍 **全文搜索** - 支持按标题、作者搜索
- 💾 **本地存储** - 数据完全本地存储，保护隐私
- 📱 **响应式设计** - 适配各种屏幕尺寸

## 🛠️ 技术栈

- **React 19** + **TypeScript** - 前端框架
- **Vite** - 构建工具
- **Tailwind CSS** + **shadcn/ui** - UI框架
- **React Router v7** - 路由管理

## 📦 第三方库集成

### 工具函数库 (src/lib/utils.ts)

已集成以下高质量的第三方库替代自实现功能：

#### 🔧 Lodash

- **防抖/节流函数** - 性能更好，功能更稳定
- **数字格式化** - 精确的四舍五入
- **数组/对象操作** - 丰富的工具函数

```typescript
import { debounce, throttle } from '@/lib/utils'

// 防抖搜索
const debouncedSearch = debounce(handleSearch, 300)

// 节流滚动
const throttledScroll = throttle(handleScroll, 100)
```

#### 📅 Date-fns

- **相对时间格式化** - 智能显示"刚刚"、"5分钟前"等
- **日期格式化** - 统一的日期显示格式
- **中文本地化** - 完整的中文本地化支持

```typescript
import { formatRelativeTime } from '@/lib/utils'

// 显示相对时间
const timeAgo = formatRelativeTime(new Date())
```

#### 💾 IDB (IndexedDB封装)

- **增强存储服务** - 更大的存储空间
- **数据库索引** - 支持按作者、格式、日期查询
- **自动降级** - IndexedDB不可用时自动降级到localStorage
- **数据完整性** - 事务支持和错误处理

```typescript
import { storage } from '@/lib/utils'

// 异步存储操作
await storage.saveBook(bookData)
await storage.getBooks()
```

## 🚀 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 📁 项目结构

```
src/
├── components/     # React组件
├── pages/         # 页面组件
├── lib/           # 工具库和配置
│   └── utils.ts   # 工具函数库（已优化）
├── types/         # TypeScript类型定义
├── services/      # 业务服务
└── router/        # 路由配置
```

## 📋 开发计划

- ✅ 类型定义文件
- ✅ 工具函数库（已使用第三方库优化）
- ✅ 存储服务（已增强为IndexedDB主）
- 🔄 路由配置
- 🔄 布局组件
- 🔄 页面组件
- 🔄 文件解析器
- 🔄 阅读器功能

## 🔒 隐私保护

- 所有数据本地存储
- 不上传用户文件到服务器
- 保护用户隐私和数据安全

## 📄 许可证

MIT License

