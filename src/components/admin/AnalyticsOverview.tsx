'use client';
import { useState, useEffect } from 'react';
import { AdminAnalytics } from '@/types/api';
import { Button, Loader, Alert } from '@/components/reusable';
import { ADMIN_ROLES } from '@/utils/constants';

interface AnalyticsOverviewProps {
  analytics: AdminAnalytics | null;
  userRole?: string;
}

export default function AnalyticsOverview({ analytics, userRole }: AnalyticsOverviewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedFilter, setSelectedFilter] = useState('all');

  if (!analytics) {
    return (
      <div className="p-6">
        <Loader size="large" />
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Users',
      value: analytics.totalUsers.total.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      color: 'blue',
    },
    {
      title: 'Active Listings',
      value: analytics.activeListings.toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      color: 'green',
    },
    {
      title: 'Pending Listings',
      value: analytics.pendingListings.toLocaleString(),
      change: '-5.1%',
      trend: 'down',
      color: 'yellow',
    },
    {
      title: 'Total Payments',
      value: `$${analytics.totalPayments.toLocaleString()}`,
      change: '+15.3%',
      trend: 'up',
      color: 'purple',
    },
  ];

  const userBreakdown = [
    { label: 'Buyers', value: analytics.totalUsers.buyers, color: 'bg-blue-500' },
    { label: 'Sellers', value: analytics.totalUsers.sellers, color: 'bg-green-500' },
    { label: 'Agents', value: analytics.totalUsers.agents, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
        <div className="flex space-x-4">
          {/* Role-based Quick Filters */}
          {userRole === ADMIN_ROLES.SUPER_ADMIN && (
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Data</option>
              <option value="users">Users Only</option>
              <option value="listings">Listings Only</option>
              <option value="payments">Payments Only</option>
            </select>
          )}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((kpi, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              </div>
              <div className={`text-sm font-medium ${
                kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.userGrowth.map((month, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div className="flex flex-col space-y-1">
                  <div 
                    className="bg-blue-500 rounded-t"
                    style={{ height: `${(month.buyers / 200) * 100}px`, width: '20px' }}
                  />
                  <div 
                    className="bg-green-500"
                    style={{ height: `${(month.sellers / 200) * 100}px`, width: '20px' }}
                  />
                  <div 
                    className="bg-purple-500 rounded-b"
                    style={{ height: `${(month.agents / 200) * 100}px`, width: '20px' }}
                  />
                </div>
                <span className="text-xs text-gray-600">{month.date.split('-')[1]}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {userBreakdown.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded ${item.color}`} />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Listings by Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Listings by Status</h3>
          <div className="space-y-4">
            {analytics.listingsByStatus.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${
                    status.status === 'public' ? 'bg-green-500' :
                    status.status === 'private' ? 'bg-blue-500' :
                    status.status === 'pending' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {status.status}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">{status.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Trends */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Trends</h3>
        <div className="h-64 flex items-end justify-between space-x-4">
          {analytics.paymentsByMonth.map((month, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div 
                className="bg-purple-500 rounded-t"
                style={{ height: `${(month.amount / 40000) * 200}px`, width: '40px' }}
              />
              <div className="text-center">
                <div className="text-xs font-medium text-gray-900">
                  ${(month.amount / 1000).toFixed(0)}k
                </div>
                <div className="text-xs text-gray-600">{month.month.split('-')[1]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}