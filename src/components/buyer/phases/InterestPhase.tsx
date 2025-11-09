'use client';

import React, { useState } from 'react';
import { useBuyerContext } from '../../../context/BuyerContext';
import { useRouter } from 'next/navigation';
import Button from '../../reusable/Button';
import InputField from '../../reusable/InputField';

const InterestPhase: React.FC = () => {
  const { buyerData, updateBuyerData } = useBuyerContext();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExpressInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically send the interest to your backend
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update buyer data to mark interest as expressed
      updateBuyerData({ interestExpressed: true });
      
      // Navigate directly to buyer dashboard
      router.push('/dashboards/buyer');
      
    } catch (error) {
      console.error('Error expressing interest:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Express Your Interest
        </h2>
        <p className="text-gray-600">
          Let the seller know you're interested in their property
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Your Selected Property
        </h3>
        <p className="text-gray-600">
          {buyerData.selectedProperty?.address || 'Property details will be shown here'}
        </p>
      </div>

      <form onSubmit={handleExpressInterest} className="space-y-6">
        <InputField
          label="Message to Seller (Optional)"
          type="textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell the seller why you're interested in this property..."
          rows={4}
        />

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• The seller will be notified of your interest</li>
            <li>• You'll be redirected to your buyer dashboard</li>
            <li>• You can track the status of your interest there</li>
            <li>• The seller may contact you directly</li>
          </ul>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Expressing Interest...' : 'Express Interest & Go to Dashboard'}
        </Button>
      </form>
    </div>
  );
};

export default InterestPhase;