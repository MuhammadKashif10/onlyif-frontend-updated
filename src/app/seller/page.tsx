'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Home, DollarSign, Eye, TrendingUp, Edit, Trash2, MoreVertical } from 'lucide-react';
import { sellerApi, SellerStats } from '@/api/seller';
import { propertiesApi } from '@/api';
import { Property } from '@/types/api';

export default function SellerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [sellerStats, setSellerStats] = useState<SellerStats>({
    totalOffers: 0,
    pendingOffers: 0,
    acceptedOffers: 0,
    averageOfferValue: 0,
    totalProperties: 0,
    totalViews: 0,
    averagePropertyValue: 0
  });
  const [activeListings, setActiveListings] = useState<Property[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    street: '', // Changed from 'address' to 'street'
    city: '',
    state: '',
    zipCode: '',
    price: '',
    beds: '',
    baths: '',
    squareMeters: '', // Changed from 'size' to 'squareMeters'
    propertyType: 'single-family', // Changed to match enum
    description: '',
    // Add required contact info fields
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });
  
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
    
    // Load data once authenticated
    loadData();
  }, [authLoading, isAuthenticated, user, router]);

  const loadData = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const sellerId = user.id;
      
      // Fetch seller statistics
      const stats = await sellerApi.getSellerOverview(sellerId);
      setSellerStats(stats);
      
      // Fetch seller's active listings
      const listingsResponse = await sellerApi.getSellerListings(sellerId, {
        page: 1,
        limit: 10,
        status: 'public'
      });
      setActiveListings(listingsResponse.properties);
      
    } catch (err) {
      console.error('Error loading seller data:', err);
      setError('Failed to load dashboard data. Please try again.');
      
      // Set empty state instead of mock data
      setSellerStats({
        totalOffers: 0,
        pendingOffers: 0,
        acceptedOffers: 0,
        averageOfferValue: 0,
        totalProperties: 0,
        totalViews: 0,
        averagePropertyValue: 0
      });
      
      setActiveListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Show error if not authenticated
  if (!isAuthenticated || !user || user.role !== 'seller') {
    return null; // Will redirect in useEffect
  }

  // Empty state component
  const EmptyState = ({ title, description, actionText, onAction }: {
    title: string;
    description: string;
    actionText?: string;
    onAction?: () => void;
  }) => (
    <div className="text-center py-12">
      <div className="mx-auto h-12 w-12 text-gray-400">
        <Home className="h-12 w-12" />
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {actionText && onAction && (
        <div className="mt-6">
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            {actionText}
          </button>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    loadData();
  }, []);

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create new property via API
      const newProperty = await propertiesApi.submitProperty({
        title: formData.title,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        price: parseFloat(formData.price),
        beds: parseInt(formData.beds),
        baths: parseFloat(formData.baths),
        squareMeters: parseInt(formData.squareMeters), // Changed from 'size'
        propertyType: formData.propertyType,
        description: formData.description,
        contactInfo: {
          name: formData.contactName,
          email: formData.contactEmail,
          phone: formData.contactPhone
        },
        status: 'pending'
      });
      
      // Add to local state for immediate UI update
      setActiveListings(prev => [newProperty, ...prev]);
      
      // Update statistics
      await loadData();
      
      // Reset form and close modal
      setFormData({
        title: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        price: '',
        beds: '',
        baths: '',
        squareMeters: '', // Changed from 'size'
        propertyType: 'single-family', // Changed to match enum
        description: '',
        contactName: '',
        contactEmail: '',
        contactPhone: ''
      });
      setShowAddModal(false);
      
    } catch (err) {
      console.error('Error adding property:', err);
      setError('Failed to add property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Loading state
  if (loading && activeListings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your property listings and track performance</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="sr-only">Dismiss</span>
              ×
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{sellerStats.totalProperties}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Offers</p>
                <p className="text-2xl font-bold text-gray-900">{sellerStats.totalOffers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{sellerStats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Offer Value</p>
                <p className="text-2xl font-bold text-gray-900">${sellerStats.averageOfferValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Listings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Active Listings</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Listing
            </button>
          </div>

          <div className="p-6">
            {activeListings.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active listings found</h3>
                <p className="text-gray-600 mb-4">Add your first property to get started!</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Your First Property
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeListings.map((listing) => (
                  <div key={listing.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={listing.mainImage || '/images/placeholder.jpg'}
                        alt={listing.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{listing.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{listing.address}</p>
                      <p className="text-2xl font-bold text-blue-600 mb-2">${listing.price.toLocaleString()}</p>
                      <div className="flex justify-between text-sm text-gray-600 mb-3">
                        <span>{listing.beds} beds</span>
                        <span>{listing.baths} baths</span>
                        <span>{listing.size} sqft</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          listing.status === 'public' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {listing.status === 'public' ? 'Live' : 'Pending'}
                        </span>
                        <div className="flex space-x-2">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Listing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Listing</h2>
              
              <form onSubmit={handleAddListing} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="single-family">Single Family</option>
                      <option value="condo">Condo</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="multi-family">Multi Family</option>
                      <option value="land">Land</option>
                      <option value="commercial">Commercial</option>
                      <option value="apartment">Apartment</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms *</label>
                    <input
                      type="number"
                      name="beds"
                      value={formData.beds}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms *</label>
                    <input
                      type="number"
                      step="0.5"
                      name="baths"
                      value={formData.baths}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Square Meters *</label>
                    <input
                      type="number"
                      name="squareMeters"
                      value={formData.squareMeters}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                    <input
                      type="number"
                      name="yearBuilt"
                      value={formData.yearBuilt}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1800"
                      max={new Date().getFullYear() + 2}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lot Size (sq meters)</label>
                    <input
                      type="number"
                      name="lotSize"
                      value={formData.lotSize}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your property..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* File Upload Sections */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Media Files</h3>
                  
                  {/* Property Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Images</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'images')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {files.images.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {files.images.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile('images', index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                
                  {/* Floor Plans */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Floor Plans</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'floorPlans')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {files.floorPlans.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {files.floorPlans.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile('floorPlans', index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                
                  {/* Videos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Videos</label>
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, 'videos')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {files.videos.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {files.videos.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile('videos', index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setError(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitLoading ? 'Adding...' : 'Add Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const handleAddListing = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    setSubmitLoading(true);
    setError(null);
    
    // Create FormData for file upload
    const formDataToSend = new FormData();
    
    // Add property data
    formDataToSend.append('owner', user?.id || '');
    formDataToSend.append('title', formData.title);
    formDataToSend.append('street', formData.street);
    formDataToSend.append('city', formData.city);
    formDataToSend.append('state', formData.state);
    formDataToSend.append('zipCode', formData.zipCode);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('beds', formData.beds);
    formDataToSend.append('baths', formData.baths);
    formDataToSend.append('squareMeters', formData.squareMeters);
    formDataToSend.append('propertyType', formData.propertyType);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('contactName', formData.contactName);
    formDataToSend.append('contactEmail', formData.contactEmail);
    formDataToSend.append('contactPhone', formData.contactPhone);
    
    if (formData.yearBuilt) {
      formDataToSend.append('yearBuilt', formData.yearBuilt);
    }
    if (formData.lotSize) {
      formDataToSend.append('lotSize', formData.lotSize);
    }
    
    // Add files
    files.images.forEach(file => {
      formDataToSend.append('images', file);
    });
    files.floorPlans.forEach(file => {
      formDataToSend.append('floorPlans', file);
    });
    files.videos.forEach(file => {
      formDataToSend.append('videos', file);
    });
    
    // Use the correct API endpoint for file uploads
    const result = await propertiesApi.createPropertyWithFiles(formDataToSend);
    
    if (result.success && result.data) {
      // Add to local state for immediate UI update
      setActiveListings(prev => [result.data, ...prev]);
      
      // Update statistics
      await loadData();
      
      // Reset form and close modal
      setFormData({
        title: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        price: '',
        beds: '',
        baths: '',
        squareMeters: '',
        propertyType: 'single-family',
        description: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        yearBuilt: '',
        lotSize: ''
      });
      
      setFiles({
        images: [],
        floorPlans: [],
        videos: []
      });
      
      setShowAddModal(false);
      
      // Show success message
      setError(null);
      console.log('✅ Property created successfully:', result.data);
      
    } else {
      throw new Error(result.error || 'Failed to create property');
    }
    
  } catch (err: any) {
    console.error('❌ Error adding property:', err);
    setError(err.message || 'Failed to add property. Please try again.');
  } finally {
    setSubmitLoading(false); // Always re-enable the button
  }
};

// Add file handling functions
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'images' | 'floorPlans' | 'videos') => {
  const selectedFiles = Array.from(e.target.files || []);
  setFiles(prev => ({
    ...prev,
    [fileType]: selectedFiles
  }));
};

const removeFile = (fileType: 'images' | 'floorPlans' | 'videos', index: number) => {
  setFiles(prev => ({
    ...prev,
    [fileType]: prev[fileType].filter((_, i) => i !== index)
  }));
};