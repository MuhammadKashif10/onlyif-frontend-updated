'use client';

import React, { useState, useEffect } from 'react';
import { notificationAPI, Notification, NotificationResponse } from '@/api/notifications';
import { Button } from './Button';
import { useNotifications } from '@/context/NotificationContext';
import Modal from './Modal';
import Loader from './Loader';
import {
  Bell,
  BellOff,
  Unlock,
  CalendarClock,
  Home,
  BarChart3,
  ClipboardList,
  MessageCircle,
  Clock,
  X,
  Trash2
} from 'lucide-react';

interface EnhancedNotificationPanelProps {
  userType: 'buyer' | 'seller' | 'agent';
  className?: string;
  showAsDropdown?: boolean;
}

export default function EnhancedNotificationPanel({ 
  userType, 
  className = '',
  showAsDropdown = false 
}: EnhancedNotificationPanelProps) {
  const { openInvoice } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [userType, filter]);

  const loadNotifications = async (pageNum = 1, reset = true) => {
    try {
      setLoading(true);
      const response: NotificationResponse = await notificationAPI.getNotifications(pageNum, 20, filter);
      
      if (reset) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      
      setUnreadCount(response.unreadCount);
      setHasMore(pageNum < response.pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadNotifications(page + 1, false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const commonProps = { className: 'w-5 h-5 text-[#47C96F]', strokeWidth: 2 } as const;
    const icons = {
      property_unlocked: <Unlock {...commonProps} />,
      inspection_booked: <CalendarClock {...commonProps} />,
      new_match: <Home {...commonProps} />,
      status_update: <BarChart3 {...commonProps} />,
      new_assignment: <ClipboardList {...commonProps} />,
      inquiry_received: <MessageCircle {...commonProps} />,
      inspection_scheduled: <Clock {...commonProps} />
    } as const;
    return (icons as any)[type] || <Bell {...commonProps} />;
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      property_unlocked: 'bg-green-50 border-green-200',
      inspection_booked: 'bg-blue-50 border-blue-200',
      new_match: 'bg-purple-50 border-purple-200',
      status_update: 'bg-yellow-50 border-yellow-200',
      new_assignment: 'bg-indigo-50 border-indigo-200',
      inquiry_received: 'bg-pink-50 border-pink-200',
      inspection_scheduled: 'bg-cyan-50 border-cyan-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 border-gray-200';
  };

  const filteredNotifications = notifications;

  if (showAsDropdown) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="w-6 h-6 text-[#47C96F]" strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {showPanel && (
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
              
              <div className="flex space-x-2 mb-3">
                {['all', 'unread', 'read'].map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType as any)}
                    className={`px-3 py-1 rounded-md text-sm font-medium capitalize ${
                      filter === filterType
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {filterType} {filterType === 'unread' && `(${unreadCount})`}
                  </button>
                ))}
              </div>
              
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Mark All as Read
                </Button>
              )}
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <Loader size="sm" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications found
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-l-4 transition-colors ${
                        notification.read
                          ? 'bg-gray-50 border-gray-200'
                          : getNotificationColor(notification.type)
                      } hover:bg-opacity-80`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${
                              notification.read ? 'text-gray-700' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              {notification.data?.actionUrl && (
                                <a
                                  href={notification.data.actionUrl}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                                >
                                  View Invoice
                                </a>
                              )}
                              {!notification.data?.actionUrl && notification.data?.invoiceId && (
                                <button
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  onClick={() => {
                                    if (!notification.read) handleMarkAsRead(notification.id);
                                    openInvoice(notification.data.invoiceId);
                                  }}
                                >
                                  View Invoice
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                className="text-gray-400 hover:text-red-500 ml-2"
                                aria-label="Delete notification"
                              >
                                <Trash2 className="w-4 h-4" strokeWidth={2} />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {hasMore && (
                    <div className="p-3 text-center">
                      <Button
                        onClick={loadMore}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                      >
                        {loading ? 'Loading...' : 'Load More'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full panel view for dedicated notification pages
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {unreadCount} unread
            </span>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                variant="outline"
                size="sm"
              >
                Mark All as Read
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          {['all', 'unread', 'read'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${
                filter === filterType
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {filterType} {filterType === 'unread' && `(${unreadCount})`}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <Loader />
            <p className="text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <BellOff className="w-12 h-12 mx-auto" strokeWidth={2} />
            </div>
            <p className="text-gray-500">No notifications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                  notification.read
                    ? 'bg-gray-50 border-gray-200'
                    : getNotificationColor(notification.type)
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-semibold ${
                          notification.read ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {!notification.read && (
                      <Button
                        onClick={() => handleMarkAsRead(notification.id)}
                        variant="outline"
                        size="sm"
                      >
                        Mark as Read
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDeleteNotification(notification.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4 inline-block mr-1" strokeWidth={2} /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Notifications'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
