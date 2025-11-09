'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components';
import Footer from '@/components/main/Footer';
import ProgressStepper from '@/components/reusable/ProgressStepper';
import DatePicker from '@/components/reusable/DatePicker';
import TimeSlotSelector from '@/components/reusable/TimeSlotSelector';

export default function ScheduleInspectionPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const router = useRouter();

  const steps = [
    { id: 'get-offer', title: 'Get Offer', description: 'Enter property details' },
    { id: 'schedule-inspection', title: 'Schedule Inspection', description: 'Choose inspection time' },
    { id: 'accept-offer', title: 'Accept Offer', description: 'Review and accept' },
    { id: 'close', title: 'Close & Move', description: 'Complete the sale' }
  ];

  const handleConfirm = () => {
    if (selectedDate && selectedTimeSlot) {
      setIsConfirmed(true);
      // In a real app, this would save the appointment to the database
      setTimeout(() => {
        router.push('/sell/accept-offer');
      }, 2000);
    }
  };

  if (isConfirmed) {
    return (
      <div className="min-h-screen">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <ProgressStepper steps={steps} currentStep={1} className="mb-8" />
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Inspection Scheduled!</h2>
                <p className="text-gray-600 mb-6">
                  Your property inspection has been scheduled successfully. We'll send you a confirmation email with all the details.
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-blue-700">
                    <span className="font-medium">Next:</span> Review your final offer after the inspection
                  </p>
                </div>
                
                <div className="animate-pulse">
                  <p className="text-sm text-gray-500">Redirecting to next step...</p>
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
          <ProgressStepper steps={steps} currentStep={1} className="mb-8" />
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Schedule Your Inspection</h1>
                <p className="text-gray-600">
                  Choose a convenient date and time for your property inspection. This helps us provide you with the most accurate offer.
                </p>
              </div>

              <div className="space-y-8">
                {/* Date Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
                  <DatePicker
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    placeholder="Choose inspection date"
                  />
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <TimeSlotSelector
                      selectedSlot={selectedTimeSlot}
                      onSlotSelect={setSelectedTimeSlot}
                      date={selectedDate}
                    />
                  </div>
                )}

                {/* Confirmation Summary */}
                {selectedDate && selectedTimeSlot && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Appointment Summary</h4>
                    <div className="text-blue-700">
                      <p><span className="font-medium">Date:</span> {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                      <p><span className="font-medium">Time:</span> {selectedTimeSlot}</p>
                      <p className="text-sm mt-2">Our inspector will contact you 30 minutes before arrival</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleConfirm}
                    disabled={!selectedDate || !selectedTimeSlot}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Appointment
                  </button>
                  <button
                    onClick={() => router.push('/sell/get-offer')}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                </div>

                {/* Additional Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">What to Expect</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Inspection typically takes 30-45 minutes</li>
                    <li>• No need to prepare or clean your home</li>
                    <li>• Inspector will take photos and notes</li>
                    <li>• You'll receive the final offer within 24 hours</li>
                  </ul>
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