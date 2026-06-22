'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components';
import { sellerApi } from '@/api/seller';
import { propertiesApi } from '@/api/properties';
import { Property } from '@/types/api';
import { UNLOCK_FEE_LABEL } from '@/utils/constants';
import { 
  LayoutDashboard, 
  Building2, 
  Settings, 
  Bell, 
  Home, 
  Plus, 
  DollarSign, 
  User,
  Activity,
  Search,
  Menu,
  X,
  ArrowRight,
  Store,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/reusable';
import EditPropertyModal from '@/components/seller/EditPropertyModal';
import OccupancyBadge from '@/components/property/OccupancyBadge';

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
  const { user, isAuthenticated, isLoading: authLoading, logout, addRole, setActiveRole } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState<'dashboard' | 'listings'>('dashboard');
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [activeListings, setActiveListings] = useState<EnhancedProperty[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Edit property modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<EnhancedProperty | null>(null);

  // Role switch modal state
  const [isBuyerModalOpen, setBuyerModalOpen] = useState(false);
  const [buyerChecks, setBuyerChecks] = useState({
    unlockFee: false,
    noBypass: false,
    responsibility: false,
  });

  const buyerAllChecked = 
    buyerChecks.unlockFee && 
    buyerChecks.noBypass && 
    buyerChecks.responsibility;

  const handleSwitchToBuyer = async () => {
    if (user?.acceptedRoles?.buyer) {
      setActiveRole('buyer');
      router.push('/dashboards/buyer');
    } else {
      setBuyerModalOpen(true);
    }
  };

  const handleAcceptBuyer = async () => {
    if (!buyerAllChecked) return;
    try {
      await addRole('buyer');
      setActiveRole('buyer');
      setBuyerModalOpen(false);
      router.push('/dashboards/buyer');
    } catch (err) {
      console.error('Error switching to buyer:', err);
    }
  };

  // Add missing state variables for Quick Actions
  const [isGettingPriceEstimation, setIsGettingPriceEstimation] = useState(false);
  const [isViewingAddons, setIsViewingAddons] = useState(false);
  const [isGettingCashOffer, setIsGettingCashOffer] = useState(false);
  const [isSchedulingInspection, setIsSchedulingInspection] = useState(false);
  
  // Authentication check - updated for multi-role support
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !user) {
      router.push('/signin');
      return;
    }
    
    // In multi-role system, check roles array instead of legacy role field
    if (!user.roles.includes('seller')) {
      router.push('/dashboard');
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
  if (!isAuthenticated || !user || !user.roles.includes('seller')) {
    return null; // Will redirect in useEffect
  }

  // Handle edit listing — open the in-page modal (no navigation, no 404)
  const handleEditOpen = (property: EnhancedProperty) => {
    setEditingProperty(property);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setEditingProperty(null);
  };

  // After a successful save: close the modal and refresh listings in place
  const handlePropertyUpdated = () => {
    handleEditClose();
    fetchListings();
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
      router.push('/dashboards/seller/marketplace');
      
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

  const featuredListing = activeListings[0];
  const setupProgress = activeListings.length > 0 ? 100 : 0;
  const dashboardTitle = user?.name ? `Welcome back, ${user.name}` : 'Welcome back';

  const sidebarButtonClass = (isActive: boolean) =>
    `w-full flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ease-out hover:shadow-sm ${
      isActive
        ? 'bg-black text-white shadow-lg shadow-black/10'
        : 'text-gray-600 hover:bg-white hover:text-gray-950'
    }`;

  const sidebarIconClass = (isActive: boolean) =>
    `h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`;

  return (
    <div className="min-h-screen bg-[#f5f6fb] flex flex-col">
      <Navbar />

      <div className="sticky top-20 z-40 border-b border-gray-200/70 bg-[#f5f6fb]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="truncate text-sm font-semibold text-gray-950">{activeTab === 'dashboard' ? 'Dashboard' : 'Listings'}</p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm"
            aria-label="Open seller dashboard menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white overflow-y-auto pb-20">
          <div className="pt-20 px-6 space-y-8">
            <nav className="flex flex-col space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 mb-2">Main Menu</p>
              <Link href="/buy" className="text-lg font-bold text-gray-900 py-3.5 border-b border-gray-50 flex items-center justify-between group" onClick={() => setIsMobileMenuOpen(false)}>
                Buy <ArrowRight className="w-4 h-4 text-gray-300 group-active:text-emerald-500 transition-colors" />
              </Link>
              <Link href="/signin" className="text-lg font-bold text-gray-900 py-3.5 border-b border-gray-50 flex items-center justify-between group" onClick={() => setIsMobileMenuOpen(false)}>
                Sell <ArrowRight className="w-4 h-4 text-gray-300 group-active:text-emerald-500 transition-colors" />
              </Link>
              <Link href="/how-it-works" className="text-lg font-bold text-gray-900 py-3.5 border-b border-gray-50 flex items-center justify-between group" onClick={() => setIsMobileMenuOpen(false)}>
                How it Works <ArrowRight className="w-4 h-4 text-gray-300 group-active:text-emerald-500 transition-colors" />
              </Link>
              <Link href="/agents" className="text-lg font-bold text-gray-900 py-3.5 border-b border-gray-50 flex items-center justify-between group" onClick={() => setIsMobileMenuOpen(false)}>
                Agents <ArrowRight className="w-4 h-4 text-gray-300 group-active:text-emerald-500 transition-colors" />
              </Link>

              <div className="pt-8 space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 mb-2">Dashboard Menu</p>
                <button 
                  onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} 
                  className={`w-full flex items-center justify-between py-4 px-2 rounded-xl transition-all ${
                    activeTab === 'dashboard' 
                      ? 'bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 shadow-sm' 
                      : 'text-gray-900 font-bold border-b border-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-gray-400'}`} />
                    Dashboard
                  </span>
                  {activeTab === 'dashboard' && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-sm"></div>}
                </button>
                <button 
                  onClick={() => { setActiveTab('listings'); setIsMobileMenuOpen(false); }} 
                  className={`w-full flex items-center justify-between py-4 px-2 rounded-xl transition-all ${
                    activeTab === 'listings' 
                      ? 'bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 shadow-sm' 
                      : 'text-gray-900 font-bold border-b border-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Building2 className={`w-5 h-5 ${activeTab === 'listings' ? 'text-emerald-600' : 'text-gray-400'}`} />
                    My Listings
                  </span>
                  {activeTab === 'listings' && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-sm"></div>}
                </button>
                <Link 
                  href="/dashboards/seller/marketplace" 
                  className="w-full flex items-center justify-between py-4 px-2 border-b border-gray-50 text-gray-900 font-bold" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-3">
                    <Store className="w-5 h-5 text-gray-400" />
                    Marketplace
                  </span>
                </Link>
                <Link 
                  href="/dashboards/seller/analytics" 
                  className="w-full flex items-center justify-between py-4 px-2 border-b border-gray-50 text-gray-900 font-bold" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                    Analytics
                  </span>
                </Link>
                <Link 
                  href="/dashboards/seller/account" 
                  className="w-full flex items-center justify-between py-4 px-2 border-b border-gray-50 text-gray-900 font-bold" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-gray-400" />
                    Settings
                  </span>
                </Link>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => { handleSwitchToBuyer(); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center space-x-3 bg-blue-50 text-blue-600 border border-blue-200 py-4 rounded-2xl font-bold shadow-sm active:scale-[0.98] transition-all"
                >
                  <Search className="h-5 w-5" />
                  <span>Switch to Buyer Mode</span>
                </button>
              </div>

              <button 
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left text-lg font-bold text-red-600 py-6 flex items-center justify-between group"
              >
                Sign Out <X className="w-5 h-5 text-red-300 group-active:text-red-500 transition-colors" />
              </button>
            </nav>
            
            <div className="pt-2">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-all"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex w-full flex-1 bg-[#f5f6fb] lg:pl-[280px]">
        <aside id="dashboard-sidebar" className="fixed left-0 top-20 bottom-0 z-30 hidden w-[280px] shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white px-5 py-4 lg:flex">
          <div className="flex-1">
            <nav className="space-y-2 pt-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={sidebarButtonClass(activeTab === 'dashboard')}
              >
                <LayoutDashboard className={sidebarIconClass(activeTab === 'dashboard')} />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={sidebarButtonClass(activeTab === 'listings')}
              >
                <Home className={sidebarIconClass(activeTab === 'listings')} />
                <span>Listings</span>
              </button>
              <button
                onClick={() => router.push('/dashboards/seller/messages')}
                className={sidebarButtonClass(false)}
              >
                <MessageSquare className={sidebarIconClass(false)} />
                <span>Messages</span>
              </button>
              <button
                onClick={() => router.push('/dashboards/seller/marketplace')}
                className={sidebarButtonClass(false)}
              >
                <Store className={sidebarIconClass(false)} />
                <span>Marketplace</span>
              </button>
              <button
                onClick={() => router.push('/dashboards/seller/analytics')}
                className={sidebarButtonClass(false)}
              >
                <BarChart3 className={sidebarIconClass(false)} />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => router.push('/dashboards/seller/account')}
                className={sidebarButtonClass(false)}
              >
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
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-gray-950">{user?.name || 'Seller Name'}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">Verified Seller</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
          <main className="w-full">
            {activeTab === 'dashboard' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-8 duration-500 sm:space-y-10">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">Seller Dashboard</p>
                    <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                      {dashboardTitle}
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600 sm:text-base">
                      {featuredListing ? (
                        <>
                          Your listing for <span className="font-semibold text-gray-950">{featuredListing.title}</span> is ready to monitor from one place.
                        </>
                      ) : (
                        'Create your first listing, track buyer activity, and manage your sale workflow from one premium seller hub.'
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={handleSwitchToBuyer}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      <Search className="h-4 w-4" />
                      <span>Switch to Buyer</span>
                    </button>
                    <button
                      onClick={() => router.push('/dashboards/seller/add-property')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-gray-900"
                    >
                      <Plus className="h-4 w-4" />
                      <span>List Property</span>
                    </button>
                  </div>
                </div>
                {/* My Property Snapshot Section */}
                <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,0.95fr)]">
                  <div className="rounded-[24px] border border-gray-200/80 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-8">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">Listing Health</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">My Property Snapshot</h2>
                      </div>
                      <div className="flex flex-col gap-2 sm:items-end">
                      {activeListings.length > 0 ? (
                        <>
                          <span className="text-5xl font-black tracking-tight text-gray-300">{setupProgress}%</span>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 sm:w-40">
                            <div className="h-full w-full rounded-full bg-emerald-600"></div>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-5xl font-black tracking-tight text-gray-300">{setupProgress}%</span>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 sm:w-40">
                            <div className="h-full w-0 rounded-full bg-emerald-600"></div>
                          </div>
                        </>
                      )}
                      </div>
                    </div>

                    <div>
                      {activeListings.length > 0 ? (
                        (() => {
                          const property = activeListings[0];
                          return (
                            <>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                  <div className="p-2 sm:p-3 bg-emerald-50 rounded-lg sm:rounded-2xl shadow-sm flex-shrink-0">
                                    <Home className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="text-lg sm:text-2xl font-extrabold text-gray-900 truncate">{property.title}</h3>
                                    <p className="text-xs sm:text-gray-500 font-medium truncate">
                                      {typeof property.address === 'object' ? 
                                        `${property.address.street}, ${property.address.city}, ${property.address.state}` : 
                                        property.address}
                                    </p>
                                  </div>
                                </div>
                                <div className="self-start sm:self-auto">
                                  {renderStatusBadge(property.status)}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                <div className="py-2 sm:py-0 sm:px-8 first:pl-0 border-none">
                                  <div className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 sm:mb-2">
                                    <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>Status</span>
                                  </div>
                                  <p className="text-sm sm:text-xl font-bold text-gray-900 capitalize truncate">
                                    {property.status.replace('-', ' ')}
                                  </p>
                                </div>
                                <div className="py-2 sm:py-0 sm:px-8 border-none">
                                  <div className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 sm:mb-2">
                                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>Views</span>
                                  </div>
                                  <p className="text-xl sm:text-4xl font-black text-gray-900">{property.views || 0}</p>
                                </div>
                                <div className="py-2 sm:py-0 sm:px-8 border-none">
                                  <div className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 sm:mb-2">
                                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>Inquiries</span>
                                  </div>
                                  <p className="text-xl sm:text-4xl font-black text-gray-900">{property.inquiries || 0}</p>
                                </div>
                                <div className="py-2 sm:py-0 sm:px-8 last:pr-0 border-none">
                                  <div className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 sm:mb-2">
                                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>Price</span>
                                  </div>
                                  <p className="text-sm sm:text-xl font-black text-gray-900 truncate">
                                    {property.price ? `A$${property.price.toLocaleString('en-AU')}` : 'Not Set'}
                                  </p>
                                </div>
                              </div>
                            </>
                          );
                        })()
                      ) : (
                        <>
                          <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                            <div className="p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-2xl shadow-sm">
                              <Home className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg sm:text-2xl font-extrabold text-gray-900">Not Listed Yet</h3>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            <div className="py-2 sm:py-0 sm:px-8 first:pl-0 border-none">
                              <div className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 sm:mb-2">
                                <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Status</span>
                              </div>
                              <p className="text-sm sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
                                <Home className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-400" />
                                <span>None</span>
                              </p>
                            </div>
                            <div className="py-2 sm:py-0 sm:px-8 border-none">
                              <div className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 sm:mb-2">
                                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Interest</span>
                              </div>
                              <p className="text-xl sm:text-4xl font-black text-gray-900">0</p>
                            </div>
                            <div className="py-2 sm:py-0 sm:px-8 border-none">
                              <div className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 sm:mb-2">
                                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Offers</span>
                              </div>
                              <p className="text-xl sm:text-4xl font-black text-gray-900">0</p>
                            </div>
                            <div className="py-2 sm:py-0 sm:px-8 last:pr-0 border-none">
                              <div className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 sm:mb-2">
                                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Price</span>
                              </div>
                              <p className="text-sm sm:text-xl font-black text-gray-900">Not Set</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="h-2 sm:h-3 w-full bg-gray-100 shadow-inner">
                      <div className={`h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-sm ${activeListings.length > 0 ? 'w-full' : 'w-0'}`}></div>
                    </div>
                    <div className="px-4 sm:px-10 py-2 sm:py-3.5 bg-gray-50/80 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-[10px] sm:text-xs font-black text-gray-400 tracking-[0.2em] uppercase">
                        {activeListings.length > 0 ? '100% COMPLETE' : '0% COMPLETE'}
                      </span>
                    </div>
                  </div>

                  <aside className="rounded-[24px] border border-emerald-200 bg-emerald-50/80 p-6 text-emerald-950 shadow-[0_24px_70px_rgba(15,23,42,0.04)]">
                    <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200 bg-white/70">
                      <Bell className="h-5 w-5 text-emerald-700" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-800">Optimization Alert</p>
                    <h3 className="mt-3 text-2xl font-black tracking-tight">Improve your listing reach</h3>
                    <p className="mt-4 text-sm leading-6 text-emerald-900/80">
                      Add premium services from Marketplace to improve listing presentation while keeping your current seller workflow intact.
                    </p>
                    <button
                      onClick={() => router.push('/dashboards/seller/marketplace')}
                      className="mt-8 inline-flex items-center gap-2 border-b border-emerald-700 pb-1 text-sm font-bold text-emerald-950 transition hover:text-emerald-700"
                    >
                      View Marketplace
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </aside>
                </section>

                <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {isLoadingStats ? (
                    <div className="col-span-full rounded-[24px] border border-gray-200 bg-white p-8 text-center text-sm font-semibold text-gray-500 shadow-sm">
                      Loading seller metrics...
                    </div>
                  ) : statsError ? (
                    <div className="col-span-full">
                      <ErrorMessage message={statsError} onRetry={fetchStats} />
                    </div>
                  ) : (
                    [
                      { label: 'Total Properties', value: stats?.totalProperties ?? 0, detail: `${stats?.activeProperties ?? 0} active listings`, change: `${stats?.soldProperties ?? 0} sold` },
                      { label: 'Total Views', value: stats?.totalViews ?? 0, detail: 'Across your seller listings', change: 'Live' },
                      { label: 'Total Inquiries', value: stats?.totalInquiries ?? 0, detail: 'Buyer activity signals', change: 'Tracked' },
                      { label: 'Total Offers', value: stats?.totalOffers ?? 0, detail: `${stats?.pendingOffers ?? 0} pending offers`, change: `${stats?.acceptedOffers ?? 0} accepted` },
                    ].map((metric) => (
                      <div key={metric.label} className="rounded-[24px] border border-gray-200/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">{metric.label}</p>
                        <div className="mt-5 flex items-end gap-3">
                          <p className="text-5xl font-black tracking-tight text-black">{metric.value.toLocaleString()}</p>
                          <span className="mb-2 text-xs font-bold text-emerald-600">{metric.change}</span>
                        </div>
                        <p className="mt-4 text-sm leading-5 text-gray-500">{metric.detail}</p>
                      </div>
                    ))
                  )}
                </section>

                {/* Get Started Section */}
                <section className="space-y-5 sm:space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black tracking-tight text-gray-950">Get Started</h2>
                    <p className="text-sm sm:text-base text-gray-500">
                      You&apos;re in control <span className="font-bold text-gray-900">of your sale</span> – track interest, manage buyers, and move only when the price is right.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Add Property Card */}
                    <div className="flex flex-col justify-between rounded-[24px] border border-gray-200/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
                      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                        <Home className="h-7 w-7 text-emerald-700" />
                      </div>
                      <div className="mb-8 space-y-2">
                        <h3 className="text-2xl font-black tracking-tight text-gray-950">Add Property</h3>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">Start your listing – photos, price, and details.</p>
                      </div>
                      <button 
                        onClick={() => router.push('/dashboards/seller/add-property')}
                        className="w-full rounded-xl bg-black py-4 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-gray-900 active:scale-[0.98]"
                      >
                        Create Listing
                      </button>
                    </div>

                    {/* View Listings Card */}
                    <div className="flex flex-col justify-between rounded-[24px] border border-gray-200/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
                      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                        <Building2 className="h-7 w-7 text-gray-800" />
                      </div>
                      <div className="mb-8 space-y-2">
                        <h3 className="text-2xl font-black tracking-tight text-gray-950">View Listings</h3>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">Manage your active and pending property listings.</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('listings')}
                        className="w-full rounded-xl border border-gray-300 bg-white py-4 text-sm font-bold text-gray-950 transition hover:border-gray-950 active:scale-[0.98]"
                      >
                        View My Listings
                      </button>
                    </div>
                  </div>
                </section>

                {/* Buyer Activity Section */}
                <section className="space-y-5">
                  <h2 className="text-3xl font-black tracking-tight text-gray-950">Buyer Activity</h2>
                  <div className="flex flex-col items-center justify-center rounded-[24px] border border-gray-200/80 bg-white px-6 py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:py-20">
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
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">Seller Inventory</p>
                    <h2 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">My Listings</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">Manage your active and pending property listings without leaving the seller hub.</p>
                  </div>
                  <button 
                    onClick={() => router.push('/dashboards/seller/add-property')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-gray-900 sm:w-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>New Listing</span>
                  </button>
                </div>
                
                {isLoadingListings ? (
                  <div className="flex flex-col items-center justify-center py-16 sm:py-32 space-y-4">
                    <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-b-2 border-emerald-600"></div>
                    <p className="text-sm sm:text-base text-gray-500 font-medium">Fetching your properties...</p>
                  </div>
                ) : activeListings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {activeListings.map((property) => (
                      <div key={property.id} className="group flex flex-col gap-5 rounded-[24px] border border-gray-200/80 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-6 md:flex-row md:items-stretch">
                        <div className="h-44 w-full flex-shrink-0 overflow-hidden rounded-2xl shadow-sm md:h-auto md:w-56">
                          <img 
                            src={property.primaryImage || '/images/default-property.jpg'} 
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => (e.currentTarget.src = '/images/01.jpg')}
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1 sm:py-2 w-full">
                          <div className="space-y-2 sm:space-y-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <h4 className="truncate text-xl font-black tracking-tight text-gray-950 sm:text-2xl">{property.title}</h4>
                              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                                <OccupancyBadge property={property} />
                                {renderStatusBadge(property.status)}
                              </div>
                            </div>
                            <p className="text-xs sm:text-gray-500 font-medium flex items-center mb-3 sm:mb-4 truncate">
                              <Home className="w-3.5 h-3.5 mr-2 opacity-50" />
                              {typeof property.address === 'object' ? 
                                `${property.address.street}, ${property.address.city}, ${property.address.state}` : 
                                property.address}
                            </p>
                            <div className="flex w-fit flex-wrap items-center gap-3 rounded-xl bg-gray-50 px-3 py-2 text-[10px] font-bold text-gray-600 sm:gap-5 sm:px-4 sm:text-sm">
                              <span className="flex items-center"><Building2 className="w-3.5 h-3.5 mr-1.5 sm:mr-2 text-gray-400" />{property.beds}</span>
                              <span className="flex items-center"><Activity className="w-3.5 h-3.5 mr-1.5 sm:mr-2 text-gray-400" />{property.baths}</span>
                              <span className="flex items-center"><LayoutDashboard className="w-3.5 h-3.5 mr-1.5 sm:mr-2 text-gray-400" />{property.size} m²</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full flex-col justify-center gap-4 border-gray-100 sm:items-end md:w-auto md:border-l md:pl-6">
                          <div className="text-left sm:text-right">
                            <p className="text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                              {property.price != null
                                ? `A$${property.price.toLocaleString('en-AU')}`
                                : 'A$0'}
                            </p>
                            <div className="flex items-center justify-start sm:justify-end space-x-3 sm:space-x-4 mt-1 sm:mt-2 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                              <span>{property.views} views</span>
                              <span>•</span>
                              <span>{property.inquiries} inquiries</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3 w-full md:w-auto">
                            <button
                              onClick={() => handleEditOpen(property)}
                              className="flex-1 rounded-xl bg-black px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-gray-900 sm:text-sm md:flex-none"
                            >
                              Edit
                            </button>
                            <select 
                              value={property.status}
                              onChange={(e) => handleStatusChange(property.id, e.target.value)}
                              className="flex-1 cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold outline-none transition-all focus:ring-2 focus:ring-emerald-500 sm:px-4 sm:text-sm md:flex-none"
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
                  <div className="flex flex-col items-center justify-center rounded-[24px] border border-gray-200/80 bg-white px-6 py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:py-28">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 sm:h-20 sm:w-20">
                      <Building2 className="w-6 h-6 sm:w-10 sm:h-10 text-gray-300" />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">No properties yet</h3>
                      <p className="text-xs sm:text-sm text-gray-400 font-medium max-w-xs mx-auto">You haven't added any properties to your account yet.</p>
                    </div>
                    <button 
                      onClick={() => router.push('/dashboards/seller/add-property')}
                      className="mt-2 w-full rounded-xl bg-black px-8 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-gray-900 sm:w-auto sm:text-base"
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

      {/* Switch to Buyer Popup */}
      <Dialog open={isBuyerModalOpen} onOpenChange={(open) => setBuyerModalOpen(open)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Browse Homes</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={buyerChecks.unlockFee}
                onChange={(e) => setBuyerChecks((p) => ({ ...p, unlockFee: e.target.checked }))}
              />
              <span>
                I understand the {UNLOCK_FEE_LABEL} unlock fee is non-refundable and grants access to full listing details.
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={buyerChecks.noBypass}
                onChange={(e) => setBuyerChecks((p) => ({ ...p, noBypass: e.target.checked }))}
              />
              <span>I agree not to contact sellers directly or bypass the platform.</span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={buyerChecks.responsibility}
                onChange={(e) => setBuyerChecks((p) => ({ ...p, responsibility: e.target.checked }))}
              />
              <span>I acknowledge Only If is not responsible for the sale outcome or owner decisions.</span>
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              onClick={() => setBuyerModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                buyerAllChecked ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
              }`}
              disabled={!buyerAllChecked}
              onClick={handleAcceptBuyer}
            >
              Accept
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Property Modal — unified in-page edit flow (shared with listings page) */}
      {isEditModalOpen && (
        <EditPropertyModal
          isOpen={isEditModalOpen}
          onClose={handleEditClose}
          property={editingProperty}
          onUpdated={handlePropertyUpdated}
        />
      )}
    </div>
  );
};

export default SellerDashboard;
