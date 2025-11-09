'use client';

import React, { useState, useEffect } from 'react';
import { Conversation, Message } from '@/types/api';
import { getConversations, createConversation } from '@/api/messages';
import { useUI } from '@/context/UIContext';
import { Button, Modal, Badge } from '@/components/reusable';
import ConversationList from '@/components/reusable/ConversationList';
import ChatInterface from '@/components/reusable/ChatInterface';

interface EnhancedMessagesInterfaceProps {
  currentUserId: string;
  currentUserRole: 'buyer' | 'seller' | 'agent';
  propertyId?: string;
  className?: string;
}

const EnhancedMessagesInterface: React.FC<EnhancedMessagesInterfaceProps> = ({
  currentUserId,
  currentUserRole,
  propertyId,
  className = ''
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const { addNotification } = useUI();

  useEffect(() => {
    loadConversations();
    
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
      
      // Filter conversations by property if specified
      const filteredConversations = propertyId 
        ? userConversations.filter(conv => conv.propertyId === propertyId)
        : userConversations;
      
      setConversations(filteredConversations);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to load conversations. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleMessageSent = (message: Message) => {
    setConversations(prev => 
      prev.map(c => 
        c.id === message.conversationId
          ? { ...c, lastMessage: message, updatedAt: message.timestamp }
          : c
      )
    );
  };

  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  };

  const getConversationTypeLabel = (type: string) => {
    switch (type) {
      case 'buyer_agent':
        return 'Buyer ↔ Agent';
      case 'agent_seller':
        return 'Agent ↔ Seller';
      case 'buyer_seller':
        return 'Buyer ↔ Seller';
      default:
        return 'Conversation';
    }
  };

  if (isMobileView) {
    return (
      <div className={`h-full flex flex-col ${className}`}>
        {!selectedConversation ? (
          <div className="flex-1 flex flex-col">
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                <div className="flex items-center space-x-2">
                  {getTotalUnreadCount() > 0 && (
                    <Badge variant="primary" className="text-xs">
                      {getTotalUnreadCount()} unread
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewChatModal(true)}
                    className="text-xs"
                  >
                    New Chat
                  </Button>
                </div>
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
          <div className="flex-1 flex flex-col">
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConversation(null)}
                  className="p-2"
                  aria-label="Back to conversations"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
                  <p className="text-xs text-gray-500">
                    {getConversationTypeLabel(selectedConversation.type)}
                  </p>
                </div>
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

  return (
    <div className={`h-full flex ${className}`}>
      {/* Conversation List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <div className="flex items-center space-x-2">
              {getTotalUnreadCount() > 0 && (
                <Badge variant="primary" className="text-xs">
                  {getTotalUnreadCount()} unread
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewChatModal(true)}
                className="text-xs"
              >
                New Chat
              </Button>
            </div>
          </div>
          
          {propertyId && (
            <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
              Property-specific conversations
            </div>
          )}
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
              <p className="text-gray-600 mb-4">Choose a conversation from the list to start messaging.</p>
              <Button
                variant="primary"
                onClick={() => setShowNewChatModal(true)}
              >
                Start New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <Modal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        title="Start New Conversation"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            New conversation functionality will be implemented based on your role and available contacts.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowNewChatModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                // Implement new conversation logic
                setShowNewChatModal(false);
              }}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EnhancedMessagesInterface;