'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, MapPin, DollarSign, Home, Settings } from 'lucide-react';
import { buyerApi } from '@/api/buyer';

interface BuyerProfileCardProps {
  profile: any;
  onClose: () => void;
  onUpdate: () => void;
}

export default function BuyerProfileCard({ profile, onClose, onUpdate }: BuyerProfileCardProps) {
  const [formData, setFormData] = useState({
    preferences: {
      budget: {
        min: '',
        max: '',
        preApprovalAmount: ''
      },
      location: {
        preferredCities: [],
        preferredStates: [],
        maxCommuteDistance: '',
        workAddress: ''
      },
      propertyTypes: [],
      features: {
        bedrooms: {
          min: '',
          preferred: ''
        },
        bathrooms: {
          min: '',
          preferred: ''
        },
        squareFootage: {
          min: '',
          preferred: ''
        },
        mustHave: [],
        niceToHave: []
      },
      timeline: 'flexible'
    },
    notificationSettings: {
      newListings: true,
      priceDrops: true,
      marketUpdates: false,
      savedSearchAlerts: true,
      frequency: 'daily'
    }
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('preferences');

  useEffect(() => {
    if (profile) {
      setFormData({
        preferences: {
          budget: {
            min: profile.preferences?.budget?.min || '',
            max: profile.preferences?.budget?.max || '',
            preApprovalAmount: profile.preferences?.budget?.preApprovalAmount || ''
          },
          location: {
            preferredCities: profile.preferences?.location?.preferredCities || [],
            preferredStates: profile.preferences?.location?.preferredStates || [],
            maxCommuteDistance: profile.preferences?.location?.maxCommuteDistance || '',
            workAddress: profile.preferences?.location?.workAddress || ''
          },
          propertyTypes: profile.preferences?.propertyTypes || [],
          features: {
            bedrooms: {
              min: profile.preferences?.features?.bedrooms?.min || '',
              preferred: profile.preferences?.features?.bedrooms?.preferred || ''
            },
            bathrooms: {
              min: profile.preferences?.features?.bathrooms?.min || '',
              preferred: profile.preferences?.features?.bathrooms?.preferred || ''
            },
            squareFootage: {
              min: profile.preferences?.features?.squareFootage?.min || '',
              preferred: profile.preferences?.features?.squareFootage?.preferred || ''
            },
            mustHave: profile.preferences?.features?.mustHave || [],
            niceToHave: profile.preferences?.features?.niceToHave || []
          },
          timeline: profile.preferences?.timeline || 'flexible'
        },
        notificationSettings: {
          newListings: profile.notificationSettings?.newListings ?? true,
          priceDrops: profile.notificationSettings?.priceDrops ?? true,
          marketUpdates: profile.notificationSettings?.marketUpdates ?? false,
          savedSearchAlerts: profile.notificationSettings?.savedSearchAlerts ?? true,
          frequency: profile.notificationSettings?.frequency || 'daily'
        }
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await buyerApi.updateProfile(formData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArrayInput = (field: string, value: string, subField?: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    
    if (subField) {
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [field]: {
            ...prev.preferences[field],
            [subField]: items
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [field]: items
        }
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'preferences'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Home className="h-4 w-4 inline mr-2" />
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'notifications'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="h-4 w-4 inline mr-2" />
            Notifications
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {activeTab === 'preferences' && (
              <div className="space-y-8">
                {/* Budget Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                    Budget
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Budget
                      </label>
                      <input
                        type="number"
                        value={formData.preferences.budget.min}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            budget: {
                              ...prev.preferences.budget,
                              min: e.target.value
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="A$0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Budget
                      </label>
                      <input
                        type="number"
                        value={formData.preferences.budget.max}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            budget: {
                              ...prev.preferences.budget,
                              max: e.target.value
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="A$1,000,000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pre-approval Amount
                      </label>
                      <input
                        type="number"
                        value={formData.preferences.budget.preApprovalAmount}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            budget: {
                              ...prev.preferences.budget,
                              preApprovalAmount: e.target.value
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="A$500,000"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    Location Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Cities (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.preferences.location.preferredCities.join(', ')}
                        onChange={(e) => handleArrayInput('location', e.target.value, 'preferredCities')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Austin, Dallas, Houston"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred States (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.preferences.location.preferredStates.join(', ')}
                        onChange={(e) => handleArrayInput('location', e.target.value, 'preferredStates')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="TX, CA, NY"
                      />
                    </div>
                  </div>
                </div>

                {/* Property Types */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Types</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['house', 'condo', 'townhouse', 'apartment', 'land', 'commercial'].map((type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.preferences.propertyTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                preferences: {
                                  ...prev.preferences,
                                  propertyTypes: [...prev.preferences.propertyTypes, type]
                                }
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                preferences: {
                                  ...prev.preferences,
                                  propertyTypes: prev.preferences.propertyTypes.filter(t => t !== type)
                                }
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                  <select
                    value={formData.preferences.timeline}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        timeline: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediately">Immediately</option>
                    <option value="3months">Within 3 months</option>
                    <option value="6months">Within 6 months</option>
                    <option value="1year">Within 1 year</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">New Listings</span>
                    <input
                      type="checkbox"
                      checked={formData.notificationSettings.newListings}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notificationSettings: {
                          ...prev.notificationSettings,
                          newListings: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Price Drops</span>
                    <input
                      type="checkbox"
                      checked={formData.notificationSettings.priceDrops}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notificationSettings: {
                          ...prev.notificationSettings,
                          priceDrops: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Market Updates</span>
                    <input
                      type="checkbox"
                      checked={formData.notificationSettings.marketUpdates}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notificationSettings: {
                          ...prev.notificationSettings,
                          marketUpdates: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Saved Search Alerts</span>
                    <input
                      type="checkbox"
                      checked={formData.notificationSettings.savedSearchAlerts}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notificationSettings: {
                          ...prev.notificationSettings,
                          savedSearchAlerts: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Frequency
                  </label>
                  <select
                    value={formData.notificationSettings.frequency}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notificationSettings: {
                        ...prev.notificationSettings,
                        frequency: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}