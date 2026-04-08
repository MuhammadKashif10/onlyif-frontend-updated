'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useBuyer } from '@/context/BuyerContext';
import { Navbar, PropertyCard } from '@/components';
import NotificationsPanel from '@/components/buyer/NotificationsPanel';
import { 
  Bell, Heart, Search, Eye, Calendar, DollarSign, User, 
  TrendingUp, AlertCircle, Clock, CheckCircle, Star, 
  MapPin, Home, Bed, Bath, Car, ArrowRight, ClipboardList,
  Menu, X
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

export default function BuyerDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, addRole, setActiveRole } = useAuth();
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
  const [activeTab, setActiveTab] = useState<'overview' | 'watchlist' | 'tracking' | 'notifications'>('overview');
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [loadingUpdates, setLoadingUpdates] = useState(false);

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
    try {
      const response = await fetch(`/api/buyer/watchlist/${propertyId}`, {
        method: isCurrentlyWatching ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        if (isCurrentlyWatching) {
          setWatchlist(prev => prev.filter(p => p._id !== propertyId && p.id !== propertyId));
          toast.success('Property removed from watchlist');
        } else {
          toast.success('Property added to watchlist');
          fetchWatchlist(); // Refresh the full list to get updated status and metadata
        }
      }
    } catch (error) {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
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

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'contract-exchanged': return 'bg-yellow-100 text-yellow-800';
      case 'unconditional': return 'bg-blue-100 text-blue-800';
      case 'settled': return 'bg-green-100 text-green-800';
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar - Matching Seller Dashboard Style */}
      <header className="h-16 sm:h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-50 w-full">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <img src="/images/logo.PNG" alt="Only If" className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto transition-transform duration-200" />
          </Link>
        </div>

        {/* Center: Main Site Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          <Link href="/buy" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">Buy</Link>
          <Link href="/sell" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">Sell</Link>
          <Link href="/how-it-works" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">How it Works</Link>
          <Link href="/agents" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">Agents</Link>
        </nav>

        {/* Right: Dashboard & Sign Out */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link 
            href="/dashboard"
            className="hidden md:block text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Dashboard
          </Link>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/signin');
            }}
            className="hidden md:block text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors"
          >
            Sign Out
          </button>
          
          <div className="flex items-center space-x-2 sm:space-x-3 sm:pl-4 sm:border-l border-gray-200">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 relative"
            >
              <Bell className="w-5 h-5" />
              {stats.unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex-shrink-0">
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'B'}&background=10b981&color=fff`} 
                alt="User" 
                className="w-full h-full object-cover" 
              />
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white pt-20 px-6 space-y-6">
          <nav className="flex flex-col space-y-4">
            <Link href="/buy" className="text-lg font-bold text-gray-900 py-3 border-b border-gray-50 flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
              Buy <ArrowRight className="w-4 h-4 text-gray-300" />
            </Link>
            <Link href="/sell" className="text-lg font-bold text-gray-900 py-3 border-b border-gray-50 flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
              Sell <ArrowRight className="w-4 h-4 text-gray-300" />
            </Link>
            <Link href="/how-it-works" className="text-lg font-bold text-gray-900 py-3 border-b border-gray-50 flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
              How it Works <ArrowRight className="w-4 h-4 text-gray-300" />
            </Link>
            <Link href="/agents" className="text-lg font-bold text-gray-900 py-3 border-b border-gray-50 flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
              Agents <ArrowRight className="w-4 h-4 text-gray-300" />
            </Link>
            <Link href="/dashboard" className="text-lg font-bold text-emerald-600 py-3 border-b border-gray-50 flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
              Dashboard <ArrowRight className="w-4 h-4 text-emerald-100" />
            </Link>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/signin');
                setIsMobileMenuOpen(false);
              }}
              className="text-left text-lg font-bold text-red-600 py-3 flex items-center justify-between"
            >
              Sign Out <ArrowRight className="w-4 h-4 text-red-100" />
            </button>
          </nav>
          <div className="pt-6">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg"
            >
              Close Menu
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* 1. Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="text-center lg:text-left">
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">Welcome back, {user.name}! 👋</h1>
            <p className="text-sm sm:text-lg text-gray-500 mt-2 font-medium">These homes aren't on the market — but they could be yours.</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full sm:w-auto">
            <button
              onClick={() => router.push('/buy')}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md"
            >
              <Search className="w-4 h-4" />
              <span className="whitespace-nowrap">Browse All Homes</span>
            </button>
            <button
              onClick={handleSwitchToSeller}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 rounded-full border-2 border-emerald-100 text-emerald-600 font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span className="whitespace-nowrap">Switch to Seller</span>
            </button>
          </div>
        </div>

        {/* 2. Main Content — Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-12">
          {/* Left Column (wider) */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            {/* Recommended for You */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8">
              <div className="flex items-center justify-between mb-6 sm:mb-8 gap-2">
                <h2 className="text-base sm:text-2xl font-bold text-gray-900 leading-tight">For You</h2>
                <Link href="/buy" className="text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-1 transition-colors text-xs sm:text-base whitespace-nowrap">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              {loadingRecommendations ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-6">
                  {hasSetCriteria && recommendations.some(p => {
                    // This is a simple client-side check to see if the property matches criteria
                    // It helps determine if we are showing fallback results
                    const matchesPrice = p.price >= criteria.minPrice && p.price <= criteria.maxPrice;
                    const matchesBeds = !criteria.maxRooms || (p.beds && p.beds <= criteria.maxRooms);
                    return matchesPrice && matchesBeds;
                  }) === false && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <p className="text-sm text-amber-800 font-medium">
                        No properties match your exact criteria. Showing all available homes instead.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.slice(0, 3).map((property) => (
                      <PropertyCard
                        key={property.id || property._id}
                        id={property.id || property._id}
                        title={property.title}
                        address={typeof property.address === 'string' ? property.address : formatPropertyAddress(property.address)}
                        price={property.price}
                        beds={property.beds}
                        baths={property.baths}
                        size={property.size}
                        image={property.images?.[0]?.url || property.mainImage?.url || property.mainImage || '/images/01.jpg'}
                        carSpaces={property.carSpaces}
                        isWatched={watchlist.some(w => 
                          (w._id && (w._id === property.id || w._id === property._id)) ||
                          (w.id && (w.id === property.id || w.id === property._id))
                        )}
                        onToggleWatchlist={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          const id = property.id || property._id;
                          if (!id) return;
                          
                          const isWatching = watchlist.some(w => 
                            (w._id && (w._id === property.id || w._id === property._id)) ||
                            (w.id && (w.id === property.id || w.id === property._id))
                          );
                          toggleWatchlist(id, isWatching);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Home className="w-6 h-6 text-gray-300" />
                  </div>
                  {hasSetCriteria ? (
                    <>
                      <p className="text-gray-900 font-bold mb-1">No matching properties found.</p>
                      <p className="text-gray-500 font-medium text-sm mb-6">Try broadening your criteria or browse all available properties below.</p>
                    </>
                  ) : (
                    <p className="text-gray-500 font-medium">No recommendations yet. Set your criteria to get matches.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (narrower) */}
          <div className="lg:col-span-4 space-y-6 sm:space-y-8">
            {/* Set Your Buying Criteria card at top */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-6 sm:p-8 pb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-50 p-2 rounded-lg">
                    <ClipboardList className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900">Set Your Buying Criteria</h3>
                </div>
                <p className="text-[10px] sm:text-sm font-bold text-gray-900 mb-2">
                  {hasSetCriteria ? 'Current: ' + formatCurrencyCompact(criteria.minPrice) + ' - ' + formatCurrencyCompact(criteria.maxPrice) : 'Get better matches & alerts early'}
                </p>
                <p className="text-[10px] sm:text-sm text-gray-500 mb-6 leading-relaxed">
                  Select your suburbs, set your price range, and choose property types to get notified of early matches.
                </p>
              </div>
              <div className="relative h-32 sm:h-40 mx-4 sm:mx-8 rounded-2xl overflow-hidden mb-6">
                <img 
                  src="/images/01.jpg" 
                  alt="Property" 
                  className="w-full h-full object-cover blur-[2px] brightness-75" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                     <Heart className="w-6 h-6 text-white" />
                   </div>
                </div>
              </div>
              <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex flex-col gap-3">
                <button
                  onClick={() => setCriteriaModalOpen(true)}
                  className="w-full py-2.5 sm:py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  <ClipboardList className="w-4 h-4" />
                  {hasSetCriteria ? 'Update Criteria' : 'Set My Criteria'}
                </button>
                <button
                  onClick={() => router.push('/buy')}
                  className="w-full py-2.5 sm:py-3 border-2 border-emerald-100 text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Search className="w-4 h-4" />
                  Browse All Homes
                </button>
              </div>
            </div>

            {/* Your Watchlist card below */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-emerald-50 p-2 rounded-lg">
                    <Heart className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900">Your Watchlist</h3>
                </div>
                
                {watchlist.length === 0 ? (
                  <div className="space-y-6">
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
                      You haven't saved any properties yet. Browse homes and tap the heart ❤️ to add favorites to your watchlist.
                    </p>
                    <div className="relative h-32 sm:h-40 rounded-2xl overflow-hidden">
                      <img 
                        src="/images/02.jpg" 
                        alt="Watchlist placeholder" 
                        className="w-full h-full object-cover brightness-90" 
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm">
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/buy')}
                      className="w-full py-2.5 sm:py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md text-sm"
                    >
                      Browse All Homes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {watchlist.slice(0, 2).map(p => (
                      <div key={p._id} className="flex gap-3 sm:gap-4 items-center p-2 sm:p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-50">
                        <img 
                          src={getSafeImageUrl(p.images?.[0]?.url || p.mainImage?.url || p.mainImage || '/images/01.jpg')} 
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover shadow-sm"
                          alt={p.title}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 truncate text-[10px] sm:text-sm">{p.title}</h4>
                          <p className="text-[10px] sm:text-xs text-emerald-600 font-bold">{formatCurrencyCompact(p.price || 0)}</p>
                        </div>
                        <button onClick={() => toggleWatchlist(p._id || p.id, true)} className="p-1">
                          <Heart className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-red-500 fill-red-500" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setActiveTab('watchlist')}
                      className="w-full py-2.5 sm:py-3 border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all text-xs sm:text-sm"
                    >
                      View Full Watchlist
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Tabs (keep existing style but with new colors) */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10">
          <div className="border-b border-gray-100">
            <nav className="flex flex-wrap px-4 sm:px-8">
              {[
                { key: 'overview', label: 'Overview', icon: Home },
                { key: 'watchlist', label: 'Watchlist', icon: Star },
                { key: 'tracking', label: 'Property Tracking', icon: TrendingUp },
                { key: 'notifications', label: 'Updates', icon: Bell },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-5 text-[10px] sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                    activeTab === key
                      ? 'border-emerald-600 text-emerald-600 bg-emerald-50/30'
                      : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${activeTab === key ? 'text-emerald-600' : 'text-gray-400'}`} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-8">
            {/* Tab Content (Mostly preserved existing logic) */}
            {activeTab === 'overview' && (
              <div className="space-y-12">
                {/* Unlocked Properties */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base sm:text-xl font-extrabold text-gray-900">Recently Unlocked</h2>
                    <Link href="/buyer/unlocked-properties" className="text-xs sm:text-sm font-bold text-emerald-600 hover:underline">
                      View All
                    </Link>
                  </div>
                  
                  {unlockedProperties && unlockedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {unlockedProperties.slice(0, 4).map((property) => (
                        <div
                          key={property.id || property._id}
                          className="group border border-gray-100 rounded-2xl p-4 hover:shadow-xl hover:border-emerald-100 transition-all cursor-pointer bg-white"
                          onClick={() => {
                            setSelectedProperty(property);
                            setPropertyModalOpen(true);
                          }}
                        >
                          <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                            <img 
                              src={getSafeImageUrl(property.images?.[0]?.url || property.mainImage?.url || '/images/01.jpg')}
                              alt={property.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-2 right-2">
                               <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm">
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                               </div>
                            </div>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-1 truncate">{property.title}</h3>
                          <p className="text-xs text-gray-500 mb-3 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {formatPropertyAddress(property.address)}
                          </p>
                          <p className="text-lg font-black text-emerald-600">
                            {formatCurrencyCompact(property.price || 0)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                      <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Heart className="w-8 h-8 text-gray-200" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No unlocked properties</h3>
                      <p className="text-gray-500 max-w-xs mx-auto mb-6 px-4">Start browsing properties to unlock full details and owner contact!</p>
                      <button 
                        onClick={() => router.push('/buy')}
                        className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md"
                      >
                        Explore Homes
                      </button>
                    </div>
                  )}
                </div>

                {/* Status Updates */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base sm:text-xl font-extrabold text-gray-900">Recent Status Updates</h2>
                    <button 
                      onClick={() => setActiveTab('tracking')}
                      className="text-xs sm:text-sm font-bold text-emerald-600 hover:underline"
                    >
                      View History
                    </button>
                  </div>
                  
                  {statusUpdates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {statusUpdates.slice(0, 4).map((update) => {
                        const StatusIcon = getStatusIcon(update.newStatus);
                        return (
                          <div key={update._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 p-4 sm:p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getStatusColor(update.newStatus).split(' ')[0]}`}>
                              <StatusIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${getStatusColor(update.newStatus).split(' ')[1]}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 truncate text-sm sm:text-base">{update.property.title}</h4>
                              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                                Changed to <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${getStatusColor(update.newStatus)}`}>
                                  {update.newStatus?.replace('-', ' ') || 'Updated'}
                                </span>
                              </p>
                            </div>
                            <div className="text-[10px] sm:text-xs font-bold text-gray-400 whitespace-nowrap">
                              {formatDate(update.updatedAt)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                      <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No recent updates for your watched properties.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'watchlist' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg sm:text-2xl font-black text-gray-900">Your Watchlist</h2>
                    <p className="text-xs sm:text-base text-gray-500 font-medium">Properties you're tracking for status updates</p>
                  </div>
                  <button
                    onClick={fetchWatchlist}
                    disabled={loadingWatchlist}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all text-xs sm:text-sm"
                  >
                    {loadingWatchlist ? 'Refreshing...' : 'Refresh List'}
                  </button>
                </div>

                {loadingWatchlist ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                  </div>
                ) : watchlist.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <Star className="mx-auto h-16 w-16 text-gray-200 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Watchlist is empty</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium px-4">Save properties to your watchlist to get notified immediately when their status changes.</p>
                    <button 
                      onClick={() => router.push('/buy')}
                      className="w-full sm:w-auto bg-emerald-600 text-white px-10 py-3.5 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl"
                    >
                      Browse Homes
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {watchlist.map((property) => {
                      return (
                        <PropertyCard
                          key={property._id}
                          id={property._id}
                          title={property.title}
                          address={typeof property.address === 'string' ? property.address : formatPropertyAddress(property.address)}
                          price={property.price}
                          beds={property.beds}
                          baths={property.baths}
                          size={property.size}
                          image={property.images?.[0]?.url || property.mainImage?.url || '/images/01.jpg'}
                          carSpaces={property.carSpaces}
                          isWatched={true}
                          onToggleWatchlist={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleWatchlist(property._id, true);
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tracking' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg sm:text-2xl font-black text-gray-900">Status History</h2>
                    <p className="text-xs sm:text-base text-gray-500 font-medium">Track sales status changes for properties you're interested in</p>
                  </div>
                  <button
                    onClick={fetchStatusUpdates}
                    disabled={loadingUpdates}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all text-xs sm:text-sm"
                  >
                    {loadingUpdates ? 'Loading...' : 'Refresh'}
                  </button>
                </div>

                {loadingUpdates ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                  </div>
                ) : statusUpdates.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <TrendingUp className="mx-auto h-16 w-16 text-gray-200 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No updates yet</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">Status updates for properties in your watchlist will appear here in real-time.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {statusUpdates.map((update) => {
                      const StatusIcon = getStatusIcon(update.newStatus);
                      return (
                        <div key={update._id} className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-8 hover:shadow-xl transition-all duration-300">
                          <div className="flex flex-col md:flex-row md:items-start gap-6 sm:gap-8">
                            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${getStatusColor(update.newStatus).split(' ')[0]}`}>
                              <StatusIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${getStatusColor(update.newStatus).split(' ')[1]}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                <h3 className="text-lg sm:text-xl font-black text-gray-900 truncate">{update.property.title}</h3>
                                <div className="text-[10px] sm:text-sm font-bold text-gray-400">
                                  {formatDate(update.updatedAt)}
                                </div>
                              </div>
                              
                              <p className="text-gray-500 font-bold text-xs sm:text-sm mb-4 sm:mb-6 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                {formatPropertyAddress(update.property.address)}
                              </p>
                              
                              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6 bg-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-100">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Status Change</span>
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${getStatusColor(update.previousStatus)}`}>
                                    {update.previousStatus?.replace('-', ' ') || 'Unknown'}
                                  </span>
                                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300" />
                                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${getStatusColor(update.newStatus)}`}>
                                    {update.newStatus?.replace('-', ' ') || 'Updated'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="text-xl sm:text-2xl font-black text-emerald-600">
                                  {formatCurrencyCompact(update.property.price || 0)}
                                </div>
                                
                                {update.agent && (
                                  <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 rounded-xl">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-[8px] sm:text-[10px]">
                                      {update.agent.name[0]}
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-bold text-gray-500">Updated by {update.agent.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-gray-900">Notification Center</h2>
                  <p className="text-xs sm:text-base text-gray-500 font-medium">Stay updated with property status changes and important platform news</p>
                </div>
                
                <div className="bg-gray-50 rounded-3xl p-4 md:p-8">
                  <NotificationsPanel 
                    isOpen={true} 
                    onClose={() => {}} 
                    standalone={true}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
              className="w-full sm:flex-1 py-3 border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              Reset
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md"
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
                  const isWatching = watchlist.some(p => p._id === selectedProperty._id);
                  toggleWatchlist(selectedProperty._id, isWatching);
                }}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
              >
                <Heart 
                  className={`h-5 w-5 ${
                    watchlist.some(p => p._id === selectedProperty._id) 
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
                <span className="ml-2 font-semibold text-blue-600">
                  {selectedProperty.price ? formatCurrencyCompact(selectedProperty.price) : '—'}
                </span>
              </div>
              
              <div className="flex items-center justify-start gap-2">
                <Bed className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">
                  {selectedProperty.beds ?? '—'} beds
                </span>
              </div>
              
              <div className="flex items-center justify-start gap-2">
                <Bath className="h-5 w-5 text-teal-600" />
                <span className="text-lg font-semibold text-gray-900">
                  {selectedProperty.baths ?? '—'} baths
                </span>
              </div>
              
              <div className="flex items-center justify-start gap-2">
                <Car className="h-5 w-5 text-amber-600" />
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
                {watchlist.some(p => p._id === selectedProperty._id) ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              onClick={() => setSellerModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                sellerAllChecked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-300 cursor-not-allowed'
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