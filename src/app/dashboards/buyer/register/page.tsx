'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BuyerProvider } from '@/context/BuyerContext';
import BuyerWizard from '@/components/buyer/BuyerWizard';

export default function BuyerRegistration() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/signin');
  }, [router]);

  return (
    <BuyerProvider>
      <BuyerWizard />
    </BuyerProvider>
  );
}
