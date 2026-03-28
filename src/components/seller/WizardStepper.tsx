'use client';

import React from 'react';
import { useSellerContext } from '@/context/SellerContext';

interface Phase {
  id: number;
  title: string;
}

interface WizardStepperProps {
  phases: Phase[];
}

export default function WizardStepper({ phases }: WizardStepperProps) {
  const { currentPhase } = useSellerContext();

  return (
    <div className="border-b border-gray-200">
      <nav className="flex" aria-label="Progress">
        {phases.map((phase, index) => {
          const isActive = phase.id === currentPhase;
          const isCompleted = phase.id < currentPhase;
          const isUpcoming = phase.id > currentPhase;

          return (
            <div
              key={phase.id}
              className={`flex-1 py-4 px-6 text-center border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : isCompleted
                  ? 'border-green-500 text-green-600'
                  : 'border-gray-300 text-gray-500'
              }`}
            >
              <div className="flex items-center justify-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium mr-2 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    phase.id
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {phase.title}
                </span>
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}