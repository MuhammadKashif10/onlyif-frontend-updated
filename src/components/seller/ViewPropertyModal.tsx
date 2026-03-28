'use client';

import React from 'react';
import Modal from '@/components/reusable/Modal';
import { Button } from '@/components/reusable/Button';
import AssignedAgentCard from '@/components/seller/AssignedAgentCard';
import { getSafeImageUrl } from '@/utils/imageUtils';
import { Bed, Bath, Car } from 'lucide-react';

interface ViewPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
}

export default function ViewPropertyModal({
  isOpen,
  onClose,
  property
}: ViewPropertyModalProps) {
  const imageUrl = getSafeImageUrl(
    property?.primaryImage ||
    property?.images?.[0]?.url ||
    property?.mainImage?.url
  );

  const propertyId = property?._id || property?.id;

  // Normalize details from various possible keys
  const bedrooms = property?.bedrooms ?? property?.beds ?? property?.attributes?.bedrooms ?? null;
  const bathrooms = property?.bathrooms ?? property?.baths ?? property?.attributes?.bathrooms ?? null;
  const carSpaces = property?.carSpaces ?? property?.parkingSpaces ?? property?.garageSpaces ?? null;
  const propertyType = property?.propertyType ?? property?.attributes?.propertyType ?? null;

  // Prefer `size` if present; otherwise convert `squareMeters` → sqft
  const sizeSqft =
    property?.size != null
      ? Number(property.size)
      : property?.squareMeters != null
        ? Math.round(Number(property.squareMeters) * 10.7639)
        : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Property Details" size="lg">
      <div className="space-y-4">
        {/* Header with image and basic info */}
        <div className="flex gap-4">
          <img
            src={imageUrl}
            alt={property?.title || 'Property'}
            className="w-40 h-28 object-cover rounded-md border"
          />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {property?.title || 'Untitled Property'}
            </h3>
            <p className="text-gray-600">
              {typeof property?.address === 'string'
                ? property?.address
                : [
                    property?.address?.street,
                    property?.address?.city,
                    property?.address?.state
                  ].filter(Boolean).join(', ')
              }
            </p>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {property?.price != null ? `$${Number(property?.price).toLocaleString()}` : '—'}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-center justify-start">
              <Bed className="w-6 h-6 text-blue-600" aria-label="Bedrooms" />
            </div>
            <div className="text-lg font-semibold text-gray-900">{bedrooms ?? '—'}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-center justify-start">
              <Bath className="w-6 h-6 text-teal-600" aria-label="Bathrooms" />
            </div>
            <div className="text-lg font-semibold text-gray-900">{bathrooms ?? '—'}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-center justify-start">
              <Car className="w-6 h-6 text-amber-600" aria-label="Car Spaces" />
            </div>
            <div className="text-lg font-semibold text-gray-900">{carSpaces ?? '—'}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">Size (sqft)</div>
            <div className="text-lg font-semibold text-gray-900">{sizeSqft ?? '—'}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">Status</div>
            <div className="text-lg font-semibold text-gray-900">{property?.status ?? '—'}</div>
          </div>
        </div>

        {/* Property type and views */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500">Type</div>
            <div className="text-lg font-semibold text-gray-900">{propertyType ?? '—'}</div>
          </div>
          {/* Removed: Views container */}
        </div>

        {/* Assigned Agent */}
        {property?.assignedAgent && (
          <div>
            <AssignedAgentCard
              agent={property.assignedAgent}
              assignedAt={property.assignedDate || property.dateListed || new Date().toISOString()}
              propertyId={propertyId}
            />
          </div>
        )}

        {/* Actions (removed Open Full Page button) */}
        <div className="flex items-center justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}