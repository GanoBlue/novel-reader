import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary for chapter navigation component
 * Catches rendering errors and displays a fallback UI
 */
export class ChapterNavigationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ChapterNavigation] 渲染错误:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">章节导航加载失败</h3>
          <p className="text-sm text-muted-foreground mb-4">
            抱歉，章节导航组件遇到了问题。您仍然可以正常阅读内容。
          </p>
          <Button onClick={this.handleReset} variant="outline" size="sm">
            重试
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

