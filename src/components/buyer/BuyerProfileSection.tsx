'use client';

import { useState, useEffect } from 'react';
import { X, User, MapPin, DollarSign, Home, Bell } from 'lucide-react';

interface BuyerProfile {
  preferences: {
    location: {
      preferredAreas: string[];
      maxCommute: number;
    };
    budget: {
      min: number;
      max: number;
    };
    propertyTypes: string[];
    features: string[];
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

interface BuyerProfileSectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BuyerProfileSection({ isOpen, onClose }: BuyerProfileSectionProps) {
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<BuyerProfile>({
    preferences: {
      location: {
        preferredAreas: [],
        maxCommute: 30
      },
      budget: {
        min: 0,
        max: 1000000
      },
      propertyTypes: [],
      features: [],
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    }
  });

  const propertyTypes = ['house', 'condo', 'townhouse', 'apartment', 'land'];
  const features = ['pool', 'garage', 'fireplace', 'garden', 'balcony', 'gym', 'security'];

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/buyer/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setProfile(data.data);
        setFormData(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = profile ? '/api/buyer/profile' : '/api/buyer/profile';
      const method = profile ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
        onClose();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const addPreferredArea = (area: string) => {
    if (area && !formData.preferences.location.preferredAreas.includes(area)) {
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          location: {
            ...formData.preferences.location,
            preferredAreas: [...formData.preferences.location.preferredAreas, area]
          }
        }
      });
    }
  };

  const removePreferredArea = (area: string) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        location: {
          ...formData.preferences.location,
          preferredAreas: formData.preferences.location.preferredAreas.filter(a => a !== area)
        }
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">My Profile & Preferences</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Location Preferences */}
            <div>
              <div className="flex items-center mb-3">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Location Preferences</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Areas
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.preferences.location.preferredAreas.map((area) => (
                      <span key={area} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {area}
                        <button 
                          onClick={() => removePreferredArea(area)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add preferred area (e.g., Downtown, Suburbs)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addPreferredArea(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Commute (minutes): {formData.preferences.location.maxCommute}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    value={formData.preferences.location.maxCommute}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        location: {
                          ...formData.preferences.location,
                          maxCommute: parseInt(e.target.value)
                        }
                      }
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Budget */}
            <div>
              <div className="flex items-center mb-3">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Budget Range</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum</label>
                  <input
                    type="number"
                    value={formData.preferences.budget.min}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        budget: {
                          ...formData.preferences.budget,
                          min: parseInt(e.target.value) || 0
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum</label>
                  <input
                    type="number"
                    value={formData.preferences.budget.max}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        budget: {
                          ...formData.preferences.budget,
                          max: parseInt(e.target.value) || 0
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1000000"
                  />
                </div>
              </div>
            </div>

            {/* Property Types */}
            <div>
              <div className="flex items-center mb-3">
                <Home className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Property Types</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {propertyTypes.map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferences.propertyTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            preferences: {
                              ...formData.preferences,
                              propertyTypes: [...formData.preferences.propertyTypes, type]
                            }
                          });
                        } else {
                          setFormData({
                            ...formData,
                            preferences: {
                              ...formData.preferences,
                              propertyTypes: formData.preferences.propertyTypes.filter(t => t !== type)
                            }
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Desired Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {features.map((feature) => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferences.features.includes(feature)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            preferences: {
                              ...formData.preferences,
                              features: [...formData.preferences.features, feature]
                            }
                          });
                        } else {
                          setFormData({
                            ...formData,
                            preferences: {
                              ...formData.preferences,
                              features: formData.preferences.features.filter(f => f !== feature)
                            }
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="capitalize">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notification Preferences */}
            <div>
              <div className="flex items-center mb-3">
                <Bell className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences.notifications.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        notifications: {
                          ...formData.preferences.notifications,
                          email: e.target.checked
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  <span>Email notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences.notifications.push}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        notifications: {
                          ...formData.preferences.notifications,
                          push: e.target.checked
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  <span>Push notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences.notifications.sms}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        notifications: {
                          ...formData.preferences.notifications,
                          sms: e.target.checked
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  <span>SMS notifications</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}