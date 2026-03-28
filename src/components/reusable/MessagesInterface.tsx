'use client';

import React, { useState, useEffect } from 'react';
import { Conversation, Message } from '@/types/api';
import { getConversations } from '@/api/messages';
import { useUI } from '@/context/UIContext';
import ConversationList from './ConversationList';
import ChatInterface from './ChatInterface';
import Button from './Button';

interface MessagesInterfaceProps {
  currentUserId: string;
  currentUserRole: 'buyer' | 'seller' | 'agent';
  className?: string;
}

const MessagesInterface: React.FC<MessagesInterfaceProps> = ({
  currentUserId,
  currentUserRole,
  className = '',
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const { addNotification } = useUI(); // Fixed: changed from useUIContext() to useUI()

  useEffect(() => {
    loadConversations();
    
    // Check if mobile view
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const userConversations = await getConversations(currentUserId);
      setConversations(userConversations);
      
      // Auto-select first conversation if available
      if (userConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(userConversations[0]);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to load conversations. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Update unread count locally
    if (conversation.unreadCount > 0) {
      setConversations(prev => 
        prev.map(c => 
          c.id === conversation.id 
            ? { ...c, unreadCount: 0 }
            : c
        )
      );
    }
  };

  const handleMessageSent = (message: Message) => {
    // Update conversation list with new message
    setConversations(prev => 
      prev.map(c => 
        c.id === message.conversationId
          ? { ...c, lastMessage: message, updatedAt: message.timestamp }
          : c
      )
    );
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  };

  // Mobile view: show either conversation list or chat
  if (isMobileView) {
    return (
      <div className={`h-full ${className}`}>
        {!selectedConversation ? (
          <div className="h-full flex flex-col">
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                {getTotalUnreadCount() > 0 && (
                  <span className="bg-blue-600 text-white text-sm rounded-full px-3 py-1">
                    {getTotalUnreadCount()} unread
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ConversationList
                conversations={conversations}
                selectedConversationId={selectedConversation?.id}
                onConversationSelect={handleConversationSelect}
                currentUserId={currentUserId}
                loading={loading}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleBackToList}
                  variant="outline"
                  size="sm"
                  className="p-2"
                  aria-label="Back to conversations"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              </div>
            </div>
            <div className="flex-1">
              <ChatInterface
                conversation={selectedConversation}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onMessageSent={handleMessageSent}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop view: show both conversation list and chat side by side
  return (
    <div className={`h-full flex ${className}`}>
      {/* Conversation List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            {getTotalUnreadCount() > 0 && (
              <span className="bg-blue-600 text-white text-sm rounded-full px-3 py-1">
                {getTotalUnreadCount()} unread
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversation?.id}
            onConversationSelect={handleConversationSelect}
            currentUserId={currentUserId}
            loading={loading}
          />
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatInterface
            conversation={selectedConversation}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            onMessageSent={handleMessageSent}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.697-.413l-2.725.688a1 1 0 01-1.265-1.265l.688-2.725A8.955 8.955 0 014 12C4 7.582 7.582 4 12 4s8 3.582 8 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the list to start messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesInterface;