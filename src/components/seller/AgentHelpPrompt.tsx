'use client';

import React, { useState } from 'react';
import { Button, Modal, Alert, Loader } from '@/components/reusable';
import { assignmentAPI } from '@/api/assignments';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';

interface AgentHelpPromptProps {
  propertyId: string;
  propertyAddress: string;
  onAgentAssigned?: (assignment: any) => void;
  className?: string;
}

const AgentHelpPrompt: React.FC<AgentHelpPromptProps> = ({
  propertyId,
  propertyAddress,
  onAgentAssigned,
  className = ''
}) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedHelpType, setSelectedHelpType] = useState<'pricing_help' | 'marketing_help' | 'general_assistance'>('pricing_help');
  const [customMessage, setCustomMessage] = useState('');
  const [assignmentResult, setAssignmentResult] = useState<any>(null);
  const { addNotification } = useUI();
  const { user } = useAuth();

  const helpTypes = {
    pricing_help: {
      title: 'Pricing Guidance',
      description: 'Get expert advice on setting your "Only If" price based on market data and comparable sales.',
      icon: '💰'
    },
    marketing_help: {
      title: 'Marketing & Listing Optimization',
      description: 'Improve your listing with professional photos, better descriptions, and marketing strategies.',
      icon: '📸'
    },
    general_assistance: {
      title: 'General Support',
      description: 'Get help with any aspect of selling your property through the OnlyIf platform.',
      icon: '🤝'
    }
  };

  const handleRequestAgent = async () => {
    if (!user) {
      addNotification({ type: 'error', message: 'Please log in to request agent assistance.' });
      return;
    }

    setLoading(true);
    try {
      const assignment = await assignmentAPI.assignAgent({
        propertyId,
        sellerId: user.id,
        propertyAddress,
        requestType: selectedHelpType,
        message: customMessage
      });

      setAssignmentResult(assignment);
      onAgentAssigned?.(assignment);
      
      addNotification({
        type: 'success',
        message: `Agent ${assignment.agent.name} has been assigned to help you!`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to assign agent. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (assignmentResult) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Agent Assigned Successfully!
            </h3>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={assignmentResult.agent.avatar}
                  alt={assignmentResult.agent.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{assignmentResult.agent.name}</h4>
                  <p className="text-sm text-gray-600">{assignmentResult.agent.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Specializations:</span>
                  <div className="flex flex-wrap gap-1">
                    {assignmentResult.agent.specializations.map((spec: string, index: number) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Rating:</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">{assignmentResult.agent.rating}</span>
                    <span className="text-yellow-400 ml-1">★</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-green-700 mt-3">
              Your assigned agent will contact you within 24 hours. You can also message them directly through your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12