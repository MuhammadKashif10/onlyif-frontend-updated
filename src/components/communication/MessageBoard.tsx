'use client';

import React, { useState, useEffect } from 'react';
import { MessagesInterface } from '@/components/reusable';
import { useAuth } from '@/context/AuthContext';
import { Button, Modal, InputField, Alert } from '@/components/reusable';
import { createConversation } from '@/api/messages';
import { useUI } from '@/context/UIContext';

interface MessageBoardProps {
  className?: string;
  propertyId?: string;
  targetUserId?: string;
  targetUserRole?: 'buyer' | 'seller' | 'agent';
}

const MessageBoard: React.FC<MessageBoardProps> = ({
  className = '',
  propertyId,
  targetUserId,
  targetUserRole
}) => {
  const { user } = useAuth();
  const { addNotification } = useUI();
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationData, setNewConversationData] = useState({
    participantEmail: '',
    initialMessage: '',
    type: 'buyer_agent' as 'buyer_agent' | 'agent_seller'
  });
  const [creating, setCreating] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to access messages</p>
          <Button href="/signin" className="bg-blue-600 text-white">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateConversation = async () => {
    if (!newConversationData.participantEmail.trim() || !newConversationData.initialMessage.trim()) {
      addNotification({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setCreating(true);
    try {
      const result = await createConversation({
        type: newConversationData.type,
        participantIds: [user.id, 'participant-id'], // In real app, resolve email to ID
        propertyId: propertyId || '',
        initialMessage: newConversationData.initialMessage
      });

      if (result.success) {
        addNotification({
          type: 'success',
          message: 'Conversation started successfully'
        });
        setShowNewConversation(false);
        setNewConversationData({
          participantEmail: '',
          initialMessage: '',
          type: 'buyer_agent'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to start conversation. Please try again.'
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          <Button
            onClick={() => setShowNewConversation(true)}
            className="bg-blue-600 text-white hover:bg-blue-700"
            size="sm"
          >
            New Message
          </Button>
        </div>
      </div>

      {/* Messages Interface */}
      <div className="flex-1">
        <MessagesInterface
          currentUserId={user.id}
          currentUserRole={user.role as 'buyer' | 'seller' | 'agent'}
          className="h-full"
        />
      </div>

      {/* New Conversation Modal */}
      <Modal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        title="Start New Conversation"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Email
            </label>
            <InputField
              type="email"
              value={newConversationData.participantEmail}
              onChange={(e) => setNewConversationData(prev => ({
                ...prev,
                participantEmail: e.target.value
              }))}
              placeholder="Enter recipient's email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conversation Type
            </label>
            <select
              value={newConversationData.type}
              onChange={(e) => setNewConversationData(prev => ({
                ...prev,
                type: e.target.value as 'buyer_agent' | 'agent_seller'
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="buyer_agent">Buyer ↔ Agent</option>
              <option value="agent_seller">Agent ↔ Seller</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Message
            </label>
            <textarea
              value={newConversationData.initialMessage}
              onChange={(e) => setNewConversationData(prev => ({
                ...prev,
                initialMessage: e.target.value
              }))}
              placeholder="Type your message..."
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowNewConversation(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={creating}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {creating ? 'Starting...' : 'Start Conversation'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MessageBoard;