'use client';

import React from 'react';
import { Property } from '@/types/api';
import { PropertyCard, Pagination } from '@/components';
import { useRouter } from 'next/navigation';
import { generatePropertyUrl } from '@/utils/slugify';

interface EnhancedPropertyGridProps {
  properties: Property[];
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export default function EnhancedPropertyGrid({
  properties,
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 100,
  onPageChange,
  className = ''
}: EnhancedPropertyGridProps) {
  const router = useRouter();

  // Handle property card click
  const handlePropertyClick = (property: Property) => {
    const propertyId = property.id;
    if (propertyId) {
      const seoUrl = generatePropertyUrl(propertyId, property.title);
      router.push(seoUrl);
    } else {
      console.error('Cannot navigate: Property ID not found', property);
    }
  };

  // Validation function for property objects
  const isValidProperty = (property: any): property is Property => {
    return (
      property &&
      typeof property === 'object' &&
      property.id &&
      typeof property.title === 'string' &&
      typeof property.address === 'string'
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Updating results...</p>
          </div>
        </div>
      )}

      {/* Property Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
        {properties.map((property) => {
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
              onClick={() => handlePropertyClick(property)}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="mt-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}