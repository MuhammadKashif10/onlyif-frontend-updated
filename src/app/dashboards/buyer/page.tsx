'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useBuyer } from '@/context/BuyerContext';
import Navbar from '@/components/layout/Navbar';
import NotificationsPanel from '@/components/buyer/NotificationsPanel';
import { Bell, Heart, Search, Eye, Calendar, DollarSign, User, TrendingUp, AlertCircle, Clock, CheckCircle, Star, MapPin, Home } from 'lucide-react';
import { formatPropertyAddress } from '@/utils/addressUtils';
import Modal from '@/components/reusable/Modal';
import { getSafeImageUrl } from '@/utils/imageUtils';
import { formatCurrencyCompact } from '@/utils/currency';
import { Bed, Bath, Car } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  const { user, loading: authLoading } = useAuth();
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
  
  // Property tracking state
  const [watchlist, setWatchlist] = useState<TrackedProperty[]>([]);
  const [statusUpdates, setStatusUpdates] = useState<PropertyStatusUpdate[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'watchlist' | 'tracking' | 'notifications'>('overview');
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [loadingUpdates, setLoadingUpdates] = useState(false);

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
      return;
    }

    if (user && user.role !== 'buyer') {
      router.push('/signin');
      return;
    }

    if (user) {
      fetchBuyerData();
      fetchDashboardStats();
      fetchWatchlist();
      fetchStatusUpdates();
    }
  }, [user, authLoading]);

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
          setWatchlist(prev => prev.filter(p => p._id !== propertyId));
          toast.success('Property removed from watchlist');
        } else {
          toast.success('Property added to watchlist');
          fetchWatchlist(); // Refresh the list
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Notifications */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.name}! Track your properties and stay updated.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
              >
                <Bell className="h-6 w-6" />
                {stats.unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.unreadNotifications > 9 ? '9+' : stats.unreadNotifications}
                  </span>
                )}
              </button>
            </div>
            
            {/* Account Button */}
            <button
              onClick={() => router.push('/dashboards/buyer/account')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <User className="h-5 w-5" />
              <span>Account</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Unlocked</p>
                <p className="text-2xl font-semibold text-gray-900">{unlockedProperties?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Watchlist</p>
                <p className="text-2xl font-semibold text-gray-900">{watchlist.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Status Updates</p>
                <p className="text-2xl font-semibold text-gray-900">{statusUpdates.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Viewed</p>
                <p className="text-2xl font-semibold text-gray-900">{viewedProperties?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Buyer Dashboard Info Section - Matching Seller Design */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Dashboard Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Payment Status Card */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Status</h3>
              <p className="text-gray-600 text-sm mb-4">Track your payment history and upcoming fees.</p>
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-green-600">$0</p>
                <p className="text-sm text-gray-500">Outstanding balance</p>
              </div>
              <button 
                onClick={() => router.push('/dashboards/buyer/payments')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                View Payments
              </button>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
              <p className="text-gray-600 text-sm mb-4">Browse properties and manage your search preferences.</p>
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-orange-600">{stats.savedSearches}</p>
                <p className="text-sm text-gray-500">Saved searches</p>
              </div>
              <button 
                onClick={() => router.push('/browse')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Browse Properties
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-t-lg shadow-sm">
          <nav className="flex space-x-8 px-8 py-4 border-b border-gray-200">
            {[
              { key: 'overview', label: 'Overview', icon: Home },
              { key: 'watchlist', label: 'Watchlist', icon: Star },
              { key: 'tracking', label: 'Property Tracking', icon: TrendingUp },
              { key: 'notifications', label: 'Updates', icon: Bell },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === key
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-8">
              <div className="space-y-8">
                {/* Unlocked Properties */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recently Unlocked Properties</h2>
                    <button 
                      onClick={() => router.push('/browse')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Browse More →
                    </button>
                  </div>
                  
                  {unlockedProperties && unlockedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {unlockedProperties.slice(0, 4).map((property) => {
                        const imageUrl = getSafeImageUrl(
                          property.images?.[0]?.url || property.mainImage?.url || property.primaryImage || '/images/01.jpg'
                        );

                        return (
                          <div
                            key={property.id || property._id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => {
                              setSelectedProperty(property);
                              setPropertyModalOpen(true);
                            }}
                          >
                            <img 
                              src={imageUrl}
                              alt={property.title || 'Property'}
                              className="w-full h-32 object-cover rounded mb-3"
                            />
                            <h3 className="font-medium text-gray-900 mb-1">{property.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {formatPropertyAddress(property.address)}
                            </p>
                            <p className="text-lg font-semibold text-blue-600">
                              {formatCurrencyCompact(property.price || 0)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                      <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No unlocked properties yet</h3>
                      <p className="text-gray-600 mb-4">Start browsing properties to unlock details!</p>
                      <button 
                        onClick={() => router.push('/browse')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Browse Properties
                      </button>
                    </div>
                  )}
                </div>

                {/* Recent Status Updates */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Status Updates</h2>
                    <button 
                      onClick={() => setActiveTab('tracking')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  
                  {statusUpdates.length > 0 ? (
                    <div className="space-y-3">
                      {statusUpdates.slice(0, 3).map((update) => {
                        const StatusIcon = getStatusIcon(update.newStatus);
                        return (
                          <div key={update._id} className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <StatusIcon className="h-6 w-6 text-blue-600 mr-3" />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{update.property.title}</h4>
                              <p className="text-sm text-gray-600">
                                Status changed to <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(update.newStatus)}`}>
                                  {update.newStatus?.replace('-', ' ') || 'Updated'}
                                </span>
                              </p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(update.updatedAt)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                      <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No recent updates</h3>
                      <p className="text-gray-600">Property status updates will appear here when properties in your watchlist change status.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Watchlist Tab */}
          {activeTab === 'watchlist' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Property Watchlist</h2>
                  <p className="text-gray-600 mt-1">Properties you're tracking for status updates</p>
                </div>
                <button
                  onClick={fetchWatchlist}
                  disabled={loadingWatchlist}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingWatchlist ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {loadingWatchlist ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading watchlist...</span>
                </div>
              ) : watchlist.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No properties in watchlist</h3>
                  <p className="text-gray-500 mb-4">Add properties to your watchlist to track their status updates.</p>
                  <button 
                    onClick={() => router.push('/browse')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Browse Properties
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {watchlist.map((property) => {
                    const imageUrl = getSafeImageUrl(
                      property.images?.[0]?.url || property.mainImage?.url || property.primaryImage || '/images/01.jpg'
                    );
                    const StatusIcon = getStatusIcon(property.salesStatus);

                    return (
                      <div key={property._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="relative mb-4">
                          <img 
                            src={imageUrl}
                            alt={property.title}
                            className="w-full h-48 object-cover rounded"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(property._id, true);
                            }}
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50"
                          >
                            <Heart className="h-5 w-5 text-red-500 fill-current" />
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{property.title}</h3>
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {formatPropertyAddress(property.address)}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-xl font-bold text-blue-600">
                              {formatCurrencyCompact(property.price || 0)}
                            </p>
                            {property.salesStatus && (
                              <div className="flex items-center">
                                <StatusIcon className="h-4 w-4 mr-1" />
                                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(property.salesStatus)}`}>
                                  {property.salesStatus.replace('-', ' ')}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-3">
                              <span>{property.beds || 0} beds</span>
                              <span>{property.baths || 0} baths</span>
                              <span>{property.carSpaces || 0} cars</span>
                            </div>
                          </div>
                          
                          {property.agent && (
                            <div className="pt-3 border-t border-gray-200">
                              <p className="text-sm text-gray-600">
                                <User className="h-4 w-4 inline mr-1" />
                                Agent: {property.agent.name}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Property Tracking Tab */}
          {activeTab === 'tracking' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Property Status Tracking</h2>
                  <p className="text-gray-600 mt-1">Track sales status changes for properties you're interested in</p>
                </div>
                <button
                  onClick={fetchStatusUpdates}
                  disabled={loadingUpdates}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingUpdates ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {loadingUpdates ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading status updates...</span>
                </div>
              ) : statusUpdates.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No status updates yet</h3>
                  <p className="text-gray-500 mb-4">Status updates for properties in your watchlist will appear here.</p>
                  <button 
                    onClick={() => setActiveTab('watchlist')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Manage Watchlist
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {statusUpdates.map((update) => {
                    const StatusIcon = getStatusIcon(update.newStatus);
                    return (
                      <div key={update._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <StatusIcon className="h-8 w-8 text-blue-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900">{update.property.title}</h3>
                              <div className="text-sm text-gray-500">
                                {formatDate(update.updatedAt)}
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mb-2">
                              <MapPin className="h-4 w-4 inline mr-1" />
                              {formatPropertyAddress(update.property.address)}
                            </p>
                            
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-sm text-gray-600">Status changed from</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(update.previousStatus)}`}>
                                {update.previousStatus?.replace('-', ' ') || 'Unknown'}
                              </span>
                              <span className="text-sm text-gray-600">to</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(update.newStatus)}`}>
                                {update.newStatus?.replace('-', ' ') || 'Updated'}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-lg font-bold text-blue-600">
                                {formatCurrencyCompact(update.property.price || 0)}
                              </div>
                              
                              {update.agent && (
                                <div className="text-sm text-gray-600">
                                  <User className="h-4 w-4 inline mr-1" />
                                  Updated by {update.agent.name}
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

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Notification Center</h2>
                <p className="text-gray-600 mt-1">Stay updated with property status changes and important updates</p>
              </div>
              
              <NotificationsPanel 
                isOpen={true} 
                onClose={() => {}} 
                standalone={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel 
          isOpen={showNotifications} 
          onClose={() => setShowNotifications(false)} 
        />
      )}

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
    </div>
  );
}