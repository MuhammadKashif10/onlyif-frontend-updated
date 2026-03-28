'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Message, Conversation } from '@/types/api';
import { InputField, Button } from '@/components/reusable';
import { sendMessage, getConversationMessages, markConversationAsRead } from '@/api/messages';
import { useUI } from '@/context/UIContext';
import { initSocket } from '@/lib/socket';

interface ChatInterfaceProps {
  conversation: Conversation;
  currentUserId: string;
  currentUserRole: 'buyer' | 'seller' | 'agent';
  onMessageSent?: (message: Message) => void;
  className?: string;
  // Optional mock mode for places that need UI only (e.g., seller listings contact)
  mockMode?: boolean;
  initialMessages?: Message[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  currentUserId,
  currentUserRole,
  onMessageSent,
  className = '',
  mockMode = false,
  initialMessages,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useUI(); // Fixed: changed from useUIContext() to useUI()

  const otherParticipant = conversation.participants.find(p => p.userId !== currentUserId);

  useEffect(() => {
    console.log('🔄 ChatInterface mounted/updated - Conversation ID:', conversation.id);
    console.log('📋 Current conversation object:', conversation);
    
    if (mockMode) {
      console.log('🎭 Mock mode enabled, using initial messages');
      setMessages(initialMessages || []);
      setLoading(false);
      return;
    }
    
    console.log('🌐 Real mode - Loading messages from API');
    loadMessages();
  }, [conversation.id, mockMode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (mockMode) return; // skip in mock mode
    // Mark conversation as read when opened
    if (conversation.unreadCount > 0) {
      markConversationAsRead(conversation.id);
    }
  }, [conversation.id, conversation.unreadCount, mockMode]);

  // Socket: join and listen for incoming messages in this conversation
  useEffect(() => {
    if (mockMode) return; // skip sockets in mock mode
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
    if (!token || !currentUserId) return;
    const socket = initSocket(token);
    // Identify current user for personal room delivery
    socket.emit('add-user', currentUserId);

    const handler = (payload: any) => {
      // Accept both shapes
      const socketConvId = payload?.conversationId;
      const rawSender = payload?.sender || payload?.senderId;
      const rawReceiver = payload?.receiver || payload?.receiverId;
      const msgText = payload?.messageText || payload?.text || '';
      const msgId = String(payload?.id || payload?._id || Math.random());
      const ts = payload?.timestamp || payload?.createdAt || new Date().toISOString();

      // Filter to this conversation: either explicit conversationId or matching participants
      const otherId = otherParticipant?.userId;
      const belongsByConv = socketConvId && socketConvId === conversation.id;
      const belongsByUsers = rawSender && rawReceiver && (
        (String(rawSender) === currentUserId && String(rawReceiver) === otherId) ||
        (String(rawSender) === otherId && String(rawReceiver) === currentUserId)
      );
      if (!belongsByConv && !belongsByUsers) return;

      // Dedupe by id
      setMessages(prev => {
        if (prev.some(m => String(m.id) === msgId)) return prev;
        const senderId = String(rawSender || '');
        const receiverId = String(rawReceiver || (senderId === currentUserId ? otherId : currentUserId));
        const sender = conversation.participants.find(p => p.userId === senderId);
        const receiver = conversation.participants.find(p => p.userId === receiverId);
        const normalized: Message = {
          id: msgId,
          conversationId: conversation.id,
          senderId,
          receiverId,
          senderRole: (sender?.role as any) || 'agent',
          receiverRole: (receiver?.role as any) || 'seller',
          messageText: msgText,
          timestamp: typeof ts === 'string' ? ts : new Date(ts).toISOString(),
          status: 'sent',
          isRead: senderId === currentUserId
        };
        return [...prev, normalized];
      });
    };

    socket.on('receive-message', handler);
    return () => {
      socket.off('receive-message', handler);
    };
  }, [conversation.id, currentUserId, mockMode]);

  const loadMessages = async () => {
    try {
      console.log('📥 Loading messages for conversation:', conversation.id);
      setLoading(true);
      const conversationMessages = await getConversationMessages(conversation.id);
      console.log(`✅ Loaded ${conversationMessages?.length || 0} messages from DB:`, conversationMessages);
      setMessages(conversationMessages || []);
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load messages. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !otherParticipant) return;

    setSending(true);
    try {
      if (mockMode) {
        const temp: Message = {
          id: String(Date.now()),
          conversationId: conversation.id,
          senderId: currentUserId,
          receiverId: otherParticipant.userId,
          senderRole: currentUserRole,
          receiverRole: otherParticipant.role as any,
          messageText: newMessage.trim(),
          timestamp: new Date().toISOString(),
          status: 'sent',
          isRead: true,
        };
        setMessages(prev => [...prev, temp]);
        setNewMessage('');
        // Optional tiny simulated reply
        setTimeout(() => {
          const reply: Message = {
            id: String(Date.now() + 1),
            conversationId: conversation.id,
            senderId: otherParticipant.userId,
            receiverId: currentUserId,
            senderRole: otherParticipant.role as any,
            receiverRole: currentUserRole,
            messageText: 'Thanks for reaching out! I\'ll get back to you shortly.',
            timestamp: new Date().toISOString(),
            status: 'delivered',
            isRead: false,
          };
          setMessages(prev => [...prev, reply]);
        }, 800);
        return;
      }

      const result = await sendMessage({
        conversationId: conversation.id,
        receiverId: otherParticipant.userId,
        messageText: newMessage.trim(),
      });

      if (result.success) {
        // Don't add to messages here - let the socket event handle it
        // The server will emit to both users via socket after saving
        // This prevents duplication
        
        setNewMessage('');
        onMessageSent?.(result.message);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to send message. Please try again.',
      });
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'buyer': return 'text-blue-600';
      case 'seller': return 'text-orange-600';
      case 'agent': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'buyer': return '🏠';
      case 'seller': return '🏡';
      case 'agent': return '👨‍💼';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading messages...</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              {otherParticipant?.avatar ? (
                <img
                  src={otherParticipant.avatar}
                  alt={otherParticipant.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-lg">{getRoleBadge(otherParticipant?.role || '')}</span>
              )}
            </div>
            {otherParticipant?.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{otherParticipant?.name}</h3>
            <p className={`text-sm ${getRoleColor(otherParticipant?.role || '')}`}>
              {getRoleBadge(otherParticipant?.role || '')} {otherParticipant?.role?.charAt(0).toUpperCase()}{otherParticipant?.role?.slice(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.697-.413l-2.725.688a1 1 0 01-1.265-1.265l.688-2.725A8.955 8.955 0 014 12C4 7.582 7.582 4 12 4s8 3.582 8 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No messages yet</h3>
            <p className="text-gray-600">Start the conversation by sending a message below.</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId;
            const participant = conversation.participants.find(p => p.userId === message.senderId);
            
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    {!isCurrentUser && (
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="text-xs">{getRoleBadge(participant?.role || '')}</span>
                        <span className={`text-xs font-medium ${getRoleColor(participant?.role || '')}`}>
                          {participant?.name}
                        </span>
                      </div>
                    )}
                    <p className="text-sm">{message.messageText}</p>
                    <div className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                      {isCurrentUser && (
                        <span className="ml-2">
                          {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓' : '○'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <div className="flex-1">
            <InputField
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${otherParticipant?.name}...`}
              disabled={sending}
              className="w-full"
              aria-label="Type your message"
            />
          </div>
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
