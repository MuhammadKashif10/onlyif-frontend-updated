'use client';

import { useState, useEffect } from 'react';
import { FilterOptions } from '@/api';
import { usePropertyContext } from '@/context/PropertyContext';
import PropertyCard from '../ui/PropertyCard';
import FilterBar from '../ui/FilterBar';
import Pagination from '../reusable/Pagination';
import { PropertyGridSkeleton } from '../ui/LoadingSkeleton';
import { LoadingError, NoResults } from '../ui/ErrorMessage';
import { getSafeImageUrl } from '@/utils/imageUtils';
import { Property } from '@/types/api';

interface PropertyGridProps {
  showFilters?: boolean;
  showPagination?: boolean;
  itemsPerPage?: number;
  featuredOnly?: boolean;
  className?: string;
  onPropertyClick?: (property: Property) => void;
}

export default function PropertyGrid({
  showFilters = true,
  showPagination = true,
  itemsPerPage = 12,
  featuredOnly = false,
  className = '',
  onPropertyClick
}: PropertyGridProps) {
  // Fix: Access properties from state instead of destructuring directly
  const { state, loadProperties, loadFeaturedProperties } = usePropertyContext();
  const { properties: allProperties, loading: contextLoading, error: contextError } = state;
  
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Load properties when component mounts
  useEffect(() => {
    const initializeProperties = async () => {
      if (!Array.isArray(allProperties) || allProperties.length === 0) {
        try {
          // Fix: Use loadFeaturedProperties when featuredOnly is true
          if (featuredOnly) {
            await loadFeaturedProperties();
          } else {
            await loadProperties();
          }
        } catch (err) {
          console.error('Failed to load properties:', err);
        }
      }
    };
    
    initializeProperties();
  }, [featuredOnly]); // Add featuredOnly to dependencies

  // Filter and paginate properties with array safety checks
  useEffect(() => {
    try {
      setLoading(true);
      setError(null);

      // Fix: Use featuredProperties from state when featuredOnly is true
      let properties = featuredOnly 
        ? (Array.isArray(state.featuredProperties) ? [...state.featuredProperties] : [])
        : (Array.isArray(allProperties) ? [...allProperties] : []);

      // Apply search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        properties = properties.filter(p => 
          p.title.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        );
      }

      // Apply filters (only if not featuredOnly, since featured properties are pre-filtered)
      if (!featuredOnly) {
        if (filters.propertyType) {
          properties = properties.filter(p => p.propertyType === filters.propertyType);
        }
        if (filters.city) {
          properties = properties.filter(p => p.city === filters.city);
        }
        if (filters.minPrice) {
          properties = properties.filter(p => p.price >= filters.minPrice!);
        }
        if (filters.maxPrice) {
          properties = properties.filter(p => p.price <= filters.maxPrice!);
        }
      }
      if (filters.beds) {
        properties = properties.filter(p => p.beds >= filters.beds!);
      }
      if (filters.baths) {
        properties = properties.filter(p => p.baths >= filters.baths!);
      }
      if (filters.minSize) {
        properties = properties.filter(p => p.size >= filters.minSize!);
      }
      if (filters.maxSize) {
        properties = properties.filter(p => p.size <= filters.maxSize!);
      }

      // Sort properties
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price-asc':
            properties.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            properties.sort((a, b) => b.price - a.price);
            break;
          case 'newest':
            properties.sort((a, b) => new Date(b.dateListed).getTime() - new Date(a.dateListed).getTime());
            break;
          case 'oldest':
            properties.sort((a, b) => new Date(a.dateListed).getTime() - new Date(b.dateListed).getTime());
            break;
        }
      }

      const total = properties.length;
      setTotalProperties(total);

      // Apply pagination
      if (showPagination) {
        const totalPagesCalc = Math.ceil(total / itemsPerPage);
        setTotalPages(totalPagesCalc);
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        properties = properties.slice(startIndex, endIndex);
      }

      setFilteredProperties(properties);
    } catch (err) {
      setError('Failed to load properties. Please try again.');
      console.error('Error filtering properties:', err);
    } finally {
      setLoading(false);
    }
  }, [allProperties, filters, searchQuery, currentPage, itemsPerPage, showPagination, featuredOnly]);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && filteredProperties.length === 0) {
    return (
      <div className={className}>
        <PropertyGridSkeleton count={itemsPerPage} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <LoadingError 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  // Show context error if properties failed to load from API
  if (contextError && (!Array.isArray(allProperties) || allProperties.length === 0)) {
    return (
      <div className={`property-grid ${className}`}>
        <LoadingError 
          message={contextError}
          onRetry={loadProperties}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Filters */}
      {showFilters && (
        <div className="mb-8">
          <FilterBar
            onFiltersChange={handleFiltersChange}
            onSearchChange={handleSearchChange}
            currentFilters={filters}
            searchQuery={searchQuery}
          />
        </div>
      )}

      {/* Results Summary */}
      {!featuredOnly && (
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredProperties.length} of {totalProperties.toLocaleString()} properties
          </p>
        </div>
      )}

      {/* Properties Grid */}
      {Array.isArray(filteredProperties) && filteredProperties.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => {
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
                  onClick={onPropertyClick ? () => onPropertyClick(property) : undefined}
                />
              );
            })}
          </div>

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
        </>
      ) : (
        <NoResults
          message="No properties found"
          suggestion={
            searchQuery || Object.keys(filters).length > 0
              ? 'Try adjusting your search criteria or filters.'
              : 'Check back later for new listings.'
          }
        />
      )}
    </div>
  );
}
