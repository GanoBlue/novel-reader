# 小说阅读器应用任务文档

## 基础架构任务

- [x] 1. 创建类型定义文件
  - File: src/types/index.ts
  - 定义所有数据模型的TypeScript接口
  - 包含Book、Chapter、ReadingSettings、ImportHistory等类型
  - Purpose: 建立类型安全的数据结构基础
  - \_Leverage: 现有的TypeScript配置
  - \_Requirements: 数据模型定义
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: TypeScript Developer specializing in type systems | Task: Create comprehensive TypeScript interfaces for all data models (Book, Chapter, ReadingSettings, ImportHistory) following the design document specifications | Restrictions: Must use strict typing, include all required properties, maintain consistency with design document | Success: All interfaces compile without errors, provide full type coverage for the application data structures

- [x] 2. 创建工具函数库
  - File: src/utils/index.ts
  - 实现文件处理、存储、格式化等工具函数
  - 包含文件大小格式化、日期处理、文本处理等
  - Purpose: 提供可复用的工具函数
  - \_Leverage: 现有的cn工具函数
  - \_Requirements: 工具函数需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Utility Developer specializing in helper functions | Task: Create comprehensive utility functions for file processing, storage operations, text formatting, and date handling | Restrictions: Must be pure functions where possible, handle edge cases, maintain performance | Success: All utility functions work correctly, are well-tested, and provide consistent APIs

- [x] 3. 创建存储服务
  - File: src/services/storage.ts
  - 实现localStorage和IndexedDB的封装
  - 提供数据持久化和检索功能
  - Purpose: 管理应用数据的本地存储
  - \_Leverage: 浏览器存储API
  - \_Requirements: 数据存储需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Storage Engineer specializing in client-side data persistence | Task: Implement storage service using localStorage and IndexedDB for data persistence, providing CRUD operations for books, chapters, and settings | Restrictions: Must handle storage quota limits, provide fallback mechanisms, ensure data integrity | Success: Storage service works reliably, handles large files efficiently, provides consistent data access patterns

## 路由和布局任务

- [x] 4. 创建路由配置
  - File: src/router/index.tsx
  - 配置React Router v7路由结构
  - 定义所有页面路由和嵌套路由
  - Purpose: 建立应用的路由系统
  - \_Leverage: React Router v7
  - \_Requirements: 路由需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Frontend Router Specialist with expertise in React Router | Task: Configure React Router v7 with all application routes including nested routes for the novel reader application | Restrictions: Must use type-safe routing, implement proper route guards, maintain clean route structure | Success: All routes work correctly, navigation is smooth, route parameters are properly typed

- [ ] 5. 创建布局组件
  - File: src/components/Layout.tsx
  - 实现应用的整体布局结构
  - 包含导航栏和内容区域
  - Purpose: 提供统一的页面布局
  - \_Leverage: shadcn/ui组件
  - \_Requirements: 布局需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Layout Developer specializing in React component architecture | Task: Create main layout component with navigation and content areas using shadcn/ui components | Restrictions: Must be responsive, maintain consistent styling, provide proper navigation structure | Success: Layout is responsive and consistent, navigation works properly, content areas are properly structured

- [ ] 6. 创建导航组件
  - File: src/components/Navigation.tsx
  - 实现顶部导航栏
  - 包含应用标题、搜索、设置等按钮
  - Purpose: 提供主要的导航功能
  - \_Leverage: shadcn/ui Button组件
  - \_Requirements: 导航需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Navigation Developer with expertise in React navigation patterns | Task: Create navigation component with app title, search functionality, and settings access using shadcn/ui components | Restrictions: Must be accessible, responsive, maintain consistent styling | Success: Navigation is fully functional, responsive design works, accessibility standards are met

## 页面组件任务

- [ ] 7. 创建书架页面
  - File: src/pages/Bookshelf.tsx
  - 实现小说收藏列表展示
  - 包含图书卡片、搜索、排序功能
  - Purpose: 显示用户的小说收藏
  - \_Leverage: BookCard组件、SearchBar组件
  - \_Requirements: 书架功能需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Page Developer specializing in React page components | Task: Create bookshelf page displaying user's novel collection with search and sorting functionality | Restrictions: Must handle empty states, provide smooth interactions, maintain performance with large collections | Success: Bookshelf displays correctly, search and sort work properly, handles all edge cases gracefully

- [ ] 8. 创建图书卡片组件
  - File: src/components/BookCard.tsx
  - 实现单个图书的展示卡片
  - 包含封面、标题、作者、进度等信息
  - Purpose: 展示图书基本信息
  - \_Leverage: shadcn/ui组件
  - \_Requirements: 图书展示需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Component Developer specializing in card-based UI | Task: Create book card component displaying book information including cover, title, author, and reading progress | Restrictions: Must be visually appealing, handle missing data gracefully, provide clear interaction feedback | Success: Book cards display all information correctly, interactions are smooth, design is consistent with UI prototype

- [ ] 9. 创建搜索栏组件
  - File: src/components/SearchBar.tsx
  - 实现图书搜索功能
  - 支持按标题、作者搜索
  - Purpose: 提供图书搜索功能
  - \_Leverage: shadcn/ui Input组件
  - \_Requirements: 搜索功能需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Search Developer specializing in client-side search functionality | Task: Create search bar component for searching books by title and author with real-time filtering | Restrictions: Must provide instant feedback, handle special characters, maintain search performance | Success: Search works accurately and quickly, handles all input types, provides clear search results

- [ ] 10. 创建导入页面
  - File: src/pages/Import.tsx
  - 实现文件导入界面
  - 包含拖拽上传、文件选择、格式说明
  - Purpose: 处理小说文件导入
  - \_Leverage: FileUploader组件
  - \_Requirements: 导入功能需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: File Upload Developer specializing in drag-and-drop interfaces | Task: Create import page with drag-and-drop file upload, file selection, and format information display | Restrictions: Must validate file types, provide clear feedback, handle upload errors gracefully | Success: File upload works smoothly, validation is accurate, user feedback is clear and helpful

- [ ] 11. 创建文件上传组件
  - File: src/components/FileUploader.tsx
  - 实现拖拽上传功能
  - 支持TXT和EPUB格式验证
  - Purpose: 处理文件上传逻辑
  - \_Leverage: 浏览器文件API
  - \_Requirements: 文件上传需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: File Upload Engineer specializing in browser file APIs | Task: Create file uploader component with drag-and-drop support and file type validation for TXT and EPUB formats | Restrictions: Must validate file types properly, handle large files, provide progress feedback | Success: File upload works reliably, validation is accurate, handles all file types correctly

- [ ] 12. 创建导入历史组件
  - File: src/components/ImportHistory.tsx
  - 显示最近导入的文件列表
  - 支持重新导入和删除操作
  - Purpose: 管理导入历史
  - \_Leverage: 存储服务
  - \_Requirements: 导入历史需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: History Management Developer specializing in data persistence | Task: Create import history component displaying recent imports with re-import and delete functionality | Restrictions: Must persist data correctly, handle deletion safely, provide clear status indicators | Success: Import history displays correctly, operations work reliably, data persistence is maintained

## 阅读器功能任务

- [ ] 13. 创建阅读器页面
  - File: src/pages/Reader.tsx
  - 实现小说阅读界面
  - 包含内容显示、工具栏、进度控制
  - Purpose: 提供小说阅读功能
  - \_Leverage: ReadingContent组件、ReadingControls组件
  - \_Requirements: 阅读器功能需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Reader Developer specializing in text display and reading interfaces | Task: Create reader page with content display, toolbar, and progress controls for novel reading | Restrictions: Must handle large text content efficiently, provide smooth scrolling, maintain reading position | Success: Reader displays content correctly, navigation works smoothly, reading experience is optimized

- [ ] 14. 创建阅读内容组件
  - File: src/components/ReadingContent.tsx
  - 实现文本内容显示
  - 支持字体大小、行间距调整
  - Purpose: 显示小说文本内容
  - \_Leverage: 阅读设置
  - \_Requirements: 内容显示需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Content Display Developer specializing in text rendering | Task: Create reading content component with customizable font size, line spacing, and theme support | Restrictions: Must render text efficiently, support all reading settings, maintain readability | Success: Text displays clearly with all settings, performance is optimized, readability is maintained

- [ ] 15. 创建阅读控制组件
  - File: src/components/ReadingControls.tsx
  - 实现章节导航和阅读设置
  - 包含上一章、下一章、设置按钮
  - Purpose: 提供阅读控制功能
  - \_Leverage: shadcn/ui Button组件
  - \_Requirements: 阅读控制需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Control Interface Developer specializing in navigation controls | Task: Create reading controls component with chapter navigation and reading settings access | Restrictions: Must handle chapter boundaries correctly, provide clear navigation feedback, maintain accessibility | Success: Navigation works correctly, controls are intuitive, accessibility standards are met

- [ ] 16. 创建目录页面
  - File: src/pages/Toc.tsx
  - 实现章节目录显示
  - 包含章节列表、快速跳转、搜索
  - Purpose: 提供章节导航功能
  - \_Leverage: ChapterList组件
  - \_Requirements: 目录功能需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Table of Contents Developer specializing in navigation interfaces | Task: Create table of contents page with chapter list, quick jump functionality, and chapter search | Restrictions: Must handle large chapter lists efficiently, provide smooth navigation, maintain chapter status | Success: Chapter list displays correctly, navigation is smooth, search functionality works properly

- [ ] 17. 创建章节列表组件
  - File: src/components/ChapterList.tsx
  - 实现章节列表显示
  - 支持章节状态、进度显示
  - Purpose: 显示章节信息
  - \_Leverage: 章节数据模型
  - \_Requirements: 章节列表需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: List Component Developer specializing in data display | Task: Create chapter list component displaying chapter information with read status and progress indicators | Restrictions: Must handle large lists efficiently, provide clear status indicators, maintain performance | Success: Chapter list displays correctly, status indicators are accurate, performance is optimized

## 设置功能任务

- [ ] 18. 创建设置页面
  - File: src/pages/Settings.tsx
  - 实现应用设置界面
  - 包含阅读设置、主题设置、其他设置
  - Purpose: 管理应用设置
  - \_Leverage: SettingsPanel组件
  - \_Requirements: 设置功能需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Settings Developer specializing in configuration interfaces | Task: Create settings page with reading preferences, theme selection, and other application settings | Restrictions: Must persist settings correctly, provide immediate feedback, maintain setting consistency | Success: Settings page works correctly, all preferences are saved, changes take effect immediately

- [ ] 19. 创建设置面板组件
  - File: src/components/SettingsPanel.tsx
  - 实现设置选项的展示和编辑
  - 包含各种设置控件
  - Purpose: 提供设置编辑界面
  - \_Leverage: shadcn/ui表单组件
  - \_Requirements: 设置面板需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Form Developer specializing in settings interfaces | Task: Create settings panel component with various setting controls for reading preferences and theme selection | Restrictions: Must validate input correctly, provide clear labels, maintain setting persistence | Success: Settings panel works correctly, all controls function properly, settings are saved reliably

- [ ] 20. 创建主题选择器组件
  - File: src/components/ThemeSelector.tsx
  - 实现主题切换功能
  - 支持默认、护眼、夜间、绿色主题
  - Purpose: 提供主题切换功能
  - \_Leverage: CSS变量和Tailwind配置
  - \_Requirements: 主题功能需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Theme Developer specializing in CSS and design systems | Task: Create theme selector component supporting default, sepia, dark, and green themes with CSS variables | Restrictions: Must provide smooth transitions, maintain accessibility, ensure theme consistency | Success: Theme switching works smoothly, all themes are properly styled, accessibility is maintained

## 文件处理任务

- [ ] 21. 创建TXT文件解析器
  - File: src/services/txtParser.ts
  - 实现TXT文件解析和章节识别
  - 自动识别章节结构
  - Purpose: 处理TXT格式小说文件
  - \_Leverage: 文本处理工具
  - \_Requirements: TXT解析需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Text Parser Developer specializing in file format processing | Task: Create TXT file parser with automatic chapter detection and text processing capabilities | Restrictions: Must handle various encoding formats, detect chapters accurately, process large files efficiently | Success: TXT files are parsed correctly, chapters are detected accurately, performance is optimized for large files

- [ ] 22. 创建EPUB文件解析器
  - File: src/services/epubParser.ts
  - 实现EPUB文件解析
  - 提取文本内容和元数据
  - Purpose: 处理EPUB格式电子书
  - \_Leverage: EPUB解析库
  - \_Requirements: EPUB解析需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: EPUB Parser Developer specializing in electronic book formats | Task: Create EPUB file parser extracting text content, metadata, and chapter structure | Restrictions: Must handle EPUB 2 and 3 formats, extract content accurately, process images if needed | Success: EPUB files are parsed correctly, content and metadata are extracted properly, chapter structure is maintained

- [ ] 23. 创建文件服务
  - File: src/services/fileService.ts
  - 统一文件处理接口
  - 协调不同格式的解析器
  - Purpose: 提供统一的文件处理服务
  - \_Leverage: TXT和EPUB解析器
  - \_Requirements: 文件服务需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: File Service Developer specializing in file processing coordination | Task: Create unified file service coordinating TXT and EPUB parsers with consistent interface | Restrictions: Must handle all supported formats, provide consistent error handling, maintain performance | Success: File service works with all formats, error handling is consistent, performance is optimized

## 数据管理任务

- [ ] 24. 创建图书服务
  - File: src/services/bookService.ts
  - 实现图书数据管理
  - 包含CRUD操作和搜索功能
  - Purpose: 管理图书数据
  - \_Leverage: 存储服务
  - \_Requirements: 图书管理需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Data Service Developer specializing in CRUD operations | Task: Create book service managing book data with CRUD operations and search functionality | Restrictions: Must maintain data integrity, provide efficient search, handle large datasets | Success: Book service works correctly, all CRUD operations function properly, search is efficient and accurate

- [ ] 25. 创建章节服务
  - File: src/services/chapterService.ts
  - 实现章节数据管理
  - 包含章节CRUD和进度跟踪
  - Purpose: 管理章节数据
  - \_Leverage: 存储服务
  - \_Requirements: 章节管理需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Chapter Service Developer specializing in content management | Task: Create chapter service managing chapter data with CRUD operations and reading progress tracking | Restrictions: Must maintain chapter order, track progress accurately, handle large chapter collections | Success: Chapter service works correctly, progress tracking is accurate, chapter management is efficient

- [ ] 26. 创建设置服务
  - File: src/services/settingsService.ts
  - 实现设置数据管理
  - 包含设置的保存和加载
  - Purpose: 管理应用设置
  - \_Leverage: 存储服务
  - \_Requirements: 设置管理需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Settings Service Developer specializing in configuration management | Task: Create settings service managing application settings with save and load functionality | Restrictions: Must persist settings reliably, provide default values, handle setting validation | Success: Settings service works correctly, settings are persisted properly, default values are handled correctly

## 状态管理任务

- [ ] 27. 创建应用状态管理
  - File: src/hooks/useAppState.ts
  - 实现全局应用状态管理
  - 使用React Context和useReducer
  - Purpose: 管理应用全局状态
  - \_Leverage: React Hooks
  - \_Requirements: 状态管理需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: State Management Developer specializing in React state patterns | Task: Create application state management using React Context and useReducer for global state | Restrictions: Must maintain state consistency, provide efficient updates, handle complex state interactions | Success: State management works correctly, state updates are efficient, state consistency is maintained

- [ ] 28. 创建图书状态Hook
  - File: src/hooks/useBooks.ts
  - 实现图书相关的状态管理
  - 包含图书列表、当前图书等状态
  - Purpose: 管理图书相关状态
  - \_Leverage: 图书服务
  - \_Requirements: 图书状态需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Book State Developer specializing in book-related state management | Task: Create book state hook managing book list, current book, and related state using book service | Restrictions: Must handle loading states, provide error handling, maintain state synchronization | Success: Book state hook works correctly, loading and error states are handled properly, state is synchronized

- [ ] 29. 创建阅读状态Hook
  - File: src/hooks/useReading.ts
  - 实现阅读相关的状态管理
  - 包含当前章节、阅读进度等状态
  - Purpose: 管理阅读相关状态
  - \_Leverage: 章节服务
  - \_Requirements: 阅读状态需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Reading State Developer specializing in reading-related state management | Task: Create reading state hook managing current chapter, reading progress, and related state | Restrictions: Must track progress accurately, handle chapter navigation, maintain reading position | Success: Reading state hook works correctly, progress tracking is accurate, chapter navigation is smooth

## 错误处理任务

- [ ] 30. 创建错误边界组件
  - File: src/components/ErrorBoundary.tsx
  - 实现React错误边界
  - 捕获和处理组件错误
  - Purpose: 提供错误处理机制
  - \_Leverage: React错误边界API
  - \_Requirements: 错误处理需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Error Handling Developer specializing in React error boundaries | Task: Create error boundary component to catch and handle React component errors gracefully | Restrictions: Must provide user-friendly error messages, log errors appropriately, allow error recovery | Success: Error boundary catches errors correctly, provides helpful error messages, allows application recovery

- [ ] 31. 创建错误处理工具
  - File: src/utils/errorHandler.ts
  - 实现统一的错误处理逻辑
  - 包含错误分类和处理策略
  - Purpose: 提供统一的错误处理
  - \_Leverage: 错误处理模式
  - \_Requirements: 错误处理工具需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Error Handling Specialist with expertise in error classification and handling strategies | Task: Create unified error handling utility with error classification and handling strategies | Restrictions: Must categorize errors appropriately, provide consistent error handling, maintain error context | Success: Error handling utility works correctly, errors are categorized properly, handling strategies are consistent

## 测试任务

- [ ] 32. 创建单元测试配置
  - File: vitest.config.ts
  - 配置Vitest测试环境
  - 设置测试工具和模拟
  - Purpose: 建立测试环境
  - \_Leverage: Vitest框架
  - \_Requirements: 测试配置需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Test Configuration Developer specializing in Vitest setup | Task: Configure Vitest testing environment with proper setup for React component testing | Restrictions: Must support React testing, provide proper mocking, maintain test performance | Success: Test environment is properly configured, React components can be tested, mocking works correctly

- [ ] 33. 创建组件测试
  - File: src/components/**tests**/
  - 为所有组件创建单元测试
  - 测试组件渲染和交互
  - Purpose: 确保组件功能正确
  - \_Leverage: React Testing Library
  - \_Requirements: 组件测试需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Component Test Developer specializing in React Testing Library | Task: Create comprehensive unit tests for all components testing rendering and user interactions | Restrictions: Must test user interactions, provide good coverage, maintain test reliability | Success: All components are tested thoroughly, user interactions work correctly, test coverage is comprehensive

- [ ] 34. 创建服务测试
  - File: src/services/**tests**/
  - 为所有服务创建单元测试
  - 测试业务逻辑和数据处理
  - Purpose: 确保服务功能正确
  - \_Leverage: Vitest和模拟工具
  - \_Requirements: 服务测试需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Service Test Developer specializing in business logic testing | Task: Create comprehensive unit tests for all services testing business logic and data processing | Restrictions: Must mock external dependencies, test error scenarios, maintain test isolation | Success: All services are tested thoroughly, business logic is verified, error scenarios are covered

- [ ] 35. 创建E2E测试配置
  - File: playwright.config.ts
  - 配置Playwright E2E测试环境
  - 设置浏览器和测试选项
  - Purpose: 建立E2E测试环境
  - \_Leverage: Playwright框架
  - \_Requirements: E2E测试配置需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: E2E Test Configuration Developer specializing in Playwright setup | Task: Configure Playwright E2E testing environment with proper browser setup and test options | Restrictions: Must support multiple browsers, provide proper test isolation, maintain test reliability | Success: E2E test environment is properly configured, tests run reliably across browsers, test isolation is maintained

- [ ] 36. 创建E2E测试用例
  - File: tests/e2e/
  - 创建完整的用户流程测试
  - 测试导入、阅读、设置等流程
  - Purpose: 确保端到端功能正确
  - \_Leverage: Playwright测试API
  - \_Requirements: E2E测试需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: E2E Test Developer specializing in user journey testing | Task: Create comprehensive E2E tests covering complete user workflows from import to reading to settings | Restrictions: Must test real user scenarios, maintain test reliability, provide clear test reports | Success: E2E tests cover all critical user journeys, tests run reliably, user experience is validated

## 性能优化任务

- [ ] 37. 实现代码分割
  - File: src/router/lazy.tsx
  - 实现路由级别的代码分割
  - 使用React.lazy和Suspense
  - Purpose: 优化应用加载性能
  - \_Leverage: React.lazy API
  - \_Requirements: 性能优化需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Performance Developer specializing in code splitting and lazy loading | Task: Implement route-level code splitting using React.lazy and Suspense for optimal loading performance | Restrictions: Must maintain smooth navigation, provide loading states, optimize bundle sizes | Success: Code splitting works correctly, loading performance is improved, navigation remains smooth

- [ ] 38. 实现虚拟滚动
  - File: src/components/VirtualList.tsx
  - 为长列表实现虚拟滚动
  - 优化大量章节的显示性能
  - Purpose: 优化长列表性能
  - \_Leverage: 虚拟滚动库
  - \_Requirements: 虚拟滚动需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Performance Developer specializing in virtual scrolling and large list optimization | Task: Implement virtual scrolling for long chapter lists to optimize performance with large datasets | Restrictions: Must maintain smooth scrolling, preserve scroll position, handle dynamic content | Success: Virtual scrolling works smoothly, performance is optimized for large lists, user experience is maintained

- [ ] 39. 实现缓存策略
  - File: src/utils/cache.ts
  - 实现数据缓存机制
  - 优化重复数据请求
  - Purpose: 优化数据访问性能
  - \_Leverage: 浏览器缓存API
  - \_Requirements: 缓存策略需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Cache Developer specializing in client-side caching strategies | Task: Implement data caching mechanism to optimize repeated data requests and improve performance | Restrictions: Must handle cache invalidation, manage cache size, maintain data consistency | Success: Caching works correctly, performance is improved, data consistency is maintained

## 最终集成任务

- [ ] 40. 集成所有组件
  - File: src/App.tsx
  - 集成所有页面和组件
  - 确保应用完整功能
  - Purpose: 完成应用集成
  - \_Leverage: 所有已创建的组件
  - \_Requirements: 应用集成需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Integration Developer specializing in application assembly | Task: Integrate all pages and components into the main App component ensuring complete functionality | Restrictions: Must maintain component relationships, handle routing correctly, ensure proper state management | Success: All components are integrated correctly, application functions as a complete system, all features work together

- [ ] 41. 最终测试和优化
  - File: 全项目
  - 进行全面的功能测试
  - 优化性能和用户体验
  - Purpose: 确保应用质量
  - \_Leverage: 所有测试工具
  - \_Requirements: 最终质量需求
  - \_Prompt: Implement the task for spec novel-reader, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Quality Assurance Engineer specializing in comprehensive testing and optimization | Task: Perform comprehensive testing and optimization of the entire application ensuring quality and performance | Restrictions: Must test all functionality, optimize performance, ensure accessibility compliance | Success: Application passes all tests, performance is optimized, accessibility standards are met, user experience is excellent
