'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components';
import { InputField, Button, Alert } from '@/components/reusable';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const { login, user, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Redirect if already authenticated based on userType from database
    if (user) {
      switch (user.role) {
        case 'buyer':
          router.push('/dashboards/buyer');
          break;
        case 'seller':
          router.push('/dashboards/seller');
          break;
        case 'agent':
          router.push('/dashboards/agent');
          break;
        case 'admin':
          router.push('/admin');
          break;
        default:
          router.push('/');
      }
    }
  }, [user, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (loginError) setLoginError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    try {
      // Use unified login - backend will determine user role and return appropriate data
      await login(formData.email, formData.password);
      // Redirect will happen automatically via useEffect when user state updates
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    return formData.email.trim() !== '' && formData.password.trim() !== '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center pt-4 sm:pt-6 md:pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Welcome back! Enter your credentials to access your dashboard.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {(loginError || error) && (
              <Alert 
                type="error" 
                message={loginError || error || 'An error occurred during sign in'} 
                className="mb-4" 
              />
            )}

            <div className="space-y-4">
              <InputField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={isSubmitting}
                autoComplete="email"
              />

              <InputField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting || isLoading || !validateForm()}
              className="w-full"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center">
              <p className="text-center text-sm text-gray-600 mb-4">
                Don't have an account? Create one here:
              </p>
              <div className="flex flex-row justify-center space-x-4 mt-2">
                <Link 
                  href="/sell/onboard" 
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors duration-200 min-w-[80px] text-center"
                >
                  Seller
                </Link>
                <Link 
                  href="/buy/onboard" 
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors duration-200 min-w-[80px] text-center"
                >
                  Buyer
                </Link>
                {/* Agent button removed - agents can only be created by administrators */}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}