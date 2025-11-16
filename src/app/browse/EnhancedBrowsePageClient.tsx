'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Navbar, PropertyNoResults, SearchNoResults } from '@/components';
import { useProperties, usePropertySearch, useFilterOptions } from '@/hooks/useProperties';
import { PropertySearchParams } from '@/types/api';
import EnhancedPropertyFilters from '@/components/sections/EnhancedPropertyFilters';
import EnhancedPropertyGrid from '@/components/sections/EnhancedPropertyGrid';
import { useDebounce } from '@/hooks/useDebounce';

export default function EnhancedBrowsePageClient() {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PropertySearchParams>({});
  const [currentPage, setCurrentPage] = useState(1);
  
  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Build search parameters
  const searchParams = useMemo(() => ({
    ...filters,
    search: debouncedSearchQuery?.trim() || undefined,
    page: currentPage.toString(),
    limit: '100',
    status: 'active'
  }), [filters, debouncedSearchQuery, currentPage]);
  
  // Use React Query for data fetching with caching
  const { 
    data: propertiesData, 
    isLoading, 
    error,
    isFetching,
    refetch
  } = useProperties(searchParams);
  
  // Get filter options for dropdowns
  const { data: filterOptions } = useFilterOptions();
  
  // Extract data with fallbacks
  const properties = propertiesData?.properties || [];
  const totalProperties = propertiesData?.total || 0;
  const totalPages = propertiesData?.totalPages || 1;
  
  console.log('🏠 EnhancedBrowsePageClient state:', {
    searchQuery,
    debouncedSearchQuery,
    filters,
    propertiesCount: properties.length,
    totalProperties,
    isLoading,
    isFetching,
    error: error?.message
  });
  
  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: PropertySearchParams) => {
    console.log('🔧 Filter change:', newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);
  
  // Handle search changes
  const handleSearchChange = useCallback((query: string) => {
    console.log('🔍 Search change:', query);
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  }, []);
  
  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    console.log('📄 Page change:', page);
    setCurrentPage(page);
  }, []);
  
  // Reset all filters and search
  const handleReset = useCallback(() => {
    console.log('🔄 Resetting filters and search');
    setSearchQuery('');
    setFilters({});
    setCurrentPage(1);
  }, []);
  
  // Calculate if there are active filters or search
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).length > 0 || searchQuery.length > 0;
  }, [filters, searchQuery]);
  
  // Stats for display
  const stats = useMemo(() => {
    if (!properties.length) return null;
    
    return {
      totalProperties: properties.length,
      averagePrice: Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length),
      featuredCount: properties.filter(p => p.featured).length
    };
  }, [properties]);
  
  // Error state
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-white">
<Navbar
          logo="/images/logo.PNG"
          logoText=""
          navigationItems={[
            { label: 'Buy', href: '/browse', isActive: true },
            { label: 'Sell', href: '/sell', isActive: false },
            { label: 'How It Works', href: '/how-it-works', isActive: false },
            { label: 'About', href: '/about', isActive: false },
          ]}
          ctaText="Get Started"
          ctaHref="/signin"
        />
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Properties</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button 
            onClick={() => refetch()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
<Navbar
        logo="/images/logo.PNG"
        logoText=""
        ctaText="Get Started"
        ctaHref="/signin"
      />

      {/* Header */}
      <section className="bg-gray-50 pt-4 sm:pt-6 md:pt-8 pb-8" aria-labelledby="browse-homes-heading">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <header className="text-center">
            <h1 id="browse-homes-heading" className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
              Browse Homes for Sale
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover your perfect home with our comprehensive search and filter options. 
              Find properties that match your criteria and budget.
            </p>
            
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span>Loading properties...</span>
                </div>
              ) : (
                <>
                  <span className="font-semibold">
                    {totalProperties.toLocaleString()}+ homes available
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>Updated in real-time</span>
                  {stats && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span>Avg. ${stats.averagePrice.toLocaleString()}</span>
                    </>
                  )}
                </>
              )}
            </div>
          </header>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8" aria-labelledby="property-results-heading">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <h2 id="property-results-heading" className="sr-only">Property Search Results</h2>
          
          {/* Filters */}
          <div className="mb-6">
            <EnhancedPropertyFilters
              filters={filters}
              searchQuery={searchQuery}
              onFilterChange={handleFilterChange}
              onSearchChange={handleSearchChange}
              filterOptions={filterOptions}
              isLoading={isLoading}
            />
          </div>

          {/* Loading State */}
          {isLoading && !isFetching && (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading properties...</p>
              </div>
            </div>
          )}

          {/* Property Grid */}
          {!isLoading && (
            <>
              {/* Results Summary */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                  {isFetching && (
                    <div className="inline-flex items-center mr-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span>Updating...</span>
                    </div>
                  )}
                  Showing {properties.length} of {totalProperties} properties
                  {hasActiveFilters && ' (filtered)'}
                </div>
                
                {hasActiveFilters && (
                  <button
                    onClick={handleReset}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {/* Properties Grid or No Results */}
              {properties.length > 0 ? (
                <EnhancedPropertyGrid
                  properties={properties}
                  isLoading={isFetching}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalProperties}
                  itemsPerPage={100}
                  onPageChange={handlePageChange}
                />
              ) : (
                <div className="mt-8">
                  {searchQuery ? (
                    <SearchNoResults 
                      query={searchQuery}
                      onReset={handleReset}
                    />
                  ) : (
                    <PropertyNoResults 
                      onReset={handleReset}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}