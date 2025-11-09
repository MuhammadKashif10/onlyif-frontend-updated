'use client';

import React, { useState, useEffect } from 'react';
import { MessagesInterface } from '@/components/reusable';
import { useAuth } from '@/context/AuthContext';
import { Button, Modal, InputField, Alert, Badge } from '@/components/reusable';
import { createConversation } from '@/api/messages';
import { useUI } from '@/context/UIContext';
import { getAgents } from '@/api/agents';
import { Agent } from '@/types/api';

interface SecureMessageBoardProps {
  className?: string;
  propertyId?: string;
  restrictedMode?: boolean; // Enforces stricter business rules
}

const SecureMessageBoard: React.FC<SecureMessageBoardProps> = ({
  className = '',
  propertyId,
  restrictedMode = true
}) => {
  const { user } = useAuth();
  const { addNotification } = useUI();
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [newConversationData, setNewConversationData] = useState({
    selectedAgentId: '',
    initialMessage: '',
    type: 'buyer_agent' as 'buyer_agent' | 'agent_seller'
  });
  const [creating, setCreating] = useState(false);
  const [businessRuleError, setBusinessRuleError] = useState<string | null>(null);

  useEffect(() => {
    if (showNewConversation) {
      loadAvailableAgents();
    }
  }, [showNewConversation]);

  const loadAvailableAgents = async () => {
    try {
      const agents = await getAgents();
      setAvailableAgents(agents);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const validateConversationType = (): boolean => {
    if (!user) return false;
    
    // Business rule enforcement based on user role
    if (user.role === 'buyer') {
      // Buyers can only start conversations with agents
      return newConversationData.type === 'buyer_agent';
    } else if (user.role === 'seller') {
      // Sellers can only communicate through agents (no direct initiation)
      if (restrictedMode) {
        setBusinessRuleError('Sellers cannot initiate conversations directly. An agent will contact you when there is interest in your property.');
        return false;
      }
      return newConversationData.type === 'agent_seller';
    } else if (user.role === 'agent') {
      // Agents can start both types of conversations
      return true;
    }
    
    return false;
  };

  const handleCreateConversation = async () => {
    if (!user) return;
    
    setBusinessRuleError(null);
    
    if (!newConversationData.selectedAgentId || !newConversationData.initialMessage.trim()) {
      addNotification({
        type: 'error',
        message: 'Please select an agent and enter a message'
      });
      return;
    }

    if (!validateConversationType()) {
      return;
    }

    setCreating(true);
    try {
      const participantIds = user.role === 'agent' 
        ? [user.id, newConversationData.selectedAgentId]
        : [user.id, newConversationData.selectedAgentId];
      
      const result = await createConversation({
        type: newConversationData.type,
        participantIds,
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
          selectedAgentId: '',
          initialMessage: '',
          type: 'buyer_agent'
        });
      } else {
        setBusinessRuleError(result.error || 'Failed to create conversation');
      }
    } catch (error: any) {
      setBusinessRuleError(error.message || 'Failed to start conversation. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const getConversationTypeOptions = () => {
    if (!user) return [];
    
    const options = [];
    
    if (user.role === 'buyer') {
      options.push({ value: 'buyer_agent', label: 'Contact Agent' });
    } else if (user.role === 'agent') {
      options.push(
        { value: 'buyer_agent', label: 'Contact Buyer' },
        { value: 'agent_seller', label: 'Contact Seller' }
      );
    }
    
    return options;
  };

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

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header with Business Rules Info */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          {user.role !== 'seller' || !restrictedMode ? (
            <Button
              onClick={() => setShowNewConversation(true)}
              className="bg-blue-600 text-white hover:bg-blue-700"
              size="sm"
            >
              New Message
            </Button>
          ) : null}
        </div>
        
        {/* Business Rules Notice */}
        <div className="flex items-center space-x-2 text-sm">
          <Badge variant="info" size="sm">Secure Messaging</Badge>
          <span className="text-gray-600">
            {user.role === 'buyer' && 'Connect with agents for property inquiries'}
            {user.role === 'seller' && 'Agents will contact you about buyer interest'}
            {user.role === 'agent' && 'Facilitate buyer-seller communication'}
          </span>
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
        onClose={() => {
          setShowNewConversation(false);
          setBusinessRuleError(null);
        }}
        title="Start New Conversation"
        size="md"
      >
        <div className="space-y-4">
          {businessRuleError && (
            <Alert type="error" message={businessRuleError} />
          )}
          
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
              disabled={user.role === 'buyer'}
            >
              {getConversationTypeOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Agent
            </label>
            <select
              value={newConversationData.selectedAgentId}
              onChange={(e) => setNewConversationData(prev => ({
                ...prev,
                selectedAgentId: e.target.value
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Choose an agent...</option>
              {availableAgents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} - {agent.specialization}
                </option>
              ))}
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
              onClick={() => {
                setShowNewConversation(false);
                setBusinessRuleError(null);
              }}
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

export default SecureMessageBoard;