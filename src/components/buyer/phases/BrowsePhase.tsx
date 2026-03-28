'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Property } from '@/types/api';
import { PropertyGrid } from '@/components/sections';
import { useBuyerContext } from '@/context/BuyerContext';
import { generatePropertyUrl } from '@/utils/slugify';

export default function BrowsePhase() {
  const router = useRouter();
  const { buyerData, updateBuyerData } = useBuyerContext();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedPropertyData, setSelectedPropertyData] = useState<Property | null>(null);

  // Handle property selection from PropertyGrid
  const handlePropertySelect = (property: Property) => {
    setSelectedPropertyId(property.id);
    setSelectedPropertyData(property);
    
    updateBuyerData({
      selectedProperty: {
        id: property.id,
        title: property.title,
        price: property.price,
        address: property.address
      }
    });
    
    // Navigate to property details page with SEO-friendly URL
    const seoUrl = generatePropertyUrl(property.id, property.title);
    router.push(seoUrl);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Browse Available Properties
        </h2>
        <p className="text-gray-600 mb-8">
          Explore our curated selection of properties and find your perfect home.
        </p>
      </div>

      <PropertyGrid
        onPropertyClick={handlePropertySelect}
        showFilters={true}
        showPagination={true}
        itemsPerPage={12}
      />

      {selectedPropertyData && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Selected Property</h3>
          <p className="text-blue-800">
            {selectedPropertyData.title} - ${selectedPropertyData.price?.toLocaleString()}
          </p>
          <p className="text-blue-700 text-sm">{selectedPropertyData.address}</p>
        </div>
      )}
    </div>
  );
}