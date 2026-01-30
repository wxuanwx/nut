
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from './Icons';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error boundary component to catch and handle errors in the child component tree.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  // Added constructor to ensure props are correctly initialized and recognized by TypeScript
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">出错了</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            组件在渲染时发生了预期外的错误，您可以尝试刷新页面或联系技术支持。
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg font-bold"
          >
            <RefreshCw className="w-4 h-4" /> 刷新页面
          </button>
        </div>
      );
    }

    // Accessing children from this.props which is now correctly recognized after explicit inheritance
    return this.props.children;
  }
}
