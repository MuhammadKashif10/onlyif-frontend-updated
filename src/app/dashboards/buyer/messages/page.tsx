'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import SecureMessageBoard from '@/components/communication/SecureMessageBoard';
import { Card } from '@/components/reusable';

const BuyerMessagesPage: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'buyer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to buyers.</p>
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
            Connect with agents to inquire about properties and schedule viewings
          </p>
        </div>

        {/* Messaging Interface */}
        <div className="bg-white rounded-lg shadow-md h-[calc(100vh-200px)]">
          <SecureMessageBoard 
            className="h-full"
            restrictedMode={true}
          />
        </div>
      </div>
    </div>
  );
};

export default BuyerMessagesPage;