'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BuyerProvider } from '@/context/BuyerContext';
import BuyerWizard from '@/components/buyer/BuyerWizard';

export default function BuyerCreateAccount() {
  const router = useRouter();

  // Option 1: Redirect to the original onboard flow
  useEffect(() => {
    router.replace('/buy/onboard');
  }, [router]);

  // Option 2: Or render the BuyerWizard directly here
  return (
    <BuyerProvider>
      <BuyerWizard />
    </BuyerProvider>
  );
}