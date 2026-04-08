'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import AgentRequests from '@/components/admin/AgentRequests';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building, 
  UserCheck, 
  TrendingUp, 
  Activity, 
  ChevronRight, 
  ArrowRight,
  PlusCircle,
  Settings as SettingsIcon,
  ShieldCheck,
  Building2,
  Users2
} from 'lucide-react';
import { useAdminPaymentMonitoring } from '@/hooks/usePaymentUpdates';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';

// Utility function for authenticated API calls
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle unauthorized responses
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login';
    throw new Error('Authentication failed - redirecting to login');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.message === 'Unauthorized') {
      throw new Error('Unauthorized access');
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Recent activity fetch
const fetchRecentActivity = () => {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  return authenticatedFetch(`${apiBase}/admin/activity`);
}

// Replace individual fetch functions with consolidated stats fetch
const fetchDashboardStats = () => {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  return authenticatedFetch(`${apiBase}/admin/dashboard/stats`);
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Initialize real-time payment monitoring
  const { isConnected } = useAdminPaymentMonitoring();

  // Use single query for all dashboard stats
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: fetchDashboardStats,
    enabled: !!user && user.type === 'admin',
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Add missing query for recent activity
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: fetchRecentActivity,
    enabled: !!user && user.type === 'admin',
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Track previous activity IDs to detect new events (no notifications)
  const prevActivityIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const activities = activityData?.data?.activities || [];
    if (!activities || activities.length === 0) {
      prevActivityIdsRef.current = new Set();
      return;
    }

    const currentIds = new Set<string>(activities.map((a: any) => a.id));
    prevActivityIdsRef.current = currentIds;
  }, [activityData]);

  return (
    <AdminLayout>
      <Toaster position="top-right" />

      <div className="space-y-6 sm:space-y-10 pb-10">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome back, {user?.name || 'Admin'}! 👋
            </h1>
            <p className="text-sm sm:text-lg text-gray-500 font-medium mt-1">
              Here's an overview of how Only If is performing.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-full shadow-sm self-start md:self-center">
            <div className={`w-2.5 h-2.5 rounded-full ${
              isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'
            }`}></div>
            <span className="text-xs sm:text-sm font-bold text-gray-600">
              {isConnected ? 'Live updates connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Agent Requests Section with Stats */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Agent Requests
            </h2>
          </div>
          
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* OnlyIf Properties */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2.5 sm:p-3 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {dashboardLoading ? '...' : (dashboardData?.data?.totalProperties || 0)}
                </p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">OnlyIf Properties</p>
                <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-1">Active properties listed on platform</p>
              </div>
            </div>

            {/* OnlyIf Agents */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2.5 sm:p-3 bg-purple-50 rounded-xl group-hover:scale-110 transition-transform">
                  <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {dashboardLoading ? '...' : (dashboardData?.data?.totalAgents || 0)}
                </p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">OnlyIf Agents</p>
                <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-1">Registered real estate agents</p>
              </div>
            </div>

            {/* OnlyIf Users */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow group sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2.5 sm:p-3 bg-teal-50 rounded-xl group-hover:scale-110 transition-transform">
                  <Users2 className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-green-600 font-bold hover:bg-green-50 rounded-lg text-xs"
                  onClick={() => router.push('/admin/users')}
                >
                  More
                </Button>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {dashboardLoading ? '...' : (dashboardData?.data?.totalUsers || 0)}
                </p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">OnlyIf Users</p>
                <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-1">Registered buyers and sellers</p>
              </div>
            </div>
          </div>

          <AgentRequests />
        </section>

        {/* Quick Actions */}
        <section className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-green-600" />
            Quick Actions
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden divide-y divide-gray-50">
            <button 
              onClick={() => router.push('/admin/properties')}
              className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3 sm:gap-4 text-left">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Building className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-900">Manage Properties</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Review and approve new listings</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={() => router.push('/admin/agents')}
              className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3 sm:gap-4 text-left">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-900">Manage Agents</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Approve new agent registrations</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={() => router.push('/admin/users')}
              className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3 sm:gap-4 text-left">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-900">Manage Users</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">View and manage user accounts</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Recent Activity
            </h2>
            <Link 
              href="/admin/activity" 
              className="text-xs sm:text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1 group"
            >
              View All Activity
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-4 sm:p-6">
            {activityLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : !activityData?.data?.activities || activityData.data.activities.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 font-medium">No recent activity to display</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activityData.data.activities.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm ${
                      activity.type === 'property' ? 'bg-blue-500' :
                      activity.type === 'user' ? 'bg-green-500' :
                      activity.type === 'agent' ? 'bg-purple-500' :
                      activity.type === 'payment' ? 'bg-amber-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                        {activity.action || activity.message}
                      </p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
                        {(() => {
                          const ts = activity.timestamp;
                          const date = new Date(ts);
                          return isNaN(date.getTime()) ? 'Unknown time' : date.toLocaleString();
                        })()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}