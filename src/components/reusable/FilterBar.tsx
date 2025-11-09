'use client';

import React from 'react';
import { PROPERTY_STATUS } from '@/utils/constants';

interface FilterBarProps {
  filters: {
    priceRange: [number, number];
    sizeRange: [number, number];
    location: string;
    bedrooms: number;
    bathrooms: number;
    status: string;
    propertyType: string;
  };
  onFilterChange: (filters: any) => void;
  className?: string;
}

// Renamed to avoid conflict with API FilterOptions
interface LocalFilterOptions {
  sizeRange: [number, number]; // Now in square meters
}

const defaultFilterOptions: LocalFilterOptions = {
  sizeRange: [0, 465], // Converted from 5000 sq ft
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  className = '',
}) => {
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: PROPERTY_STATUS.PUBLIC, label: 'Public' },
    { value: PROPERTY_STATUS.PRIVATE, label: 'Private' },
    { value: PROPERTY_STATUS.PENDING, label: 'Pending' },
    { value: PROPERTY_STATUS.SOLD, label: 'Sold' },
  ];

  const propertyTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
  ];

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            placeholder="Enter city or area"
            value={filters.location}
            onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Property Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Type
          </label>
          <select
            value={filters.propertyType}
            onChange={(e) => onFilterChange({ ...filters, propertyType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {propertyTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bedrooms Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bedrooms
          </label>
          <select
            value={filters.bedrooms}
            onChange={(e) => onFilterChange({ ...filters, bedrooms: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>Any</option>
            <option value={1}>1+</option>
            <option value={2}>2+</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
            <option value={5}>5+</option>
          </select>
        </div>

        {/* Bathrooms Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bathrooms
          </label>
          <select
            value={filters.bathrooms}
            onChange={(e) => onFilterChange({ ...filters, bathrooms: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>Any</option>
            <option value={1}>1+</option>
            <option value={2}>2+</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <button
            onClick={() => onFilterChange({
              priceRange: [0, 1000000],
              sizeRange: [0, 465], // Updated to square meters
              location: '',
              bedrooms: 0,
              bathrooms: 0,
              status: '',
              propertyType: '',
            })}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;