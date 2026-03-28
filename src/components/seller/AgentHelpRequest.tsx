'use client';

import React, { useState } from 'react';
import { Button, Modal, InputField, Alert, Badge } from '@/components/reusable';
import { assignmentAPI } from '@/api/assignments';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';

interface AgentHelpRequestProps {
  propertyId: string;
  propertyAddress: string;
  className?: string;
}

const AgentHelpRequest: React.FC<AgentHelpRequestProps> = ({
  propertyId,
  propertyAddress,
  className = ''
}) => {
  const { user } = useAuth();
  const { addNotification } = useUI();
  const [showModal, setShowModal] = useState(false);
  const [requestData, setRequestData] = useState({
    requestType: 'pricing_help' as 'pricing_help' | 'marketing_help' | 'general_assistance',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [assignedAgent, setAssignedAgent] = useState<any>(null);

  const requestTypes = [
    {
      id: 'pricing_help',
      label: 'Pricing Strategy',
      description: 'Get expert advice on pricing your property competitively',
      icon: '💰'
    },
    {
      id: 'marketing_help',
      label: 'Marketing Support',
      description: 'Professional help with photos, descriptions, and promotion',
      icon: '📸'
    },
    {
      id: 'general_assistance',
      label: 'General Assistance',
      description: 'Any other questions or support you need',
      icon: '🤝'
    }
  ];

  const handleSubmitRequest = async () => {
    if (!requestData.message.trim()) {
      addNotification({
        type: 'error',
        message: 'Please provide details about what help you need'
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await assignmentAPI.assignAgent({
        propertyId,
        sellerId: user?.id || '',
        propertyAddress,
        requestType: requestData.requestType,
        message: requestData.message
      });

      setAssignedAgent(result.agent);
      addNotification({
        type: 'success',
        message: `Agent ${result.agent.name} has been assigned to help you!`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to assign agent. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRequestData({
      requestType: 'pricing_help',
      message: ''
    });
    setAssignedAgent(null);
    setShowModal(false);
  };

  return (
    <div className={className}>
      <Button
        onClick={() => setShowModal(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 py-3 px-6 rounded-lg font-medium shadow-lg"
      >
        <span className="mr-2">🏠</span>
        Get Help From an Only If Agent
      </Button>

      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title="Get Expert Help"
        size="lg"
      >
        {!assignedAgent ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Get Professional Help
              </h3>
              <p className="text-gray-600">
                Our expert agents are here to help you succeed with your property sale.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What type of help do you need?
              </label>
              <div className="space-y-3">
                {requestTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      requestData.requestType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setRequestData(prev => ({ ...prev, requestType: type.id as any }))}
                  >
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">{type.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{type.label}</h4>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell us more about what you need help with
              </label>
              <textarea
                value={requestData.message}
                onChange={(e) => setRequestData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Describe your specific needs or questions..."
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-600">ℹ️</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-900">What happens next?</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    We'll assign an expert agent to your request within 24 hours. They'll contact you directly to discuss your needs and provide personalized assistance.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRequest}
                disabled={submitting || !requestData.message.trim()}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {submitting ? 'Requesting Help...' : 'Request Agent Help'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <span className="text-3xl">✅</span>
            </div>
            
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Agent Assigned Successfully!
              </h3>
              <p className="text-gray-600">
                Your request has been assigned to one of our expert agents.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-700">
                      {assignedAgent.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{assignedAgent.name}</h4>
                  <p className="text-sm text-gray-600">{assignedAgent.email}</p>
                  <p className="text-sm text-gray-600">{assignedAgent.phone}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm text-gray-600 ml-1">{assignedAgent.rating}/5.0</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Specializations:</h5>
                <div className="flex flex-wrap gap-2">
                  {assignedAgent.specializations.map((spec: string, index: number) => (
                    <Badge key={index} variant="info" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>{assignedAgent.name}</strong> will contact you within 24 hours to discuss your needs. You can also reach out to them directly using the contact information above.
              </p>
            </div>

            <Button
              onClick={resetForm}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AgentHelpRequest;