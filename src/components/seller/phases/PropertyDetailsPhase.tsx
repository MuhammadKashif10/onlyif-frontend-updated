'use client';

import React, { useState } from 'react';
import { useSellerContext } from '@/context/SellerContext';
import Button from '@/components/reusable/Button';
import { coreLogicAPI, CoreLogicValuationResponse } from '@/api/corelogic';
import Loader from '@/components/reusable/Loader';

const propertyTypes = [
  { value: '', label: 'Select Property Type' },
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condominium' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'villa', label: 'Villa' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' }
];

export default function PropertyDetailsPhase() {
  const { data, updateData, setCurrentPhase, errors, setErrors } = useSellerContext();
  const [priceValuation, setPriceValuation] = useState<CoreLogicValuationResponse | null>(null);
  const [isLoadingValuation, setIsLoadingValuation] = useState(false);
  const [valuationError, setValuationError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Address validation
    if (!data.address.street.trim()) newErrors.street = 'Street address is required';
    if (!data.address.city.trim()) newErrors.city = 'City is required';
    if (!data.address.state.trim()) newErrors.state = 'State is required';
    if (!data.address.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    
    // Property details validation
    if (!data.price.trim()) newErrors.price = 'Price is required';
    if (!data.propertyType.trim()) newErrors.propertyType = 'Property type is required';
    
    // Add validation for new fields
    if (!data.bedrooms.trim()) newErrors.bedrooms = 'Number of bedrooms is required';
    if (!data.bathrooms.trim()) newErrors.bathrooms = 'Number of bathrooms is required';
    if (!data.squareFootage.trim()) newErrors.squareFootage = 'Square meters is required';
    
    // Validate numeric values
    if (data.bedrooms && (isNaN(Number(data.bedrooms)) || Number(data.bedrooms) < 0)) {
      newErrors.bedrooms = 'Please enter a valid number of bedrooms';
    }
    if (data.bathrooms && (isNaN(Number(data.bathrooms)) || Number(data.bathrooms) < 0)) {
      newErrors.bathrooms = 'Please enter a valid number of bathrooms';
    }
    if (data.squareFootage && (isNaN(Number(data.squareFootage)) || Number(data.squareFootage) <= 0)) {
      newErrors.squareFootage = 'Please enter a valid square meters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      setCurrentPhase(3);
    }
  };

  const handleBack = () => {
    setCurrentPhase(1);
  };

  const updateAddress = (field: string, value: string) => {
    updateData({
      address: {
        ...data.address,
        [field]: value
      }
    });
  };

  const handleCheckPriceRange = async () => {
    if (!data.address.street || !data.address.city || !data.address.postalCode) {
      setValuationError('Please fill in the complete address before checking price range.');
      return;
    }

    setIsLoadingValuation(true);
    setValuationError(null);

    try {
      const valuation = await coreLogicAPI.getPropertyValuation({
        address: data.address.street,
        suburb: data.address.city,
        state: data.address.state || 'TX',
        postcode: data.address.postalCode
      });
      
      setPriceValuation(valuation);
    } catch (error) {
      setValuationError(error instanceof Error ? error.message : 'Failed to get price valuation');
    } finally {
      setIsLoadingValuation(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Details</h2>
        <p className="text-gray-600">Tell us about your property</p>
      </div>

      <div className="space-y-6">
        {/* Address Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Address</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                id="street"
                value={data.address.street}
                onChange={(e) => updateAddress('street', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.street ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123 Main Street"
                aria-label="Street Address"
              />
              {errors.street && <p className="mt-1 text-sm text-red-600" role="alert">{errors.street}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  value={data.address.city}
                  onChange={(e) => updateAddress('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="City name"
                  aria-label="City"
                />
                {errors.city && <p className="mt-1 text-sm text-red-600" role="alert">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  value={data.address.state}
                  onChange={(e) => updateAddress('state', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="State"
                  aria-label="State"
                />
                {errors.state && <p className="mt-1 text-sm text-red-600" role="alert">{errors.state}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                id="postalCode"
                value={data.address.postalCode}
                onChange={(e) => updateAddress('postalCode', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.postalCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="12345"
                aria-label="Postal Code"
              />
              {errors.postalCode && <p className="mt-1 text-sm text-red-600" role="alert">{errors.postalCode}</p>}
            </div>
          </div>
        </div>

        {/* Property Details Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) *
              </label>
              <input
                type="text"
                id="price"
                value={data.price}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  updateData({ price: value });
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="500000"
                aria-label="Property Price"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600" role="alert">{errors.price}</p>}
              {data.price && (
                <p className="mt-1 text-sm text-gray-600">
                  ${Number(data.price).toLocaleString()}
                </p>
              )}
              
              {/* Check Price Range Button */}
              <div className="mt-3">
                <Button
                  onClick={handleCheckPriceRange}
                  variant="outline"
                  size="sm"
                  disabled={isLoadingValuation || !data.address.street || !data.address.city || !data.address.postalCode}
                  className="w-full md:w-auto"
                  aria-label="Check property price range using CoreLogic data"
                >
                  {isLoadingValuation ? (
                    <>
                      <Loader className="w-4 h-4 mr-2" />
                      Checking Price Range...
                    </>
                  ) : (
                    'Check Price Range'
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                id="propertyType"
                value={data.propertyType}
                onChange={(e) => updateData({ propertyType: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.propertyType ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-label="Property Type"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.propertyType && <p className="mt-1 text-sm text-red-600" role="alert">{errors.propertyType}</p>}
            </div>
          </div>
        </div>

        {/* Add this new section for bedrooms, bathrooms, square footage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms *
            </label>
            <input
              type="number"
              id="bedrooms"
              min="0"
              max="20"
              value={data.bedrooms}
              onChange={(e) => updateData({ bedrooms: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bedrooms ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="3"
              aria-label="Number of Bedrooms"
            />
            {errors.bedrooms && <p className="mt-1 text-sm text-red-600" role="alert">{errors.bedrooms}</p>}
          </div>

          <div>
            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
              Bathrooms *
            </label>
            <input
              type="number"
              id="bathrooms"
              min="0"
              max="20"
              step="0.5"
              value={data.bathrooms}
              onChange={(e) => updateData({ bathrooms: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bathrooms ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="2.5"
              aria-label="Number of Bathrooms"
            />
            {errors.bathrooms && <p className="mt-1 text-sm text-red-600" role="alert">{errors.bathrooms}</p>}
          </div>

          <div>
            <label htmlFor="squareFootage" className="block text-sm font-medium text-gray-700 mb-2">
              Square Meters *
            </label>
            <input
              type="number"
              id="squareFootage"
              min="0"
              value={data.squareFootage}
              onChange={(e) => updateData({ squareFootage: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.squareFootage ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="185"
              aria-label="Square Meters"
            />
            {errors.squareFootage && <p className="mt-1 text-sm text-red-600" role="alert">{errors.squareFootage}</p>}
          </div>
        </div>

        {/* Price Valuation Results */}
        {(priceValuation || valuationError) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-4">CoreLogic Price Estimation</h4>
            
            {valuationError ? (
              <div className="text-red-600" role="alert">
                <p className="font-medium">Error getting price estimation:</p>
                <p className="text-sm mt-1">{valuationError}</p>
              </div>
            ) : priceValuation ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">${priceValuation.lowRange.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Low Range</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">${priceValuation.estimatedValue.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Estimated Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">${priceValuation.highRange.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">High Range</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                  <span>Confidence: <span className="font-medium">{priceValuation.confidence}</span></span>
                  <span>Last Updated: {priceValuation.lastUpdated}</span>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-yellow-800 text-sm font-medium">
                    📋 This is a guide only – your chosen price is entirely up to you.
                  </p>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button
            onClick={handleBack}
            variant="outline"
            className="px-8"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="px-8"
          >
            Next: Upload Media
          </Button>
        </div>
      </div>
    </div>
  );
}