'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/main/Navbar';
import Sidebar from '@/components/main/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { sellerApi, AnalyticsData, ChartData } from '@/api/seller';

interface AnalyticsData {
  totalViews: number;
  totalInquiries: number;
  totalOffers: number;
  averageViewsPerListing: number;
  conversionRate: number;
  topPerformingListing: {
    id: string;
    title: string;
    views: number;
  } | null;
}

interface ChartData {
  month: string;
  views: number;
  inquiries: number;
  offers: number;
}

export default function SellerAnalytics() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('6months');

  useEffect(() => {
    if (user?.id) {
      fetchAnalyticsData();
    }
  }, [timeRange, user?.id]);

  const fetchAnalyticsData = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await sellerApi.getSellerAnalytics(user.id, timeRange);
      setAnalyticsData(data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center py-8">
              <p className="text-gray-500">Please log in to view analytics.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 mb-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-orange-100">Track your property performance and insights</p>
          </div>

          {/* Time Range Selector */}
          <div className="mb-6">
            <div className="flex space-x-2">
              {[
                { value: '1month', label: '1 Month' },
                { value: '3months', label: '3 Months' },
                { value: '6months', label: '6 Months' },
                { value: '1year', label: '1 Year' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    timeRange === range.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
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
                onClick={fetchAnalyticsData}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Analytics Content */}
          {!loading && !error && analyticsData && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Views</h3>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.totalViews.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Inquiries</h3>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.totalInquiries}</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Offers</h3>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.totalOffers}</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Conversion Rate</h3>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.conversionRate}%</p>
                </div>
              </div>

              {/* Charts and Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Chart */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Over Time</h3>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {analyticsData.chartData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center space-y-2">
                        <div className="flex flex-col space-y-1">
                          <div 
                            className="bg-blue-500 rounded-t"
                            style={{ height: `${Math.max((data.views / 100) * 100, 10)}px`, width: '30px' }}
                            title={`Views: ${data.views}`}
                          />
                          <div 
                            className="bg-green-500"
                            style={{ height: `${Math.max((data.inquiries / 20) * 100, 5)}px`, width: '30px' }}
                            title={`Inquiries: ${data.inquiries}`}
                          />
                          <div 
                            className="bg-orange-500 rounded-b"
                            style={{ height: `${Math.max((data.offers / 10) * 100, 5)}px`, width: '30px' }}
                            title={`Offers: ${data.offers}`}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{data.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center space-x-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded" />
                      <span className="text-sm text-gray-600">Views</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded" />
                      <span className="text-sm text-gray-600">Inquiries</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded" />
                      <span className="text-sm text-gray-600">Offers</span>
                    </div>
                  </div>
                </div>

                {/* Top Performing Listing */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Listing</h3>
                  {analyticsData.topPerformingListing ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900">{analyticsData.topPerformingListing.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">Property ID: {analyticsData.topPerformingListing.id}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total Views</span>
                          <span className="font-semibold text-orange-600">{analyticsData.topPerformingListing.views}</span>
                        </div>
                      </div>
                      <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                        View Details
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No performance data available</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}