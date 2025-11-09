'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building, UserCheck, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { useAdminPaymentMonitoring } from '@/hooks/usePaymentUpdates';
// Removed: import { toast, Toaster } from 'react-hot-toast';

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
    // Token is invalid/expired, clear storage and redirect to login
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
const fetchRecentActivity = () =>
  authenticatedFetch('http://localhost:5000/api/admin/activity');

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: string;
  isLoading?: boolean;
  error?: string;
}

function StatsCard({ title, value, description, icon, trend, isLoading, error }: StatsCardProps) {
  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">Error</div>
          <p className="text-xs text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? 'Loading...' : value}
        </div>
        <p className="text-xs text-muted-foreground">
          {description}
          {trend && (
            <span className="text-green-600 ml-1">
              <TrendingUp className="inline h-3 w-3" /> {trend}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

// Replace individual fetch functions with consolidated stats fetch
const fetchDashboardStats = () => 
  authenticatedFetch('http://localhost:5000/api/admin/dashboard/stats');


export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
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
  const { data: activityData, isLoading: activityLoading, error: activityError } = useQuery({
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

    // Update tracker only; no toast notifications
    const currentIds = new Set<string>(activities.map((a: any) => a.id));
    prevActivityIdsRef.current = currentIds;
  }, [activityData]);

  return (
    <AdminLayout>
      {/* Removed Toaster and all toast calls */}
      {/* <Toaster position="top-right" /> */}

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
              <p className="text-muted-foreground">
                Welcome back! Here's what's happening with your platform.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>
                {isConnected ? 'Live updates connected' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="OnlyIf Properties"
            value={dashboardData?.data?.totalProperties || 0}
            description="Properties listed on platform"
            icon={<Building className="h-4 w-4 text-muted-foreground" />}
            isLoading={dashboardLoading}
            error={dashboardError ? 'Failed to load' : undefined}
          />
          <StatsCard
            title="OnlyIf Agents"
            value={dashboardData?.data?.totalAgents || 0}
            description="Registered real estate agents"
            icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
            isLoading={dashboardLoading}
            error={dashboardError ? 'Failed to load' : undefined}
          />
          <StatsCard
            title="OnlyIf Users"
            value={dashboardData?.data?.totalUsers || 0}
            description="Registered buyers and sellers"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            isLoading={dashboardLoading}
            error={dashboardError ? 'Failed to load' : undefined}
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${(dashboardData?.data?.monthlyRevenue || 0).toLocaleString()}`}
            description="Revenue this month"
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            isLoading={dashboardLoading}
            error={dashboardError ? 'Failed to load' : undefined}
          />
        </div>


        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Manage your platform efficiently with these quick actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => router.push('/admin/properties')}
            >
              Manage Properties
              <span className="ml-auto text-xs text-muted-foreground">Review and approve new listings</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => router.push('/admin/agents')}
            >
              Manage Agents
              <span className="ml-auto text-xs text-muted-foreground">Approve new agent registrations</span>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => router.push('/admin/users')}
            >
              Manage Users
              <span className="ml-auto text-xs text-muted-foreground">View and manage user accounts</span>
            </Button>
          </CardContent>
        </Card>


        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest actions and updates on your platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="text-center py-4">
                <div className="text-sm text-muted-foreground">Loading recent activity...</div>
              </div>
            ) : activityError ? (
              <div className="text-center py-4">
                <div className="text-sm text-red-600">Failed to load recent activity</div>
              </div>
            ) : !activityData?.data?.activities || activityData.data.activities.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-sm text-muted-foreground">No recent activity to display</div>
              </div>
            ) : (
              <div className="space-y-4">
                {activityData.data.activities.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'property' ? 'bg-blue-500' :
                      activity.type === 'user' ? 'bg-green-500' :
                      activity.type === 'agent' ? 'bg-yellow-500' :
                      activity.type === 'payment' ? 'bg-purple-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action || activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {(() => {
                          const ts = activity.timestamp;
                          const date = typeof ts === 'string' || typeof ts === 'number' ? new Date(ts) : ts;
                          return isNaN(date?.getTime?.() ?? NaN) ? 'Unknown time' : date.toLocaleString();
                        })()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}