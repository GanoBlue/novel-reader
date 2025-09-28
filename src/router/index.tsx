import { createBrowserRouter } from 'react-router-dom';
import Home from '@/pages/Home';
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// 懒加载页面组件
const Library = lazy(() => import('@/pages/Library'));
const Favorites = lazy(() => import('@/pages/Favorites'));
const Read = lazy(() => import('@/pages/Read'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    children: [
      {
        index: true, // 默认子路由
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Library />
          </Suspense>
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
    ],
  },
  {
    path: '/read/:bookId',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Read />
      </Suspense>
    ),
  },
]);
export { router };
