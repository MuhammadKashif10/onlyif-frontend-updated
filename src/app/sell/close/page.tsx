'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components';
import Footer from '@/components/main/Footer';
import ProgressStepper from '@/components/reusable/ProgressStepper';
import Checklist from '@/components/reusable/Checklist';

export default function ClosePage() {
  const [isCompleted, setIsCompleted] = useState(false);
  const router = useRouter();

  const steps = [
    { id: 'get-offer', title: 'Get Offer', description: 'Enter property details' },
    { id: 'schedule-inspection', title: 'Schedule Inspection', description: 'Choose inspection time' },
    { id: 'accept-offer', title: 'Accept Offer', description: 'Review and accept' },
    { id: 'close', title: 'Close & Move', description: 'Complete the sale' }
  ];

  const closingChecklist = [
    {
      id: 'documents',
      text: 'Review and sign closing documents',
      description: 'Purchase agreement, title transfer, and other legal documents',
      required: true
    },
    {
      id: 'payment',
      text: 'Choose payment method',
      description: 'Direct deposit, wire transfer, or check',
      required: true
    },
    {
      id: 'utilities',
      text: 'Transfer utility accounts',
      description: 'Cancel or transfer water, electricity, gas, and internet',
      required: false
    },
    {
      id: 'mail',
      text: 'Set up mail forwarding',
      description: 'Forward mail to your new address',
      required: false
    },
    {
      id: 'moving',
      text: 'Schedule moving assistance',
      description: 'Professional movers or DIY moving options',
      required: false
    },
    {
      id: 'insurance',
      text: 'Update insurance policies',
      description: 'Cancel homeowners insurance and update auto policies',
      required: true
    },
    {
      id: 'keys',
      text: 'Prepare keys and access',
      description: 'Gather all keys, garage remotes, and access codes',
      required: true
    },
    {
      id: 'personal',
      text: 'Remove personal belongings',
      description: 'Ensure all personal items are removed from the property',
      required: true
    }
  ];

  const handleChecklistToggle = (itemId: string, completed: boolean) => {
    // In a real app, this would update the database
    console.log(`Item ${itemId} ${completed ? 'completed' : 'uncompleted'}`);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setTimeout(() => {
      router.push('/');
    }, 3000);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <ProgressStepper steps={steps} currentStep={3} className="mb-8" />
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Closing Complete!</h2>
                <p className="text-gray-600 mb-6">
                  Congratulations! Your home sale has been completed successfully. You'll receive your payment within 1-2 business days.
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-blue-700">
                    <span className="font-medium">Payment:</span> A$445,000 will be deposited to your account
                  </p>
                </div>
                
                <div className="animate-pulse">
                  <p className="text-sm text-gray-500">Redirecting to homepage...</p>
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
          <ProgressStepper steps={steps} currentStep={3} className="mb-8" />
          
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Close & Move</h1>
              <p className="text-gray-600">
                Complete these final steps to close your sale and prepare for your move.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Closing Checklist */}
              <Checklist
                items={closingChecklist}
                onItemToggle={handleChecklistToggle}
                title="Closing Checklist"
              />

              {/* Closing Information */}
              <div className="space-y-6">
                {/* Closing Details */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Closing Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Closing Date:</span>
                      <span className="font-medium">December 15, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Closing Location:</span>
                      <span className="font-medium">Virtual (Online)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Amount:</span>
                      <span className="font-medium text-green-600">A$445,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">Direct Deposit</span>
                    </div>
                  </div>
                </div>

                {/* Moving Assistance */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Moving Assistance</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <div>
                        <h4 className="font-medium text-gray-900">Professional Movers</h4>
                        <p className="text-sm text-gray-600">Get quotes from our trusted moving partners</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <div>
                        <h4 className="font-medium text-gray-900">Moving Supplies</h4>
                        <p className="text-sm text-gray-600">Order boxes, tape, and other moving supplies</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-purple-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <h4 className="font-medium text-gray-900">Storage Solutions</h4>
                        <p className="text-sm text-gray-600">Short-term storage options available</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Need Help?</h3>
                  <div className="space-y-3 text-blue-700">
                    <p><span className="font-medium">Closing Coordinator:</span> Sarah Johnson</p>
                    <p><span className="font-medium">Phone:</span> (555) 123-4567</p>
                    <p><span className="font-medium">Email:</span> sarah@onlyif.com</p>
                    <p className="text-sm mt-4">Available Monday-Friday, 9 AM - 6 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleComplete}
                className="bg-green-600 hover:bg-green-700 text-white py-4 px-8 rounded-lg text-lg font-semibold transition-colors"
              >
                Complete Closing
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}