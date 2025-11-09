'use client';

import React from 'react';
import { useAgentContext } from '@/context/AgentContext';

const phases = [
  {
    id: 1,
    title: 'Assigned',
    description: 'View assigned properties'
  },
  {
    id: 2,
    title: 'View Listing',
    description: 'Access property details'
  },
  {
    id: 3,
    title: 'Manage Inspections',
    description: 'Schedule and track inspections'
  },
  {
    id: 4,
    title: 'Add Notes',
    description: 'Document progress and updates'
  }
];

export default function WizardStepper() {
  const { currentPhase, setCurrentPhase, data } = useAgentContext(); // Change agentData to data

  const canAccessPhase = (phaseId: number) => {
    switch (phaseId) {
      case 1:
        return true;
      case 2:
        return data.selectedProperty !== null; // Change agentData to data
      case 3:
        return data.selectedProperty !== null; // Change agentData to data
      case 4:
        return data.selectedProperty !== null; // Change agentData to data
      default:
        return false;
    }
  };

  const getPhaseStatus = (phaseId: number) => {
    if (phaseId === currentPhase) return 'current';
    if (phaseId < currentPhase) return 'completed';
    if (canAccessPhase(phaseId)) return 'available';
    return 'disabled';
  };

  const getStepClasses = (status: string) => {
    const baseClasses = 'flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors';
    
    switch (status) {
      case 'current':
        return `${baseClasses} bg-green-600 text-white`;
      case 'completed':
        return `${baseClasses} bg-green-600 text-white`;
      case 'available':
        return `${baseClasses} bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer`;
      case 'disabled':
        return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`;
      default:
        return baseClasses;
    }
  };

  const getConnectorClasses = (phaseId: number) => {
    const isCompleted = phaseId < currentPhase;
    return `flex-1 h-0.5 mx-4 ${
      isCompleted ? 'bg-green-600' : 'bg-gray-200'
    }`;
  };

  const handlePhaseClick = (phaseId: number) => {
    if (canAccessPhase(phaseId)) {
      setCurrentPhase(phaseId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        {phases.map((phase, index) => {
          const status = getPhaseStatus(phase.id);
          
          return (
            <React.Fragment key={phase.id}>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handlePhaseClick(phase.id)}
                  className={getStepClasses(status)}
                  disabled={status === 'disabled'}
                  aria-label={`Go to ${phase.title} phase`}
                >
                  {status === 'completed' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    phase.id
                  )}
                </button>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${
                    status === 'current' ? 'text-green-600' : 
                    status === 'completed' ? 'text-green-600' :
                    status === 'available' ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {phase.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {phase.description}
                  </div>
                </div>
              </div>
              
              {index < phases.length - 1 && (
                <div className={getConnectorClasses(phase.id)} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}