'use client';

import React from 'react';
import { Conversation } from '@/types/api';
import { MessageSquare } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onConversationSelect: (conversation: Conversation) => void;
  currentUserId: string;
  loading?: boolean;
  className?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onConversationSelect,
  currentUserId,
  loading = false,
  className = '',
}) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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

  const truncateMessage = (message: string, maxLength: number = 50) => {
    return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message;
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-400 mb-2" aria-hidden="true">
          <MessageSquare className="mx-auto h-12 w-12" color="#47C96F" strokeWidth={2} size={24} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No conversations yet</h3>
        <p className="text-gray-600">Your messages will appear here when you start chatting.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {conversations.map((conversation) => {
        const otherParticipant = conversation.participants.find(p => p.userId !== currentUserId);
        const isSelected = conversation.id === selectedConversationId;
        
        return (
          <button
            key={conversation.id}
            onClick={() => onConversationSelect(conversation)}
            className={`w-full text-left p-4 rounded-lg border transition-colors ${
              isSelected
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
            aria-label={`Conversation with ${otherParticipant?.name}`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative flex-shrink-0">
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
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">
                    {otherParticipant?.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem] text-center">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </span>
                    )}
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(conversation.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-xs">{getRoleBadge(otherParticipant?.role || '')}</span>
                  <span className="text-xs text-gray-500 capitalize">
                    {otherParticipant?.role}
                  </span>
                </div>
                
                {conversation.lastMessage && (
                  <p className={`text-sm mt-1 truncate ${
                    conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                  }`}>
                    {conversation.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                    {truncateMessage(conversation.lastMessage.messageText)}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationList;