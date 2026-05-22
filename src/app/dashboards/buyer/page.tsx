'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useBuyer } from '@/context/BuyerContext';
import { Navbar } from '@/components';
import NotificationsPanel from '@/components/buyer/NotificationsPanel';
import BuyerSidebar from '@/components/buyer/BuyerSidebar';
import {
  Bell, Heart, Search, Eye, Calendar, DollarSign, User,
  TrendingUp, TrendingDown, AlertCircle, Clock, CheckCircle,
  MapPin, Home, Bed, Bath, Car, ArrowRight, ClipboardList,
  Menu, X, LayoutDashboard, Settings, FileText,
  ChevronLeft, ChevronRight, Sparkles, Activity, MessageSquare,
  ShieldCheck, Headphones, PhoneCall, ArrowUpRight,
} from 'lucide-react';
import { formatPropertyAddress } from '@/utils/addressUtils';
import Modal from '@/components/reusable/Modal';
import { getSafeImageUrl } from '@/utils/imageUtils';
import { formatCurrencyCompact } from '@/utils/currency';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/reusable';
import { buyerApi } from '@/api/buyer';
import { propertiesApi } from '@/api/properties';
import { Property } from '@/types/api';

// Define DashboardStats interface
interface DashboardStats {
  savedProperties: number;
  viewedProperties: number;
  savedSearches: number;
  unreadNotifications: number;
}

// Property tracking interfaces
interface TrackedProperty {
  _id: string;
  title: string;
  address: string | object;
  price: number;
  salesStatus: 'contract-exchanged' | 'unconditional' | 'settled' | null;
  status: string;
  images: any[];
  mainImage?: any;
  primaryImage?: string;
  finalImageUrl?: any;
  beds?: number;
  baths?: number;
  carSpaces?: number;
  description?: string;
  agent?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  lastStatusUpdate?: string;
  dateAdded?: string;
  isWatching: boolean;
}

interface PropertyStatusUpdate {
  _id: string;
  property: TrackedProperty;
  previousStatus: string;
  newStatus: string;
  updatedAt: string;
  agent: {
    name: string;
    email: string;
  };
}

const getPropertyIdentifier = (property: any): string | null => {
  if (!property || typeof property !== 'object') return null;
  const candidate = property._id || property.id || property.slug;
  if (!candidate || typeof candidate !== 'string') return null;
  const normalized = candidate.trim();
  if (!normalized || normalized === 'undefined' || normalized === 'null') return null;
  return normalized;
};

type BuyerTab = 'overview' | 'notifications';

export default function BuyerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, addRole, setActiveRole } = useAuth();
  const {
    unlockedProperties,
    viewedProperties,
    scheduledViewings,
    activeOffers,
    recentActivity,
    loading,
    error,
    fetchBuyerData
  } = useBuyer();

  const [stats, setStats] = useState<DashboardStats>({
    savedProperties: 0,
    viewedProperties: 0,
    savedSearches: 0,
    unreadNotifications: 0
  });
  const [showNotifications, setShowNotifications] = useState(false);
  // Add modal state for property details
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [isPropertyModalOpen, setPropertyModalOpen] = useState(false);

  // Role switch modal state
  const [isSellerModalOpen, setSellerModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sellerChecks, setSellerChecks] = useState({
    terms: false,
    legalAuthorization: false,
    successFee: false,
    noBypass: false,
    upgrades: false,
    agentPartnerHelp: false,
  });

  const sellerAllChecked =
    sellerChecks.terms &&
    sellerChecks.legalAuthorization &&
    sellerChecks.successFee &&
    sellerChecks.noBypass &&
    sellerChecks.upgrades &&
    sellerChecks.agentPartnerHelp;

  const handleSwitchToSeller = async () => {
    if (user?.acceptedRoles?.seller) {
      setActiveRole('seller');
      router.push('/dashboards/seller');
    } else {
      setSellerModalOpen(true);
    }
  };

  const handleAcceptSeller = async () => {
    if (!sellerAllChecked) return;
    try {
      await addRole('seller');
      setActiveRole('seller');
      setSellerModalOpen(false);
      router.push('/dashboards/seller');
    } catch (err) {
      console.error('Error switching to seller:', err);
      toast.error('Failed to add seller role');
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    // In multi-role system, check roles array instead of legacy role field
    if (!user.roles.includes('buyer')) {
      router.push('/dashboard');
      return;
    }

    fetchBuyerData();
    fetchDashboardStats();
    fetchWatchlist();
    fetchStatusUpdates();
    fetchRecommendations();
  }, [user, authLoading, router]);

  // Property tracking state
  const [watchlist, setWatchlist] = useState<TrackedProperty[]>([]);
  const [statusUpdates, setStatusUpdates] = useState<PropertyStatusUpdate[]>([]);
  const [recommendations, setRecommendations] = useState<Property[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [activeTab, setActiveTab] = useState<BuyerTab>('overview');
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [loadingUpdates, setLoadingUpdates] = useState(false);

  // Updates tab: filter pill + locally dismissed entries (UI-only, no backend mutation)
  type UpdatesFilter = 'all' | 'alerts' | 'messages' | 'legal';
  const [updatesFilter, setUpdatesFilter] = useState<UpdatesFilter>('all');
  const [dismissedUpdates, setDismissedUpdates] = useState<Set<string>>(new Set());

  // Allow other buyer routes to deep-link back to a specific tab via ?tab=
  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam && ['overview', 'notifications'].includes(tabParam)) {
      setActiveTab(tabParam as BuyerTab);
    }
  }, [searchParams]);

  // Criteria State
  const [criteria, setCriteria] = useState<{
    minPrice: number;
    maxPrice: number;
    maxRooms: number;
  }>({
    minPrice: 0,
    maxPrice: 10000000,
    maxRooms: 10
  });
  const [isCriteriaModalOpen, setCriteriaModalOpen] = useState(false);
  const [hasSetCriteria, setHasSetCriteria] = useState(false);

  // Fetch recommendations
  const fetchRecommendations = async (searchCriteria = criteria, isSetting = hasSetCriteria) => {
    setLoadingRecommendations(true);
    try {
      const params: any = {
        status: 'active',
        limit: '6',
        page: '1'
      };

      if (isSetting) {
        if (searchCriteria.minPrice > 0) params.minPrice = searchCriteria.minPrice.toString();
        if (searchCriteria.maxPrice < 10000000) params.maxPrice = searchCriteria.maxPrice.toString();
        if (searchCriteria.maxRooms < 10) params.beds = searchCriteria.maxRooms.toString();
      }

      const result = await propertiesApi.getProperties(params);

      // LOGIC CHANGE: If we have criteria set but no properties were found,
      // fetch all published properties as a fallback.
      if (isSetting && (!result || !result.properties || result.properties.length === 0)) {
        const fallbackResult = await propertiesApi.getProperties({
          status: 'active',
          limit: '6',
          page: '1'
        });

        if (fallbackResult && fallbackResult.properties) {
          setRecommendations(fallbackResult.properties);
        } else {
          setRecommendations([]);
        }
      } else if (result && result.properties) {
        setRecommendations(result.properties || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleSetCriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSetCriteria(true);
    setCriteriaModalOpen(false);
    fetchRecommendations(criteria, true);
    toast.success('Criteria set successfully!');
  };

  const handleResetCriteria = () => {
    const defaultCriteria = { minPrice: 0, maxPrice: 10000000, maxRooms: 10 };
    setCriteria(defaultCriteria);
    setHasSetCriteria(false);
    setCriteriaModalOpen(false);
    fetchRecommendations(defaultCriteria, false);
    toast.success('Criteria reset');
  };

  // Safely resolve the property image for the modal
  const getModalImageUrl = (p: any) => {
    if (!p) return getSafeImageUrl('/images/01.jpg');

    // Try various known fields and handle string vs object formats
    if (Array.isArray(p.images) && p.images.length > 0) {
      const first = p.images[0];
      const img = typeof first === 'string' ? first : first?.url;
      return getSafeImageUrl(img);
    }

    if (p.mainImage) {
      const mi = typeof p.mainImage === 'string' ? p.mainImage : p.mainImage?.url;
      return getSafeImageUrl(mi);
    }

    if (p.primaryImage) {
      const pi = typeof p.primaryImage === 'string' ? p.primaryImage : p.primaryImage?.url;
      return getSafeImageUrl(pi);
    }

    if (p.finalImageUrl) {
      const fi = typeof p.finalImageUrl === 'string' ? p.finalImageUrl : p.finalImageUrl?.url;
      return getSafeImageUrl(fi);
    }

    return getSafeImageUrl('/images/01.jpg');
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/buyer/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch buyer watchlist
  const fetchWatchlist = async () => {
    setLoadingWatchlist(true);
    try {
      const response = await fetch('/api/buyer/watchlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setWatchlist(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      toast.error('Failed to load watchlist');
    } finally {
      setLoadingWatchlist(false);
    }
  };

  // Fetch property status updates
  const fetchStatusUpdates = async () => {
    setLoadingUpdates(true);
    try {
      const response = await fetch('/api/buyer/property-updates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStatusUpdates(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching status updates:', error);
      toast.error('Failed to load property updates');
    } finally {
      setLoadingUpdates(false);
    }
  };

  // Add/Remove property from watchlist
  const toggleWatchlist = async (propertyId: string, isCurrentlyWatching: boolean) => {
    if (!propertyId || propertyId === 'undefined' || propertyId === 'null') {
      toast.error('Unable to save this property. Missing property ID.');
      return;
    }

    // Optimistic Update
    const previousWatchlist = [...watchlist];

    if (isCurrentlyWatching) {
      setWatchlist(prev => prev.filter(p => p._id !== propertyId && (p as any).id !== propertyId));
    } else {
      // Find property in recommendations or unlockedProperties to add temporarily
      const propertyToAdd = recommendations.find(p => (p.id || p._id) === propertyId) ||
                          unlockedProperties.find(p => (p.id || p._id) === propertyId);

      if (propertyToAdd) {
        const newTrackedProperty: TrackedProperty = {
          _id: propertyId,
          title: propertyToAdd.title,
          address: propertyToAdd.address,
          price: propertyToAdd.price,
          salesStatus: propertyToAdd.salesStatus as any,
          status: propertyToAdd.status || 'active',
          images: propertyToAdd.images || [],
          isWatching: true
        };
        setWatchlist(prev => [newTrackedProperty, ...prev]);
      } else {
        // Just add an ID-only object if we can't find the full data
        setWatchlist(prev => [{ _id: propertyId, isWatching: true } as any, ...prev]);
      }
    }

    try {
      const response = await fetch(`/api/buyer/watchlist/${encodeURIComponent(propertyId)}`, {
        method: isCurrentlyWatching ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        if (isCurrentlyWatching) {
          toast.success('Property removed from watchlist');
        } else {
          toast.success('Property added to watchlist');
          // Fetch updated watchlist to ensure we have all correct metadata
          fetchWatchlist();
        }
        // Refresh dashboard stats to update saved properties count
        fetchDashboardStats();
      } else {
        // Revert if success is false
        setWatchlist(previousWatchlist);
        toast.error(data.message || 'Failed to update watchlist');
      }
    } catch (error) {
      // Revert on error
      setWatchlist(previousWatchlist);
      console.error('Error updating watchlist:', error);
      toast.error('Failed to update watchlist');
    }
  };

  const handleViewAll = (section: string) => {
    switch (section) {
      case 'unlocked':
        router.push('/buyer/unlocked-properties');
        break;
      case 'saved':
        router.push('/buyer/saved-properties');
        break;
      case 'viewed':
        router.push('/buyer/viewed-properties');
        break;
      case 'viewings':
        router.push('/buyer/scheduled-viewings');
        break;
      case 'offers':
        router.push('/buyer/active-offers');
        break;
      default:
        break;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f6fb]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f6fb]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-gray-950 mb-3">Error Loading Dashboard</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-900 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${Math.max(1, minutes)} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    return formatDate(dateString);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'contract-exchanged': return 'bg-amber-50 text-amber-700';
      case 'unconditional': return 'bg-blue-50 text-blue-700';
      case 'settled': return 'bg-emerald-50 text-emerald-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'contract-exchanged': return Clock;
      case 'unconditional': return AlertCircle;
      case 'settled': return CheckCircle;
      default: return Home;
    }
  };

  // Mobile menu tab items (Watchlist, Property Tracking, Messages are routes — rendered as Links below)
  const navItems: { key: BuyerTab; label: string; icon: typeof Home }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'notifications', label: 'Updates', icon: Bell },
  ];

  const tabLabel = navItems.find(n => n.key === activeTab)?.label ?? 'Overview';

  const firstName = (user.name || 'there').split(' ')[0];

  // Recently unlocked cards for the Overview "Recently Unlocked Access" row
  const unlockedAccessCards = (unlockedProperties || []).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6fb]">
      {/* Global Header */}
      <Navbar />

      {/* Mobile sticky bar for sidebar toggle */}
      <div className="sticky top-20 z-40 border-b border-gray-200/70 bg-[#f5f6fb]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold text-gray-950">{tabLabel}</p>
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
          <div className="pt-24 px-6 space-y-8">
            <nav className="flex flex-col space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 mb-2">Dashboard Menu</p>
              {navItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => { setActiveTab(key); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between py-4 px-3 rounded-xl transition-all cursor-pointer ${
                    activeTab === key
                      ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 shadow-sm'
                      : 'text-gray-900 font-bold border-b border-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${activeTab === key ? 'text-emerald-600' : 'text-gray-400'}`} />
                    {label}
                  </span>
                  {activeTab === key && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                </button>
              ))}

              <Link
                href="/dashboards/buyer/saved"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 py-4 px-3 border-b border-gray-50 text-gray-900 font-bold"
              >
                <Heart className="w-5 h-5 text-gray-400" /> Watchlist
              </Link>
              <Link
                href="/dashboards/buyer/tracking"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 py-4 px-3 border-b border-gray-50 text-gray-900 font-bold"
              >
                <TrendingUp className="w-5 h-5 text-gray-400" /> Property Tracking
              </Link>
              <Link
                href="/dashboards/buyer/messages"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 py-4 px-3 border-b border-gray-50 text-gray-900 font-bold"
              >
                <MessageSquare className="w-5 h-5 text-gray-400" /> Messages
              </Link>
              <Link
                href="/dashboards/buyer/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 py-4 px-3 border-b border-gray-50 text-gray-900 font-bold"
              >
                <Settings className="w-5 h-5 text-gray-400" /> Settings
              </Link>

              <button
                onClick={() => { handleSwitchToSeller(); setIsMobileMenuOpen(false); }}
                className="mt-6 w-full flex items-center justify-center gap-3 bg-emerald-50 text-emerald-700 border border-emerald-100 py-4 rounded-2xl font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                <Home className="h-5 w-5" />
                <span>Switch to Seller Mode</span>
              </button>
            </nav>

            <div className="pt-2">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-all cursor-pointer"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Body: Sidebar + Main */}
      <div className="flex w-full flex-1 bg-[#f5f6fb] lg:pl-[280px]">
        {/* Fixed Sidebar (shared with /dashboards/buyer/messages and other buyer routes) */}
        <BuyerSidebar
          activeKey={activeTab}
          onTabClick={(key) => setActiveTab(key)}
          user={user}
        />

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <main className="w-full">
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Welcome + Market Status */}
                <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="rounded-[28px] border border-gray-200/80 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.05)] sm:p-10">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">Buyer Dashboard</p>
                    <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                      Welcome back, {firstName}
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                      Your luxury real estate portfolio is performing beautifully. We&apos;ve identified
                      {' '}<span className="font-semibold text-gray-900">{recommendations.length || 'new'}</span>{' '}
                      opportunities aligned with your investment criteria.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => router.push('/buy')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-gray-900 cursor-pointer"
                      >
                        <Search className="h-4 w-4" />
                        <span>Browse All Homes</span>
                      </button>
                      <button
                        onClick={() => setCriteriaModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
                      >
                        <ClipboardList className="h-4 w-4" />
                        <span>{hasSetCriteria ? 'Update Criteria' : 'Set Criteria'}</span>
                      </button>
                      <button
                        onClick={handleSwitchToSeller}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
                      >
                        <Home className="h-4 w-4" />
                        <span>Switch to Seller</span>
                      </button>
                    </div>
                  </div>

                  {/* Market Status Widget */}
                  <aside className="rounded-[28px] border border-gray-200/80 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.05)]">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400">Market Status</p>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Bullish
                      </span>
                    </div>
                    <div className="mt-5">
                      <p className="text-4xl font-black tracking-tight text-gray-950">+12.4%</p>
                      <p className="mt-1 text-sm text-gray-500">YoY luxury index growth</p>
                    </div>
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-500">Avg. days on market</span>
                        <span className="font-bold text-gray-900">28 days</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-500">New listings this week</span>
                        <span className="font-bold text-gray-900">{recommendations.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-500">Status updates</span>
                        <span className="font-bold text-gray-900">{statusUpdates.length}</span>
                      </div>
                    </div>
                  </aside>
                </section>

                {/* For You + Recent Status Updates */}
                <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                  {/* For You */}
                  <div className="rounded-[28px] border border-gray-200/80 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.05)] sm:p-8">
                    <div className="mb-6 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400">Curated</p>
                        <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-950">For You</h2>
                      </div>
                      <Link
                        href="/buy"
                        className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
                      >
                        View all recommendations
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>

                    {loadingRecommendations ? (
                      <div className="flex justify-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                      </div>
                    ) : recommendations.length > 0 ? (
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-2">
                        {recommendations.slice(0, 2).map((property, idx) => {
                          const id = property._id || property.id;
                          const isWatching = watchlist.some(w =>
                            (w._id && (w._id === property._id || w._id === property.id)) ||
                            ((w as any).id && ((w as any).id === property._id || (w as any).id === property.id))
                          );
                          const badge = idx === 0 ? { label: 'New Listing', tone: 'bg-black text-white' } : { label: 'Price Drop', tone: 'bg-emerald-600 text-white' };
                          const image = (property as any).images?.[0]?.url || (property as any).mainImage?.url || (property as any).mainImage || '/images/01.jpg';
                          return (
                            <div
                              key={id}
                              className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                              onClick={() => {
                                setSelectedProperty(property);
                                setPropertyModalOpen(true);
                              }}
                            >
                              <div className="relative h-44 overflow-hidden">
                                <img
                                  src={getSafeImageUrl(image)}
                                  alt={property.title}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <span className={`absolute left-3 top-3 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm ${badge.tone}`}>
                                  {badge.label}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    const targetId = getPropertyIdentifier(property);
                                    if (!targetId) {
                                      toast.error('Unable to save this property right now.');
                                      return;
                                    }
                                    toggleWatchlist(targetId, isWatching);
                                  }}
                                  className="absolute right-3 top-3 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white"
                                  aria-label="Toggle watchlist"
                                >
                                  <Heart className={`h-4 w-4 ${isWatching ? 'fill-red-500 text-red-500' : ''}`} />
                                </button>
                              </div>
                              <div className="p-5">
                                <h3 className="truncate text-lg font-black tracking-tight text-gray-950">{property.title}</h3>
                                <p className="mt-1 flex items-center gap-1 truncate text-xs font-semibold text-gray-500">
                                  <MapPin className="h-3 w-3" />
                                  {typeof property.address === 'string' ? property.address : formatPropertyAddress(property.address)}
                                </p>
                                <div className="mt-4 flex items-center justify-between">
                                  <p className="text-xl font-black tracking-tight text-gray-950">{formatCurrencyCompact(property.price || 0)}</p>
                                  <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
                                    <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{property.beds ?? '—'}</span>
                                    <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{property.baths ?? '—'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-6 py-12 text-center">
                        <Sparkles className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-3 text-sm font-semibold text-gray-600">No matches yet. Set your criteria to unlock tailored picks.</p>
                        <button
                          onClick={() => setCriteriaModalOpen(true)}
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-gray-900 cursor-pointer"
                        >
                          <ClipboardList className="h-4 w-4" />
                          Set Criteria
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Recent Status Updates */}
                  <aside className="rounded-[28px] border border-gray-200/80 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.05)]">
                    <div className="mb-5 flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400">Recent Status Updates</p>
                      <button
                        onClick={() => router.push('/dashboards/buyer/tracking')}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                      >
                        View all
                      </button>
                    </div>
                    {loadingUpdates ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                      </div>
                    ) : statusUpdates.length > 0 ? (
                      <ul className="space-y-4">
                        {statusUpdates.slice(0, 4).map((update) => {
                          const StatusIcon = getStatusIcon(update.newStatus);
                          return (
                            <li
                              key={update._id}
                              className="cursor-pointer rounded-2xl border border-gray-100 p-4 transition hover:border-emerald-100 hover:bg-emerald-50/40"
                              onClick={() => router.push('/dashboards/buyer/tracking')}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`grid h-9 w-9 place-items-center rounded-xl ${getStatusColor(update.newStatus).split(' ')[0]}`}>
                                  <StatusIcon className={`h-4 w-4 ${getStatusColor(update.newStatus).split(' ')[1]}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-gray-950">
                                    {update.newStatus?.replace('-', ' ') || 'Status update'}
                                  </p>
                                  <p className="truncate text-xs font-semibold text-gray-500">
                                    {update.property?.title || 'Tracked property'}
                                  </p>
                                  <p className="mt-1 text-[11px] font-semibold text-gray-400">{formatRelativeTime(update.updatedAt)}</p>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-10 text-center">
                        <TrendingUp className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-3 text-xs font-semibold text-gray-500">No recent updates yet.</p>
                      </div>
                    )}
                  </aside>
                </section>

                {/* Your Watchlist */}
                <section className="rounded-[28px] border border-gray-200/80 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.05)] sm:p-8">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400">Saved</p>
                      <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-950">Your Watchlist</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push('/dashboards/buyer/saved')}
                        className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 cursor-pointer"
                        aria-label="Open saved properties"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push('/dashboards/buyer/saved')}
                        className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 cursor-pointer"
                        aria-label="Open saved properties"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {watchlist.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-6 py-14 text-center">
                      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm">
                        <Home className="h-6 w-6 text-gray-300" />
                      </div>
                      <h3 className="mt-4 text-base font-black tracking-tight text-gray-950">No saved properties yet</h3>
                      <p className="mt-2 mx-auto max-w-md text-sm text-gray-500">
                        Save properties you love to receive price alerts, availability updates, and private viewing invitations.
                      </p>
                      <button
                        onClick={() => router.push('/buy')}
                        className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-gray-900"
                      >
                        Explore Homes
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {watchlist.slice(0, 6).map((p) => (
                        <div
                          key={p._id}
                          className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          <div className="relative h-36 overflow-hidden">
                            <img
                              src={getSafeImageUrl(p.images?.[0]?.url || p.mainImage?.url || p.mainImage || '/images/01.jpg')}
                              alt={p.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <button
                              onClick={() => {
                                const targetId = getPropertyIdentifier(p);
                                if (!targetId) {
                                  toast.error('Unable to update watchlist for this property.');
                                  return;
                                }
                                toggleWatchlist(targetId, true);
                              }}
                              className="absolute right-2 top-2 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-white/90 text-red-500 shadow-sm backdrop-blur hover:bg-white"
                            >
                              <Heart className="h-4 w-4 fill-red-500" />
                            </button>
                          </div>
                          <div className="p-4">
                            <p className="truncate text-sm font-black text-gray-950">{p.title}</p>
                            <p className="mt-1 text-xs font-bold text-emerald-700">{formatCurrencyCompact(p.price || 0)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Recently Unlocked Access */}
                <section className="space-y-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400">Premium Access</p>
                      <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-950">Recently Unlocked Access</h2>
                    </div>
                    <Link
                      href="/dashboards/buyer/unlocked"
                      className="text-sm font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                    >
                      View all
                    </Link>
                  </div>

                  {unlockedAccessCards.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {unlockedAccessCards.map((property: any, idx: number) => {
                        const tags = ['Private Portfolio', 'Analysis', 'Exclusive Tour'];
                        const icons = [FileText, Activity, Eye];
                        const Icon = icons[idx % icons.length];
                        return (
                          <div
                            key={property.id || property._id}
                            className="group flex cursor-pointer flex-col rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
                            onClick={() => {
                              setSelectedProperty(property);
                              setPropertyModalOpen(true);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="grid h-11 w-11 place-items-center rounded-xl bg-black text-white">
                                <Icon className="h-5 w-5" />
                              </div>
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                                {tags[idx % tags.length]}
                              </span>
                            </div>
                            <h3 className="mt-6 text-lg font-black tracking-tight text-gray-950">{property.title || 'Unlocked property'}</h3>
                            <p className="mt-2 text-sm text-gray-500">
                              {typeof property.address === 'string' ? property.address : formatPropertyAddress(property.address)}
                            </p>
                            <div className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
                              Open Access <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {[
                        { tag: 'Private Portfolio', icon: FileText, title: 'Modernist Sanctuary', desc: 'Complete structural plans and historical context.' },
                        { tag: 'Analysis', icon: Activity, title: 'Investment ROI Deck', desc: 'Projected internal yield and appreciation curves.' },
                        { tag: 'Exclusive Tour', icon: Eye, title: 'Drone Cinema Reel', desc: 'Cinematic fly-through of every interior and exterior space.' },
                      ].map(({ tag, icon: Icon, title, desc }) => (
                        <div
                          key={title}
                          className="flex flex-col rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)]"
                        >
                          <div className="flex items-start justify-between">
                            <div className="grid h-11 w-11 place-items-center rounded-xl bg-black text-white">
                              <Icon className="h-5 w-5" />
                            </div>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                              {tag}
                            </span>
                          </div>
                          <h3 className="mt-6 text-lg font-black tracking-tight text-gray-950">{title}</h3>
                          <p className="mt-2 text-sm text-gray-500">{desc}</p>
                          <button
                            onClick={() => router.push('/buy')}
                            className="mt-6 inline-flex cursor-pointer items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800"
                          >
                            Unlock Access <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeTab === 'notifications' && (() => {
              // Map each real status update into a typed timeline entry.
              // We only have status changes from the buyer API; other categories
              // render an honest empty state instead of fabricated content.
              const baseUpdates = (statusUpdates || [])
                .filter(u => !dismissedUpdates.has(u._id))
                .map(u => ({
                  id: u._id,
                  category: 'alerts' as const,
                  title: u.newStatus === 'price-drop'
                    ? `Price Reduction Alert: ${u.property?.title || 'Tracked property'}`
                    : `${(u.newStatus || 'Status update').replace('-', ' ')}: ${u.property?.title || 'Tracked property'}`,
                  description: u.previousStatus
                    ? `Status changed from "${u.previousStatus.replace('-', ' ')}" to "${(u.newStatus || 'updated').replace('-', ' ')}"${u.agent?.name ? ` by ${u.agent.name}` : ''}.`
                    : `New status update on a property in your watchlist.`,
                  status: u.newStatus,
                  timestamp: u.updatedAt,
                  raw: u,
                }));

              const filtered = baseUpdates.filter(item =>
                updatesFilter === 'all' ? true : item.category === updatesFilter
              );

              // Group by yyyy-mm-dd for date headers
              const groups = filtered.reduce<Record<string, typeof filtered>>((acc, item) => {
                const key = new Date(item.timestamp).toISOString().slice(0, 10);
                (acc[key] ||= []).push(item);
                return acc;
              }, {});

              const sortedKeys = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1));

              const dayLabel = (key: string) => {
                const d = new Date(key);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
                if (same(d, today)) return 'Today';
                if (same(d, yesterday)) return 'Yesterday';
                return d.toLocaleDateString('en-AU', { weekday: 'long' });
              };

              const dayDate = (key: string) =>
                new Date(key).toLocaleDateString('en-AU', { month: 'long', day: 'numeric' }).toUpperCase();

              const filters: { key: UpdatesFilter; label: string; icon: typeof Bell }[] = [
                { key: 'all', label: 'All Activity', icon: Activity },
                { key: 'alerts', label: 'Property Alerts', icon: Bell },
                { key: 'messages', label: 'Agent Messages', icon: MessageSquare },
                { key: 'legal', label: 'Legal & Escrow', icon: ShieldCheck },
              ];

              // Status overview tiles derive from real buyer state
              const activeAlerts = baseUpdates.length;
              const messagesCount = stats?.unreadNotifications ?? 0;
              const pendingDocs = 0; // No backend feed → honest zero
              const showingsCount = Array.isArray(scheduledViewings) ? scheduledViewings.length : 0;

              const overviewTiles = [
                { label: 'Active Alerts', value: activeAlerts },
                { label: 'Messages', value: messagesCount },
                { label: 'Pending Docs', value: pendingDocs },
                { label: 'Showings', value: showingsCount },
              ];

              return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {/* Header */}
                  <div>
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">Notifications</p>
                    <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">Portfolio Updates</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                      Real-time alerts, direct agent communications, and status tracking for your high-value property interests.
                    </p>
                  </div>

                  {/* Filter pills */}
                  <div className="flex flex-wrap gap-2">
                    {filters.map(({ key, label, icon: Icon }) => {
                      const active = updatesFilter === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setUpdatesFilter(key)}
                          className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                            active
                              ? 'bg-black text-white shadow-lg shadow-black/10'
                              : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-gray-400'}`} />
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Timeline + Right Sidebar */}
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    {/* Timeline */}
                    <div className="space-y-8">
                      {loadingUpdates ? (
                        <div className="flex justify-center py-20">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
                        </div>
                      ) : updatesFilter === 'messages' ? (
                        <div className="rounded-[28px] border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
                          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gray-50">
                            <MessageSquare className="h-6 w-6 text-gray-300" />
                          </div>
                          <h3 className="mt-4 text-lg font-black tracking-tight text-gray-950">No agent messages yet</h3>
                          <p className="mt-2 mx-auto max-w-sm text-sm text-gray-500">
                            Direct agent conversations and replies will appear here as soon as they come in.
                          </p>
                          <button
                            onClick={() => router.push('/dashboards/buyer/messages')}
                            className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-gray-900"
                          >
                            Open Messages
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      ) : updatesFilter === 'legal' ? (
                        <div className="rounded-[28px] border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
                          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gray-50">
                            <ShieldCheck className="h-6 w-6 text-gray-300" />
                          </div>
                          <h3 className="mt-4 text-lg font-black tracking-tight text-gray-950">No documents pending</h3>
                          <p className="mt-2 mx-auto max-w-sm text-sm text-gray-500">
                            Contracts, signatures, and escrow paperwork will surface here when action is required.
                          </p>
                        </div>
                      ) : sortedKeys.length === 0 ? (
                        <div className="rounded-[28px] border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
                          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gray-50">
                            <Bell className="h-6 w-6 text-gray-300" />
                          </div>
                          <h3 className="mt-4 text-lg font-black tracking-tight text-gray-950">You&apos;re all caught up</h3>
                          <p className="mt-2 mx-auto max-w-sm text-sm text-gray-500">
                            New property alerts and agent updates will appear here as soon as they happen.
                          </p>
                        </div>
                      ) : (
                        sortedKeys.map((dayKey) => {
                          const items = groups[dayKey];
                          return (
                            <section key={dayKey} className="relative">
                              {/* Day label */}
                              <div className="mb-4 flex items-baseline gap-3">
                                <span className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                                  {dayLabel(dayKey)}
                                </span>
                                <span className="text-[11px] font-bold text-gray-300">— {dayDate(dayKey)}</span>
                              </div>

                              {/* Vertical rail + cards */}
                              <ol className="relative space-y-4 border-l border-gray-200 pl-6">
                                {items.map((item) => {
                                  const Icon = getStatusIcon(item.status);
                                  const statusTone = getStatusColor(item.status);
                                  return (
                                    <li key={item.id} className="relative">
                                      {/* timeline dot */}
                                      <span className="absolute -left-[31px] top-5 grid h-10 w-10 place-items-center rounded-full border-4 border-[#f5f6fb] bg-black text-white shadow-sm">
                                        <Icon className="h-4 w-4" />
                                      </span>

                                      <article className="group rounded-[24px] border border-gray-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-6">
                                        <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                          <div className="min-w-0">
                                            <h3 className="truncate text-base font-black tracking-tight text-gray-950 sm:text-lg">
                                              {item.title}
                                            </h3>
                                            <p className="mt-1 text-xs font-semibold text-gray-400">{formatRelativeTime(item.timestamp)}</p>
                                          </div>
                                          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${statusTone}`}>
                                            {item.status?.replace('-', ' ') || 'update'}
                                          </span>
                                        </header>

                                        <p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p>

                                        <div className="mt-5 inline-flex max-w-full items-center gap-2 truncate rounded-xl bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
                                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                          <span className="truncate">{formatPropertyAddress(item.raw.property?.address)}</span>
                                          {item.raw.property?.price ? (
                                            <span className="ml-2 font-black text-emerald-700">
                                              {formatCurrencyCompact(item.raw.property.price)}
                                            </span>
                                          ) : null}
                                        </div>

                                        <div className="mt-5 flex flex-wrap items-center gap-2">
                                          <button
                                            onClick={() => router.push('/dashboards/buyer/tracking')}
                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-gray-900"
                                          >
                                            Review Changes
                                            <ArrowRight className="h-3.5 w-3.5" />
                                          </button>
                                          <button
                                            onClick={() => setDismissedUpdates((s) => new Set(s).add(item.id))}
                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                                          >
                                            Dismiss
                                          </button>
                                        </div>
                                      </article>
                                    </li>
                                  );
                                })}
                              </ol>
                            </section>
                          );
                        })
                      )}
                    </div>

                    {/* Right Sidebar */}
                    <aside className="space-y-5">
                      {/* Status Overview */}
                      <div className="rounded-[24px] bg-gray-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400">Status Overview</p>
                        <div className="mt-5 grid grid-cols-2 gap-4">
                          {overviewTiles.map((tile) => (
                            <div key={tile.label} className="rounded-2xl bg-white/5 p-4">
                              <p className="text-3xl font-black tracking-tight">{String(tile.value).padStart(2, '0')}</p>
                              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">{tile.label}</p>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => router.push('/buy')}
                          className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white text-gray-950 px-4 py-2.5 text-xs font-bold transition hover:bg-gray-100"
                        >
                          Download Weekly Report
                        </button>
                      </div>

                      {/* Market Trends */}
                      <div className="rounded-[24px] border border-gray-200/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
                        <div className="mb-4 flex items-center justify-between">
                          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400">Market Trends</p>
                          <TrendingUp className="h-4 w-4 text-emerald-600" />
                        </div>
                        {watchlist.length > 0 ? (
                          <ul className="space-y-3">
                            {watchlist.slice(0, 3).map((p) => (
                              <li key={p._id} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3">
                                <img
                                  src={getSafeImageUrl(p.images?.[0]?.url || p.mainImage?.url || p.mainImage || '/images/01.jpg')}
                                  alt={p.title}
                                  className="h-10 w-10 rounded-xl object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-black text-gray-950">{p.title}</p>
                                  <p className="text-[11px] font-semibold text-emerald-700">{formatCurrencyCompact(p.price || 0)}</p>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center">
                            <TrendingDown className="mx-auto h-6 w-6 text-gray-300" />
                            <p className="mt-2 text-xs font-semibold text-gray-500">Save properties to your watchlist to see trends.</p>
                          </div>
                        )}
                      </div>

                      {/* Private Concierge */}
                      <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                          <Headphones className="h-5 w-5" />
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-800">Private Concierge</p>
                        <h3 className="mt-1 text-base font-black tracking-tight text-gray-950">Have questions about your portfolio?</h3>
                        <p className="mt-2 text-xs font-semibold text-emerald-900/70">
                          Our dedicated team is available 24/7 to help with high-value property decisions.
                        </p>
                        <button
                          onClick={() => router.push('/dashboards/buyer/messages')}
                          className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-gray-900"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                          Open Concierge Chat
                        </button>
                      </div>
                    </aside>
                  </div>
                </div>
              );
            })()}
          </main>
        </div>
      </div>

      {/* Global green footer is rendered once by AppReadyShell; it auto-offsets past #buyer-sidebar. */}

      {/* Notifications Panel (Drawer) */}
      {showNotifications && (
        <NotificationsPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Criteria Modal */}
      <Modal
        isOpen={isCriteriaModalOpen}
        onClose={() => setCriteriaModalOpen(false)}
        title="Set Your Buying Criteria"
        size="md"
      >
        <form onSubmit={handleSetCriteria} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Min Price (A$)</label>
              <input
                type="number"
                value={criteria.minPrice}
                onChange={(e) => setCriteria({ ...criteria, minPrice: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="e.g. 500000"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Max Price (A$)</label>
              <input
                type="number"
                value={criteria.maxPrice}
                onChange={(e) => setCriteria({ ...criteria, maxPrice: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="e.g. 2000000"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Max Rooms</label>
              <select
                value={criteria.maxRooms}
                onChange={(e) => setCriteria({ ...criteria, maxRooms: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>Up to {num} Rooms</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleResetCriteria}
              className="w-full sm:flex-1 py-3 border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
            >
              Reset
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-all shadow-md cursor-pointer"
            >
              Apply Criteria
            </button>
          </div>
        </form>
      </Modal>

      {/* Property Details Modal */}
      <Modal
        isOpen={isPropertyModalOpen}
        onClose={() => {
          setPropertyModalOpen(false);
          setSelectedProperty(null);
        }}
        title={selectedProperty?.title || 'Property Details'}
        size="lg"
      >
        {selectedProperty && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={getModalImageUrl(selectedProperty)}
                alt={selectedProperty.title || 'Property'}
                className="w-full h-56 object-cover rounded"
              />

              {/* Add to Watchlist Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const targetId = getPropertyIdentifier(selectedProperty);
                  if (!targetId) {
                    toast.error('Unable to update watchlist for this property.');
                    return;
                  }
                  const isWatching = watchlist.some(p => getPropertyIdentifier(p) === targetId);
                  toggleWatchlist(targetId, isWatching);
                }}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 cursor-pointer"
              >
                <Heart
                  className={`h-5 w-5 ${
                    watchlist.some(p => getPropertyIdentifier(p) === getPropertyIdentifier(selectedProperty))
                      ? 'text-red-500 fill-current'
                      : 'text-gray-400'
                  }`}
                />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedProperty.title || 'Untitled'}
              </h3>
              <p className="text-gray-700 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {formatPropertyAddress(selectedProperty.address)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-sm text-gray-600">
                Price:
                <span className="ml-2 font-semibold text-emerald-700">
                  {selectedProperty.price ? formatCurrencyCompact(selectedProperty.price) : '—'}
                </span>
              </div>

              <div className="flex items-center justify-start gap-2">
                <Bed className="h-5 w-5 text-gray-700" />
                <span className="text-lg font-semibold text-gray-900">
                  {selectedProperty.beds ?? '—'} beds
                </span>
              </div>

              <div className="flex items-center justify-start gap-2">
                <Bath className="h-5 w-5 text-gray-700" />
                <span className="text-lg font-semibold text-gray-900">
                  {selectedProperty.baths ?? '—'} baths
                </span>
              </div>

              <div className="flex items-center justify-start gap-2">
                <Car className="h-5 w-5 text-gray-700" />
                <span className="text-lg font-semibold text-gray-900">
                  {selectedProperty.carSpaces ?? selectedProperty.parkingSpaces ?? '—'} cars
                </span>
              </div>
            </div>

            {selectedProperty.description && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Description</h4>
                <p className="text-sm text-gray-700">{selectedProperty.description}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                {watchlist.some(p => getPropertyIdentifier(p) === getPropertyIdentifier(selectedProperty)) ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    In Watchlist
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">Click heart to add to watchlist</span>
                )}
              </div>

              <button
                onClick={() => {
                  setPropertyModalOpen(false);
                  setSelectedProperty(null);
                }}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Switch to Seller Popup */}
      <Dialog open={isSellerModalOpen} onOpenChange={(open) => setSellerModalOpen(open)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>List My Home</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={sellerChecks.terms}
                onChange={(e) => setSellerChecks((p) => ({ ...p, terms: e.target.checked }))}
              />
              <span>
                I agree to the Terms and Conditions
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={sellerChecks.legalAuthorization}
                onChange={(e) => setSellerChecks((p) => ({ ...p, legalAuthorization: e.target.checked }))}
              />
              <span>I confirm I am legally authorised to list the property on Only If.</span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={sellerChecks.successFee}
                onChange={(e) => setSellerChecks((p) => ({ ...p, successFee: e.target.checked }))}
              />
              <span>
                I agree to a 1.1% (inc. GST) success fee if a buyer from Only If purchases my property.
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={sellerChecks.noBypass}
                onChange={(e) => setSellerChecks((p) => ({ ...p, noBypass: e.target.checked }))}
              />
              <span>I will not attempt to bypass the platform or agent once a buyer is introduced.</span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={sellerChecks.upgrades}
                onChange={(e) => setSellerChecks((p) => ({ ...p, upgrades: e.target.checked }))}
              />
              <span>I understand premium listings and AI features may incur additional costs.</span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={sellerChecks.agentPartnerHelp}
                onChange={(e) => setSellerChecks((p) => ({ ...p, agentPartnerHelp: e.target.checked }))}
              />
              <span>I am interested in professional agent help to sell my property.</span>
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
              onClick={() => setSellerModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                sellerAllChecked ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'
              }`}
              disabled={!sellerAllChecked}
              onClick={handleAcceptSeller}
            >
              Accept
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
