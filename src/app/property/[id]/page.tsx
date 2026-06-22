'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Property, Agent } from '@/types/api';
import { propertiesApi } from '@/api/properties';
import { PropertyGridSkeleton } from '@/components/ui/LoadingSkeleton';
import { LoadingError } from '@/components/ui/ErrorMessage';
import AgentChatModal from '@/components/ui/AgentChatModal';
import Image from 'next/image';
import { getSafeImageUrl } from '@/utils/imageUtils';
import { getNonDuplicateAddress } from '@/utils/addressUtils';
import { formatCurrencyCompact, formatCurrency } from '@/utils/currency';
import { PRICING } from '@/utils/constants';
import { Bed, Bath, Car, Lock } from 'lucide-react';
import OccupancyBadge from '@/components/property/OccupancyBadge';
import InvestmentDetails from '@/components/property/InvestmentDetails';
import PropertyDocuments from '@/components/property/PropertyDocuments';

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

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

  const handleContactAgent = () => {
    setIsContactModalOpen(true);
  };

  const handleUnlock = async () => {
    setIsUnlocking(true);
    setUnlockError(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/signin');
      return;
    }

    // Same normalized backend base as the other checkout entry points
    // (drops a trailing slash and a trailing "/api" to avoid "/api/api").
    const backendBase = (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
      ''
    )
      .replace(/\/$/, '')
      .replace(/\/api$/, '');

    // Use the real Mongo id from the loaded property (the URL param may be a slug).
    const targetId = (property as any)?._id || (property as any)?.id || propertyId;

    try {
      const res = await fetch(`${backendBase}/api/payment/checkout/${targetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => ({} as any));

      if (data.alreadyPaid) {
        // Already unlocked — reload to fetch the full (unlocked) details.
        window.location.reload();
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setUnlockError(data?.message || 'Unable to start checkout. Please try again.');
      setIsUnlocking(false);
    } catch {
      setUnlockError('Unable to start checkout. Please try again.');
      setIsUnlocking(false);
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
            onClick={() => router.push('/buy')}
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
    // mainImage is a flat string in the current API; tolerate a legacy { url } object too.
    const mainImage = property.mainImage as unknown;
    if (typeof mainImage === 'string' && mainImage.trim()) return mainImage;
    if (mainImage && typeof mainImage === 'object' && (mainImage as { url?: string }).url) {
      return (mainImage as { url: string }).url;
    }
    if (property.images && property.images.length > 0) {
      const firstImage = property.images.find(img => img && img.url);
      if (firstImage) return firstImage.url;
    }
    return '/images/01.jpg';
  };

  // Avoid showing the same street/locality text in both the title and the
  // address line. The title is always rendered; the address line only shows
  // information the title doesn't already include.
  const displayAddress = getNonDuplicateAddress(property.title, formatAddress(property.address));

  // Backend now returns a reliable `agent` + `agentAssigned`. Prefer those;
  // keep local `agent` state only as a harmless fallback.
  const resolvedAgent = property.agent || agent;
  const hasAgent = !!(property.agentAssigned && resolvedAgent);

  // Paid-content gate. The backend omits the full details and sets isUnlocked:false
  // for viewers who haven't paid. Treat an explicit `false` as locked.
  const isUnlocked = (property as any).isUnlocked !== false;

  if (!isUnlocked) {
    return (
      <div className="w-full px-4 py-8">
        <button
          onClick={() => router.push('/buy')}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back to Browse
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-3xl mx-auto">
          {/* Blurred preview image with lock overlay */}
          <div className="relative h-96 w-full">
            <Image
              src={getSafeImageUrl(getMainImage())}
              alt={property.title}
              fill
              className="object-cover blur-sm"
              priority
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center mb-3">
                <Lock className="h-7 w-7 text-gray-700" />
              </div>
              <p className="text-white font-semibold text-lg">Locked listing</p>
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                {displayAddress && (
                  <p className="text-gray-600 text-lg">{displayAddress}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrencyCompact(property.price || 0)}
                </p>
                <p className="text-gray-500">{property.status}</p>
              </div>
            </div>

            {/* Preview stats (non-sensitive) */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center flex flex-col items-center">
                <Bed className="h-6 w-6 text-blue-600 mb-1" />
                <p className="text-2xl font-bold text-gray-900">{property.beds || 'N/A'}</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <Bath className="h-6 w-6 text-blue-600 mb-1" />
                <p className="text-2xl font-bold text-gray-900">{property.baths || 'N/A'}</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <Car className="h-6 w-6 text-blue-600 mb-1" />
                <p className="text-2xl font-bold text-gray-900">{property.carSpaces || 'N/A'}</p>
              </div>
            </div>

            <div className="border-t pt-6 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Unlock full property details</h2>
              <p className="text-gray-600 mb-4">
                Pay {formatCurrency(PRICING.UNLOCK_FEE)} to view the full address, description, photos and agent contact.
              </p>

              {unlockError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {unlockError}
                </div>
              )}

              <button
                onClick={handleUnlock}
                disabled={isUnlocking}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUnlocking ? 'Redirecting…' : `Unlock for ${formatCurrency(PRICING.UNLOCK_FEE)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              {displayAddress && (
                <p className="text-gray-600 text-lg">{displayAddress}</p>
              )}
              <OccupancyBadge property={property} className="mt-2" />
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

          {/* Investment Details (read-only; self-hides when no data) */}
          <InvestmentDetails property={property} />

          {/* Documents (read-only view/download; only shows when documents exist) */}
          {property.propertyDocuments && property.propertyDocuments.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Documents</h2>
              <PropertyDocuments
                propertyId={property._id || property.id}
                documents={property.propertyDocuments}
                canManage={false}
              />
            </div>
          )}

          {/* Assigned Agent Section (single, consolidated) */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Assigned Agent</h2>

            {hasAgent && resolvedAgent ? (
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-600">
                      {(resolvedAgent.name || 'A').charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{resolvedAgent.name}</p>
                    <p className="text-gray-600">{resolvedAgent.title || 'Real Estate Agent'}</p>
                  </div>
                </div>

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
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No agent assigned yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Agent Modal */}
      {hasAgent && resolvedAgent && (
        <AgentChatModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          agent={resolvedAgent}
          propertyTitle={property.title}
        />
      )}

    </div>
  );
}