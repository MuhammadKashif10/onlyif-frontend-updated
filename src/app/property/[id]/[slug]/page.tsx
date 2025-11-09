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
import { Bed, Bath, Car } from 'lucide-react';
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

  const propertyId = params.id as string;
  const slug = params.slug as string;

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

  // Fetch agent details if property has an agent ID but no agent data
  useEffect(() => {
    const fetchAgent = async () => {
      if (property && property.agentId && !agent) {
        try {
          setAgentLoading(true);
          const agentResponse = await agentsApi.getAgentById(property.agentId);
          if (agentResponse && agentResponse.success && agentResponse.data) {
            setAgent(agentResponse.data);
          }
        } catch (error) {
          console.error('Error fetching agent:', error);
        } finally {
          setAgentLoading(false);
        }
      }
    };

    fetchAgent();
  }, [property, agent]);

  const handleContactAgent = () => {
    setIsContactModalOpen(true);
  };

  const formatAddress = (address: any) => {
    if (typeof address === 'string') {
      return address;
    }
    if (typeof address === 'object' && address !== null) {
      const { street, city, state, zipCode } = address;
      return [street, city, state, zipCode].filter(Boolean).join(', ');
    }
    return 'Address not available';
  };

  const getMainImage = () => {
    // images can be strings or objects with `url`
    if (property?.images && property.images.length > 0) {
      const first = (property.images as any[])[0];
      return typeof first === 'string' ? first : first?.url;
    }
    if (property?.mainImage) {
      const mi = (property as any).mainImage;
      return typeof mi === 'string' ? mi : mi?.url;
    }
    if ((property as any)?.finalImageUrl) {
      const fi = (property as any).finalImageUrl;
      return typeof fi === 'string' ? fi : fi?.url;
    }
    if ((property as any)?.primaryImage) {
      return (property as any).primaryImage;
    }
    return '/images/01.jpg';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PropertyGridSkeleton />
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
          <div className="grid grid-cols-3 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-3">
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-50">
                <Bed className="h-8 w-8 text-blue-600" />
              </span>
              <span className="text-3xl font-bold text-gray-900">
                {property?.beds ?? 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-teal-50">
                <Bath className="h-8 w-8 text-teal-600" />
              </span>
              <span className="text-3xl font-bold text-gray-900">
                {property?.baths ?? 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-50">
                <Car className="h-8 w-8 text-amber-600" />
              </span>
              <span className="text-3xl font-bold text-gray-900">
                {(property as any)?.carSpaces ?? (property as any)?.parkingSpaces ?? 'N/A'}
              </span>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Property Features */}
          {property.features && property.features.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {property.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agent Information */}
          {agent && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Agent</h2>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {agent.name?.charAt(0) || 'A'}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                  </div>
                </div>
                <button
                  onClick={handleContactAgent}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Contact Agent
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Agent Modal */}
      {isContactModalOpen && agent && (
        <ContactAgentModal
          agent={agent}
          property={property}
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}
    </div>
  );
}