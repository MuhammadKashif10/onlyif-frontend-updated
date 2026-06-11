'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/reusable';
import { Navbar } from '@/components';
import BuyerChatPanel from '@/components/agent/BuyerChatPanel';

function ManageBuyersContent() {
  const router = useRouter();
  const params = useSearchParams();
  const propertyId = params.get('propertyId');
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
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Buyers</h1>
          <p className="text-gray-600">Message buyers who unlocked your assigned properties.</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {propertyId ? (
            <BuyerChatPanel propertyId={propertyId} />
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a property first</h3>
              <p className="text-gray-600 mb-6">
                Open a property from Assigned Properties and choose “Manage Buyers”.
              </p>
              <button
                onClick={() => router.push('/dashboards/agent')}
                className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors"
              >
                Go to Assigned Properties
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ManageBuyersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ManageBuyersContent />
    </Suspense>
  );
}
