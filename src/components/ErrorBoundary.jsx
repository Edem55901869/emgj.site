import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const isPageBoundary = this.props.pageBoundary;
      return (
        <div className={`flex items-center justify-center bg-gray-50 p-6 ${isPageBoundary ? 'min-h-[60vh]' : 'min-h-screen'}`}>
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Une erreur est survenue</h2>
            <p className="text-gray-600 mb-2">
              Nous sommes désolés, quelque chose s'est mal passé.
            </p>
            {this.state.error && (
              <details className="mb-4 text-left">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Détails techniques</summary>
                <pre className="text-xs text-red-500 bg-red-50 rounded-lg p-3 mt-2 overflow-auto max-h-32">
                  {this.state.error?.message || String(this.state.error)}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                className="bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
              <Button
                onClick={() => { window.location.href = '/'; }}
                variant="outline"
                className="rounded-xl"
              >
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;