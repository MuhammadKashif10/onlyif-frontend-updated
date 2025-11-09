'use client';

import React, { useState, useEffect } from 'react';
import { Star, MapPin, Bed, Bath, Square, Heart, Eye, ExternalLink } from 'lucide-react';
import { buyerApi } from '@/api/buyer';
import { Property } from '@/types/api';
import Link from 'next/link';
import { generatePropertyUrl } from '@/utils/slugify';

interface RecommendationsSectionProps {
  onPropertyView?: (propertyId: string) => void;
}

export default function RecommendationsSection({ onPropertyView }: RecommendationsSectionProps) {
  const [recommendations, setRecommendations] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await buyerApi.getRecommendations();
        if (response.success) {
          setRecommendations(response.data || []);
        } else {
          setError(response.message || 'Failed to fetch recommendations');
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handlePropertyView = (property: Property) => {
    if (onPropertyView) {
      onPropertyView(property.id);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Properties</h2>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <Star className="h-5 w-5 text-yellow-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
        </div>
        <Link 
          href="/browse" 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All
        </Link>
      </div>
      
      <div className="p-6">
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.slice(0, 3).map((property) => {
              const seoUrl = generatePropertyUrl(property.id, property.title);
              
              return (
                <div key={property.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {property.mainImage ? (
                      <img 
                        src={property.mainImage} 
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-xs text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{property.title}</h3>
                    <div className="flex items-center text-gray-500 text-sm mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{property.address}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      {property.beds && (
                        <div className="flex items-center">
                          <Bed className="h-3 w-3 mr-1" />
                          <span>{property.beds}</span>
                        </div>
                      )}
                      {property.baths && (
                        <div className="flex items-center">
                          <Bath className="h-3 w-3 mr-1" />
                          <span>{property.baths}</span>
                        </div>
                      )}
                      {property.size && (
                        <div className="flex items-center">
                          <Square className="h-3 w-3 mr-1" />
                          <span>{property.size} m²</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900">
                      ${property.price?.toLocaleString()}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => handlePropertyView(property)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <Link
                        href={seoUrl}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Open Property"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No recommendations available yet</p>
            <Link 
              href="/browse"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Browse All Properties
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}