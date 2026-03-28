'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode
} from 'react';
import { propertiesApi } from '../api/properties';
import {
  Property,
  PropertySearchParams
} from '../types/api';
import { useAuth } from './AuthContext';

interface PropertyState {
  properties: Property[];
  featuredProperties: Property[];
  currentProperty: Property | null;
  favorites: Property[];
  searchResults: Property[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: PropertySearchParams;
  searchQuery: string;
}

type PropertyAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROPERTIES'; payload: { properties: Property[]; pagination?: any } }
  | { type: 'SET_FEATURED_PROPERTIES'; payload: Property[] }
  | { type: 'SET_CURRENT_PROPERTY'; payload: Property | null }
  | { type: 'SET_FAVORITES'; payload: Property[] }
  | { type: 'SET_SEARCH_RESULTS'; payload: { properties: Property[]; pagination?: any } }
  | { type: 'SET_FILTERS'; payload: PropertySearchParams }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'ADD_PROPERTY'; payload: Property }
  | { type: 'UPDATE_PROPERTY'; payload: { id: string; updates: Partial<Property> } }
  | { type: 'DELETE_PROPERTY'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string };

const initialState: PropertyState = {
  properties: [],
  featuredProperties: [],
  currentProperty: null,
  favorites: [],
  searchResults: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  },
  filters: {},
  searchQuery: ''
};

function propertyReducer(state: PropertyState, action: PropertyAction): PropertyState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PROPERTIES':
      return {
        ...state,
        properties: action.payload.properties,
        pagination: action.payload.pagination || state.pagination,
        loading: false,
        error: null
      };
    case 'SET_FEATURED_PROPERTIES':
      return { ...state, featuredProperties: action.payload };
    case 'SET_CURRENT_PROPERTY':
      return { ...state, currentProperty: action.payload };
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.payload.properties,
        pagination: action.payload.pagination || state.pagination
      };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_CURRENT_PAGE':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          currentPage: action.payload
        }
      };
    case 'ADD_PROPERTY':
      return {
        ...state,
        properties: [action.payload, ...state.properties],
        pagination: {
          ...state.pagination,
          totalItems: state.pagination.totalItems + 1
        }
      };
    case 'UPDATE_PROPERTY':
      return {
        ...state,
        properties: state.properties.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
        currentProperty: state.currentProperty?.id === action.payload.id
          ? { ...state.currentProperty, ...action.payload.updates }
          : state.currentProperty
      };
    case 'DELETE_PROPERTY':
      return {
        ...state,
        properties: state.properties.filter(p => p.id !== action.payload),
        currentProperty: state.currentProperty?.id === action.payload ? null : state.currentProperty,
        pagination: {
          ...state.pagination,
          totalItems: Math.max(0, state.pagination.totalItems - 1)
        }
      };
    case 'TOGGLE_FAVORITE':
      const isFavorite = state.favorites.some(p => p.id === action.payload);
      const property = state.properties.find(p => p.id === action.payload);
      return {
        ...state,
        favorites: isFavorite
          ? state.favorites.filter(p => p.id !== action.payload)
          : property ? [...state.favorites, property] : state.favorites
      };
    default:
      return state;
  }
}

interface PropertyContextType {
  state: PropertyState;
  loadProperties: (params?: PropertySearchParams) => Promise<void>;
  loadFeaturedProperties: (limit?: number) => Promise<void>;
  loadPropertyById: (id: string) => Promise<void>;
  searchProperties: (params: PropertySearchParams) => Promise<void>;
  addProperty: (propertyData: Partial<Property>) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (propertyId: string) => Promise<void>;
  setFilters: (filters: PropertySearchParams) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  clearError: () => void;
  resetPagination: () => void;
  refreshProperties: () => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(propertyReducer, initialState);
  const { user } = useAuth();

  const loadProperties = useCallback(async (params: PropertySearchParams = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await propertiesApi.getProperties(params);

      if (response && Array.isArray(response.properties)) {
        dispatch({
          type: 'SET_PROPERTIES',
          payload: {
            properties: response.properties,
            pagination: {
              currentPage: response.page || 1,
              totalPages: response.totalPages || 1,
              totalItems: response.total || 0,
              hasNext: (response.page || 1) < (response.totalPages || 1),
              hasPrev: (response.page || 1) > 1
            }
          }
        });
      } else {
        dispatch({ type: 'SET_PROPERTIES', payload: { properties: [], pagination: initialState.pagination } });
        dispatch({ type: 'SET_ERROR', payload: 'Invalid data format received from server' });
      }
    } catch (error) {
      dispatch({ type: 'SET_PROPERTIES', payload: { properties: [], pagination: initialState.pagination } });
      const errorMessage = error instanceof Error ? error.message : 'Failed to load properties from database';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadFeaturedProperties = async (limit: number = 6) => {
    try {
      const response = await propertiesApi.getFeaturedProperties(limit);
      dispatch({ type: 'SET_FEATURED_PROPERTIES', payload: response.data || response });
    } catch (error) {
      console.error('Error loading featured properties:', error);
    }
  };

  const loadPropertyById = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await propertiesApi.getPropertyById(id);
      if (response.success && response.data) {
        dispatch({ type: 'SET_CURRENT_PROPERTY', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to load property' });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load property' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const searchProperties = async (params: PropertySearchParams) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await propertiesApi.searchProperties(params);
      dispatch({
        type: 'SET_SEARCH_RESULTS',
        payload: {
          properties: response.data || response.properties || [],
          pagination: {
            currentPage: response.meta?.page || response.page || 1,
            totalPages: response.meta?.totalPages || response.totalPages || 1,
            totalItems: response.meta?.total || response.total || 0,
            hasNext: response.meta?.hasNext || false,
            hasPrev: response.meta?.hasPrev || false
          }
        }
      });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to search properties' });
    }
  };

  const addProperty = async (propertyData: Partial<Property>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await propertiesApi.submitProperty(propertyData);
      const newProperty = response.data || response;
      dispatch({ type: 'ADD_PROPERTY', payload: newProperty });
      await loadProperties(state.filters);
      if (newProperty.featured) {
        await loadFeaturedProperties();
      }
      return newProperty;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add property' });
      throw error;
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const response = await propertiesApi.updateProperty(id, updates);
      dispatch({ type: 'UPDATE_PROPERTY', payload: { id, updates: response.data || response } });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update property' });
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      await propertiesApi.deleteProperty(id);
      dispatch({ type: 'DELETE_PROPERTY', payload: id });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete property' });
    }
  };

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const response = await propertiesApi.getFavoriteProperties();
      dispatch({ type: 'SET_FAVORITES', payload: response.data || response.properties || [] });
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (propertyId: string) => {
    if (!user) return;
    try {
      await propertiesApi.toggleFavorite(propertyId);
      dispatch({ type: 'TOGGLE_FAVORITE', payload: propertyId });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update favorites' });
    }
  };

  const setFilters = (filters: PropertySearchParams) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setCurrentPage = (page: number) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const resetPagination = () => {
    dispatch({
      type: 'SET_PROPERTIES',
      payload: {
        properties: state.properties,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          hasNext: false,
          hasPrev: false
        }
      }
    });
  };

  // Enhanced useEffect with debounced search and proper filtering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params: PropertySearchParams = {
        ...state.filters,
        search: state.searchQuery?.trim() || undefined,
        page: state.pagination.currentPage.toString(),
        status: 'active',
        limit: '100' // Load more properties for better filtering
      };

      // Clean up undefined/empty values
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value === undefined || value === '' || value === null) {
          delete params[key];
        }
      });

      console.log('🔄 PropertyContext: Loading properties with params', params);
      loadProperties(params);
    }, state.searchQuery ? 300 : 0); // Debounce search queries

    return () => clearTimeout(timeoutId);
  }, [state.filters, state.searchQuery, state.pagination.currentPage, loadProperties]);

  useEffect(() => {
    loadProperties({ status: 'active' });
    loadFeaturedProperties();
  }, []);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      dispatch({ type: 'SET_FAVORITES', payload: [] });
    }
  }, [user]);

  const refreshProperties = async () => {
    await loadProperties(state.filters);
    await loadFeaturedProperties();
  };

  const value: PropertyContextType = {
    state,
    loadProperties,
    loadFeaturedProperties,
    loadPropertyById,
    searchProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    loadFavorites,
    toggleFavorite,
    setFilters,
    setSearchQuery,
    setCurrentPage,
    clearError,
    resetPagination,
    refreshProperties
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export function usePropertyContext() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('usePropertyContext must be used within a PropertyProvider');
  }
  return context;
}
