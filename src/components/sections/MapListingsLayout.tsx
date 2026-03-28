'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Property } from '@/types/api';
import { usePropertyContext } from '@/context/PropertyContext';
import { PropertyCard, Pagination, PropertyNoResults } from '@/components';
import PropertyMap from '@/components/reusable/PropertyMap';
import PropertyFilters from '@/components/sections/PropertyFilters';
import { generatePropertyUrl } from '@/utils/slugify';

interface MapListingsLayoutProps {
  showFilters?: boolean;
  showPagination?: boolean;
  itemsPerPage?: number;
  featuredOnly?: boolean;
  showMap?: boolean; // Add option to show/hide map
}

export default function MapListingsLayout({
  showFilters = true,
  showPagination = true,
  itemsPerPage = 12,
  featuredOnly = false,
  showMap = true,
}: MapListingsLayoutProps) {
  const router = useRouter();
  // Fix: Access properties from state object
  const { state, setFilters, setSearchQuery, setCurrentPage } = usePropertyContext();
  const { properties, loading, error, pagination, filters, searchQuery } = state;

  const [currentPage, setLocalCurrentPage] = useState(1);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);

  // Filter properties based on featuredOnly prop
  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    let filtered = [...properties];

    if (featuredOnly) {
      filtered = filtered.filter(property => property.featured);
    }

    return filtered;
  }, [properties, featuredOnly]);

  // Calculate pagination
  const totalProperties = filteredProperties.length;
  const totalPages = Math.ceil(totalProperties / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  // Validation function for property objects
  const isValidProperty = (property: any): property is Property => {
    return (
      property &&
      typeof property === 'object' &&
      (property.id || property._id) &&
      typeof property.title === 'string' &&
      typeof property.address === 'string'
    );
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setLocalCurrentPage(page);
    if (showPagination) {
      setCurrentPage(page);
    }
  };

  // Handle property card hover (unified function)
  const handlePropertyCardHover = (property: Property | null) => {
    const propertyId = property?._id || property?.id;
    setHoveredPropertyId(propertyId || null);
  };

  // Handle view details navigation
  const handleViewDetails = (property: Property) => {
    const propertyId = property._id || property.id;
    if (propertyId) {
      const seoUrl = generatePropertyUrl(propertyId, property.title);
      router.push(seoUrl);
    } else {
      console.error('Cannot navigate: Property ID not found', property);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setLocalCurrentPage(1);
    if (showPagination) {
      setCurrentPage(1);
    }
  };

  // Handle search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setLocalCurrentPage(1);
    if (showPagination) {
      setCurrentPage(1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={showMap ? "flex flex-col lg:flex-row gap-6" : "w-full"}>
      {/* Main Content - Filters and Listings */}
      <div className={showMap ? "flex-1" : "w-full"}>
        {/* Filters */}
        {showFilters && (
          <div className="mb-6">
            <PropertyFilters
              filters={filters}
              searchQuery={searchQuery}
              onFilterChange={handleFilterChange}
              onSearchChange={handleSearchChange}
            />
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {currentProperties.length} of {totalProperties} properties
          {featuredOnly && ' (Featured only)'}
        </div>

        {/* Property Grid - Full Width */}
        {currentProperties.length > 0 ? (
          <div className={`grid gap-6 ${showMap 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4"
          }`}>
            {currentProperties.map((property) => {
              if (!isValidProperty(property)) {
                console.warn('Invalid property object:', property);
                return null;
              }

              return (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  slug={property.slug}
                  title={property.title}
                  address={property.address}
                  price={property.price}
                  beds={property.beds}
                  baths={property.baths}
                  size={property.size}
                  image={property.mainImage || '/images/default-property.jpg'}
                  featured={property.featured}
                  carSpaces={property.carSpaces}
                  onClick={() => handleViewDetails(property)}
                />
              );
            })}
          </div>
        ) : (
          <PropertyNoResults 
            onReset={() => {
              setSearchQuery('');
              setFilters({});
              setLocalCurrentPage(1);
              if (showPagination) {
                setCurrentPage(1);
              }
            }}
          />
        )}

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalProperties}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Right Side - Map (only show if showMap is true) */}
      {showMap && (
        <div className="lg:w-1/2">
          <div className="sticky top-4">
            <PropertyMap
              properties={currentProperties}
              hoveredPropertyId={hoveredPropertyId}
              onPropertyHover={handlePropertyCardHover}
              onPropertyClick={handleViewDetails}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export { MapListingsLayout };