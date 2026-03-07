'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // TODO: Integrate with Sentry here in Task 1.11
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleReturnHome = () => {
    window.location.href = '/';
  };

  public override render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
          <div className="bg-destructive/10 text-destructive mb-4 flex size-16 items-center justify-center rounded-full">
            <AlertTriangle className="size-8" />
          </div>
          <h2 className="mb-2 text-2xl font-bold tracking-tight">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            An unexpected error occurred. We&apos;ve been notified and are
            looking into it.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" onClick={this.handleRetry}>
              <RefreshCw className="mr-2 size-4" />
              Try Again
            </Button>
            <Button variant="default" onClick={this.handleReturnHome}>
              Return Home
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-muted mt-8 w-full max-w-2xl overflow-auto rounded-md border p-4 text-left font-mono text-xs">
              <p className="text-destructive mb-2 font-bold">
                {error?.name}: {error?.message}
              </p>
              <pre>{error?.stack}</pre>
            </div>
          )}
        </div>
      );
    }

    return children;
  }
}
