'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Property, Agent } from '@/types/api';
import { propertiesApi } from '@/api/properties';
import { agentsApi } from '@/api/agents';
import { PropertyGridSkeleton } from '@/components/ui/LoadingSkeleton';
import { LoadingError } from '@/components/ui/ErrorMessage';
import ContactAgentModal from '@/components/ui/ContactAgentModal';
import Image from 'next/image';
import { getSafeImageUrl } from '@/utils/imageUtils';
import ChatDemo from '@/components/ui/ContactAgentModal';
import OneToOneChat from '@/components/ui/ContactAgentModal';

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);

  // Handle both /property/[id] and /property/[id]/[slug] patterns
  const urlParams = Array.isArray(params.params) ? params.params : [];
  const propertyId = urlParams[0]; // First param is always the ID
  const slug = urlParams[1]; // Second param is the slug (optional)

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) {
        setError('Property ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await propertiesApi.getPropertyById(propertyId);
        console.log("🚀 ~ fetchProperty ~ response:", response)
        
        // Handle the API response structure properly
        if (response && response.success && response.data) {
          setProperty(response.data);
          
          // If property has agent info, set it directly
          if (response.data.agent) {
            setAgent(response.data.agent);
          }
        } else if (response && response.data && !response.success) {
          // Handle error response
          setError(response.message || 'Failed to fetch property');
        } else {
          // Handle unexpected response structure
          setError('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  // ... existing code ...
  const formatAddress = (address: any) => {
    if (typeof address === 'string') {
      return address;
    }
    
    if (typeof address === 'object' && address !== null) {
      const parts = [];
      if (address.street) parts.push(address.street);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.zipCode) parts.push(address.zipCode);
      return parts.join(', ');
    }
    
    return 'Address not available';
  };

  const getMainImage = () => {
    if (property?.images && property.images.length > 0) {
      return property.images[0];
    }
    if (property?.mainImage) {
      return property.mainImage;
    }
    return '/images/default-property.jpg';
  };

  const handleContactAgent = async () => {
    if (!property?.agent?.id && !agent?.id) {
      setError('No agent assigned to this property');
      return;
    }

    const agentId = property?.agent?.id || agent?.id;
    
    try {
      setAgentLoading(true);
      const agentResponse = await agentsApi.getAgentById(agentId);
      
      if (agentResponse && agentResponse.success && agentResponse.data) {
        setAgent(agentResponse.data);
        setIsContactModalOpen(true);
      } else {
        setError('Failed to load agent details');
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
      setError('Failed to load agent information');
    } finally {
      setAgentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PropertyGridSkeleton count={1} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingError 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => router.push('/browse')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => router.back()}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
      >
        ← Back to Browse
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Property Image */}
        <div className="relative h-96 w-full">
          <Image
            src={getSafeImageUrl(getMainImage())}
            alt={property.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Property Details */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <p className="text-gray-600 text-lg">{formatAddress(property.address)}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">
                ${property.price?.toLocaleString()}
              </p>
              <p className="text-gray-500">{property.status}</p>
            </div>
          </div>

          {/* Property Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{property.beds || 'N/A'}</p>
              <p className="text-gray-600">Bedrooms</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{property.baths || 'N/A'}</p>
              <p className="text-gray-600">Bathrooms</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {property.size ? `${property.size.toLocaleString()} m²` : 'N/A'}
              </p>
              <p className="text-gray-600">Size</p>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Contact Agent Button */}
          <div className="flex justify-center">
            <button
              onClick={handleContactAgent}
              disabled={agentLoading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {agentLoading ? 'Loading...' : 'Contact Agent'}
            </button>
          </div>
        </div>
      </div>

      {/* Contact Agent Modal */}
      {isContactModalOpen && agent && (
        <ContactAgentModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          agent={agent}
          property={property}
        />
      )}
    </div>
  );
}