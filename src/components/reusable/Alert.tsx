import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export default function Alert({ type, title, message, onClose, className = '' }: AlertProps) {
  const alertStyles = {
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-[#47C96F]',
      title: 'text-green-800',
      message: 'text-green-700',
      close: 'text-green-400 hover:text-green-600',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
      message: 'text-red-700',
      close: 'text-red-400 hover:text-red-600',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      close: 'text-yellow-400 hover:text-yellow-600',
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-800',
      message: 'text-blue-700',
      close: 'text-blue-400 hover:text-blue-600',
    },
  } as const;

  const styles = alertStyles[type];

  const getIcon = () => {
    const commonProps = { className: 'w-5 h-5', strokeWidth: 2, color: '#47C96F', size: 24 } as const;
    switch (type) {
      case 'success':
        return <CheckCircle2 {...commonProps} />;
      case 'error':
        return <XCircle {...commonProps} />;
      case 'warning':
        return <AlertTriangle {...commonProps} />;
      case 'info':
        return <Info {...commonProps} />;
    }
  };

  return (
    <div className={`border rounded-md p-4 ${styles.container} ${className}`}>
      <div className="flex">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>{title}</h3>
          )}
          <div className={`text-sm ${styles.message}`}>
            <p>{message}</p>
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.close}`}
            >
              <X className="w-5 h-5" color="#47C96F" strokeWidth={2} size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
