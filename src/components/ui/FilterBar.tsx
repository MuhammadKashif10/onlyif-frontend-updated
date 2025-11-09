'use client';

import { useState, useEffect } from 'react';
import { propertiesApi, FilterOptions } from '@/api';
import { Search, ChevronDown } from 'lucide-react';

interface FilterBarProps {
  onFiltersChange: (filters: FilterOptions) => void;
  onSearchChange: (query: string) => void;
  currentFilters: FilterOptions;
  searchQuery: string;
  className?: string;
}

export default function FilterBar({
  onFiltersChange,
  onSearchChange,
  currentFilters,
  searchQuery,
  className = ''
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [sizeRange, setSizeRange] = useState({ min: 0, max: 465 }); // Updated max
  const [loading, setLoading] = useState(false);

  // Load filter options on component mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoading(true);
      try {
        const filterOptions = await propertiesApi.getFilterOptions();
        // Handle the FilterOptionsData structure correctly
        if (filterOptions) {
          setPropertyTypes(filterOptions.propertyTypes || []);
          setCities(filterOptions.cities || []);
          setPriceRange(filterOptions.priceRange || { min: 0, max: 1000000 });
          setSizeRange(filterOptions.sizeRange || { min: 0, max: 10000 });
        }
      } catch (error) {
        console.error('Error loading filter options:', error);
        // Set default values on error
        setPropertyTypes([]);
        setCities([]);
        setPriceRange({ min: 0, max: 1000000 });
        setSizeRange({ min: 0, max: 10000 });
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...currentFilters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const clearFilters = () => {
    onFiltersChange({});
    onSearchChange('');
  };

  const hasActiveFilters = Object.keys(currentFilters || {}).length > 0 || searchQuery.length > 0;

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
            <ChevronDown className={`h-5 w-5 mr-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} color="#47C96F" strokeWidth={2} size={24} aria-hidden="true" />
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
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={currentFilters?.city || currentFilters?.location || ''}
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
                      value={currentFilters?.minPrice || currentFilters?.priceMin || ''}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max"
                      value={currentFilters?.maxPrice || currentFilters?.priceMax || ''}
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
                  Square Meters {/* Changed from Square Feet */}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min sq"
                    value={currentFilters?.minSize || ''}
                    onChange={(e) => handleFilterChange('minSize', e.target.value ? Number(e.target.value) : undefined)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max sq m"
                    value={currentFilters?.maxSize || ''}
                    onChange={(e) => handleFilterChange('maxSize', e.target.value ? Number(e.target.value) : undefined)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  Range: {sizeRange.min.toLocaleString()} - {sizeRange.max.toLocaleString()} sq m {/* Changed unit */}
                </div>
              </div>

              {/* Beds and Baths */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <select
                    value={currentFilters?.beds || ''}
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
                    value={currentFilters?.baths || ''}
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
                    value={currentFilters?.sortBy || ''}
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
                    value={currentFilters?.sortOrder || 'asc'}
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
