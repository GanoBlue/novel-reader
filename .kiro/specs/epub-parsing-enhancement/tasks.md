# EPUB 解析增强任务列表

## 第一阶段：核心解析功能

- [x] 1. 重构 EPUB 解析器支持章节元数据提取
  - 修改 `parseEpubFileToBlocks` 函数返回 `ParsedEpubContent` 类型
  - 在解析每个章节时提取 title 元素作为章节标题
  - 记录每个章节在 blocks 数组中的起止位置
  - 生成 ChapterMetadata 数组
  - _Requirements: 1.1, 1.4, 3.1_

- [ ]\* 1.1 为章节元数据提取编写属性测试
  - **Property 1: 章节元数据完整性**
  - **Validates: Requirements 1.1, 1.4**

- [x] 2. 优化章节内容解析逻辑
  - 修改 `walkElements` 函数，跳过 meta、link、script 等非内容元素
  - 确保 h3、p、img 等元素被正确解析为独立 blocks
  - 保持元素的原始属性（style、src、alt 等）
  - 将所有内容 blocks 扁平化到主数组中
  - _Requirements: 1.2, 1.3, 1.9_

- [ ]\* 2.1 为递归解析编写属性测试
  - **Property 2: 递归解析完整性**
  - **Validates: Requirements 1.2**

- [ ]\* 2.2 为非内容元素过滤编写属性测试
  - **Property 6: 非内容元素过滤**
  - **Validates: Requirements 1.9**

- [x] 3. 增强元素属性保留
  - 确保图片元素的 src 和 alt 属性被保留
  - 确保段落元素的 style 属性被保留
  - 确保标题元素的 tag 信息被保留
  - _Requirements: 1.6, 1.7, 1.8_

- [ ]\* 3.1 为图片属性保留编写属性测试
  - **Property 3: 图片属性保留**
  - **Validates: Requirements 1.6**

- [ ]\* 3.2 为段落样式保留编写属性测试
  - **Property 4: 段落样式保留**
  - **Validates: Requirements 1.7**

- [ ]\* 3.3 为标题层级保留编写属性测试
  - **Property 5: 标题层级保留**
  - **Validates: Requirements 1.8**

- [x] 4. 更新存储格式支持章节元数据
  - 修改 `StoredBookContent` 接口，添加 chapters 字段
  - 在保存书籍内容时同时保存章节元数据
  - 在加载书籍内容时同时加载章节元数据
  - _Requirements: 3.2_

- [x] 5. 更新类型定义
  - 在 `src/types/book.ts` 中添加 `ChapterMetadata` 接口
  - 更新 `Block` 类型定义（如需要）
  - 确保类型定义与设计文档一致
  - _Requirements: 3.1_

- [x] 6. 第一阶段检查点
  - 确保所有测试通过，如有问题请询问用户

## 第二阶段：章节导航 UI

- [x] 7. 创建章节导航侧边栏组件
  - 创建 `src/components/read-page/chapter-navigation.tsx`
  - 使用 shadcn/ui Sheet 组件作为侧边栏容器
  - 实现章节列表渲染
  - 添加章节项点击处理
  - 高亮当前章节
  - _Requirements: 2.1, 2.3, 2.5_

- [ ] 7.1 为章节列表完整性编写属性测试
  - **Property 9: 章节列表完整性**
  - **Validates: Requirements 2.3**

- [ ]\* 7.2 为当前章节高亮编写属性测试
  - **Property 11: 当前章节高亮**
  - **Validates: Requirements 2.5**

- [x] 8. 实现章节导航状态管理
  - 在 Read.tsx 中添加 `showChapterNav` 状态
  - 添加 `chapters` 和 `currentChapterIndex` 状态
  - 实现打开/关闭侧边栏的处理函数
  - _Requirements: 2.2, 2.6_

- [ ]\* 8.1 为章节导航状态转换编写属性测试
  - **Property 8: 章节导航状态转换**
  - **Validates: Requirements 2.2, 2.6**

- [x] 9. 实现章节跳转功能
  - 添加 `onChapterSelect` 处理函数
  - 根据 `blockStartIndex` 跳转到对应章节
  - 跳转后关闭侧边栏
  - 更新当前章节索引
  - _Requirements: 2.4, 3.5_

- [ ]\* 9.1 为章节跳转正确性编写属性测试
  - **Property 10: 章节跳转正确性**
  - **Validates: Requirements 2.4**

- [ ]\* 9.2 为章节 ID 定位编写属性测试
  - **Property 14: 章节 ID 定位**
  - **Validates: Requirements 3.5**

- [x] 10. 集成章节导航按钮到阅读页面
  - 在 AutoHideHeader 组件中添加章节导航按钮
  - 将按钮放置在设置按钮旁边
  - 使用合适的图标（如 BookOpen 或 List）
  - _Requirements: 2.1_

- [x] 11. 实现章节导航滚动功能
  - 使用 shadcn/ui ScrollArea 组件
  - 确保长章节列表可以滚动
  - 自动滚动到当前章节位置
  - _Requirements: 2.7_

- [ ] 12. 优化章节导航 UI 样式
  - 确保侧边栏在移动端和桌面端都有良好的显示效果
  - 添加适当的过渡动画
  - 确保高亮样式清晰可见
  - _Requirements: 2.5_

- [ ] 13. 第二阶段检查点
  - 确保所有测试通过，如有问题请询问用户

## 第三阶段：优化和测试

- [x] 14. 实现基于 TOC 的章节提取（可选增强）
  - 解析 EPUB 的 TOC（toc.ncx 或 nav.xhtml）
  - 使用 TOC 中的章节标题和顺序
  - 如果 TOC 不存在，回退到当前的 title 提取方式
  - _Requirements: 2.8_

- [ ]\* 14.1 为 TOC 章节提取编写属性测试
  - **Property 12: 章节元数据提取**
  - **Validates: Requirements 3.1**

- [ ] 15. 实现章节层级结构支持（可选增强）
  - 支持嵌套章节（章、节、小节）
  - 在章节导航中显示层级关系
  - 使用缩进或树形结构展示
  - _Requirements: 3.4_

- [ ]\* 15.1 为章节层级结构编写属性测试
  - **Property 13: 章节层级结构保留**
  - **Validates: Requirements 3.4**

- [ ] 16. 优化阅读进度跟踪
  - 确认进度跟踪基于单个 block 索引
  - 添加当前章节索引的计算逻辑
  - 在章节导航中正确显示当前章节
  - _Requirements: 1.5_

- [ ]\* 16.1 为阅读进度跟踪粒度编写属性测试
  - **Property 7: 阅读进度跟踪粒度**
  - **Validates: Requirements 1.5**

- [x] 17. 性能优化
  - 对长章节列表实施虚拟滚动（如果章节数 > 100）
  - 使用 React.memo 优化章节项组件
  - 缓存章节元数据，避免重复计算
  - _Requirements: 3.3_

- [x] 18. 错误处理完善
  - 处理缺少 title 元素的章节（使用默认标题）
  - 处理章节内容为空的情况
  - 处理侧边栏渲染失败（使用错误边界）
  - 添加友好的错误提示

- [ ]\* 19. 编写集成测试
  - 测试完整的 EPUB 导入和章节导航流程
  - 测试章节跳转和进度保存
  - 测试不同 EPUB 格式的兼容性

- [ ] 20. 最终检查点
  - 确保所有测试通过，如有问题请询问用户
  - 验证所有需求都已实现
  - 确认用户体验符合预期

