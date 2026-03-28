'use client';

import React, { useEffect, useState } from 'react';
import { useAgentContext } from '@/context/AgentContext';
import { Button } from '@/components/reusable/Button';
import Image from 'next/image';

interface PropertyDetails {
  id: string;
  title: string;
  address: string;
  price: number;
  status: string;
  images: string[];
  description: string;
  beds: number;
  baths: number;
  size: number;
  yearBuilt: number;
  lotSize: number;
  propertyType: string;
  features: string[];
  agent: {
    name: string;
    phone: string;
    email: string;
  };
  permissions: {
    canEdit: boolean;
    canScheduleInspection: boolean;
    canViewFinancials: boolean;
  };
  carSpaces?: number;
  parkingSpaces?: number;
}

export default function ViewListingPhase() {
  const { agentData, updateAgentData, nextPhase, previousPhase, setLoading, loading } = useAgentContext();
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!agentData.selectedProperty) {
        setHasPermission(false);
        return;
      }

      setLoading(true);
      try {
        // Use real API call instead of mock data
        const response = await propertiesApi.getPropertyById(agentData.selectedProperty.id);
        const propertyDetails = response.data || response;
        
        setPropertyDetails(propertyDetails);
        updateAgentData({ propertyDetails });
      } catch (error) {
        console.error('Error fetching property details:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [agentData.selectedProperty, setLoading, updateAgentData]);

  const nextImage = () => {
    if (propertyDetails && currentImageIndex < propertyDetails.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!hasPermission || !agentData.selectedProperty) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-2">Access Denied</div>
          <p className="text-gray-500 mb-4">You don't have permission to view this property or no property is selected.</p>
          <Button onClick={previousPhase} variant="secondary">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!propertyDetails) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Property Not Found</div>
          <p className="text-gray-500">Unable to load property details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Image Gallery */}
        <div className="relative h-96">
          <Image
            src={propertyDetails.images[currentImageIndex]}
            alt={propertyDetails.title}
            fill
            className="object-cover"
          />
          {propertyDetails.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                disabled={currentImageIndex === 0}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-30"
              >
                ←
              </button>
              <button
                onClick={nextImage}
                disabled={currentImageIndex === propertyDetails.images.length - 1}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-30"
              >
                →
              </button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {propertyDetails.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{propertyDetails.title}</h1>
              <p className="text-gray-600 mb-2">{propertyDetails.address}</p>
              <div className="text-3xl font-bold text-green-600">
                ${propertyDetails.price.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                propertyDetails.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' :
                propertyDetails.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {propertyDetails.status}
              </span>
            </div>
          </div>

          {/* Property Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-50">
                  <Bed className="h-6 w-6 text-blue-600" />
                </span>
                <span className="text-2xl font-bold text-gray-900">{propertyDetails.beds}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-teal-50">
                  <Bath className="h-6 w-6 text-teal-600" />
                </span>
                <span className="text-2xl font-bold text-gray-900">{propertyDetails.baths}</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-amber-50">
                  <Car className="h-6 w-6 text-amber-600" />
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {propertyDetails.carSpaces ?? propertyDetails.parkingSpaces ?? '—'}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{propertyDetails.yearBuilt}</div>
              <div className="text-sm text-gray-600">Year Built</div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{propertyDetails.description}</p>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {propertyDetails.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Agent Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Listing Agent</h3>
            <div className="text-gray-700">
              <div className="font-medium">{propertyDetails.agent.name}</div>
              <div className="text-sm">{propertyDetails.agent.phone}</div>
              <div className="text-sm">{propertyDetails.agent.email}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={previousPhase} variant="secondary" className="flex-1">
              Back to Assignments
            </Button>
            {propertyDetails.permissions.canScheduleInspection && (
              <Button onClick={nextPhase} variant="primary" className="flex-1">
                Manage Inspections
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}