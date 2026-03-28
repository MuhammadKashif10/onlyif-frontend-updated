'use client';

import React from 'react';
import { useBuyerContext } from '../../context/BuyerContext';
import { Check } from 'lucide-react';

interface Phase {
  id: number;
  title: string;
  component: React.ComponentType;
}

interface WizardStepperProps {
  phases: Phase[];
}

const WizardStepper: React.FC<WizardStepperProps> = ({ phases }) => {
  const { currentPhase, canProceedToPhase, setPhase } = useBuyerContext();

  const getPhaseStatus = (phaseId: number) => {
    if (phaseId < currentPhase) return 'completed';
    if (phaseId === currentPhase) return 'current';
    return 'upcoming';
  };

  const isPhaseAccessible = (phaseId: number) => {
    return phaseId <= currentPhase || canProceedToPhase(phaseId);
  };

  const handlePhaseClick = (phaseId: number) => {
    if (isPhaseAccessible(phaseId)) {
      setPhase(phaseId);
    }
  };

  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {phases.map((phase, index) => {
            const status = getPhaseStatus(phase.id);
            const isAccessible = isPhaseAccessible(phase.id);
            
            return (
              <li key={phase.id} className="flex-1">
                <div className="flex items-center">
                  <button
                    onClick={() => handlePhaseClick(phase.id)}
                    disabled={!isAccessible}
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                      ${status === 'completed'
                        ? 'bg-green-600 border-green-600 text-white'
                        : status === 'current'
                        ? 'border-green-600 text-green-600 bg-white'
                        : isAccessible
                        ? 'border-gray-300 text-gray-500 bg-white hover:border-gray-400'
                        : 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
                      }
                    `}
                    aria-current={status === 'current' ? 'step' : undefined}
                  >
                    {status === 'completed' ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span className="text-sm font-medium">{phase.id}</span>
                    )}
                  </button>
                  
                  <div className="ml-3 flex-1">
                    <button
                      onClick={() => handlePhaseClick(phase.id)}
                      disabled={!isAccessible}
                      className={`
                        text-left block text-sm font-medium transition-colors
                        ${status === 'current'
                          ? 'text-green-600'
                          : status === 'completed'
                          ? 'text-gray-900'
                          : isAccessible
                          ? 'text-gray-500 hover:text-gray-700'
                          : 'text-gray-300 cursor-not-allowed'
                        }
                      `}
                    >
                      {phase.title}
                    </button>
                  </div>
                  
                  {index < phases.length - 1 && (
                    <div className="flex-1 ml-4">
                      <div className={`
                        h-0.5 transition-colors
                        ${status === 'completed' ? 'bg-green-600' : 'bg-gray-200'}
                      `} />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default WizardStepper;