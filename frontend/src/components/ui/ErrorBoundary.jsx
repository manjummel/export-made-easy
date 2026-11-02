import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';
import Card from './Card';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Exception caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="max-w-lg w-full p-8 border-red-500/30 bg-red-950/10 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Application Exception</h2>
                <p className="text-xs text-red-400">ExportEase AI caught an unexpected rendering error.</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4 bg-slate-900/60 p-3 rounded-lg font-mono overflow-auto max-h-32 border border-slate-800">
              {this.state.error?.message || 'Unknown runtime error'}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                icon={RefreshCw}
                onClick={this.handleReset}
              >
                Reload Component
              </Button>
              <Button
                variant="outline"
                icon={Home}
                onClick={() => { window.location.href = '/dashboard'; }}
              >
                Return to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
