
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
// Fix: Use Component directly from named import to ensure proper generic application and inheritance for props/state
export class ErrorBoundary extends Component<Props, State> {
  // Fix: Explicitly declare and initialize state property for better type recognition across different TS versions
  public state: State = {
    hasError: false
  };

  constructor(props: Props) {
    super(props);
    // Fix: Redundant initialization to ensure 'state' property is recognized in the constructor (Line 20)
    this.state = {
      hasError: false
    };
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
    // Fix: Accessing this.state which is now explicitly declared and inherited correctly (Line 34)
    if (this.state.hasError) {
      // You can render any custom fallback UI
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

    // Fix: Accessing this.props which is now properly recognized from Component inheritance (Line 55)
    return this.props.children;
  }
}
