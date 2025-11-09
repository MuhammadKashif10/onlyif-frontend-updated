'use client';

import React, { useState } from 'react';
import { useBuyerContext } from '../../../context/BuyerContext';
import { useAuth } from '../../../context/AuthContext'; // Add this import
import InputField from '../../reusable/InputField';
import PasswordField from '../../reusable/PasswordField';
import Button from '../../reusable/Button';
import { validatePassword, validatePasswordConfirmation } from '../../../utils/passwordValidation';

const RegistrationPhase: React.FC = () => {
  const { buyerData, updateBuyerData, nextPhase } = useBuyerContext();
  const { register } = useAuth(); // This line was causing the error
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!buyerData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (buyerData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!buyerData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!buyerData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(buyerData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (!buyerData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(buyerData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    // Confirm password validation
    if (!buyerData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (buyerData.password && buyerData.confirmPassword) {
      const confirmValidation = validatePasswordConfirmation(buyerData.confirmPassword, buyerData.password);
      if (!confirmValidation.isValid) {
        newErrors.confirmPassword = confirmValidation.errors[0];
      }
    }

    // Checkbox validations
    if (!buyerData.unlockFeeAcknowledgment) {
      newErrors.unlockFeeAcknowledgment = 'You must acknowledge the unlock fee terms';
    }

    if (!buyerData.noBypassing) {
      newErrors.noBypassing = 'You must agree not to bypass the platform';
    }

    if (!buyerData.responsibilityAcknowledgment) {
      newErrors.responsibilityAcknowledgment = 'You must acknowledge the responsibility terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Register user but don't store JWT yet (will be stored after OTP verification)
      await register({
        name: buyerData.name,
        email: buyerData.email,
        password: buyerData.password!,
        type: 'buyer',
        phone: buyerData.phone
      });

      // Move to OTP verification phase instead of directly to browse
      nextPhase(); // This will go to OTP verification phase
    } catch (error: any) {
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create Your Buyer Account
        </h2>
        <p className="text-gray-600">
          Enter your details to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Full Name"
          type="text"
          value={buyerData.name}
          onChange={(e) => updateBuyerData({ name: e.target.value })}
          placeholder="Enter your full name"
          error={errors.name}
          required
        />

        <InputField
          label="Email Address"
          type="email"
          value={buyerData.email}
          onChange={(e) => updateBuyerData({ email: e.target.value })}
          placeholder="Enter your email address"
          error={errors.email}
          required
        />

        <InputField
          label="Phone Number"
          type="tel"
          value={buyerData.phone}
          onChange={(e) => updateBuyerData({ phone: e.target.value })}
          placeholder="Enter your phone number"
          error={errors.phone}
          required
        />

        <PasswordField
          label="Password"
          value={buyerData.password || ''}
          onChange={(value) => updateBuyerData({ password: value })}
          placeholder="Create a strong password"
          error={errors.password}
          required
          showStrengthMeter
        />

        <PasswordField
          label="Confirm Password"
          value={buyerData.confirmPassword || ''}
          onChange={(value) => updateBuyerData({ confirmPassword: value })}
          placeholder="Confirm your password"
          error={errors.confirmPassword}
          required
          isConfirmField
          confirmPassword={buyerData.password}
        />

        {/* New checkboxes */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="unlockFeeAcknowledgment"
              checked={buyerData.unlockFeeAcknowledgment}
              onChange={(e) => updateBuyerData({ unlockFeeAcknowledgment: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="unlockFeeAcknowledgment" className="text-sm text-gray-700">
              I understand the $49 unlock fee is non-refundable and grants access to full listing details.
            </label>
          </div>
          {errors.unlockFeeAcknowledgment && (
            <p className="text-red-600 text-sm ml-7">{errors.unlockFeeAcknowledgment}</p>
          )}

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="noBypassing"
              checked={buyerData.noBypassing}
              onChange={(e) => updateBuyerData({ noBypassing: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="noBypassing" className="text-sm text-gray-700">
              I agree not to contact sellers directly or bypass the platform.
            </label>
          </div>
          {errors.noBypassing && (
            <p className="text-red-600 text-sm ml-7">{errors.noBypassing}</p>
          )}

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="responsibilityAcknowledgment"
              checked={buyerData.responsibilityAcknowledgment}
              onChange={(e) => updateBuyerData({ responsibilityAcknowledgment: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="responsibilityAcknowledgment" className="text-sm text-gray-700">
              I acknowledge Only If is not responsible for the sale outcome or owner decisions.
            </label>
          </div>
          {errors.responsibilityAcknowledgment && (
            <p className="text-red-600 text-sm ml-7">{errors.responsibilityAcknowledgment}</p>
          )}
        </div>

        {errors.submit && (
          <div className="text-red-600 text-sm text-center">
            {errors.submit}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Creating Account...' : 'Create Account & Send Verification'}
        </Button>
      </form>
    </div>
  );
};

export default RegistrationPhase;