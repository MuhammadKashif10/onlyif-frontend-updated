'use client';

import React from 'react';
import { useSellerContext } from '@/context/SellerContext';
import RegistrationPhase from './phases/RegistrationPhase';
import OtpVerificationPhase from './phases/OtpVerificationPhase';
import WizardStepper from './WizardStepper';

const phases = [
  { id: 1, title: 'Register', component: RegistrationPhase },
  { id: 2, title: 'Verify', component: OtpVerificationPhase }
];

export default function SellerWizard() {
  const { currentPhase, nextPhase, prevPhase } = useSellerContext();
  const CurrentPhaseComponent = phases.find(p => p.id === currentPhase)?.component;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Sell Your Property</h1>
            <p className="text-blue-100 mt-1">Create your account and verify to access your Seller Dashboard</p>
          </div>

          {/* Stepper */}
          <WizardStepper phases={phases} />

          {/* Current Phase Content */}
          <div className="p-6">
            {CurrentPhaseComponent && (
              <CurrentPhaseComponent 
                onNext={nextPhase}
                onBack={prevPhase}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}