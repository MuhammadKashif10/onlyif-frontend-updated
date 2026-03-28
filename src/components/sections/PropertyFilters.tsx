'use client';

import { useState } from 'react';
import { FilterOptions } from '@/api';
import { useFilterOptions } from '@/hooks/useProperties';
import { Search, ChevronDown } from 'lucide-react';

interface PropertyFiltersProps {
  filters: FilterOptions;
  searchQuery: string;
  onFilterChange: (filters: FilterOptions) => void;
  onSearchChange: (query: string) => void;
  className?: string;
}

export function PropertyFilters({
  filters,
  searchQuery,
  onFilterChange,
  onSearchChange,
  className = ''
}: PropertyFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Use React Query hook for filter options with caching
  const { data: filterOptions, isLoading: loading, error } = useFilterOptions();
  
  // Extract filter options with fallbacks
  const propertyTypes = filterOptions?.propertyTypes || [];
  const cities = filterOptions?.cities || [];
  const priceRange = filterOptions?.priceRange || { min: 0, max: 2000000 };
  const sizeRange = filterOptions?.sizeRange || { min: 0, max: 1000 };
  
  console.log('📊 PropertyFilters: Filter options loaded', {
    propertyTypes: propertyTypes.length,
    cities: cities.length,
    priceRange,
    sizeRange,
    loading,
    error: error?.message
  });

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
  };

  const clearFilters = () => {
    onFilterChange({});
    onSearchChange('');
  };

  const hasActiveFilters = Object.keys(filters || {}).length > 0 || (searchQuery || '').length > 0;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search color="#47C96F" strokeWidth={2} size={24} aria-hidden="true" />
          </div>
          <input
            type="text"
            placeholder="Search by location, property type, or keywords..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors"
          >
            <ChevronDown className={`h-5 w-5 mr-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} color="#47C96F" strokeWidth={2} size={24} />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Active
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8" aria-live="polite">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#47C96F]"></div>
            </div>
          ) : (
            <>
              {/* Property Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={filters?.propertyType || ''}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value || undefined)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">All Types</option>
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={filters?.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">All Locations</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters?.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters?.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Range: ${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()}
                </div>
              </div>

              {/* Size Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Square Meters
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min sq m"
                    value={filters?.minSize || ''}
                    onChange={(e) => handleFilterChange('minSize', e.target.value ? Number(e.target.value) : undefined)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max sq m"
                    value={filters?.maxSize || ''}
                    onChange={(e) => handleFilterChange('maxSize', e.target.value ? Number(e.target.value) : undefined)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  Range: {sizeRange.min.toLocaleString()} - {sizeRange.max.toLocaleString()} sq m
                </div>
              </div>

              {/* Beds and Baths */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <select
                    value={filters?.beds || ''}
                    onChange={(e) => handleFilterChange('beds', e.target.value ? Number(e.target.value) : undefined)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <select
                    value={filters?.baths || ''}
                    onChange={(e) => handleFilterChange('baths', e.target.value ? Number(e.target.value) : undefined)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={filters?.sortBy || ''}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value || undefined)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Default</option>
                    <option value="price">Price</option>
                    <option value="size">Size</option>
                    <option value="date">Date Listed</option>
                    <option value="beds">Bedrooms</option>
                  </select>
                  <select
                    value={filters?.sortOrder || 'asc'}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="asc">Low to High</option>
                    <option value="desc">High to Low</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default PropertyFilters;