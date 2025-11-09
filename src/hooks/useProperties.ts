'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { propertiesApi } from '@/api/properties';
import { Property, PropertySearchParams, FilterOptionsData } from '@/types/api';
import { useMemo } from 'react';

// Query keys for consistent caching
export const propertyQueryKeys = {
  all: ['properties'] as const,
  lists: () => [...propertyQueryKeys.all, 'list'] as const,
  list: (params: PropertySearchParams) => [...propertyQueryKeys.lists(), params] as const,
  details: () => [...propertyQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...propertyQueryKeys.details(), id] as const,
  featured: () => [...propertyQueryKeys.all, 'featured'] as const,
  filters: () => [...propertyQueryKeys.all, 'filters'] as const,
  favorites: () => [...propertyQueryKeys.all, 'favorites'] as const,
};

// Main hook for property listings with search and filters
export const useProperties = (params: PropertySearchParams = {}) => {
  const queryKey = propertyQueryKeys.list(params);
  
  return useQuery({
    queryKey,
    queryFn: () => propertiesApi.getProperties(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// Hook for searching properties with debounced query
export const usePropertySearch = (
  searchQuery: string,
  filters: PropertySearchParams = {},
  options: { enabled?: boolean; debounceMs?: number } = {}
) => {
  const { enabled = true, debounceMs = 300 } = options;
  
  const searchParams = useMemo(() => ({
    ...filters,
    search: searchQuery?.trim() || undefined,
    status: 'active',
    limit: 100
  }), [searchQuery, filters]);

  return useQuery({
    queryKey: propertyQueryKeys.list(searchParams),
    queryFn: () => propertiesApi.getProperties(searchParams),
    enabled: enabled && (searchQuery.length >= 2 || Object.keys(filters).length > 0),
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// Hook for individual property details
export const useProperty = (id: string, options: { enabled?: boolean } = {}) => {
  const { enabled = true } = options;
  
  return useQuery({
    queryKey: propertyQueryKeys.detail(id),
    queryFn: () => propertiesApi.getPropertyById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000, // Keep property details longer
    retry: 2,
  });
};

// Hook for featured properties
export const useFeaturedProperties = (limit: number = 6) => {
  return useQuery({
    queryKey: [...propertyQueryKeys.featured(), limit],
    queryFn: () => propertiesApi.getFeaturedProperties(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook for filter options
export const useFilterOptions = () => {
  return useQuery({
    queryKey: propertyQueryKeys.filters(),
    queryFn: () => propertiesApi.getFilterOptions(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

// Hook for favorite properties
export const useFavoriteProperties = (options: { enabled?: boolean } = {}) => {
  const { enabled = true } = options;
  
  return useQuery({
    queryKey: propertyQueryKeys.favorites(),
    queryFn: () => propertiesApi.getFavoriteProperties(),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Mutation for toggling favorites
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (propertyId: string) => propertiesApi.toggleFavorite(propertyId),
    onSuccess: () => {
      // Invalidate and refetch favorites
      queryClient.invalidateQueries({ queryKey: propertyQueryKeys.favorites() });
      
      // Also invalidate property lists to update favorite status
      queryClient.invalidateQueries({ queryKey: propertyQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to toggle favorite:', error);
    },
  });
};

// Mutation for creating properties
export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (propertyData: Partial<Property>) => propertiesApi.createProperty(propertyData),
    onSuccess: () => {
      // Invalidate property lists to include new property
      queryClient.invalidateQueries({ queryKey: propertyQueryKeys.lists() });
    },
  });
};

// Advanced search hook with multiple filters
export const useAdvancedPropertySearch = (
  searchParams: {
    query?: string;
    filters?: PropertySearchParams;
    page?: number;
    limit?: number;
  },
  options: { enabled?: boolean } = {}
) => {
  const { enabled = true } = options;
  
  const fullParams = useMemo(() => ({
    ...searchParams.filters,
    search: searchParams.query?.trim(),
    page: searchParams.page?.toString(),
    limit: searchParams.limit?.toString(),
    status: 'active'
  }), [searchParams]);

  return useQuery({
    queryKey: propertyQueryKeys.list(fullParams),
    queryFn: () => propertiesApi.searchPropertiesAdvanced(searchParams),
    enabled: enabled && (
      (searchParams.query && searchParams.query.length >= 2) ||
      (searchParams.filters && Object.keys(searchParams.filters).length > 0)
    ),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Prefetch utilities
export const usePrefetchProperty = () => {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: propertyQueryKeys.detail(id),
      queryFn: () => propertiesApi.getPropertyById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};

export const usePrefetchProperties = () => {
  const queryClient = useQueryClient();
  
  return (params: PropertySearchParams) => {
    queryClient.prefetchQuery({
      queryKey: propertyQueryKeys.list(params),
      queryFn: () => propertiesApi.getProperties(params),
      staleTime: 5 * 60 * 1000,
    });
  };
};