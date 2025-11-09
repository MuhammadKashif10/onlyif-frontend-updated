'use client';

import React, { useState, useEffect } from 'react';
import { User, MapPin, DollarSign, Home, Bell, Save } from 'lucide-react';
import { buyerApi } from '@/api/buyer';

interface BuyerProfileProps {
  onProfileUpdate?: () => void;
}

interface BuyerProfile {
  preferences: {
    location: {
      preferredCities: string[];
      preferredStates: string[];
      maxCommute?: number;
    };
    budget: {
      minPrice: number;
      maxPrice: number;
      preApprovalAmount?: number;
      financingType: string;
    };
    propertyTypes: string[];
    features: {
      minBedrooms?: number;
      minBathrooms?: number;
      minSquareFootage?: number;
      mustHave: string[];
      niceToHave: string[];
    };
  };
  notifications: {
    newListings: boolean;
    priceDrops: boolean;
    marketUpdates: boolean;
    savedSearchAlerts: boolean;
    emailFrequency: string;
  };
}

const BuyerProfile: React.FC<BuyerProfileProps> = ({ onProfileUpdate }) => {
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<BuyerProfile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await buyerApi.getProfile();
      if (response.success) {
        setProfile(response.data);
        setFormData(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    
    setSaving(true);
    try {
      const response = await buyerApi.updateProfile(formData);
      if (response.success) {
        setProfile(formData);
        setIsEditing(false);
        onProfileUpdate?.();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (path: string, value: any) => {
    if (!formData) return;
    
    const keys = path.split('.');
    const newFormData = { ...formData };
    let current: any = newFormData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setFormData(newFormData);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(profile);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Budget Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-medium text-gray-900">Budget Preferences</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Price
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData?.preferences.budget.minPrice || ''}
                  onChange={(e) => handleInputChange('preferences.budget.minPrice', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">${profile?.preferences.budget.minPrice?.toLocaleString() || 'Not set'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Price
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData?.preferences.budget.maxPrice || ''}
                  onChange={(e) => handleInputChange('preferences.budget.maxPrice', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">${profile?.preferences.budget.maxPrice?.toLocaleString() || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-medium text-gray-900">Location Preferences</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Cities
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData?.preferences.location.preferredCities?.join(', ') || ''}
                onChange={(e) => handleInputChange('preferences.location.preferredCities', e.target.value.split(', ').filter(Boolean))}
                placeholder="Austin, Dallas, Houston"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">
                {profile?.preferences.location.preferredCities?.join(', ') || 'Not set'}
              </p>
            )}
          </div>
        </div>

        {/* Property Types Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Home className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Property Preferences</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Types
            </label>
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['house', 'condo', 'townhouse', 'apartment'].map((type) => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData?.preferences.propertyTypes?.includes(type) || false}
                      onChange={(e) => {
                        const current = formData?.preferences.propertyTypes || [];
                        const updated = e.target.checked
                          ? [...current, type]
                          : current.filter(t => t !== type);
                        handleInputChange('preferences.propertyTypes', updated);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-900">
                {profile?.preferences.propertyTypes?.map(type => 
                  type.charAt(0).toUpperCase() + type.slice(1)
                ).join(', ') || 'Not set'}
              </p>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { key: 'newListings', label: 'New Listings' },
              { key: 'priceDrops', label: 'Price Drops' },
              { key: 'marketUpdates', label: 'Market Updates' },
              { key: 'savedSearchAlerts', label: 'Saved Search Alerts' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={formData?.notifications[key as keyof typeof formData.notifications] as boolean || false}
                    onChange={(e) => handleInputChange(`notifications.${key}`, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                ) : (
                  <span className={`text-sm ${
                    profile?.notifications[key as keyof typeof profile.notifications] 
                      ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {profile?.notifications[key as keyof typeof profile.notifications] ? 'Enabled' : 'Disabled'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;