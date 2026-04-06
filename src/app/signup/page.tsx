'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components';
import { InputField, Button, Alert } from '@/components/reusable';
import PasswordField from '@/components/reusable/PasswordField';
import { validatePassword, validatePasswordConfirmation } from '@/utils/passwordValidation';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { register, user, isLoading, error } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    router.push('/dashboard');
  }, [router, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) nextErrors.name = 'Full name is required';
    if (!formData.email.trim()) nextErrors.email = 'Email is required';
    if (!formData.phone.trim()) nextErrors.phone = 'Phone number is required';

    if (!formData.password) {
      nextErrors.password = 'Password is required';
    } else {
      const pw = validatePassword(formData.password);
      if (!pw.isValid) nextErrors.password = pw.errors[0];
    }

    const confirm = validatePasswordConfirmation(formData.password, formData.confirmPassword);
    if (!confirm.isValid) nextErrors.confirmPassword = confirm.error || 'Passwords do not match';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!validateForm()) return;

      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: null,
      });

      router.push('/dashboard');
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, submit: err?.message || 'Signup failed. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex-grow flex items-center justify-center pt-4 sm:pt-6 md:pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your details to get started.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {(errors.submit || error) && (
              <Alert
                type="error"
                message={errors.submit || error || 'An error occurred during signup'}
                className="mb-4"
              />
            )}

            <div className="space-y-4">
              <InputField
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                placeholder="Enter your full name"
                required
                disabled={isSubmitting}
              />

              <InputField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                placeholder="Enter your email address"
                required
                disabled={isSubmitting}
              />

              <InputField
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={errors.phone}
                placeholder="Enter your Australian phone or mobile (e.g. 04xx xxx xxx)"
                required
                disabled={isSubmitting}
              />

              <PasswordField
                label="Password"
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
                error={errors.password}
                placeholder="Create a strong password"
                showStrengthMeter
                required
              />

              <PasswordField
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={(value) => handleInputChange('confirmPassword', value)}
                error={errors.confirmPassword}
                placeholder="Confirm your password"
                isConfirmation
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting || isLoading}
              className="w-full"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
