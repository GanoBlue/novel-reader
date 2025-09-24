import { createBrowserRouter } from 'react-router-dom';
import Home from '@/pages/Home';
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// 懒加载页面组件
const Library = lazy(() => import('@/pages/Library'));
const Favorites = lazy(() => import('@/pages/Favorites'));
const Reader = lazy(() => import('@/pages/Reader'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    children: [
      {
        index: true, // 默认子路由
        element: (
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">欢迎使用小说阅读器</h1>
            <p className="text-muted-foreground">选择左侧菜单开始阅读</p>
          </div>
        ),
      },
      {
        path: 'library',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Library />
          </Suspense>
        ),
      },
      {
        path: 'favorites',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Favorites />
          </Suspense>
        ),
      },
      {
        path: 'reader/:id',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Reader />
          </Suspense>
        ),
      },
    ],
  },
]);
export { router };
