'use client';

import { useState } from 'react';
import { BuyerProvider } from '@/context/BuyerContext';
import BuyerWizard from '@/components/buyer/BuyerWizard';

export default function BuyerOnboardPage() {
  const [loading, setLoading] = useState(false);
  return (
    <BuyerProvider>
      <BuyerWizard />
    </BuyerProvider>
  );
}