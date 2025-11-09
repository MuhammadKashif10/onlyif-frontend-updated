'use client';

import React, { useState } from 'react';
import { useBuyerContext } from '../../../context/BuyerContext';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import InputField from '../../reusable/InputField';
import Button from '../../reusable/Button';

const OtpVerificationPhase: React.FC = () => {
  const { buyerData, updateBuyerData, setPhase } = useBuyerContext();
  const { sendOtp, verifyOtp, isLoading, error } = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSendOtp = async () => {
    console.log('Attempting to send OTP to:', buyerData.email, buyerData.phone);
    try {
      await sendOtp(buyerData.email, buyerData.phone);
      console.log('OTP sent successfully');
      setOtpSent(true);
      setErrors({});
    } catch (err) {
      console.error('OTP send error:', err);
      setErrors({ otp: 'Failed to send OTP. Please try again.' });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return;
    }

    try {
      await verifyOtp(buyerData.email, buyerData.phone, otp);
      
      // Mark OTP as verified and skip Terms modal
      updateBuyerData({ 
        otpVerified: true, 
        termsAccepted: true // Auto-accept terms after OTP verification
      });
      
      // Clear password data for security
      updateBuyerData({ password: '', confirmPassword: '' });
      
      // Move to Payment phase (Phase 3) within the wizard
      setPhase(3);
      
    } catch (err) {
      setErrors({ otp: 'Invalid or expired OTP. Please try again.' });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verify Your Account
        </h2>
        <p className="text-gray-600">
          {otpSent 
            ? `Enter the 6-digit code sent to ${buyerData.email || buyerData.phone}`
            : 'We\'ll send you a verification code'
          }
        </p>
      </div>

      {!otpSent ? (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">Verification will be sent to:</p>
            <p className="font-medium">{buyerData.email}</p>
            {buyerData.phone && <p className="font-medium">{buyerData.phone}</p>}
          </div>
          
          <Button
            onClick={handleSendOtp}
            variant="primary"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <InputField
            label="Verification Code"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            error={errors.otp}
            maxLength={6}
            className="text-center text-2xl tracking-widest"
            required
          />

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || otp.length !== 6}
              className="w-full"
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue to Payment'}
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              onClick={handleSendOtp}
              disabled={isLoading}
              className="w-full"
            >
              Resend Code
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default OtpVerificationPhase;