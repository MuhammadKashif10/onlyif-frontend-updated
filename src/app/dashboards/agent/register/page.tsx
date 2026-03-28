'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentRegistrationRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to signin page immediately
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