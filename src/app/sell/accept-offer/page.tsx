'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components';
import Footer from '@/components/main/Footer';
import ProgressStepper from '@/components/reusable/ProgressStepper';
import FeeBreakdown from '@/components/reusable/FeeBreakdown';

export default function AcceptOfferPage() {
  const [isAccepted, setIsAccepted] = useState(false);
  const router = useRouter();

  const steps = [
    { id: 'get-offer', title: 'Get Offer', description: 'Enter property details' },
    { id: 'schedule-inspection', title: 'Schedule Inspection', description: 'Choose inspection time' },
    { id: 'accept-offer', title: 'Accept Offer', description: 'Review and accept' },
    { id: 'close', title: 'Close & Move', description: 'Complete the sale' }
  ];

  // Mock offer data
  const offerData = {
    offerAmount: 450000,
    fees: [
      {
        name: 'Property Inspection',
        amount: 500,
        description: 'Professional inspection and assessment'
      },
      {
        name: 'Title Search & Insurance',
        amount: 1200,
        description: 'Legal title verification and insurance'
      },
      {
        name: 'Closing Costs',
        amount: 2500,
        description: 'Escrow, recording, and other closing fees'
      },
      {
        name: 'Processing Fee',
        amount: 800,
        description: 'Document processing and administrative costs'
      }
    ],
    netProceeds: 445000
  };

  const handleAccept = () => {
    setIsAccepted(true);
    setTimeout(() => {
      router.push('/sell/close');
    }, 2000);
  };

  const handleDecline = () => {
    router.push('/browse');
  };

  if (isAccepted) {
    return (
      <div className="min-h-screen">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <ProgressStepper steps={steps} currentStep={2} className="mb-8" />
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Offer Accepted!</h2>
                <p className="text-gray-600 mb-6">
                  Congratulations! Your offer has been accepted. We'll be in touch within 24 hours to discuss next steps.
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-blue-700">
                    <span className="font-medium">Next:</span> Complete closing documents and choose your closing date
                  </p>
                </div>
                
                <div className="animate-pulse">
                  <p className="text-sm text-gray-500">Redirecting to closing page...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ProgressStepper steps={steps} currentStep={2} className="mb-8" />
          
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Review Your Final Offer</h1>
              <p className="text-gray-600">
                Based on your property inspection, here's your final cash offer. Review the details and accept when you're ready.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Property Details */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">123 Main Street, Austin, TX 78701</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type:</span>
                    <span className="font-medium">Single Family Home</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bedrooms:</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bathrooms:</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Square Feet:</span>
                    <span className="font-medium">1,800</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Closing:</span>
                    <span className="font-medium">7-14 days</span>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <FeeBreakdown
                offerAmount={offerData.offerAmount}
                fees={offerData.fees}
                netProceeds={offerData.netProceeds}
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <button
                onClick={handleAccept}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 px-8 rounded-lg text-lg font-semibold transition-colors"
              >
                Accept Offer
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 px-8 rounded-lg text-lg font-semibold transition-colors"
              >
                Decline Offer
              </button>
            </div>

            {/* Additional Information */}
            <div className="mt-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="font-semibold text-blue-900">Flexible Closing</h3>
                  </div>
                  <p className="text-sm text-blue-700">Choose when you want to close - we work around your schedule</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <h3 className="font-semibold text-green-900">No Repairs</h3>
                  </div>
                  <p className="text-sm text-green-700">We buy your home as-is, no repairs or improvements needed</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-purple-900">Guaranteed Sale</h3>
                  </div>
                  <p className="text-sm text-purple-700">Once you accept, your sale is guaranteed - no backing out</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}