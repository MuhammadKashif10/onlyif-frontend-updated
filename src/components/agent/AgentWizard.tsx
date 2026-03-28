'use client';

import React from 'react';
import { useAgentContext } from '@/context/AgentContext';
import WizardStepper from './WizardStepper';
import AssignedPhase from './phases/AssignedPhase';
import ViewListingPhase from './phases/ViewListingPhase';
import ManageInspectionsPhase from './phases/ManageInspectionsPhase';
import AddNotesPhase from './phases/AddNotesPhase';

export default function AgentWizard() {
  const { currentPhase } = useAgentContext();

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 1:
        return <AssignedPhase />;
      case 2:
        return <ViewListingPhase />;
      case 3:
        return <ManageInspectionsPhase />;
      case 4:
        return <AddNotesPhase />;
      default:
        return <AssignedPhase />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your assigned properties and client interactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <WizardStepper />
      </div>

      {/* Current Phase Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {renderCurrentPhase()}
      </div>
    </div>
  );
}