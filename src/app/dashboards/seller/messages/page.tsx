'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Home, Store, BarChart3, Settings } from 'lucide-react';
import { Navbar } from '@/components';
import { useAuth } from '@/context/AuthContext';
import SecureMessageBoard from '@/components/communication/SecureMessageBoard';
import { Card, Alert } from '@/components/reusable';

const SellerMessagesPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const canAccessSellerDashboard = !!user?.roles?.includes('seller');

  const sidebarButtonClass = (isActive: boolean) =>
    `w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
      isActive
        ? 'bg-black text-white shadow-lg shadow-black/10'
        : 'text-gray-600 hover:bg-white hover:text-gray-950'
    }`;

  const sidebarIconClass = (isActive: boolean) =>
    `h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`;

  if (!user || !canAccessSellerDashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to sellers.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6fb] flex flex-col">
      <Navbar />

      <div className="flex w-full flex-1 bg-[#f5f6fb] lg:pl-[280px]">
        <aside id="dashboard-sidebar" className="fixed left-0 top-20 bottom-0 z-30 hidden w-[280px] shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white px-5 py-4 lg:flex">
          <div className="flex-1">
            <nav className="space-y-2 pt-3">
              <button onClick={() => router.push('/dashboards/seller')} className={sidebarButtonClass(false)}>
                <LayoutDashboard className={sidebarIconClass(false)} />
                <span>Dashboard</span>
              </button>
              <button onClick={() => router.push('/dashboards/seller/listings')} className={sidebarButtonClass(false)}>
                <Home className={sidebarIconClass(false)} />
                <span>Listings</span>
              </button>
              <button onClick={() => router.push('/dashboards/seller/marketplace')} className={sidebarButtonClass(false)}>
                <Store className={sidebarIconClass(false)} />
                <span>Marketplace</span>
              </button>
              <button onClick={() => router.push('/dashboards/seller/analytics')} className={sidebarButtonClass(false)}>
                <BarChart3 className={sidebarIconClass(false)} />
                <span>Analytics</span>
              </button>
              <button onClick={() => router.push('/dashboards/seller/account')} className={sidebarButtonClass(false)}>
                <Settings className={sidebarIconClass(false)} />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          <div className="border-t border-gray-200 pt-5">
            <button
              onClick={() => router.push('/dashboards/seller/add-property')}
              className="mb-5 w-full rounded-xl bg-black px-4 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-gray-900"
            >
              List Property
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-sm">
                {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-950">{user?.name || 'Seller Name'}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">Verified Seller</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 grid grid-cols-2 gap-3 lg:hidden">
            <button onClick={() => router.push('/dashboards/seller')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Dashboard</button>
            <button onClick={() => router.push('/dashboards/seller/listings')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Listings</button>
            <button onClick={() => router.push('/dashboards/seller/marketplace')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Marketplace</button>
            <button onClick={() => router.push('/dashboards/seller/analytics')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Analytics</button>
            <button onClick={() => router.push('/dashboards/seller/account')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Settings</button>
          </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">
            View messages from agents about buyer interest in your properties
          </p>
        </div>

        {/* Business Rules Notice */}
        <Alert 
          type="info" 
          message="For security and transparency, all communication goes through our licensed agents. Agents will contact you when there is buyer interest in your properties."
          className="mb-6"
        />

        {/* Messaging Interface */}
        <div className="bg-white rounded-lg shadow-md h-[calc(100vh-280px)]">
          <SecureMessageBoard 
            className="h-full"
            restrictedMode={true}
          />
        </div>
        </main>
      </div>
    </div>
  );
};

export default SellerMessagesPage;
