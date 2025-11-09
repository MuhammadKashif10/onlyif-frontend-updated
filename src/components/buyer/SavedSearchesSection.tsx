'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Play, Edit, MapPin, DollarSign, Home, Clock } from 'lucide-react';
import { buyerApi, SavedSearch } from '@/api/buyer';

interface SavedSearchesSectionProps {
  onSearchExecute?: (searchId: string) => void;
}

const SavedSearchesSection: React.FC<SavedSearchesSectionProps> = ({ onSearchExecute }) => {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSearch, setNewSearch] = useState({
    name: '',
    searchCriteria: {
      location: { city: '', state: '' },
      priceRange: { min: 0, max: 1000000 },
      propertyType: [] as string[],
      bedrooms: { min: 1 },
      bathrooms: { min: 1 }
    },
    alertSettings: {
      emailAlerts: true,
      pushNotifications: true,
      frequency: 'daily'
    }
  });

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      const response = await buyerApi.getSavedSearches();
      if (response.success) {
        setSearches(response.data);
      }
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSavedSearch = async () => {
    try {
      const response = await buyerApi.createSavedSearch(newSearch);
      if (response.success && response.data) {
        setSearches(prev => [response.data!, ...prev]);
        setShowCreateForm(false);
        setNewSearch({
          name: '',
          searchCriteria: {
            location: { city: '', state: '' },
            priceRange: { min: 0, max: 1000000 },
            propertyType: [],
            bedrooms: { min: 1 },
            bathrooms: { min: 1 }
          },
          alertSettings: {
            emailAlerts: true,
            pushNotifications: true,
            frequency: 'daily'
          }
        });
      }
    } catch (error) {
      console.error('Error creating saved search:', error);
    }
  };

  const deleteSavedSearch = async (searchId: string) => {
    try {
      await buyerApi.deleteSavedSearch(searchId);
      setSearches(prev => prev.filter(s => s._id !== searchId));
    } catch (error) {
      console.error('Error deleting saved search:', error);
    }
  };

  const executeSearch = async (searchId: string) => {
    try {
      const response = await buyerApi.executeSavedSearch(searchId);
      if (response.success && response.data) {
        // Update match count
        setSearches(prev => 
          prev.map(s => 
            s._id === searchId 
              ? { ...s, matchCount: response.data!.totalMatches }
              : s
          )
        );
        onSearchExecute?.(searchId);
      }
    } catch (error) {
      console.error('Error executing search:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
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
            <Search className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Saved Searches</h2>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Search</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {searches.length === 0 ? (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved searches yet</h3>
            <p className="text-gray-600 mb-4">Create your first saved search to get notified about new properties that match your criteria.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Saved Search
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {searches.map((search) => (
              <div key={search._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{search.name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      {search.searchCriteria.location?.city && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{search.searchCriteria.location.city}, {search.searchCriteria.location.state}</span>
                        </div>
                      )}
                      {search.searchCriteria.priceRange && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${search.searchCriteria.priceRange.min?.toLocaleString()} - ${search.searchCriteria.priceRange.max?.toLocaleString()}</span>
                        </div>
                      )}
                      {search.searchCriteria.bedrooms && (
                        <div className="flex items-center space-x-1">
                          <Home className="h-4 w-4" />
                          <span>{search.searchCriteria.bedrooms.min}+ beds</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{search.matchCount} matches</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Created {new Date(search.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => executeSearch(search._id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Run search"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteSavedSearch(search._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete search"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Search Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Saved Search</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Name</label>
                <input
                  type="text"
                  value={newSearch.name}
                  onChange={(e) => setNewSearch({ ...newSearch, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Downtown Condos"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newSearch.searchCriteria.location.city}
                    onChange={(e) => setNewSearch({
                      ...newSearch,
                      searchCriteria: {
                        ...newSearch.searchCriteria,
                        location: { ...newSearch.searchCriteria.location, city: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={newSearch.searchCriteria.location.state}
                    onChange={(e) => setNewSearch({
                      ...newSearch,
                      searchCriteria: {
                        ...newSearch.searchCriteria,
                        location: { ...newSearch.searchCriteria.location, state: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createSavedSearch}
                disabled={!newSearch.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedSearchesSection;