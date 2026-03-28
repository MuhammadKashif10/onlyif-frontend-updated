'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/reusable';

export default function CreateAccountPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('');

  const roles = [
    {
      id: 'buyer',
      title: 'Buyer',
      description: 'Looking to purchase property',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21l4-4 4 4" />
        </svg>
      ),
      route: '/dashboards/buyer/register'
    },
    {
      id: 'seller',
      title: 'Seller',
      description: 'Looking to sell property',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      route: '/dashboards/seller/register'
    }
    // Removed agent option
  ];

  const handleRoleSelection = () => {
    const selectedRoleData = roles.find(role => role.id === selectedRole);
    if (selectedRoleData) {
      router.push(selectedRoleData.route);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create Your Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Choose your account type to get started
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                  selectedRole === role.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value={role.id}
                    checked={selectedRole === role.id}
                    onChange={() => setSelectedRole(role.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3 flex items-center">
                    <div className="text-blue-600 mr-3">
                      {role.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {role.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {role.description}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button
              onClick={handleRoleSelection}
              variant="primary"
              size="lg"
              className="px-8"
              disabled={!selectedRole}
              aria-label="Continue with selected role"
            >
              Continue as {roles.find(role => role.id === selectedRole)?.title || 'Selected Role'}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="/signin" className="text-blue-600 hover:underline font-medium">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}