'use client';

import React, { useState } from 'react';
import Button from '@/components/reusable/Button';
import Modal from '@/components/reusable/Modal';
import { AgentAssignmentResponse } from '@/api/assignments';

interface AssignedAgentProps {
  assignment: AgentAssignmentResponse;
}

export default function AssignedAgent({ assignment }: AssignedAgentProps) {
  const [showMessaging, setShowMessaging] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'agent',
      content: `Hi! I'm ${assignment.agent.name}, your assigned Only If agent. I'm here to help you optimize your property listing and pricing strategy. Let me know how I can assist you!`,
      timestamp: new Date().toISOString()
    }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'seller',
        content: message.trim(),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Simulate agent response
      setTimeout(() => {
        const agentResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          content: 'Thanks for your message! I\'ll review your property details and get back to you with recommendations shortly.',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, agentResponse]);
      }, 2000);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-start space-x-4">
          <img
            src={assignment.agent.avatar}
            alt={assignment.agent.name}
            className="w-16 h-16 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/images/agent-default.jpg';
            }}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Assigned Agent: {assignment.agent.name}
              </h3>
              <div className="flex items-center text-yellow-500">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium">{assignment.agent.rating}</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mb-3">
              <p><strong>Email:</strong> {assignment.agent.email}</p>
              <p><strong>Phone:</strong> {assignment.agent.phone}</p>
              <p><strong>Specializations:</strong> {assignment.agent.specializations.join(', ')}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowMessaging(true)}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                💬 Message Agent
              </Button>
              <Button
                onClick={() => window.open(`tel:${assignment.agent.phone}`)}
                variant="outline"
                size="sm"
              >
                📞 Call Agent
              </Button>
            </div>
          </div>
        </div>
        
        {/* Agent Recommendations Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Agent Recommendations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-medium text-green-900 mb-2">💰 Suggested Price Range</h5>
              <p className="text-sm text-green-700">
                Based on market analysis, consider pricing between $420,000 - $480,000 for optimal market response.
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h5 className="font-medium text-purple-900 mb-2">📸 Marketing Add-ons</h5>
              <p className="text-sm text-purple-700">
                Professional photography and virtual staging could increase interest by 40%. 
                <button className="text-purple-600 underline ml-1">View options</button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messaging Modal */}
      <Modal
        isOpen={showMessaging}
        onClose={() => setShowMessaging(false)}
        title={`Chat with ${assignment.agent.name}`}
        size="lg"
      >
        <div className="flex flex-col h-96">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === 'seller' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender === 'seller'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === 'seller' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Message Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Type your message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              size="sm"
            >
              Send
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}