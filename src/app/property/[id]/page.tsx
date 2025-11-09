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
import { formatCurrencyCompact } from '@/utils/currency';
import ChatDemo from '@/components/ui/ContactAgentModal';
import OneToOneChat from '@/components/ui/ContactAgentModal';
import { Bed, Bath, Car } from 'lucide-react';

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);

  const propertyId = params.id as string;

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
          // Handle case where response.data exists but success is false
          setError(response.message || 'Failed to load property');
        } else {
          setError('Property not found');
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const handleContactAgent = async () => {
    if (!property?.agent && !agent) {
      // Try to fetch agent info if not available
      if (property?.agentId) {
        setAgentLoading(true);
        try {
          const agentResponse = await agentsApi.getAgentById(property.agentId);
          if (agentResponse && agentResponse.success && agentResponse.data) {
            setAgent(agentResponse.data);
          }
        } catch (err) {
          console.error('Error fetching agent:', err);
        } finally {
          setAgentLoading(false);
        }
      }
    }
    setIsContactModalOpen(true);
  };

  const handleViewAgentProfile = () => {
    const agentData = property?.agent || agent;
    if (agentData?.id) {
      router.push(`/agent/${agentData.id}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-8">
        <PropertyGridSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 py-8">
        <LoadingError 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="w-full px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => router.push('/browse')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const formatAddress = (address: Property['address']) => {
    if (typeof address === 'string') return address;
    if (address && typeof address === 'object') {
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
    if (property.mainImage?.url) return property.mainImage.url;
    if (property.finalImageUrl?.url) return property.finalImageUrl.url;
    if (property.images && property.images.length > 0) {
      const firstImage = property.images.find(img => img && img.url);
      if (firstImage) return firstImage.url;
    }
    return '/images/01.jpg';
  };

  return (
    <div className="w-full px-4 py-8">
      <button 
        onClick={() => router.back()}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
      >
        ← Back to Browse
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full">
        {/* Property Image - Full Width */}
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
                {formatCurrencyCompact(property.price || 0)}
              </p>
              <p className="text-gray-500">{property.status}</p>
            </div>
          </div>

          {/* Property Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center flex flex-col items-center">
              <Bed className="h-6 w-6 text-blue-600 mb-1" />
              <p className="text-2xl font-bold text-gray-900">{property.beds || 'N/A'}</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <Bath className="h-6 w-6 text-blue-600 mb-1" />
              <p className="text-2xl font-bold text-gray-900">{property.baths || 'N/A'}</p>
            </div>
            {property.carSpaces !== undefined && (
              <div className="text-center flex flex-col items-center">
                <Car className="h-6 w-6 text-blue-600 mb-1" />
                <p className="text-2xl font-bold text-gray-900">{property.carSpaces || 'N/A'}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {property.features.map((feature, index) => (
                  <div key={`feature-${feature}-${index}`} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Agent Section */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Interested in this property?</h2>
            
            {property.agent || agent ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleContactAgent}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Agent
                </button>
                
                <button
                  onClick={handleViewAgentProfile}
                  className="flex-1 border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Agent Profile
                </button>
              </div>
            ) :
             (
              <div className="text-center py-4">
                <button
                  disabled
                  className="bg-gray-300 text-gray-500 px-6 py-3 rounded-lg cursor-not-allowed font-medium"
                >
                  No agent assigned
                </button>
                <p className="text-gray-500 text-sm mt-2">
                  This property doesn't have an assigned agent yet.
                </p>
              </div>
            )}
          </div>

          {/* Agent Information Display (if available) */}
          {(property.agent || agent) && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Agent</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-600">
                    {(property.agent?.name || agent?.name || 'A').charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{property.agent?.name || agent?.name}</p>
                  <p className="text-gray-600">{property.agent?.title || agent?.title || 'Real Estate Agent'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
{isContactModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl w-full max-w-2xl">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">Chat with Agent</h2>
        <button onClick={() => setIsContactModalOpen(false)}>✕</button>
      </div>
      <div className="p-4">
        <OneToOneChat
          agent={property.agent}
          propertyTitle={property.title}
        />
      </div>
    </div>
  </div>
)}


    </div>
  );
}