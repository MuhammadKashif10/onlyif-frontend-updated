'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components';
import BuyerSidebar from '@/components/buyer/BuyerSidebar';
import SecureMessageBoard from '@/components/communication/SecureMessageBoard';
import {
  Menu,
  X,
  MessageSquare,
  LayoutDashboard,
  Heart,
  TrendingUp,
  Bell,
  Settings,
  ArrowRight,
} from 'lucide-react';

const MOBILE_NAV: { href: string; label: string; icon: typeof MessageSquare; active?: boolean }[] = [
  { href: '/dashboards/buyer?tab=overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboards/buyer/saved', label: 'Watchlist', icon: Heart },
  { href: '/dashboards/buyer/tracking', label: 'Property Tracking', icon: TrendingUp },
  { href: '/dashboards/buyer?tab=notifications', label: 'Updates', icon: Bell },
  { href: '/dashboards/buyer/messages', label: 'Messages', icon: MessageSquare, active: true },
  { href: '/dashboards/buyer/account', label: 'Settings', icon: Settings },
];

export default function BuyerMessagesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const canAccessBuyerDashboard = !!user?.roles?.includes('buyer');

  // Auth gate — match the main buyer dashboard's behavior
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/signin');
      return;
    }
    if (!user.roles?.includes('buyer')) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f6fb]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
        </div>
      </div>
    );
  }

  if (!user || !canAccessBuyerDashboard) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6fb]">
      {/* Global Header (same as rest of buyer dashboard) */}
      <Navbar />

      {/* Mobile sticky bar */}
      <div className="sticky top-20 z-40 border-b border-gray-200/70 bg-[#f5f6fb]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold text-gray-950">Messages</p>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm cursor-pointer"
            aria-label="Open buyer dashboard menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white overflow-y-auto pb-20">
          <div className="pt-24 px-6 space-y-6">
            <nav className="flex flex-col space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 mb-2">Dashboard Menu</p>
              {MOBILE_NAV.map(({ href, label, icon: Icon, active }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-between py-4 px-3 rounded-xl transition-all cursor-pointer ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 shadow-sm'
                      : 'text-gray-900 font-bold border-b border-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                    {label}
                  </span>
                  {active ? <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> : <ArrowRight className="w-4 h-4 text-gray-300" />}
                </Link>
              ))}
            </nav>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-all cursor-pointer"
            >
              Close Menu
            </button>
          </div>
        </div>
      )}

      {/* Body: Sidebar + Main */}
      <div className="flex w-full flex-1 bg-[#f5f6fb] lg:pl-[280px]">
        <BuyerSidebar activeKey="messages" user={user} />

        <div className="flex min-w-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <main className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Page header */}
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">Buyer Inbox</p>
              <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">Messages</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                Communicate securely with agents and support about your property interests.
              </p>
            </div>

            {/* Message Board card */}
            <div className="rounded-[28px] border border-gray-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.05)] overflow-hidden">
              <div className="h-[calc(100vh-260px)] min-h-[520px]">
                <SecureMessageBoard className="h-full" restrictedMode={true} />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Global green footer is rendered once by AppReadyShell; it auto-offsets past #buyer-sidebar. */}
    </div>
  );
}
