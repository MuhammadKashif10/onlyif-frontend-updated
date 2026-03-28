'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationAPI, Notification } from '@/api/notifications';
import { useAuth } from '@/hooks/useAuth';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  triggerNotification: (type: string, data: any) => Promise<void>;
  openInvoice: (invoiceId: string) => void;
  closeInvoice: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [invoiceModalId, setInvoiceModalId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      refreshNotifications();

      // Real-time updates via Socket.io
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
        if (token) {
          const socket = require('@/lib/socket').initSocket(token);
          // Identify the user and join seller room if applicable
          socket.emit('add-user', user.id);
          if (user.role === 'seller') {
            socket.emit('join-seller-room', user.id);
          }
          // Listen for server-pushed notifications
          socket.on('new-notification', () => {
            refreshNotifications();
          });
          // Also support room-based event name with underscore
          socket.on('new_notification', (payload: any) => {
            if (payload?.invoiceId && user?.role === 'seller') {
              setInvoiceModalId(payload.invoiceId);
            }
            console.debug('🔔 new_notification received', payload);
            setUnreadCount(prev => prev + 1);
            refreshNotifications();
          });
        }
      } catch (e) {
        console.warn('Socket setup failed, falling back to polling');
      }

      // Fallback polling every 30s
      const interval = setInterval(refreshNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const refreshNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications(1, 50, 'all');
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
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

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const triggerNotification = async (type: string, data: any) => {
    if (!user) return;
    
    try {
      // Trigger appropriate notification based on user type and event
      if (user.userType === 'seller') {
        if (type === 'property_unlocked' || type === 'inspection_booked') {
          await notificationAPI.triggerSellerNotification(type as any, { ...data, sellerId: user.id });
        }
      } else if (user.userType === 'buyer') {
        if (type === 'new_match' || type === 'status_update') {
          await notificationAPI.triggerBuyerNotification(type as any, { ...data, buyerId: user.id });
        }
      } else if (user.userType === 'agent') {
        if (type === 'new_assignment' || type === 'inspection_booked') {
          await notificationAPI.triggerAgentNotification(type as any, { ...data, agentId: user.id });
        }
      }
      
      // Refresh notifications to show the new one
      await refreshNotifications();
    } catch (error) {
      console.error('Error triggering notification:', error);
    }
  };

  const openInvoice = (invoiceId: string) => {
    if (user?.role === 'seller') setInvoiceModalId(invoiceId);
  };
  const closeInvoice = () => setInvoiceModalId(null);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    openInvoice,
    closeInvoice,
    triggerNotification
  };

  const InvoiceModal = require('@/components/reusable/InvoiceModal').default;

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {invoiceModalId && user?.role === 'seller' && (
        <InvoiceModal invoiceId={invoiceModalId} onClose={closeInvoice} />
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}