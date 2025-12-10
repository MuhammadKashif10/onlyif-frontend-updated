'use client';

import React, { useState, useMemo } from 'react';
import { PropertySearchParams, FilterOptionsData } from '@/types/api';
import { Search, X, ChevronDown, DollarSign, Home, Bed, Bath, MapPin, SlidersHorizontal } from 'lucide-react';
import FilterModal from '../modals/FilterModal';

interface EnhancedPropertyFiltersProps {
  filters: PropertySearchParams;
  searchQuery: string;
  onFilterChange: (filters: PropertySearchParams) => void;
  onSearchChange: (query: string) => void;
  filterOptions?: FilterOptionsData;
  isLoading?: boolean;
  className?: string;
}

export default function EnhancedPropertyFilters({
  filters,
  searchQuery,
  onFilterChange,
  onSearchChange,
  filterOptions,
  isLoading = false,
  className = ''
}: EnhancedPropertyFiltersProps) {
  // Modal state management
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [tempFilters, setTempFilters] = useState<PropertySearchParams>({});
  
  // Extract filter options with fallbacks
  const propertyTypes = filterOptions?.propertyTypes || [];
  const cities = filterOptions?.cities || [];
  const priceRange = filterOptions?.priceRange || { min: 0, max: 2000000 };
  const sizeRange = filterOptions?.sizeRange || { min: 0, max: 1000 };

  // Handle individual filter changes
  const handleFilterChange = (key: keyof PropertySearchParams, value: any) => {
    const newFilters = { ...filters };
    
    if (value === '' || value === undefined || value === null) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    console.log(`🔧 Filter change: ${key} = ${value}`, newFilters);
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

  // Modal handlers
  const openModal = (modalName: string) => {
    setTempFilters({ ...filters });
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
    setTempFilters({});
  };

  const applyTempFilters = () => {
    onFilterChange(tempFilters);
  };

  const handleTempFilterChange = (key: keyof PropertySearchParams, value: any) => {
    const newFilters = { ...tempFilters };
    
    if (value === '' || value === undefined || value === null) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    setTempFilters(newFilters);
  };

  // Get display text for filter buttons
  const getFilterButtonText = (filterType: string) => {
    switch (filterType) {
      case 'price':
        if (filters.minPrice || filters.maxPrice) {
          const min = filters.minPrice ? `$${(filters.minPrice / 1000).toFixed(0)}k` : 'Any';
          const max = filters.maxPrice ? `$${(filters.maxPrice / 1000).toFixed(0)}k` : 'Any';
          return `${min} - ${max}`;
        }
        return 'Price';
      case 'propertyType':
        return filters.propertyType 
          ? filters.propertyType.charAt(0).toUpperCase() + filters.propertyType.slice(1).replace('-', ' ')
          : 'Property Type';
      case 'beds':
        return filters.beds ? `${filters.beds}+ Beds` : 'Beds';
      case 'baths':
        return filters.baths ? `${filters.baths}+ Baths` : 'Baths';
      case 'location':
        return filters.city || 'Location';
      default:
        return 'More';
    }
  };

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (filters.propertyType) count++;
    if (filters.city) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.minSize || filters.maxSize) count++;
    if (filters.beds) count++;
    if (filters.baths) count++;
    if (filters.sortBy) count++;
    return count;
  }, [filters, searchQuery]);

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-lg ${className}`}
        style={{
          backgroundImage: 'url(/images/filter.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Subtle gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />

        {/* Content container */}
        <div className="relative flex flex-col justify-center px-4 sm:px-6 lg:px-10 py-8 sm:py-12 min-h-[320px] sm:min-h-[420px] lg:min-h-[500px] max-w-6xl mx-auto w-full">
          {/* Search Bar */}
          <div className="mb-4 flex justify-center">
            <div className="relative w-full bg-white rounded-xl p-3 sm:p-4 shadow-lg max-w-5xl">
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-6 flex items-center pointer-events-none">
                <Search color="#47C96F" strokeWidth={2} size={20} aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Search by location, property type, or keywords..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-10 py-2.5 border-0 rounded-md leading-5 bg-transparent placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 transition-colors text-sm sm:text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-4 sm:pr-6 flex items-center"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex justify-center">
            <div className="w-full bg-white rounded-xl p-3 sm:p-4 shadow-lg max-w-5xl">
              <div className="flex flex-wrap items-center justify-start sm:justify-center gap-2 sm:gap-3">
            {/* Price Filter Button */}
            <button
              onClick={() => openModal('price')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
                filters.minPrice || filters.maxPrice
                  ? 'bg-[#47C96F] text-white border-[#47C96F]'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">{getFilterButtonText('price')}</span>
            </button>

            {/* Property Type Filter Button */}
            <button
              onClick={() => openModal('propertyType')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
                filters.propertyType
                  ? 'bg-[#47C96F] text-white border-[#47C96F]'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Home className="h-4 w-4" />
              <span className="text-sm font-medium">{getFilterButtonText('propertyType')}</span>
            </button>

            {/* Beds Filter Button */}
            <button
              onClick={() => openModal('beds')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
                filters.beds
                  ? 'bg-[#47C96F] text-white border-[#47C96F]'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Bed className="h-4 w-4" />
              <span className="text-sm font-medium">{getFilterButtonText('beds')}</span>
            </button>

            {/* Baths Filter Button */}
            <button
              onClick={() => openModal('baths')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
                filters.baths
                  ? 'bg-[#47C96F] text-white border-[#47C96F]'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Bath className="h-4 w-4" />
              <span className="text-sm font-medium">{getFilterButtonText('baths')}</span>
            </button>

            {/* Location Filter Button */}
            <button
              onClick={() => openModal('location')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
                filters.city
                  ? 'bg-[#47C96F] text-white border-[#47C96F]'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">{getFilterButtonText('location')}</span>
            </button>

            {/* More Filters Button */}
            <button
              onClick={() => openModal('more')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all whitespace-nowrap"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm font-medium">More</span>
            </button>

            {/* Clear All Button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border bg-red-50 text-red-600 border-red-200 hover:bg-red-100 transition-all whitespace-nowrap"
              >
                <X className="h-4 w-4" />
                <span className="text-sm font-medium">Clear All</span>
              </button>
            )}
              </div>
              
              {/* Active Filters Count Badge */}
              {activeFiltersCount > 0 && (
                <div className="mt-3 text-sm text-gray-600 text-center">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Price Filter Modal */}
      <FilterModal
        isOpen={activeModal === 'price'}
        onClose={closeModal}
        onApply={applyTempFilters}
        title="Price Range"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="0"
                  value={tempFilters?.minPrice || ''}
                  onChange={(e) => handleTempFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="block w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#47C96F] focus:border-[#47C96F]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="Any"
                  value={tempFilters?.maxPrice || ''}
                  onChange={(e) => handleTempFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="block w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#47C96F] focus:border-[#47C96F]"
                />
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Range: ${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()}
          </div>
        </div>
      </FilterModal>

      {/* Property Type Filter Modal */}
      <FilterModal
        isOpen={activeModal === 'propertyType'}
        onClose={closeModal}
        onApply={applyTempFilters}
        title="Property Type"
      >
        <div className="space-y-2">
          {[{ value: '', label: 'All Types' }, ...propertyTypes.map(type => ({
            value: type,
            label: type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')
          }))].map((option) => (
            <button
              key={option.value}
              onClick={() => handleTempFilterChange('propertyType', option.value || undefined)}
              className={`w-full px-4 py-3 rounded-lg border text-left transition-all ${
                (tempFilters?.propertyType || '') === option.value
                  ? 'bg-[#47C96F] text-white border-[#47C96F]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterModal>

      {/* Beds Filter Modal */}
      <FilterModal
        isOpen={activeModal === 'beds'}
        onClose={closeModal}
        onApply={applyTempFilters}
        title="Bedrooms"
      >
        <div className="space-y-2">
          {[
            { value: undefined, label: 'Any' },
            { value: 1, label: '1+' },
            { value: 2, label: '2+' },
            { value: 3, label: '3+' },
            { value: 4, label: '4+' },
            { value: 5, label: '5+' }
          ].map((option) => (
            <button
              key={option.value || 'any'}
              onClick={() => handleTempFilterChange('beds', option.value)}
              className={`w-full px-4 py-3 rounded-lg border text-left transition-all ${
                tempFilters?.beds === option.value
                  ? 'bg-[#47C96F] text-white border-[#47C96F]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterModal>

      {/* Baths Filter Modal */}
      <FilterModal
        isOpen={activeModal === 'baths'}
        onClose={closeModal}
        onApply={applyTempFilters}
        title="Bathrooms"
      >
        <div className="space-y-2">
          {[
            { value: undefined, label: 'Any' },
            { value: 1, label: '1+' },
            { value: 2, label: '2+' },
            { value: 3, label: '3+' },
            { value: 4, label: '4+' }
          ].map((option) => (
            <button
              key={option.value || 'any'}
              onClick={() => handleTempFilterChange('baths', option.value)}
              className={`w-full px-4 py-3 rounded-lg border text-left transition-all ${
                tempFilters?.baths === option.value
                  ? 'bg-[#47C96F] text-white border-[#47C96F]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterModal>

      {/* Location Filter Modal */}
      <FilterModal
        isOpen={activeModal === 'location'}
        onClose={closeModal}
        onApply={applyTempFilters}
        title="Location"
      >
        <div className="space-y-2">
          {[{ value: '', label: 'All Locations' }, ...cities.map(city => ({
            value: city,
            label: city
          }))].map((option) => (
            <button
              key={option.value}
              onClick={() => handleTempFilterChange('city', option.value || undefined)}
              className={`w-full px-4 py-3 rounded-lg border text-left transition-all ${
                (tempFilters?.city || '') === option.value
                  ? 'bg-[#47C96F] text-white border-[#47C96F]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterModal>

      {/* More Filters Modal */}
      <FilterModal
        isOpen={activeModal === 'more'}
        onClose={closeModal}
        onApply={applyTempFilters}
        title="More Filters"
      >
        <div className="space-y-6">
          {/* Size Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size (Square Meters)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min sq m"
                value={tempFilters?.minSize || ''}
                onChange={(e) => handleTempFilterChange('minSize', e.target.value ? Number(e.target.value) : undefined)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#47C96F] focus:border-[#47C96F]"
              />
              <input
                type="number"
                placeholder="Max sq m"
                value={tempFilters?.maxSize || ''}
                onChange={(e) => handleTempFilterChange('maxSize', e.target.value ? Number(e.target.value) : undefined)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#47C96F] focus:border-[#47C96F]"
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Range: {sizeRange.min} - {sizeRange.max} sq m
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={tempFilters?.sortBy || ''}
              onChange={(e) => handleTempFilterChange('sortBy', e.target.value || undefined)}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#47C96F] focus:border-[#47C96F]"
            >
              <option value="">Default</option>
              <option value="price">Price</option>
              <option value="size">Size</option>
              <option value="date">Date Listed</option>
              <option value="beds">Bedrooms</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort Order
            </label>
            <select
              value={tempFilters?.sortOrder || 'asc'}
              onChange={(e) => handleTempFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#47C96F] focus:border-[#47C96F]"
            >
              <option value="asc">Low to High</option>
              <option value="desc">High to Low</option>
            </select>
          </div>
        </div>
      </FilterModal>
    </>
  );
}