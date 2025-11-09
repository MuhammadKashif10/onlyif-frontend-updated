import { useState, useMemo } from 'react';

interface Property {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number; // Changed from squareFeet
  location: string;
  status: string;
}

interface FilterState {
  priceRange: [number, number];
  sizeRange: [number, number]; // Now in square meters
  location: string;
  bedrooms: number;
  bathrooms: number;
  status: string;
}

interface UsePropertyFilterOptions {
  properties: Property[];
  initialFilters?: Partial<FilterState>;
}

export function usePropertyFilter({
  properties,
  initialFilters = {},
}: UsePropertyFilterOptions) {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000000],
    sizeRange: [0, 5000],
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    status: '',
    ...initialFilters,
  });

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      // Price filter
      if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
        return false;
      }

      // Size filter
      if (property.squareMeters < filters.sizeRange[0] || property.squareMeters > filters.sizeRange[1]) {
        return false;
      }

      // Location filter
      if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Bedrooms filter
      if (filters.bedrooms > 0 && property.bedrooms < filters.bedrooms) {
        return false;
      }

      // Bathrooms filter
      if (filters.bathrooms > 0 && property.bathrooms < filters.bathrooms) {
        return false;
      }

      // Status filter
      if (filters.status && property.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [properties, filters]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  const resetFilters = () => {
    setFilters({
      priceRange: [0, 1000000],
      sizeRange: [0, 5000],
      location: '',
      bedrooms: 0,
      bathrooms: 0,
      status: '',
    });
  };

  const getFilterStats = () => {
    const totalProperties = properties.length;
    const filteredCount = filteredProperties.length;
    const activeFilters = Object.entries(filters).filter(([key, value]) => {
      if (key === 'priceRange') return value[0] > 0 || value[1] < 1000000;
      if (key === 'sizeRange') return value[0] > 0 || value[1] < 465; // Updated max
      if (key === 'location') return value !== '';
      if (key === 'bedrooms' || key === 'bathrooms') return value > 0;
      if (key === 'status') return value !== '';
      return false;
    }).length;

    return {
      totalProperties,
      filteredCount,
      activeFilters,
    };
  };

  return {
    filters,
    filteredProperties,
    updateFilter,
    updateFilters,
    resetFilters,
    getFilterStats,
  };
}