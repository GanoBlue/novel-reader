import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { router } from './router';
import '@ant-design/v5-patch-for-react-19';
import './index.css';
import { I18nProvider } from '@/services/i18n';
import { preloadAllFonts } from '@/services/font-loader';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <ThemeProvider defaultTheme="light" storageKey="novel-reader-theme">
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors closeButton />
      </ThemeProvider>
    </I18nProvider>
  </StrictMode>,
);

// 在应用启动后预加载所有字体（后台静默加载）
preloadAllFonts();

