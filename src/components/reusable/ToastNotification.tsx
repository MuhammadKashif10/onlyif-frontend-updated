'use client';
import React from 'react';
import { useUI } from '@/context/UIContext';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastNotification: React.FC = () => {
  const { notifications, removeNotification } = useUI();

  if (notifications.length === 0) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <CheckCircle2 color="#47C96F" strokeWidth={2} size={24} />
        );
      case 'error':
        return (
          <XCircle color="#47C96F" strokeWidth={2} size={24} />
        );
      case 'warning':
        return (
          <AlertTriangle color="#47C96F" strokeWidth={2} size={24} />
        );
      case 'info':
        return (
          <Info color="#47C96F" strokeWidth={2} size={24} />
        );
      default:
        return null;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getNotificationTextColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2" style={{ maxWidth: '400px' }}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start p-4 border rounded-lg shadow-lg transition-all duration-300 animate-slide-in-right ${getNotificationBgColor(notification.type)}`}
          role="alert"
        >
          <div className="flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${getNotificationTextColor(notification.type)}`}>
              {notification.title}
            </h4>
            <p className={`text-sm mt-1 ${getNotificationTextColor(notification.type)} opacity-90`}>
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              onClick={() => removeNotification(notification.id)}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                notification.type === 'success'
                  ? 'text-green-500 hover:bg-green-100 focus:ring-green-500'
                  : notification.type === 'error'
                  ? 'text-red-500 hover:bg-red-100 focus:ring-red-500'
                  : notification.type === 'warning'
                  ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-500'
                  : 'text-blue-500 hover:bg-blue-100 focus:ring-blue-500'
              }`}
            >
              <span className="sr-only">Dismiss</span>
              <X className="w-4 h-4" color="#47C96F" strokeWidth={2} size={24} />
            </button>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ToastNotification;