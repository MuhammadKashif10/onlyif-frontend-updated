'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/utils/currency';
import Button from '@/components/reusable/Button';
import Loader from '@/components/reusable/Loader';
import GetCashOffer from '@/components/seller/GetCashOffer';

interface FormData {
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  name: string;
  email: string;
  phone: string;
}

interface PropertyEstimate {
  estimatedValue: number;
  lowRange: number;
  highRange: number;
  confidence: string;
  formattedRange: string;
  lastUpdated: string;
  propertyDetails?: {
    type?: string;
    landSize?: number;
    buildingArea?: number;
  };
}

const australianStates = [
  { code: 'NSW', name: 'New South Wales' },
  { code: 'VIC', name: 'Victoria' },
  { code: 'QLD', name: 'Queensland' },
  { code: 'WA', name: 'Western Australia' },
  { code: 'SA', name: 'South Australia' },
  { code: 'TAS', name: 'Tasmania' },
  { code: 'ACT', name: 'Australian Capital Territory' },
  { code: 'NT', name: 'Northern Territory' }
];

export default function GetOfferPage() {
  const [formData, setFormData] = useState<FormData>({
    address: '',
    suburb: '',
    state: '',
    postcode: '',
    name: '',
    email: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyEstimate, setPropertyEstimate] = useState<PropertyEstimate | null>(null);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [offerResult, setOfferResult] = useState<any>(null);
  const router = useRouter();

  const steps = [
    { id: 'get-offer', title: 'Get Offer', description: 'Enter property details' },
    { id: 'schedule-inspection', title: 'Schedule Inspection', description: 'Choose inspection time' },
    { id: 'accept-offer', title: 'Accept Offer', description: 'Review and accept' },
    { id: 'close', title: 'Close & Move', description: 'Complete the sale' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.address.trim()) {
      newErrors.address = 'Property address is required';
    }
    if (!formData.suburb.trim()) {
      newErrors.suburb = 'Suburb is required';
    }
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    if (!formData.postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    } else if (!/^\d{4}$/.test(formData.postcode)) {
      newErrors.postcode = 'Please enter a valid 4-digit postcode';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGetEstimate = async () => {
    // Validate address fields only
    const addressErrors: Record<string, string> = {};
    
    if (!formData.address.trim()) {
      addressErrors.address = 'Property address is required';
    }
    if (!formData.suburb.trim()) {
      addressErrors.suburb = 'Suburb is required';
    }
    if (!formData.state) {
      addressErrors.state = 'State is required';
    }
    if (!formData.postcode.trim()) {
      addressErrors.postcode = 'Postcode is required';
    } else if (!/^\d{4}$/.test(formData.postcode)) {
      addressErrors.postcode = 'Please enter a valid 4-digit postcode';
    }

    if (Object.keys(addressErrors).length > 0) {
      setErrors(addressErrors);
      return;
    }

    setIsLoadingEstimate(true);
    setEstimateError(null);
    setPropertyEstimate(null);

    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: formData.address,
          suburb: formData.suburb,
          state: formData.state,
          postcode: formData.postcode
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get property estimate');
      }

      setPropertyEstimate(data.data);
    } catch (error) {
      console.error('Estimate error:', error);
      setEstimateError(error instanceof Error ? error.message : 'Failed to get property estimate');
    } finally {
      setIsLoadingEstimate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/cash-offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: `${formData.address}, ${formData.suburb}, ${formData.state} ${formData.postcode}`,
          zipCode: formData.postcode,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          estimatedValue: propertyEstimate?.estimatedValue
        })
      });

      const data = await response.json();

      if (data.success) {
        setOfferResult(data.data);
      } else {
        throw new Error(data.message || 'Failed to submit offer request');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to submit offer request' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (offerResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Result */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Offer Submitted Successfully!</h1>
            <p className="text-gray-600 mb-6">Your cash offer request has been submitted. We'll review your property and get back to you within 24 hours.</p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Offer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <span className="font-medium text-gray-700">Offer ID:</span>
                  <p className="text-gray-900">{offerResult.offerId}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Estimated Value:</span>
                  <p className="text-gray-900">{formatCurrency(offerResult.estimatedValue)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Offer Amount:</span>
                  <p className="text-green-600 font-semibold">{formatCurrency(offerResult.offerAmount)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Expected Closing:</span>
                  <p className="text-gray-900">{offerResult.estimatedClosingDate}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              <h4 className="font-semibold text-gray-900">Next Steps:</h4>
              {offerResult.nextSteps?.map((step: string, index: number) => (
                <p key={index} className="text-gray-600">• {step}</p>
              ))}
            </div>
            
            <Button
              onClick={() => router.push('/dashboards/seller')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <GetCashOffer />
    </div>
  );
}