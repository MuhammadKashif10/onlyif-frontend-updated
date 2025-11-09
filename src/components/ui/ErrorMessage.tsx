// Error Message Component
import React from 'react';
import { AlertTriangle, Info, XCircle, ShieldAlert, RefreshCcw, Search, AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = 'error',
  onRetry,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <AlertTriangle color="#47C96F" strokeWidth={2} size={24} />
        );
      case 'info':
        return (
          <Info color="#47C96F" strokeWidth={2} size={24} />
        );
      default:
        return (
          <XCircle color="#47C96F" strokeWidth={2} size={24} />
        );
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getStyles()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0" aria-hidden="true">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
          {onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className={`text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  type === 'warning' ? 'focus:ring-yellow-500' :
                  type === 'info' ? 'focus:ring-blue-500' :
                  'focus:ring-red-500'
                }`}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Network error component
export const NetworkError: React.FC<{ onRetry?: () => void; className?: string }> = ({
  onRetry,
  className = ''
}) => (
  <div className={`text-center py-12 ${className}`}>
    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
      <ShieldAlert color="#47C96F" strokeWidth={2} size={24} />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Error</h3>
    <p className="text-gray-600 mb-6">
      Unable to load content. Please check your internet connection and try again.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <RefreshCcw className="w-4 h-4 mr-2" color="#47C96F" strokeWidth={2} size={24} />
        Retry
      </button>
    )}
  </div>
);

// No results component
export const NoResults: React.FC<{ 
  message?: string; 
  suggestion?: string;
  className?: string;
}> = ({ 
  message = "No results found", 
  suggestion = "Try adjusting your search criteria or filters",
  className = ''
}) => (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
        <Search className="w-8 h-8" color="#47C96F" strokeWidth={2} size={24} />
      </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
    <p className="text-gray-600">{suggestion}</p>
  </div>
);

// Loading error component
export const LoadingError: React.FC<{ 
  onRetry?: () => void; 
  message?: string;
  className?: string;
}> = ({ 
  onRetry, 
  message = "Failed to load content",
  className = ''
}) => (
    <div className={`text-center py-8 ${className}`}>
    <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3" aria-hidden="true">
      <AlertCircle color="#47C96F" strokeWidth={2} size={24} />
    </div>
    <p className="text-sm text-gray-600 mb-3">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-sm text-red-600 hover:text-red-700 font-medium underline"
      >
        Try again
      </button>
    )}
  </div>
);
