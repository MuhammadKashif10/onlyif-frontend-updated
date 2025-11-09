import { apiClient } from '../lib/api-client';
// Remove this import: import { withMockFallback } from '../utils/mockWrapper';

interface Notification {
  id: string;
  userId: string;
  userType: 'buyer' | 'seller' | 'agent';
  type: 'property_unlocked' | 'inspection_booked' | 'new_match' | 'status_update' | 'new_assignment' | 'inquiry_received' | 'inspection_scheduled' | 'new_property' | 'price_drop';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
  emailSent: boolean;
}

interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

interface EmailNotificationRequest {
  to: string;
  subject: string;
  template: string;
  data: any;
}

class NotificationAPI {
  // Fix the getNotifications method to use database only
  async getNotifications(page = 1, limit = 20, filter = 'all'): Promise<NotificationResponse> {
    try {
      const response = await apiClient.get(`/notifications?page=${page}&limit=${limit}&filter=${filter}`);
      return response.data.data || {
        notifications: [],
        pagination: { page, limit, total: 0, pages: 0 },
        unreadCount: 0
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return empty response instead of mock data
      return {
        notifications: [],
        pagination: { page, limit, total: 0, pages: 0 },
        unreadCount: 0
      };
    }
  }

  async getUserNotifications(userId: string, userType: 'buyer' | 'seller' | 'agent'): Promise<Notification[]> {
    try {
      const response = await apiClient.get(`/notifications/user/${userId}?userType=${userType}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  // Remove the old getAllNotifications method or rename it
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await apiClient.patch(`/notifications/${notificationId}`, { action: 'mark_read' });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      await apiClient.patch('/notifications/bulk', { action: 'mark_all_read' });
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<{ data: { unreadCount: number } }>('/notifications?limit=1');
      return response.data.unreadCount || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read' | 'emailSent'>): Promise<Notification | null> {
    try {
      const response = await apiClient.post<{ data: Notification }>('/notifications', notification);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Trigger notification events
  async triggerSellerNotification(type: 'property_unlocked' | 'inspection_booked', data: any): Promise<void> {
    const notifications = {
      property_unlocked: {
        title: 'Property Unlocked',
        message: 'Your property has been unlocked by a buyer.',
      },
      inspection_booked: {
        title: 'Inspection Scheduled',
        message: 'An inspection has been booked for your property.',
      }
    };

    const notification = notifications[type];
    if (notification) {
      await this.createNotification({
        userId: data.sellerId,
        userType: 'seller',
        type,
        title: notification.title,
        message: notification.message,
        data
      });
    }
  }

  async triggerBuyerNotification(type: 'new_match' | 'status_update' | 'new_property' | 'price_drop', data: any): Promise<void> {
    const notifications = {
      new_match: {
        title: 'New Property Match',
        message: 'A new property matching your criteria has been listed.',
      },
      status_update: {
        title: 'Property Status Updated',
        message: 'The status of a property you\'re interested in has been updated.',
      },
      new_property: {
        title: 'New Property Available!',
        message: 'A new property has been added to the browse page. Check it out now!',
      },
      price_drop: {
        title: 'Price Drop Alert!',
        message: 'Great news! A property price has dropped. Don\'t miss this opportunity!',
      }
    };

    const notification = notifications[type];
    if (notification) {
      await this.createNotification({
        userId: data.buyerId,
        userType: 'buyer',
        type,
        title: notification.title,
        message: notification.message,
        data
      });
    }
  }

  async triggerAgentNotification(type: 'new_assignment' | 'inspection_booked', data: any): Promise<void> {
    const notifications = {
      new_assignment: {
        title: 'New Property Assignment',
        message: 'You have been assigned to manage a new property.',
      },
      inspection_booked: {
        title: 'Inspection Booked',
        message: 'An inspection has been booked for one of your assigned properties.',
      }
    };

    const notification = notifications[type];
    if (notification) {
      await this.createNotification({
        userId: data.agentId,
        userType: 'agent',
        type,
        title: notification.title,
        message: notification.message,
        data
      });
    }
  }
}

export const notificationAPI = new NotificationAPI();
export type { Notification, EmailNotificationRequest, NotificationResponse };