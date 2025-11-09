'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SellerProvider } from '@/context/SellerContext';
import SellerWizard from '@/components/seller/SellerWizard';

export default function SellerRegistration() {
  const router = useRouter();

  // Option 1: Redirect to the original onboard flow
  useEffect(() => {
    router.replace('/sell/onboard');
  }, [router]);

  // Option 2: Or render the SellerWizard directly here
  return (
    <SellerProvider>
      <SellerWizard />
    </SellerProvider>
  );
}