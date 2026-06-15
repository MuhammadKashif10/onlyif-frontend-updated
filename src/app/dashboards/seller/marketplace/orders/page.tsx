'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  LayoutDashboard,
  Home,
  Store,
  BarChart3,
  Settings,
  MessageSquare,
} from 'lucide-react';
import { Navbar } from '@/components';
import { useAuth } from '@/hooks/useAuth';

interface ServiceOrder {
  id: string;
  orderNumber: string;
  serviceName: string;
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  fulfillmentStatus: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

const backendBase = () =>
  (process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
    '').replace(/\/$/, '');

const paymentBadge: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-200 text-gray-700',
};

const fulfillmentBadge: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const money = (amount: number, currency = 'AUD') =>
  `${currency === 'AUD' ? 'A$' : ''}${Number(amount || 0).toLocaleString('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function MarketplaceOrdersInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const justPaid = searchParams.get('service_payment') === 'success';

  const sidebarButtonClass = (isActive: boolean) =>
    `w-full flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ease-out hover:shadow-sm ${
      isActive
        ? 'bg-black text-white shadow-lg shadow-black/10'
        : 'text-gray-600 hover:bg-white hover:text-gray-950'
    }`;

  const sidebarIconClass = (isActive: boolean) =>
    `h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`;

  const loadOrders = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const base = backendBase();
    if (!token || !base) {
      setError('You need to be signed in to view your orders.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${base}/api/service-orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data?.data || []);
    } catch {
      setError('Unable to load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const base = backendBase();
      const sessionId = searchParams.get('session_id');
      // Fallback: when returning from Stripe, confirm by session in case the
      // webhook hasn't been delivered (e.g. local dev without `stripe listen`).
      if (justPaid && sessionId && token && base) {
        try {
          await fetch(`${base}/api/service-orders/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ sessionId }),
          });
        } catch {
          /* ignore — the webhook may have already processed it */
        }
      }
      await loadOrders();
    };
    run();
  }, [loadOrders, justPaid, searchParams]);

  const downloadReceipt = async (order: ServiceOrder) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const base = backendBase();
    if (!token || !base) return;
    try {
      const res = await fetch(`${base}/api/service-orders/${order.id}/receipt.pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        alert('Receipt is not available yet.');
        return;
      }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = `Receipt_${order.orderNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(a.href);
    } catch {
      alert('Unable to download receipt.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6fb] flex flex-col">
      <Navbar />

      <div className="flex w-full flex-1 bg-[#f5f6fb] lg:pl-[280px]">
        {/* Sidebar (matches other seller dashboard pages) */}
        <aside
          id="dashboard-sidebar"
          className="fixed left-0 top-20 bottom-0 z-30 hidden w-[280px] shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white px-5 py-4 lg:flex"
        >
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
              <button onClick={() => router.push('/dashboards/seller/messages')} className={sidebarButtonClass(false)}>
                <MessageSquare className={sidebarIconClass(false)} />
                <span>Messages</span>
              </button>
              <button onClick={() => router.push('/dashboards/seller/marketplace')} className={sidebarButtonClass(true)}>
                <Store className={sidebarIconClass(true)} />
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
              className="mb-5 w-full cursor-pointer rounded-xl bg-black px-4 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all duration-200 ease-out hover:bg-gray-900 hover:shadow-xl"
            >
              List Property
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-sm">
                {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-950">{user?.name || 'Seller Name'}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Premium Account
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {/* Mobile nav (matches other seller dashboard pages) */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:hidden">
            <button onClick={() => router.push('/dashboards/seller')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">
              Dashboard
            </button>
            <button onClick={() => router.push('/dashboards/seller/listings')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">
              Listings
            </button>
            <button onClick={() => router.push('/dashboards/seller/messages')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">
              Messages
            </button>
            <button onClick={() => router.push('/dashboards/seller/marketplace')} className="rounded-xl bg-black px-4 py-3 text-sm font-bold text-white shadow-sm">
              Marketplace
            </button>
            <button onClick={() => router.push('/dashboards/seller/analytics')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">
              Analytics
            </button>
            <button onClick={() => router.push('/dashboards/seller/account')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">
              Settings
            </button>
          </div>

          <Link
            href="/dashboards/seller/marketplace"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950">Marketplace Orders</h1>
          <p className="mt-2 text-sm text-gray-600">
            Your media studio service bookings and their fulfillment status.
          </p>

          {justPaid && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-800">Payment successful</p>
                <p className="text-sm text-emerald-700">
                  Your booking is confirmed. A confirmation email is on its way and our team will be in touch shortly.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Order', 'Service', 'Amount', 'Payment', 'Fulfillment', 'Date', 'Receipt'].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center">
                        <div className="mx-auto h-7 w-7 animate-spin rounded-full border-b-2 border-gray-900" />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-sm text-red-600">
                        {error}
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500">
                        No orders yet.{' '}
                        <Link href="/dashboards/seller/marketplace" className="font-semibold text-emerald-600 hover:underline">
                          Browse services
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">{o.orderNumber}</td>
                        <td className="px-5 py-4 text-sm text-gray-700">{o.serviceName}</td>
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">{money(o.amount, o.currency)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paymentBadge[o.paymentStatus] || 'bg-gray-100 text-gray-700'}`}>
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${fulfillmentBadge[o.fulfillmentStatus] || 'bg-gray-100 text-gray-700'}`}>
                            {o.fulfillmentStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {new Date(o.createdAt).toLocaleDateString('en-AU')}
                        </td>
                        <td className="px-5 py-4">
                          {o.paymentStatus === 'paid' ? (
                            <button
                              onClick={() => downloadReceipt(o)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-black"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Receipt
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function MarketplaceOrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f6fb]" />}>
      <MarketplaceOrdersInner />
    </Suspense>
  );
}
