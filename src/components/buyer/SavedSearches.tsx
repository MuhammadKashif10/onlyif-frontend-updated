'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Play, Edit, MapPin, DollarSign, Home } from 'lucide-react';
import { buyerApi } from '@/api/buyer';

interface SavedSearch {
  _id: string;
  name: string;
  searchCriteria: {
    location?: {
      city?: string;
      state?: string;
      zipCode?: string;
    };
    priceRange?: {
      min?: number;
      max?: number;
    };
    propertyType?: string[];
    bedrooms?: {
      min?: number;
      max?: number;
    };
    bathrooms?: {
      min?: number;
      max?: number;
    };
  };
  alertSettings: {
    emailAlerts: boolean;
    pushNotifications: boolean;
    frequency: string;
  };
  matchCount: number;
  createdAt: string;
}

interface SavedSearchesProps {
  onSearchExecute?: (searchId: string) => void;
}

const SavedSearches: React.FC<SavedSearchesProps> = ({ onSearchExecute }) => {
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
      if (response.success) {
        setSearches(prev => [response.data, ...prev]);
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
      if (response.success) {
        // Update match count
        setSearches(prev => 
          prev.map(s => 
            s._id === searchId 
              ? { ...s, matchCount: response.data.totalMatches }
              : s
          )
        );
        onSearchExecute?.(searchId);
      }
    } catch (error) {
      console.error('Error executing search:', error);
    }
  };

  const formatSearchCriteria = (criteria: SavedSearch['searchCriteria']) => {
    const parts = [];
    
    if (criteria.location?.city) {
      parts.push(criteria.location.city);
    }
    
    if (