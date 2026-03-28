import React from 'react';
import { getSafeImageUrl } from '@/utils/imageUtils';
import { formatCurrency } from '@/utils/currency';

interface AddonCardProps {
  title: string;
  description: string;
  price: number;
  image: string;
  features: string[];
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
  isActive?: boolean;
}

export default function AddonCard({
  title,
  description,
  price,
  image,
  features,
  isSelected,
  onSelect,
  className = '',
  isActive = false
}: AddonCardProps) {
  // Remove the old formatPrice function
  // const formatPrice = (price: number) => {
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: 'USD'
  //   }).format(price);
  // };

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    } ${className}`}>
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={getSafeImageUrl(image, 'addon')}
            alt={`${title} - Property marketing service`}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getSafeImageUrl('', 'addon');
            }}
          />
          {(isSelected || isActive) && (
            <div className="absolute top-2 right-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isActive 
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}>
                {isActive ? '✓ Active' : '✓ Selected'}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Content Section */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="text-2xl font-bold text-blue-600">{formatCurrency(price)}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>
        
        {/* Features List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Features:</h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Action Button */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          {isActive ? (
            <div className="text-center text-green-600 font-medium">
              ✓ Service Active
            </div>
          ) : (
            <div className="text-center">
              <span className={`text-sm ${
                isSelected ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}>
                {isSelected ? 'Selected for purchase' : 'Click to select'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}