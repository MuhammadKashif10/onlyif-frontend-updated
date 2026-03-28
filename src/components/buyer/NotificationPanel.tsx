'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, Home, TrendingDown, Search, AlertCircle } from 'lucide-react';
import { buyerApi } from '@/api/buyer';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
  data?: {
    propertyId?: {
      _id: string;
      title: string;
      address: any;
      price: number;
      images: string[];
    };
    actionUrl?: string;
  };
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  onUnreadCountChange: (count: number) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  unreadCount,
  onUnreadCountChange
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await buyerApi.getNotifications({ status: filter });
      if (response.success) {
        setNotifications(response.data.notifications);
        onUnreadCountChange(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await buyerApi.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId 
            ? { ...n, status: 'read' as const }
            : n
        )
      );
      if (unreadCount > 0) {
        onUnreadCountChange(unreadCount - 1);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await buyerApi.markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 'read' as const }))
      );
      onUnreadCountChange(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await buyerApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_listing':
      case 'new_property':
        return <Home className="h-5 w-5 text-blue-600" />;
      case 'price_drop':
        return <TrendingDown className="h-5 w-5 text-green-600" />;
      case 'saved_search_match':
        return <Search className="h-5 w-5 text-purple-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-6 w-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Filter tabs */}
            <div className="mt-4 flex space-x-1">
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  filter === 'unread'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All
              </button>
            </div>
            
            {/* Mark all as read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex space-x-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No notifications
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'unread' ? 'All caught up!' : 'No notifications yet.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 border-l-4 ${
                      notification.status === 'unread' ? 'bg-blue-50' : 'bg-white'
                    } ${getPriorityColor(notification.priority)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              {notification.message}
                            </p>
                            
                            {/* Property info if available */}
                            {notification.data?.propertyId && (
                              <div className="mt-2 p-2 bg-gray-50 rounded-md">
                                <p className="text-xs font-medium text-gray-900">
                                  {notification.data.propertyId.title}
                                </p>
                                <p className="text-xs text-gray-600">
                                  ${notification.data.propertyId.price.toLocaleString()}
                                </p>
                              </div>
                            )}
                            
                            <p className="mt-2 text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex space-x-1 ml-2">
                            {notification.status === 'unread' && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;