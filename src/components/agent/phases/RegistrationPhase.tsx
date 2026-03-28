'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegistrationPhaseRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/signin');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Agent Registration Not Available
        </h1>
        <p className="text-gray-600 mb-4">
          Agents can only be created by administrators.
        </p>
        <p className="text-gray-600">
          Redirecting to sign in page...
        </p>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useAgentContext } from '../../../context/AgentContext';
import InputField from '../../reusable/InputField';
import PasswordField from '../../reusable/PasswordField';
import Button from '../../reusable/Button';
import { validatePassword, validatePasswordConfirmation } from '../../../utils/passwordValidation';

interface RegistrationPhaseProps {
  onNext: () => void;
  onBack: () => void;
}

const RegistrationPhase: React.FC<RegistrationPhaseProps> = ({ onNext, onBack }) => {
  const { agentData, updateAgentData } = useAgentContext();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!agentData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (agentData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!agentData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agentData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!agentData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(agentData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (!agentData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(agentData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    // Confirm password validation
    if (!agentData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (agentData.password && agentData.confirmPassword) {
      const confirmValidation = validatePasswordConfirmation(agentData.confirmPassword, agentData.password);
      if (!confirmValidation.isValid) {
        newErrors.confirmPassword = confirmValidation.errors[0];
      }
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
    
    try {
      // Simulate API call or validation
      await new Promise(resolve => setTimeout(resolve, 500));
      onNext();
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create Your Agent Account
        </h2>
        <p className="text-gray-600">
          Enter your details to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Full Name"
          type="text"
          value={agentData.name}
          onChange={(value) => updateAgentData({ name: value })}
          placeholder="Enter your full name"
          error={errors.name}
          required
        />

        <InputField
          label="Email Address"
          type="email"
          value={agentData.email}
          onChange={(value) => updateAgentData({ email: value })}
          placeholder="Enter your email address"
          error={errors.email}
          required
        />

        <InputField
          label="Phone Number"
          type="tel"
          value={agentData.phone}
          onChange={(value) => updateAgentData({ phone: value })}
          placeholder="Enter your phone number"
          error={errors.phone}
          required
        />

        <PasswordField
          label="Password"
          value={agentData.password || ''}
          onChange={(value) => updateAgentData({ password: value })}
          placeholder="Create a strong password"
          error={errors.password}
          required
          showStrengthMeter
        />

        <PasswordField
          label="Confirm Password"
          value={agentData.confirmPassword || ''}
          onChange={(value) => updateAgentData({ confirmPassword: value })}
          placeholder="Confirm your password"
          error={errors.confirmPassword}
          required
          isConfirmField
          confirmPassword={agentData.password}
        />

        {errors.submit && (
          <div className="text-red-600 text-sm text-center">
            {errors.submit}
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationPhase;