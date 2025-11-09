'use client';

import React, { useState } from 'react';
import { useSellerContext } from '../../../context/SellerContext';
import InputField from '../../reusable/InputField';
import PasswordField from '../../reusable/PasswordField';
import Button from '../../reusable/Button';
import { validatePassword, validatePasswordConfirmation } from '../../../utils/passwordValidation';
import { useAuth } from '../../../context/AuthContext';
import PrivacyPolicyModal from '../../reusable/PrivacyPolicyModal';

interface RegistrationPhaseProps {
  onNext: () => void;
  onBack: () => void;
}

const RegistrationPhase: React.FC<RegistrationPhaseProps> = ({ onNext, onBack }) => {
  const { data, updateData } = useSellerContext();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  // Remove this line: const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!data.name.trim()) { // Changed from sellerData.name
      newErrors.name = 'Name is required';
    } else if (data.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!data.email.trim()) { // Changed from sellerData.email
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!data.phone.trim()) { // Changed from sellerData.phone
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(data.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (!data.password) { // Changed from sellerData.password
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    // Confirm password validation
    if (!data.confirmPassword) { // Changed from sellerData.confirmPassword
      newErrors.confirmPassword = 'Please confirm your password';
    } else {
      const confirmValidation = validatePasswordConfirmation(data.password || '', data.confirmPassword);
      if (!confirmValidation.isValid) {
        newErrors.confirmPassword = confirmValidation.error;
      }
    }

    // Terms validation
    if (!data.termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    // Seller agreements validation
    if (!data.legalAuthorization) {
      newErrors.legalAuthorization = 'You must confirm legal authorization to list the property';
    }
    
    if (!data.successFeeAgreement) {
      newErrors.successFeeAgreement = 'You must agree to the success fee terms';
    }
    
    if (!data.noBypassing) {
      newErrors.noBypassing = 'You must agree not to bypass the platform';
    }
    
    if (!data.upgradesAcknowledgment) {
      newErrors.upgradesAcknowledgment = 'You must acknowledge the optional listing upgrades';
    }
    
    if (!data.agentPartnerHelp) {
      newErrors.agentPartnerHelp = 'You must acknowledge the agent partner help option';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add import and usage of AuthContext
  // import { useAuth } from '../../../context/AuthContext';
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Register user but do not persist JWT yet (will persist after OTP verification)
      await register({
        name: data.name,
        email: data.email,
        password: data.password!,
        type: 'seller',
        phone: data.phone
      });

      // Proceed to OTP verification phase
      onNext();
    } catch (error: any) {
      console.error('Registration failed:', error);
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
        <p className="text-gray-600">Enter your details to get started with selling your property</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Full Name"
          type="text"
          value={data.name} // Changed from sellerData.name
          onChange={(e) => updateData({ name: e.target.value })} // Changed from updateSellerData
          error={errors.name}
          placeholder="Enter your full name"
          required
        />

        <InputField
          label="Email Address"
          type="email"
          value={data.email} // Changed from sellerData.email
          onChange={(e) => updateData({ email: e.target.value })} // Changed from updateSellerData
          error={errors.email}
          placeholder="Enter your email address"
          required
        />

        <InputField
          label="Phone Number"
          type="tel"
          value={data.phone} // Changed from sellerData.phone
          onChange={(e) => updateData({ phone: e.target.value })} // Changed from updateSellerData
          error={errors.phone}
          placeholder="Enter your phone number"
          required
        />

        <PasswordField
          label="Password"
          value={data.password || ''} // Changed from sellerData.password
          onChange={(value) => updateData({ password: value })} // Changed from updateSellerData
          error={errors.password}
          placeholder="Create a strong password"
          showStrengthMeter
          required
        />

        <PasswordField
          label="Confirm Password"
          value={data.confirmPassword || ''}
          onChange={(value) => updateData({ confirmPassword: value })}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
          isConfirmation
          required
        />

        {/* All Agreement Checkboxes */}
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={data.termsAccepted}
                onChange={(e) => updateData({ termsAccepted: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-700">
                I agree to the{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-500 underline">
                  Terms and Conditions
                </a>
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="legalAuthorization"
                type="checkbox"
                checked={data.legalAuthorization}
                onChange={(e) => updateData({ legalAuthorization: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="legalAuthorization" className="text-gray-700">
                I confirm I am legally authorised to list the property on Only If.
              </label>
              {errors.legalAuthorization && (
                <p className="mt-1 text-sm text-red-600">{errors.legalAuthorization}</p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="successFeeAgreement"
                type="checkbox"
                checked={data.successFeeAgreement}
                onChange={(e) => updateData({ successFeeAgreement: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="successFeeAgreement" className="text-gray-700">
                I agree to a 1.1% (inc. GST) success fee if a buyer from Only If purchases my property.
              </label>
              {errors.successFeeAgreement && (
                <p className="mt-1 text-sm text-red-600">{errors.successFeeAgreement}</p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="noBypassing"
                type="checkbox"
                checked={data.noBypassing}
                onChange={(e) => updateData({ noBypassing: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="noBypassing" className="text-gray-700">
                I will not attempt to bypass the platform or agent once a buyer is introduced.
              </label>
              {errors.noBypassing && (
                <p className="mt-1 text-sm text-red-600">{errors.noBypassing}</p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="upgradesAcknowledgment"
                type="checkbox"
                checked={data.upgradesAcknowledgment}
                onChange={(e) => updateData({ upgradesAcknowledgment: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="upgradesAcknowledgment" className="text-gray-700">
                I understand optional listing upgrades (photos, floorplan, video) are available at extra cost.
              </label>
              {errors.upgradesAcknowledgment && (
                <p className="mt-1 text-sm text-red-600">{errors.upgradesAcknowledgment}</p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agentPartnerHelp"
                type="checkbox"
                checked={data.agentPartnerHelp}
                onChange={(e) => updateData({ agentPartnerHelp: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agentPartnerHelp" className="text-gray-700">
                I may request help from an Only If Agent Partner if needed.
              </label>
              {errors.agentPartnerHelp && (
                <p className="mt-1 text-sm text-red-600">{errors.agentPartnerHelp}</p>
              )}
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="min-w-[120px]">
            {isLoading ? 'Creating...' : 'Continue'}
          </Button>
        </div>
      </form>
      
      {/* Remove this entire block:
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      */}
    </div>
  );
};

export default RegistrationPhase;