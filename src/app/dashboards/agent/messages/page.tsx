'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import SecureMessageBoard from '@/components/communication/SecureMessageBoard';
import { Card, Badge } from '@/components/reusable';

const AgentMessagesPage: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'agent') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to agents.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
              <p className="text-gray-600">
                Facilitate communication between buyers and sellers
              </p>
            </div>
            <Badge variant="success" size="lg">Agent Hub</Badge>
          </div>
        </div>

        {/* Agent Features Notice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-blue-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m-2-4h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V6a2 2 0 012-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Buyer Communication</h3>
            <p className="text-sm text-gray-600">Connect buyers with property information</p>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-green-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Seller Updates</h3>
            <p className="text-sm text-gray-600">Keep sellers informed about interest</p>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-purple-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Secure Platform</h3>
            <p className="text-sm text-gray-600">All communications are monitored and secure</p>
          </Card>
        </div>

        {/* Messaging Interface */}
        <div className="bg-white rounded-lg shadow-md h-[calc(100vh-350px)]">
          <SecureMessageBoard 
            className="h-full"
            restrictedMode={false}
          />
        </div>
      </div>
    </div>
  );
};

export default AgentMessagesPage;