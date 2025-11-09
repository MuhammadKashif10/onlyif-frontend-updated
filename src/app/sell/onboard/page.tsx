'use client';
import { SellerProvider } from '@/context/SellerContext';
import SellerWizard from '@/components/seller/SellerWizard';
import { Navbar } from '@/components';

export default function SellerOnboardPage() {
  return (
    <SellerProvider>
      <div className="min-h-screen bg-white">
        <Navbar />
        <SellerWizard />
      </div>
    </SellerProvider>
  );
}