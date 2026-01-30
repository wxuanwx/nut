import React, { Component, ErrorInfo, ReactNode } from 'react';
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
export class ErrorBoundary extends Component<Props, State> {
  // Fix: Declare and initialize state as a class property to ensure it's properly typed and exist on the class instance
  public state: State = {
    hasError: false
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    // Fix: Access state through 'this.state' which is properly inherited from Component base class
    if (this.state.hasError) {
      // Fallback UI when an error is caught
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

    // Fix: Access props through 'this.props' which is inherited from Component base class
    return this.props.children;
  }
}
