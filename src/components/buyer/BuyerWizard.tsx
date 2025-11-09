'use client';

import React from 'react';
import { useBuyerContext } from '@/context/BuyerContext';
import RegistrationPhase from './phases/RegistrationPhase';
import OtpVerificationPhase from './phases/OtpVerificationPhase';
import InterestPhase from './phases/InterestPhase';
import WizardStepper from './WizardStepper';

const phases = [
  { id: 1, title: 'Register', component: RegistrationPhase },
  { id: 2, title: 'Verify Account', component: OtpVerificationPhase },
  { id: 3, title: 'Express Interest', component: InterestPhase }
];

export default function BuyerWizard() {
  const { currentPhase } = useBuyerContext();
  const CurrentPhaseComponent = phases.find(p => p.id === currentPhase)?.component;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Find Your Dream Home</h1>
            <p className="text-green-100 mt-1">Complete the steps below to discover and connect with properties</p>
          </div>

          {/* Stepper */}
          <WizardStepper phases={phases} />

          {/* Current Phase Content */}
          <div className="p-6">
            {CurrentPhaseComponent && <CurrentPhaseComponent />}
          </div>
        </div>
      </div>
    </div>
  );
}