'use client';

import React, { useState } from 'react';
import { Button, Modal, InputField, Alert, Loader } from '@/components/reusable';
import { coreLogicAPI, CoreLogicValuationResponse } from '@/api/corelogic';
import { useUI } from '@/context/UIContext';
import { formatCurrencyCompact } from '@/utils/currency';

interface PriceCheckerProps {
  className?: string;
  propertyAddress?: string;
  onPriceReceived?: (valuation: CoreLogicValuationResponse) => void;
}

const PriceChecker: React.FC<PriceCheckerProps> = ({
  className = '',
  propertyAddress = '',
  onPriceReceived
}) => {
  const { addNotification } = useUI();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addressData, setAddressData] = useState({
    address: propertyAddress,
    suburb: '',
    state: '',
    postcode: ''
  });
  const [valuation, setValuation] = useState<CoreLogicValuationResponse | null>(null);

  const australianStates = [
    { code: 'NSW', name: 'New South Wales' },
    { code: 'VIC', name: 'Victoria' },
    { code: 'QLD', name: 'Queensland' },
    { code: 'WA', name: 'Western Australia' },
    { code: 'SA', name: 'South Australia' },
    { code: 'TAS', name: 'Tasmania' },
    { code: 'ACT', name: 'Australian Capital Territory' },
    { code: 'NT', name: 'Northern Territory' }
  ];

  const handleCheckPrice = async () => {
    if (!addressData.address.trim() || !addressData.suburb.trim() || !addressData.state || !addressData.postcode.trim()) {
      addNotification({
        type: 'error',
        message: 'Please fill in all address fields'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await coreLogicAPI.getPropertyValuation(addressData);
      setValuation(result);
      onPriceReceived?.(result);
      
      addNotification({
        type: 'success',
        message: 'Property valuation retrieved successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to get property valuation. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAddressData({
      address: propertyAddress,
      suburb: '',
      state: '',
      postcode: ''
    });
    setValuation(null);
    setShowModal(false);
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={() => setShowModal(true)}
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 py-3 px-6 rounded-lg font-medium shadow-lg"
      >
        <span className="mr-2">💰</span>
        Check My Price
      </Button>

      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title="Property Price Check"
        size="lg"
      >
        {!valuation ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Get Your Property Valuation
              </h3>
              <p className="text-gray-600">
                Get an instant property valuation powered by CoreLogic's comprehensive database.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <InputField
                  type="text"
                  value={addressData.address}
                  onChange={(e) => setAddressData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g., 123 Main Street"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Suburb *
                  </label>
                  <InputField
                    type="text"
                    value={addressData.suburb}
                    onChange={(e) => setAddressData(prev => ({ ...prev, suburb: e.target.value }))}
                    placeholder="e.g., Sydney"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postcode *
                  </label>
                  <InputField
                    type="text"
                    value={addressData.postcode}
                    onChange={(e) => setAddressData(prev => ({ ...prev, postcode: e.target.value }))}
                    placeholder="e.g., 2000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <select
                  value={addressData.state}
                  onChange={(e) => setAddressData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select State</option>
                  {australianStates.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name} ({state.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-600">ℹ️</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-900">About CoreLogic Valuations</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Our valuations are powered by CoreLogic's comprehensive property database, providing accurate estimates based on recent sales, market trends, and property characteristics.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCheckPrice}
                disabled={loading}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader size="small" className="mr-2" />
                    Getting Valuation...
                  </div>
                ) : (
                  'Get Valuation'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Property Valuation
              </h3>
              <p className="text-gray-600">
                {addressData.address}, {addressData.suburb}, {addressData.state} {addressData.postcode}
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Estimated Value</p>
                <p className="text-4xl font-bold text-gray-900 mb-4">
                  ${valuation.estimatedValue.toLocaleString()}
                </p>
                
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrencyCompact(valuation.estimatedValue)}
                </div>
                
                <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Low:</span> {formatCurrencyCompact(valuation.lowRange)}
                  </div>
                  <div>
                    <span className="font-medium">High:</span> {formatCurrencyCompact(valuation.highRange)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Confidence</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(valuation.confidence)}`}>
                    {valuation.confidence}
                  </span>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Last Updated</span>
                  <span className="text-sm text-gray-600">{valuation.lastUpdated}</span>
                </div>
              </div>
            </div>

            {(valuation.landSize || valuation.buildingArea) && (
              <div className="grid grid-cols-2 gap-4">
                {valuation.landSize && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Land Size</span>
                      <span className="text-sm text-gray-600">{valuation.landSize} m²</span>
                    </div>
                  </div>
                )}
                
                {valuation.buildingArea && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Building Area</span>
                      <span className="text-sm text-gray-600">{valuation.buildingArea} m²</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-600">⚠️</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-900">Important Note</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This is an automated valuation model (AVM) estimate. For a more accurate assessment, consider getting a professional property appraisal.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setValuation(null)}
              >
                Check Another Property
              </Button>
              <Button
                onClick={resetForm}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PriceChecker;