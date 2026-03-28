'use client';

import React, { useState } from 'react';
import { useBuyerContext } from '@/context/BuyerContext';
import { Button } from '@/components/reusable/Button';
import InputField from '@/components/reusable/InputField';
import { formatCurrency, dollarsToCents } from '@/utils/currency';

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export default function PaymentPhase() {
  // Fix: Only destructure properties that exist in BuyerContext
  const { buyerData, updateBuyerData, nextPhase, prevPhase, refreshUnlockedProperties } = useBuyerContext();
  
  // Add local state management for errors and loading
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false); // Changed from 'loading' to 'isProcessing'
  
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = (): boolean => { // Changed from 'validatePaymentForm' to 'validateForm'
    const newErrors: Record<string, string> = {};

    if (!paymentData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    if (!paymentData.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Card number is required';
    } else if (paymentData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!paymentData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }

    if (!paymentData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (paymentData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    if (!paymentData.billingAddress.street.trim()) {
      newErrors.billingStreet = 'Billing address is required';
    }

    if (!paymentData.billingAddress.city.trim()) {
      newErrors.billingCity = 'City is required';
    }

    if (!paymentData.billingAddress.state.trim()) {
      newErrors.billingState = 'State is required';
    }

    if (!paymentData.billingAddress.zipCode.trim()) {
      newErrors.billingZipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
  
    setIsProcessing(true);
    setErrors({ payment: '' });
  
    try {
      // Call the new property unlock API
      const response = await fetch('/api/buyer/unlock-property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth implementation
        },
        body: JSON.stringify({
          propertyId: buyerData.selectedProperty?.id,
          paymentData: {
            cardholderName: paymentData.cardholderName,
            cardNumber: paymentData.cardNumber,
            expirationDate: paymentData.expiryDate, // Changed from expirationDate to expiryDate
            cvv: paymentData.cvv,
            billingAddress: {
              street: paymentData.billingAddress.street,
              city: paymentData.billingAddress.city,
              state: paymentData.billingAddress.state,
              zipCode: paymentData.billingAddress.zipCode
            }
          }
        })
      });
  
      const result = await response.json();
  
      if (result.success) {
        updateBuyerData({
          paymentCompleted: true,
          paymentId: result.data.transactionId
        });
        await refreshUnlockedProperties();
        nextPhase();
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrors({ 
        payment: error instanceof Error ? error.message : 'Payment processing failed. Please try again.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const updatePaymentData = (field: string, value: string) => {
    if (field.startsWith('billingAddress.')) {
      const addressField = field.split('.')[1];
      setPaymentData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [addressField]: value
        }
      }));
    } else {
      setPaymentData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock Property Details</h2>
        <p className="text-gray-600">Pay {formatCurrency(49)} to access full property information and contact details</p>
      </div>

      {/* Selected Property Summary */}
      {buyerData.selectedProperty && (
        <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Property Selected:</h3>
          <p className="text-gray-700">{buyerData.selectedProperty.title}</p>
          <p className="text-gray-600 text-sm">{buyerData.selectedProperty.address}</p>
          <p className="text-lg font-semibold text-green-600 mt-2">
            {formatCurrency(buyerData.selectedProperty.price)}
          </p>
        </div>
      )}

      {/* Payment Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(49)}</div>
        </div>

        {errors.payment && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {errors.payment}
          </div>
        )}

        <div className="space-y-4">
          <InputField
            label="Cardholder Name"
            type="text"
            value={paymentData.cardholderName}
            onChange={(e) => updatePaymentData('cardholderName', e.target.value)}
            error={errors.cardholderName}
            placeholder="Enter cardholder name"
            required
          />

          <InputField
            label="Card Number"
            type="text"
            value={paymentData.cardNumber}
            onChange={(e) => updatePaymentData('cardNumber', formatCardNumber(e.target.value))}
            error={errors.cardNumber}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Expiry Date"
              type="text"
              value={paymentData.expiryDate}
              onChange={(e) => updatePaymentData('expiryDate', formatExpiryDate(e.target.value))}
              error={errors.expiryDate}
              placeholder="MM/YY"
              maxLength={5}
              required
            />

            <InputField
              label="CVV"
              type="text"
              value={paymentData.cvv}
              onChange={(e) => updatePaymentData('cvv', e.target.value.replace(/\D/g, ''))}
              error={errors.cvv}
              placeholder="123"
              maxLength={4}
              required
            />
          </div>

          <div className="border-t pt-4 mt-6">
            <h4 className="font-medium text-gray-900 mb-4">Billing Address</h4>
            
            <div className="space-y-4">
              <InputField
                label="Street Address"
                type="text"
                value={paymentData.billingAddress.street}
                onChange={(e) => updatePaymentData('billingAddress.street', e.target.value)}
                error={errors.billingStreet}
                placeholder="Enter street address"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="City"
                  type="text"
                  value={paymentData.billingAddress.city}
                  onChange={(e) => updatePaymentData('billingAddress.city', e.target.value)}
                  error={errors.billingCity}
                  placeholder="Enter city"
                  required
                />

                <InputField
                  label="State"
                  type="text"
                  value={paymentData.billingAddress.state}
                  onChange={(e) => updatePaymentData('billingAddress.state', e.target.value)}
                  error={errors.billingState}
                  placeholder="Enter state"
                  required
                />
              </div>

              <InputField
                label="ZIP Code"
                type="text"
                value={paymentData.billingAddress.zipCode}
                onChange={(e) => updatePaymentData('billingAddress.zipCode', e.target.value.replace(/\D/g, ''))}
                error={errors.billingZipCode}
                placeholder="Enter ZIP code"
                maxLength={10}
                required
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mt-8">
          <Button
            onClick={prevPhase}
            variant="outline"
            size="full"
            disabled={isProcessing}
          >
            Back to Browse
          </Button>
          
          <Button
            onClick={handlePayment}
            loading={isProcessing}
            size="full"
          >
            Pay {formatCurrency(49)}
          </Button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>🔒 Your payment information is secure and encrypted</p>
      </div>
    </div>
  );
}