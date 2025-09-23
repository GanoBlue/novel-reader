import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { router } from './router';
import '@ant-design/v5-patch-for-react-19';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="novel-reader-theme">
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors closeButton />
    </ThemeProvider>
  </StrictMode>,
);
