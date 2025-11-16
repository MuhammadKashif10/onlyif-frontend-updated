'use client';

import React, { useState } from 'react';
import { Navbar, PropertyNoResults } from '@/components';
import MapListingsLayout from '@/components/sections/MapListingsLayout';
import EnhancedBrowsePageClient from './EnhancedBrowsePageClient';
import { useApiIntegration } from '@/hooks/useApiIntegration';
import { usePropertyContext } from '@/context/PropertyContext';

export default function BrowsePageClient() {
  const [useEnhancedMode, setUseEnhancedMode] = useState(true); // Enable enhanced mode by default
  
  // Use enhanced version with React Query for better performance
  if (useEnhancedMode) {
    return <EnhancedBrowsePageClient />;
  }
  
  // Fallback to original implementation
  const { state } = usePropertyContext();
  const { properties, loading, error, pagination } = state;
  useApiIntegration(); // Connect API to global state
  
  // Add console logging to trace data flow
  console.log('🏠 BrowsePageClient - Properties state:', {
    propertiesCount: properties?.length || 0,
    loading,
    error,
    pagination,
    properties: properties?.slice(0, 2) // Log first 2 properties for debugging
  });
  
  // Fix: Ensure properties is always an array before using array methods
  const safeProperties = Array.isArray(properties) ? properties : [];
  
  const stats = {
    totalProperties: safeProperties.length,
    averagePrice: safeProperties.length > 0 ? Math.round(safeProperties.reduce((sum, p) => sum + p.price, 0) / safeProperties.length) : 0,
    totalValue: safeProperties.reduce((sum, p) => sum + p.price, 0),
    featuredCount: safeProperties.filter(p => p.featured).length
  };

  // Show error state
  if (error) {
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
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!loading && properties.length === 0) {
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
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
          <p className="text-gray-600">No properties are currently available in the database.</p>
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
            <div className="mt-6 text-sm text-gray-500">
              <span className="font-semibold">
                {Intl.NumberFormat('en-US').format(stats.totalProperties)}+ homes available
              </span>
              <span className="mx-2">•</span>
              <span>Updated in real-time</span>
            </div>
          </header>
        </div>
      </section>

      {/* Full Width Listings Layout */}
      <section className="py-8" aria-labelledby="property-results-heading">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <h2 id="property-results-heading" className="sr-only">Property Search Results</h2>
          <MapListingsLayout
            showFilters={true}
            showPagination={true}
            itemsPerPage={100}
            featuredOnly={false}
            showMap={false}
          />
        </div>
      </section>
    </div>
  );
}