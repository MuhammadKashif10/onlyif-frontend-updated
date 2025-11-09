import { USE_MOCKS, withMockFallback } from '@/utils/mockWrapper';
import { request } from '@/utils/api';
import { Conversation, Message } from '@/types/api';
import { apiClient } from '../lib/api-client';
import { Message, MessageThread, PaginatedResponse } from '../types/api';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Business rule validation function
function validateMessageParticipants(senderRole: string, recipientRole: string): boolean {
  // No direct buyer-seller communication allowed
  if ((senderRole === 'buyer' && recipientRole === 'seller') ||
      (senderRole === 'seller' && recipientRole === 'buyer')) {
    return false;
  }
  
  // Valid combinations: buyer-agent, agent-seller, agent-agent
  const validCombinations = [
    ['buyer', 'agent'],
    ['agent', 'buyer'],
    ['agent', 'seller'],
    ['seller', 'agent'],
    ['agent', 'agent']
  ];
  
  return validCombinations.some(([role1, role2]) => 
    (senderRole === role1 && recipientRole === role2)
  );
}

// Mock conversation data with business rules enforcement
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    type: 'buyer_agent',
    propertyId: '1',
    propertyTitle: 'Modern Downtown Condo',
    participants: [
      { userId: 'buyer-1', name: 'John Doe', role: 'buyer', email: 'john@example.com' },
      { userId: 'agent-1', name: 'Sarah Johnson', role: 'agent', email: 'sarah@example.com' }
    ],
    lastMessage: {
      id: 'msg-2',
      senderId: 'agent-1',
      messageText: 'I\'d be happy to show you the property this weekend.',
      timestamp: '2024-01-20T11:15:00Z'
    },
    unreadCount: 1,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T11:15:00Z'
  },
  {
    id: 'conv-2',
    type: 'agent_seller',
    propertyId: '1',
    propertyTitle: 'Modern Downtown Condo',
    participants: [
      { userId: 'agent-1', name: 'Sarah Johnson', role: 'agent', email: 'sarah@example.com' },
      { userId: 'seller-1', name: 'Mike Wilson', role: 'seller', email: 'mike@example.com' }
    ],
    lastMessage: {
      id: 'msg-4',
      senderId: 'seller-1',
      messageText: 'The property is available for viewing this weekend.',
      timestamp: '2024-01-20T12:00:00Z'
    },
    unreadCount: 0,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T12:00:00Z'
  }
];

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'buyer-1',
    messageText: 'Hi, I\'m interested in the property at 123 Main St. Can we schedule a viewing?',
    timestamp: '2024-01-20T10:30:00Z',
    read: true
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'agent-1',
    messageText: 'I\'d be happy to show you the property this weekend.',
    timestamp: '2024-01-20T11:15:00Z',
    read: false
  },
  {
    id: 'msg-3',
    conversationId: 'conv-2',
    senderId: 'agent-1',
    messageText: 'I have a potential buyer interested in your property.',
    timestamp: '2024-01-20T11:30:00Z',
    read: true
  },
  {
    id: 'msg-4',
    conversationId: 'conv-2',
    senderId: 'seller-1',
    messageText: 'The property is available for viewing this weekend.',
    timestamp: '2024-01-20T12:00:00Z',
    read: true
  }
];

// Get conversations for a user
export async function getConversations(userId: string, userRole?: string): Promise<Conversation[]> {
  return withMockFallback(
    // Mock implementation
    async () => {
      await delay(500);
      return mockConversations.filter(conv => 
        conv.participants.some(p => p.userId === userId)
      );
    },
    // Real API call
    async () => {
      const response = await request(`/messages?userId=${userId}&userRole=${userRole}`);
      return response.data;
    }
  );
}

// Get messages in a conversation
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  console.log('📞 getConversationMessages called for conversation:', conversationId);
  
  return withMockFallback(
    // Mock implementation
    async () => {
      console.log('🎭 Using mock messages');
      await delay(400);
      return mockMessages
        .filter(msg => msg.conversationId === conversationId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    },
    // Real API call
    async () => {
      console.log('🌐 Fetching messages from API: /messages/' + conversationId);
      const response = await request(`/messages/${conversationId}`);
      console.log('📦 API response for messages:', response);
      return response.data || [];
    }
  );
}

// Ensure or create a thread between current user and another user
export async function ensureThread(otherUserId: string, propertyId?: string): Promise<Conversation> {
  console.log('📞 ensureThread called:', { otherUserId, propertyId });
  
  const qs = new URLSearchParams({ otherUserId });
  if (propertyId) qs.append('propertyId', propertyId);
  
  const url = `/messages/ensure-thread?${qs.toString()}`;
  console.log('🌐 Making request to:', url);
  
  try {
    const response = await request(url);
    console.log('📦 ensureThread response:', response);
    
    // Handle different response formats
    if ((response as any).data) {
      return (response as any).data as unknown as Conversation;
    }
    
    // If response itself is the conversation
    return response as unknown as Conversation;
  } catch (error) {
    console.error('❌ ensureThread failed:', error);
    throw error;
  }
}

// Send a message with business rules enforcement
export async function sendMessage(messageData: {
  conversationId?: string;
  receiverId?: string; // alias used by UI
  messageText?: string;
  // legacy fields kept for compatibility below
  senderId?: string;
  senderRole?: string;
  recipientId?: string;
  recipientRole?: string;
  propertyId?: string;
}): Promise<any> {
  // Validate business rules before sending
  if (messageData.recipientRole && !validateMessageParticipants(messageData.senderRole, messageData.recipientRole)) {
    throw new Error('Direct communication between buyers and sellers is not allowed. Please communicate through an agent.');
  }

  // Always hit backend real route which auto-creates thread and emits
  const payload: any = {
    conversationId: messageData.conversationId,
    receiverId: messageData.receiverId || messageData.recipientId,
    message_text: messageData.messageText || (messageData as any).text,
    propertyId: messageData.propertyId
  };
  const response = await request('/messages/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return { success: (response as any).success !== false, message: (response as any).data };
}

// Mark conversation as read
export async function markConversationAsRead(conversationId: string, userId?: string): Promise<void> {
  return withMockFallback(
    // Mock implementation
    async () => {
      await delay(200);
      mockMessages.forEach(msg => {
        if (msg.conversationId === conversationId && msg.senderId !== userId) {
          msg.read = true;
        }
      });
      
      // Update conversation unread count
      const conversation = mockConversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },
    // Real API call
    async () => {
      await request(`/messages/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
    }
  );
}

// Create a new conversation with business rules enforcement
export async function createConversation(conversationData: {
  type: 'buyer_agent' | 'agent_seller';
  participantIds: string[];
  propertyId: string;
  initialMessage: string;
}): Promise<{ success: boolean; conversation?: Conversation; error?: string }> {
  // Validate conversation type matches business rules
  if (!['buyer_agent', 'agent_seller'].includes(conversationData.type)) {
    return {
      success: false,
      error: 'Invalid conversation type. Only buyer-agent and agent-seller conversations are allowed.'
    };
  }

  return withMockFallback(
    // Mock implementation
    async () => {
      await delay(500);
      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        type: conversationData.type,
        propertyId: conversationData.propertyId,
        propertyTitle: 'Property Title', // Would be fetched from property data
        participants: [
          // Mock participants - in real implementation, fetch user details
          { userId: conversationData.participantIds[0], name: 'User 1', role: 'buyer', email: 'user1@example.com' },
          { userId: conversationData.participantIds[1], name: 'User 2', role: 'agent', email: 'user2@example.com' }
        ],
        lastMessage: {
          id: `msg-${Date.now()}`,
          senderId: conversationData.participantIds[0],
          messageText: conversationData.initialMessage,
          timestamp: new Date().toISOString()
        },
        unreadCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockConversations.push(newConversation);
      
      return {
        success: true,
        conversation: newConversation
      };
    },
    // Real API call
    async () => {
      const response = await request('/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(conversationData)
      });
      return response;
    }
  );
}

// Remove all mock data and implement real API calls
export const messagesApi = {
  // Get user's conversations/threads
  async getConversations(params: ThreadSearchParams = {}): Promise<PaginatedResponse<MessageThread>> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await apiClient.get(`/messages/threads?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw new Error('Failed to fetch conversations');
    }
  },

  // Get messages in a thread with pagination
  async getMessages(threadId: string, params: MessageSearchParams = {}): Promise<PaginatedResponse<Message>> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await apiClient.get(`/messages/threads/${threadId}/messages?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Failed to fetch messages');
    }
  },

  // Send a new message
  async sendMessage(threadId: string, messageData: {
    text?: string;
    messageType?: string;
    attachments?: File[];
    replyTo?: string;
  }): Promise<Message> {
    try {
      const formData = new FormData();
      
      if (messageData.text) {
        formData.append('text', messageData.text);
      }
      if (messageData.messageType) {
        formData.append('messageType', messageData.messageType);
      }
      if (messageData.replyTo) {
        formData.append('replyTo', messageData.replyTo);
      }
      
      // Add attachments if any
      if (messageData.attachments && messageData.attachments.length > 0) {
        messageData.attachments.forEach((file, index) => {
          formData.append('attachments', file);
        });
      }
      
      const response = await apiClient.post(
        `/messages/threads/${threadId}/messages`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  },

  // Create a new conversation/thread
  async createConversation(conversationData: {
    propertyId: string;
    participantIds: string[];
    subject?: string;
    type?: string;
    initialMessage?: string;
  }): Promise<MessageThread> {
    try {
      const response = await apiClient.post('/messages/threads', conversationData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    }
  },

  // Mark messages as read
  async markAsRead(threadId: string, messageIds?: string[]): Promise<void> {
    try {
      const payload = messageIds ? { messageIds } : {};
      await apiClient.post(`/messages/threads/${threadId}/read`, payload);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw new Error('Failed to mark messages as read');
    }
  },

  // Get unread message count
  async getUnreadCount(): Promise<{ count: number }> {
    try {
      const response = await apiClient.get('/messages/unread-count');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw new Error('Failed to fetch unread count');
    }
  },

  // Search messages
  async searchMessages(query: string, params: MessageSearchParams = {}): Promise<PaginatedResponse<Message>> {
    try {
      const searchParams = {
        ...params,
        search: query
      };
      
      const response = await apiClient.post('/messages/search', searchParams);
      return response.data;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw new Error('Failed to search messages');
    }
  },

  // Add reaction to message
  async addReaction(messageId: string, emoji: string): Promise<void> {
    try {
      await apiClient.post(`/messages/${messageId}/reactions`, { emoji });
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw new Error('Failed to add reaction');
    }
  },

  // Remove reaction from message
  async removeReaction(messageId: string): Promise<void> {
    try {
      await apiClient.delete(`/messages/${messageId}/reactions`);
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw new Error('Failed to remove reaction');
    }
  },

  // Edit message
  async editMessage(messageId: string, newText: string): Promise<Message> {
    try {
      const response = await apiClient.put(`/messages/${messageId}`, { text: newText });
      return response.data.data;
    } catch (error) {
      console.error('Error editing message:', error);
      throw new Error('Failed to edit message');
    }
  },

  // Delete message (soft delete)
  async deleteMessage(messageId: string): Promise<void> {
    try {
      await apiClient.delete(`/messages/${messageId}`);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error('Failed to delete message');
    }
  },

  // Update thread status
  async updateThreadStatus(threadId: string, status: string): Promise<MessageThread> {
    try {
      const response = await apiClient.put(`/messages/threads/${threadId}/status`, { status });
      return response.data.data;
    } catch (error) {
      console.error('Error updating thread status:', error);
      throw new Error('Failed to update thread status');
    }
  },

  // Add participant to thread
  async addParticipant(threadId: string, userId: string, role: string): Promise<MessageThread> {
    try {
      const response = await apiClient.post(`/messages/threads/${threadId}/participants`, {
        userId,
        role
      });
      return response.data.data;
    } catch (error) {
      console.error('Error adding participant:', error);
      throw new Error('Failed to add participant');
    }
  },

  // Remove participant from thread
  async removeParticipant(threadId: string, userId: string): Promise<MessageThread> {
    try {
      const response = await apiClient.delete(`/messages/threads/${threadId}/participants/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error removing participant:', error);
      throw new Error('Failed to remove participant');
    }
  },

  // Get thread details
  async getThreadById(threadId: string): Promise<MessageThread> {
    try {
      const response = await apiClient.get(`/messages/threads/${threadId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching thread:', error);
      throw new Error('Failed to fetch thread details');
    }
  }
};

export default messagesApi;