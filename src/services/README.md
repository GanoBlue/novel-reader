# 存储服务架构升级

## 概述

将 novel-reader 项目的存储系统从 localStorage 升级为 IndexedDB，借鉴 reader 项目的优秀设计。

## 架构设计

### 1. 存储层 (Storage Layer)

- **文件**: `src/services/storage.ts`
- **功能**: IndexedDB 数据库管理
- **数据库**: `novel-reader`
- **对象存储**:
  - `config` - 配置设置
  - `books` - 书籍数据
  - `progress` - 阅读进度
  - `settings` - 用户设置

### 2. 配置层 (Config Layer)

- **文件**: `src/services/config.ts`
- **功能**: 配置管理，支持监听机制
- **特性**:
  - 异步操作
  - 配置变化监听
  - 批量操作
  - 类型安全

### 3. 服务层 (Service Layer)

- **阅读设置**: `src/services/reading-settings.ts`
- **阅读进度**: `src/services/reading-progress.ts`

## 主要改进

### ✅ 存储容量

- **localStorage**: ~5-10MB
- **IndexedDB**: 无限制（受磁盘空间限制）

### ✅ 数据结构

- **localStorage**: 仅支持字符串
- **IndexedDB**: 支持复杂对象、二进制数据

### ✅ 性能优化

- **localStorage**: 同步操作，阻塞主线程
- **IndexedDB**: 异步操作，不阻塞主线程

### ✅ 监听机制

- **localStorage**: 无监听机制
- **IndexedDB**: 支持配置变化监听

### ✅ 错误处理

- **localStorage**: 基础错误处理
- **IndexedDB**: 完善的错误处理和重试机制

## 使用示例

### 配置管理

```typescript
import config from './config';

// 获取配置
const settings = await config.get('reading-settings', defaultSettings);

// 设置配置
await config.set('reading-settings', newSettings);

// 监听配置变化
config.addListener('reading-settings', (newSettings) => {
  console.log('设置已更新:', newSettings);
});
```

### 阅读进度

```typescript
import { readingProgressService } from './reading-progress';

// 保存进度
await readingProgressService.update(bookId, position, contentLength);

// 获取进度
const progress = await readingProgressService.get(bookId);
```

## 迁移说明

### 向后兼容

- 保持原有 API 接口不变
- 所有函数改为异步
- 添加错误处理

### 数据迁移

- 首次启动时自动迁移 localStorage 数据
- 渐进式升级，不影响现有用户

## 技术特点

1. **类型安全**: 完整的 TypeScript 类型定义
2. **错误处理**: 完善的错误捕获和恢复机制
3. **性能优化**: 防抖、批量操作、异步处理
4. **监听机制**: 响应式配置更新
5. **扩展性**: 易于添加新的存储需求

## 与 Reader 项目的对比

| 特性         | Reader 项目      | Novel-reader 项目   |
| ------------ | ---------------- | ------------------- |
| **存储方式** | IndexedDB        | IndexedDB ✅        |
| **配置管理** | 专门的配置系统   | 专门的配置系统 ✅   |
| **监听机制** | 支持配置变化监听 | 支持配置变化监听 ✅ |
| **类型安全** | JavaScript       | TypeScript ✅       |
| **错误处理** | 基础处理         | 完善处理 ✅         |

## 未来扩展

1. **数据同步**: 支持多设备数据同步
2. **离线缓存**: 智能缓存策略
3. **数据压缩**: 大文件压缩存储
4. **备份恢复**: 数据备份和恢复
5. **性能监控**: 存储性能监控和分析
