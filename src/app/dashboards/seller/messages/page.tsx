'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import SecureMessageBoard from '@/components/communication/SecureMessageBoard';
import { Card, Alert } from '@/components/reusable';

const SellerMessagesPage: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to sellers.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">
            View messages from agents about buyer interest in your properties
          </p>
        </div>

        {/* Business Rules Notice */}
        <Alert 
          type="info" 
          message="For security and transparency, all communication goes through our licensed agents. Agents will contact you when there is buyer interest in your properties."
          className="mb-6"
        />

        {/* Messaging Interface */}
        <div className="bg-white rounded-lg shadow-md h-[calc(100vh-280px)]">
          <SecureMessageBoard 
            className="h-full"
            restrictedMode={true}
          />
        </div>
      </div>
    </div>
  );
};

export default SellerMessagesPage;