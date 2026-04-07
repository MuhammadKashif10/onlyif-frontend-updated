'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components';
import Sidebar from '@/components/main/Sidebar';
import { sellerApi } from '@/api/seller';
import { propertiesApi } from '@/api/properties';
import { Property } from '@/types/api';
import { 
  LayoutDashboard, 
  Building2, 
  Settings, 
  Bell, 
  Home, 
  Plus, 
  DollarSign, 
  Calendar,
  ChevronRight,
  User,
  Activity
} from 'lucide-react';

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Error message component
const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
    <p className="text-red-600 mb-2">{message}</p>
    <button 
      onClick={onRetry}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
    >
      Try Again
    </button>
  </div>
);

interface SellerStats {
  totalOffers: number;
  pendingOffers: number;
  acceptedOffers: number;
  averageOfferValue: number;
  totalProperties: number;
  activeProperties: number;
  soldProperties: number;
  averagePropertyValue: number;
  totalViews: number;
  totalInquiries: number;
}

interface EnhancedProperty extends Property {
  inquiries: number;
  pendingInquiries: number;
  views: number;
  primaryImage: string | null;
}

function SellerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState<'dashboard' | 'listings'>('dashboard');
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [activeListings, setActiveListings] = useState<EnhancedProperty[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [listingsError, setListingsError] = useState<string | null>(null);
  
  // Add missing state variables for Quick Actions
  const [isGettingPriceEstimation, setIsGettingPriceEstimation] = useState(false);
  const [isViewingAddons, setIsViewingAddons] = useState(false);
  const [isGettingCashOffer, setIsGettingCashOffer] = useState(false);
  const [isSchedulingInspection, setIsSchedulingInspection] = useState(false);
  
  // Authentication check
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !user) {
      router.push('/signin');
      return;
    }
    
    if (user.role !== 'seller') {
      router.push('/dashboards');
      return;
    }

    // Set active tab from query parameter if present
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'listings' || tab === 'dashboard') {
        setActiveTab(tab as any);
      } else if (tab === 'account') {
        // Redirect to separate account page if user specifically asks for account tab
        router.push('/dashboards/seller/account');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);
  
  // Get seller ID from authenticated user
  const sellerId = user?.id;
  
  // Fetch seller statistics
  const fetchStats = async () => {
    if (!sellerId) return;
    
    try {
      setIsLoadingStats(true);
      setStatsError(null);
      
      const response = await sellerApi.getSellerOverview(sellerId);
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStatsError('Failed to load dashboard statistics');
      // Set empty state for graceful handling
      setStats({
        totalOffers: 0,
        pendingOffers: 0,
        acceptedOffers: 0,
        averageOfferValue: 0,
        totalProperties: 0,
        activeProperties: 0,
        soldProperties: 0,
        averagePropertyValue: 0,
        totalViews: 0,
        totalInquiries: 0
      });
    } finally {
      setIsLoadingStats(false);
    }
  };
  
  // Fetch seller's property listings
  const fetchListings = async () => {
    if (!sellerId) return;
    
    try {
      setIsLoadingListings(true);
      setListingsError(null);
      const response = await sellerApi.getSellerListings(sellerId, {
        page: 1,
        limit: 10
        // removed status: 'active' to show all statuses
      });
      
      // Transform properties to include additional fields - add null check
      const enhancedProperties = ((response as any)?.data || []).map((property: any) => ({
        ...property,
        inquiries: 0, // This would come from API
        pendingInquiries: 0,
        views: property.viewCount || 0,
        primaryImage: property.images?.[0]?.url || null
      }));
      
      setActiveListings(enhancedProperties);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListingsError('Failed to load property listings');
      setActiveListings([]); // Empty state
    } finally {
      setIsLoadingListings(false);
    }
  };
  
  // Load data when component mounts and user is authenticated
  useEffect(() => {
    if (sellerId) {
      fetchStats();
      fetchListings();
    }
  }, [sellerId]);
  
  // Show loading while checking authentication
  if (authLoading) {
    return <LoadingSpinner />;
  }
  
  // Show error if not authenticated
  if (!isAuthenticated || !user || user.role !== 'seller') {
    return null; // Will redirect in useEffect
  }

  // Handle edit listing
  const handleEditListing = (propertyId: string) => {
    router.push(`/dashboards/seller/listings/${propertyId}/edit`);
  };

  // Handle adding new listing
  const handleAddListing = async (propertyData: Partial<Property>) => {
    try {
      setIsAddingProperty(true);
      
      // Create property via API
      const newProperty = await propertiesApi.submitProperty({
        ...propertyData,
        owner: sellerId
      });
      
      // Refresh both stats and listings to reflect the new property
      await Promise.all([
        fetchStats(),
        fetchListings()
      ]);
      
      // Show success message (you can implement toast notifications)
      console.log('Property added successfully:', newProperty);
      
    } catch (error) {
      console.error('Error adding property:', error);
      // Handle error (show error message to user)
    } finally {
      setIsAddingProperty(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    try {
      // Update property status via API
      await propertiesApi.updateProperty(propertyId, { status: newStatus });
      
      // Refresh listings to show updated status
      await fetchListings();
      
      // Optionally refresh stats if status change affects them
      if (newStatus === 'sold' || newStatus === 'active') {
        await fetchStats();
      }
      
    } catch (error) {
      console.error('Error updating property status:', error);
      // Handle error
    }
  };

  // Add missing handler functions after the existing handlers
  
  // Handle view add-ons
  const handleViewAddons = async () => {
    try {
      setIsViewingAddons(true);
      
      // Navigate to add-ons page (the page will fetch data itself)
      router.push('/dashboards/seller/addons');
      
    } catch (error) {
      console.error('Error navigating to add-ons:', error);
      // Handle error
    } finally {
      setIsViewingAddons(false);
    }
  };

  // Handle get cash offer
  const handleGetCashOffer = async () => {
    try {
      setIsGettingCashOffer(true);
      
      // Submit cash offer request
      const offerRequest = await cashOffersApi.submitCashOfferRequest({
        sellerId: sellerId,
        propertyId: 'selected-property-id', // You'll need to implement property selection
        requestedAmount: 0, // Optional - let them make an offer
        urgency: 'standard'
      });
      
      // Navigate to cash offer details or show success message
      router.push(`/dashboards/seller/cash-offers/${offerRequest.id}`);
      
    } catch (error) {
      console.error('Error submitting cash offer request:', error);
      // Handle error
    } finally {
      setIsGettingCashOffer(false);
    }
  };
  
  // Handle schedule inspection
  const handleScheduleInspection = async () => {
    try {
      setIsSchedulingInspection(true);
      
      // Navigate to inspection scheduling page
      router.push('/dashboards/seller/schedule-inspection');
      
    } catch (error) {
      console.error('Error navigating to inspection scheduling:', error);
      // Handle error
    } finally {
      setIsSchedulingInspection(false);
    }
  };

  // Only show stats section if there is meaningful data
  const hasStatsData = !!(stats && (
    (stats.totalOffers || 0) > 0 ||
    (stats.pendingOffers || 0) > 0 ||
    (stats.acceptedOffers || 0) > 0 ||
    (stats.averageOfferValue || 0) > 0 ||
    (stats.totalProperties || 0) > 0 ||
    (stats.activeProperties || 0) > 0 ||
    (stats.soldProperties || 0) > 0 ||
    (stats.averagePropertyValue || 0) > 0 ||
    (stats.totalViews || 0) > 0 ||
    (stats.totalInquiries || 0) > 0
  ));

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center space-x-2 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full border border-amber-100 shadow-sm uppercase tracking-wider text-[11px] font-black">
            <Activity className="w-3.5 h-3.5" />
            <span>Submitted for Approval</span>
          </div>
        );
      case 'active':
        return (
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm uppercase tracking-wider text-[11px] font-black">
            <Activity className="w-3.5 h-3.5" />
            <span>Published</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full border border-red-100 shadow-sm uppercase tracking-wider text-[11px] font-black">
            <Activity className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </div>
        );
      case 'sold':
        return (
          <div className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm uppercase tracking-wider text-[11px] font-black">
            <Activity className="w-3.5 h-3.5" />
            <span>Sold</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-2 bg-gray-50 text-gray-500 px-4 py-1.5 rounded-full border border-gray-100 shadow-sm uppercase tracking-wider text-[11px] font-black">
            <Activity className="w-3.5 h-3.5" />
            <span>{status}</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30 w-full">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <img src="/images/logo.PNG" alt="Only If" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Center: Main Site Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link href="/buy" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">Buy</Link>
          <Link href="/signin" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">Sell</Link>
          <Link href="/how-it-works" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">How it Works</Link>
          <Link href="/agents" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">Agents</Link>
        </nav>

        {/* Right: Dashboard & Sign Out */}
        <div className="flex items-center space-x-6">
          <Link 
            href="/dashboard"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Dashboard
          </Link>
          <button 
            onClick={logout}
            className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors"
          >
            Sign Out
          </button>
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex-shrink-0">
              <img 
                src="/images/user-avatar.jpg" 
                alt="User" 
                className="w-full h-full object-cover" 
                onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${user?.name || 'S'}&background=10b981&color=fff`)} 
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar - Fixed Position */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-20 bottom-0 z-20 overflow-y-auto">
          <div className="p-8 flex-1">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-5 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                  activeTab === 'dashboard' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`w-full flex items-center space-x-3 px-5 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                  activeTab === 'listings' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <Building2 className={`w-5 h-5 ${activeTab === 'listings' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span>My Listings</span>
              </button>
              <button
                onClick={() => router.push('/dashboards/seller/account')}
                className="w-full flex items-center space-x-3 px-5 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              >
                <Settings className="w-5 h-5 text-gray-400" />
                <span>Account Settings</span>
              </button>
            </nav>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center space-x-4 p-2">
              <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Seller Name'}</p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Seller</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 ml-72 flex flex-col">
          <main className="p-10 w-full max-w-7xl mx-auto min-h-[calc(100vh-5rem)]">
            {activeTab === 'dashboard' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* My Property Snapshot Section */}
                <section className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Property Snapshot</h2>
                    <div className="flex items-center space-x-4">
                      {activeListings.length > 0 ? (
                        <>
                          <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Listing Setup: 100% Complete</span>
                          <div className="w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                            <div className="w-full h-full bg-emerald-500 shadow-sm"></div>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Listing Setup: 0% Complete</span>
                          <div className="w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                            <div className="w-0 h-full bg-emerald-500 shadow-sm"></div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="p-10">
                      {activeListings.length > 0 ? (
                        (() => {
                          const property = activeListings[0];
                          return (
                            <>
                              <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-4">
                                  <div className="p-3 bg-emerald-50 rounded-2xl shadow-sm">
                                    <Home className="w-8 h-8 text-emerald-600" />
                                  </div>
                                  <div>
                                    <h3 className="text-2xl font-extrabold text-gray-900">{property.title}</h3>
                                    <p className="text-gray-500 font-medium">
                                      {typeof property.address === 'object' ? 
                                        `${property.address.street}, ${property.address.city}, ${property.address.state}` : 
                                        property.address}
                                    </p>
                                  </div>
                                </div>
                                {renderStatusBadge(property.status)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                <div className="py-4 md:py-0 md:px-8 first:pl-0">
                                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
                                    <Activity className="w-4 h-4" />
                                    <span>Current Status</span>
                                  </div>
                                  <p className="text-xl font-bold text-gray-900 capitalize">
                                    {property.status.replace('-', ' ')}
                                  </p>
                                </div>
                                <div className="py-4 md:py-0 md:px-8">
                                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
                                    <User className="w-4 h-4" />
                                    <span>Total Views</span>
                                  </div>
                                  <p className="text-4xl font-black text-gray-900">{property.views || 0}</p>
                                </div>
                                <div className="py-4 md:py-0 md:px-8">
                                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
                                    <DollarSign className="w-4 h-4" />
                                    <span>Inquiries</span>
                                  </div>
                                  <p className="text-4xl font-black text-gray-900">{property.inquiries || 0}</p>
                                </div>
                                <div className="py-4 md:py-0 md:px-8 last:pr-0">
                                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
                                    <DollarSign className="w-4 h-4" />
                                    <span>Listing Price</span>
                                  </div>
                                  <p className="text-xl font-black text-gray-900">
                                    {property.price ? `A$${property.price.toLocaleString('en-AU')}` : 'Not Set'}
                                  </p>
                                </div>
                              </div>
                            </>
                          );
                        })()
                      ) : (
                        <>
                          <div className="flex items-center space-x-4 mb-8">
                            <div className="p-3 bg-gray-50 rounded-2xl shadow-sm">
                              <Home className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-gray-900">Not Listed Yet</h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            <div className="py-4 md:py-0 md:px-8 first:pl-0">
                              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
                                <Activity className="w-4 h-4" />
                                <span>Status</span>
                              </div>
                              <p className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                                <Home className="w-5 h-5 text-gray-400" />
                                <span>Not Listed Yet</span>
                              </p>
                            </div>
                            <div className="py-4 md:py-0 md:px-8">
                              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
                                <User className="w-4 h-4" />
                                <span>Buyer Interest</span>
                              </div>
                              <p className="text-4xl font-black text-gray-900">0</p>
                            </div>
                            <div className="py-4 md:py-0 md:px-8">
                              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
                                <DollarSign className="w-4 h-4" />
                                <span>Offers</span>
                              </div>
                              <p className="text-4xl font-black text-gray-900">0</p>
                            </div>
                            <div className="py-4 md:py-0 md:px-8 last:pr-0">
                              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
                                <DollarSign className="w-4 h-4" />
                                <span>Your Price</span>
                              </div>
                              <p className="text-xl font-black text-gray-900">Not Set</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="h-3 w-full bg-gray-100 shadow-inner">
                      <div className={`h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-sm ${activeListings.length > 0 ? 'w-full' : 'w-0'}`}></div>
                    </div>
                    <div className="px-10 py-3.5 bg-gray-50/80 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs font-black text-gray-400 tracking-[0.2em] uppercase">
                        {activeListings.length > 0 ? '100% COMPLETE' : '0% COMPLETE'}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Get Started Section */}
                <section className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Get Started</h2>
                    <p className="text-gray-500 text-base">
                      You&apos;re in control <span className="font-bold text-gray-900">of your sale</span> – track interest, manage buyers, and move only when the price is right.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Add Property Card */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-200 shadow-sm flex flex-col items-center text-center space-y-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center shadow-inner">
                        <Home className="w-10 h-10 text-emerald-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-extrabold text-gray-900">Add Property</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">Start your listing – photos, price, and details.</p>
                      </div>
                      <button 
                        onClick={() => router.push('/dashboards/seller/add-property')}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-lg transition-all duration-300 shadow-md hover:shadow-emerald-200 active:scale-[0.98]"
                      >
                        Create Listing
                      </button>
                    </div>

                    {/* View Listings Card */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-200 shadow-sm flex flex-col items-center text-center space-y-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center shadow-inner">
                        <Building2 className="w-10 h-10 text-emerald-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-extrabold text-gray-900">View Listings</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">Manage your active and pending property listings.</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('listings')}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-lg transition-all duration-300 shadow-md hover:shadow-emerald-200 active:scale-[0.98]"
                      >
                        View My Listings
                      </button>
                    </div>
                  </div>
                </section>

                {/* Buyer Activity Section */}
                <section className="space-y-6">
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Buyer Activity</h2>
                  <div className="bg-white rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center py-20 px-6 space-y-6 text-center">
                    <p className="text-gray-400 font-medium max-w-sm">No buyers yet – once your property is live, you&apos;ll start seeing interest here.</p>
                    <div className="relative w-64 h-40 opacity-[0.08] grayscale select-none pointer-events-none">
                      <img 
                        src="/images/house-keys.png" 
                        alt="Empty Activity" 
                        className="w-full h-full object-contain" 
                        onError={(e) => (e.currentTarget.style.display = 'none')} 
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Listings</h2>
                  <button 
                    onClick={() => router.push('/dashboards/seller/add-property')}
                    className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-emerald-100"
                  >
                    <Plus className="w-5 h-5" />
                    <span>New Listing</span>
                  </button>
                </div>
                
                {isLoadingListings ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    <p className="text-gray-500 font-medium">Fetching your properties...</p>
                  </div>
                ) : activeListings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {activeListings.map((property) => (
                      <div key={property.id} className="bg-white rounded-[2rem] border border-gray-200 shadow-sm p-8 hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-center md:items-stretch gap-8 group">
                        <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                          <img 
                            src={property.primaryImage || '/images/default-property.jpg'} 
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => (e.currentTarget.src = '/images/01.jpg')}
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-2 w-full">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-2xl font-extrabold text-gray-900">{property.title}</h4>
                              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                                property.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                property.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                property.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {property.status}
                              </span>
                            </div>
                            <p className="text-gray-500 font-medium flex items-center mb-4">
                              <Home className="w-4 h-4 mr-2 opacity-50" />
                              {typeof property.address === 'object' ? 
                                `${property.address.street}, ${property.address.city}, ${property.address.state}` : 
                                property.address}
                            </p>
                            <div className="flex items-center space-x-6 text-sm font-bold text-gray-600 bg-gray-50/80 w-fit px-4 py-2 rounded-xl">
                              <span className="flex items-center"><Building2 className="w-4 h-4 mr-2 text-gray-400" />{property.beds} Beds</span>
                              <span className="flex items-center"><Activity className="w-4 h-4 mr-2 text-gray-400" />{property.baths} Baths</span>
                              <span className="flex items-center"><LayoutDashboard className="w-4 h-4 mr-2 text-gray-400" />{property.size} m²</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center items-end space-y-4 w-full md:w-auto md:border-l border-gray-100 md:pl-8">
                          <div className="text-right">
                            <p className="text-3xl font-black text-gray-900">
                              {property.price != null
                                ? `A$${property.price.toLocaleString('en-AU')}`
                                : 'A$0'}
                            </p>
                            <div className="flex items-center justify-end space-x-4 mt-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                              <span>{property.views} views</span>
                              <span>•</span>
                              <span>{property.inquiries} inquiries</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 w-full md:w-auto">
                            <button 
                              onClick={() => handleEditListing(property.id)}
                              className="flex-1 md:flex-none px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors shadow-sm"
                            >
                              Edit
                            </button>
                            <select 
                              value={property.status}
                              onChange={(e) => handleStatusChange(property.id, e.target.value)}
                              className="flex-1 md:flex-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                            >
                              <option value="draft">Draft</option>
                              <option value="pending">Pending</option>
                              <option value="active">Active</option>
                              <option value="sold">Sold</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center py-32 px-6 text-center space-y-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900">No properties yet</h3>
                      <p className="text-gray-400 font-medium max-w-xs mx-auto">You haven't added any properties to your account yet.</p>
                    </div>
                    <button 
                      onClick={() => router.push('/dashboards/seller/add-property')}
                      className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md"
                    >
                      Add Your First Property
                    </button>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;