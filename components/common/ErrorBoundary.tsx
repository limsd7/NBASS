import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    componentName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`Uncaught error in ${this.props.componentName || 'Component'}:`, error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <p className="font-bold mb-1">⚠️ 오류가 발생했습니다 ({this.props.componentName || 'Component'})</p>
                    <p>{this.state.error?.message}</p>
                    <button
                        className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded transition-colors text-xs font-bold"
                        onClick={() => this.setState({ hasError: false })}
                    >
                        다시 시도
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
