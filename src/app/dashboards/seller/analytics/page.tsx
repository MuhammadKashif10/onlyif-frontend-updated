'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Home, Store, BarChart3, Settings } from 'lucide-react';
import { Navbar } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { sellerApi, AnalyticsData } from '@/api/seller';

export default function SellerAnalytics() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('6months');
  const sellerId = user?.id || (user as any)?._id;
  const hasSellerAccess = !!user?.roles?.includes('seller');
  const hasAnalyticsData = !!analyticsData && (
    analyticsData.totalViews > 0 ||
    analyticsData.totalInquiries > 0 ||
    analyticsData.totalOffers > 0 ||
    analyticsData.averageViewsPerListing > 0 ||
    analyticsData.conversionRate > 0 ||
    !!analyticsData.topPerformingListing ||
    analyticsData.chartData.some((item) => item.views > 0 || item.inquiries > 0 || item.offers > 0)
  );

  const sidebarButtonClass = (isActive: boolean) =>
    `w-full flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ease-out hover:shadow-sm ${
      isActive
        ? 'bg-black text-white shadow-lg shadow-black/10'
        : 'text-gray-600 hover:bg-white hover:text-gray-950'
    }`;

  const sidebarIconClass = (isActive: boolean) =>
    `h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`;

  useEffect(() => {
    if (authLoading) return;

    if (!user || !hasSellerAccess) {
      setLoading(false);
      setAnalyticsData(null);
      return;
    }

    if (sellerId) {
      fetchAnalyticsData(sellerId);
    }
  }, [authLoading, hasSellerAccess, sellerId, timeRange, user]);

  const fetchAnalyticsData = async (id = sellerId) => {
    if (!id || !hasSellerAccess) {
      setAnalyticsData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await sellerApi.getSellerAnalytics(id, timeRange);
      setAnalyticsData(data);
    } catch (err) {
      setError('Failed to load analytics data');
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading && !user) {
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
                <button className={sidebarButtonClass(true)}>
                  <BarChart3 className={sidebarIconClass(true)} />
                  <span>Analytics</span>
                </button>
                <button onClick={() => router.push('/dashboards/seller/account')} className={sidebarButtonClass(false)}>
                  <Settings className={sidebarIconClass(false)} />
                  <span>Settings</span>
                </button>
              </nav>
            </div>
          </aside>
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <p className="mt-2 text-gray-600">Loading analytics...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user || !hasSellerAccess) {
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
                <button className={sidebarButtonClass(true)}>
                  <BarChart3 className={sidebarIconClass(true)} />
                  <span>Analytics</span>
                </button>
                <button onClick={() => router.push('/dashboards/seller/account')} className={sidebarButtonClass(false)}>
                  <Settings className={sidebarIconClass(false)} />
                  <span>Settings</span>
                </button>
              </nav>
            </div>
          </aside>
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="text-center py-8">
              <p className="text-gray-500">Please log in with a seller account to view analytics.</p>
            </div>
          </main>
        </div>
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
              <button className={sidebarButtonClass(true)}>
                <BarChart3 className={sidebarIconClass(true)} />
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
            <button className="rounded-xl bg-black px-4 py-3 text-sm font-bold text-white shadow-sm">Analytics</button>
            <button onClick={() => router.push('/dashboards/seller/account')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Settings</button>
          </div>
          {/* Header */}
          <div className="mb-8">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">Interest Insights</p>
            <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">Analytics Dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              {analyticsData?.topPerformingListing?.title
                ? `Current focus: ${analyticsData.topPerformingListing.title}`
                : 'Track buyer interest and activity for your seller listings.'}
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { value: '1month', label: '1 Month' },
                { value: '3months', label: '3 Months' },
                { value: '6months', label: '6 Months' },
                { value: '1year', label: '1 Year' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                    timeRange === range.value
                      ? 'bg-black text-white shadow-lg shadow-black/10'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <p className="mt-2 text-gray-600">Loading analytics...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => fetchAnalyticsData()}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Analytics Content */}
          {!loading && !error && (
            <div className="rounded-[24px] border border-gray-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-black tracking-tight text-gray-950">Interest Over Time</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">Views, inquiries, and offers for the selected period.</p>
              </div>

              {hasAnalyticsData && analyticsData?.chartData?.length ? (
                <>
                  <div className="flex h-80 items-end justify-between gap-3 overflow-x-auto pb-2">
                    {analyticsData.chartData.map((data, index) => (
                      <div key={`${data.month}-${index}`} className="flex min-w-16 flex-1 flex-col items-center gap-3">
                        <div className="flex h-64 items-end gap-1.5">
                          <div
                            className="w-5 rounded-t bg-blue-500"
                            style={{ height: `${Math.max((data.views / 100) * 100, data.views ? 12 : 0)}px` }}
                            title={`Views: ${data.views}`}
                          />
                          <div
                            className="w-5 rounded-t bg-emerald-500"
                            style={{ height: `${Math.max((data.inquiries / 20) * 100, data.inquiries ? 12 : 0)}px` }}
                            title={`Inquiries: ${data.inquiries}`}
                          />
                          <div
                            className="w-5 rounded-t bg-gray-950"
                            style={{ height: `${Math.max((data.offers / 10) * 100, data.offers ? 12 : 0)}px` }}
                            title={`Offers: ${data.offers}`}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-500">{data.month}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-blue-500" />
                      <span className="text-sm font-semibold text-gray-600">Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-emerald-500" />
                      <span className="text-sm font-semibold text-gray-600">Inquiries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-gray-950" />
                      <span className="text-sm font-semibold text-gray-600">Offers</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
                  <BarChart3 className="mb-4 h-10 w-10 text-gray-300" />
                  <h3 className="text-lg font-black text-gray-950">No analytics data yet</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                    Interest data will appear here once buyers start viewing or engaging with your listings.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
