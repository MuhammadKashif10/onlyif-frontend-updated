import React, { useState } from 'react';
import { useSellerContext } from '../../../context/SellerContext';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SubmitPhase: React.FC = () => {
  const { data, clearSellerData } = useSellerContext();
  const router = useRouter();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSubmitStatus('loading');
    setError('');

    try {
      // Prepare the property data for submission - transform to match backend schema
      const propertyData = {
        // Required fields for backend Property model
        title: `${data.propertyType || 'Property'} in ${data.address?.city || 'Unknown City'}`.trim(),
        address: data.address?.street?.trim() || '',
        city: data.address?.city?.trim() || '',
        state: data.address?.state?.trim() || '',
        zipCode: (data.address?.postalCode || data.address?.zipCode || '').trim(),
        price: parseFloat(data.price) || 0,
        beds: parseInt(data.bedrooms) || 0,
        baths: parseFloat(data.bathrooms) || 0,
        squareMeters: parseFloat(data.squareFootage) || 0,
        
        // FIXED: Add missing required fields
        propertyType: data.propertyType?.trim() || 'single-family',
        contactName: data.name?.trim() || '',
        contactEmail: data.email?.trim() || '',
        contactPhone: data.phone?.trim() || '',
        
        // FIXED: Add required coordinates (defaulting to NYC)
        latitude: 40.7128,
        longitude: -74.006,
        
        // Optional fields
        yearBuilt: data.yearBuilt ? parseInt(data.yearBuilt) : undefined,
        description: data.description?.trim() || '',
        features: Array.isArray(data.features) ? data.features.filter(f => f && f.trim()) : [],
        
        // Media - ensure it's a clean array of strings
        images: Array.isArray(data.photos) ? 
          data.photos.filter(photo => typeof photo === 'string' && photo.trim()) : [],
        
        // Timeline
        timeframe: data.timeframe?.trim() || ''
      };
    
      // FIXED: Enhanced validation for all required fields
      const requiredFields = {
        title: propertyData.title,
        address: propertyData.address,
        city: propertyData.city,
        state: propertyData.state,
        zipCode: propertyData.zipCode,
        contactName: propertyData.contactName,
        contactEmail: propertyData.contactEmail,
        propertyType: propertyData.propertyType
      };
      
      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value || (typeof value === 'string' && value.trim() === ''))
        .map(([key]) => key);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      if (propertyData.price <= 0) {
        throw new Error('Please enter a valid price');
      }

      if (!propertyData.contactEmail.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      console.log('Submitting property data:', propertyData);

      // Use direct fetch for public submission
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/properties/public-submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit property');
      }

      const result = await response.json();
      setSubmitStatus('success');
      
      // Clear the form data and redirect to seller dashboard
      setTimeout(() => {
        clearSellerData();
        router.push('/dashboards/seller'); // Redirect to seller dashboard
      }, 2000);
    } catch (err: any) {
      console.error('Property submission error:', err);
      setError(err.message || 'An error occurred while submitting your property');
      setSubmitStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Submit</h2>
        
        {/* Property Summary */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Property Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Property Type:</span>
              <span className="font-medium">{data.propertyType || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span className="font-medium">
                {data.address?.street ? `${data.address.street}, ${data.address.city}, ${data.address.state}` : 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium">${data.price ? parseFloat(data.price).toLocaleString() : 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bedrooms:</span>
              <span className="font-medium">{data.bedrooms || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bathrooms:</span>
              <span className="font-medium">{data.bathrooms || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Square Meters:</span>
              <span className="font-medium">{data.squareFootage ? `${data.squareFootage} m²` : 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{data.name || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{data.email || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{data.phone || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Photos */}
        {data.photos && data.photos.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Photos ({data.photos.length})</h3>
            <div className="grid grid-cols-3 gap-4">
              {data.photos.slice(0, 6).map((photo, index) => (
                <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={photo} 
                    alt={`Property photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            {data.photos.length > 6 && (
              <p className="text-sm text-gray-500 mt-2">+{data.photos.length - 6} more photos</p>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-green-700 font-medium">Property submitted successfully!</p>
              <p className="text-green-600 text-sm">We'll review your submission and get back to you soon.</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitStatus === 'loading' || submitStatus === 'success'}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitStatus === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitStatus === 'loading' ? 'Submitting...' : 
             submitStatus === 'success' ? 'Submitted!' : 'Submit Property'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitPhase;


const handleSubmit = async () => {
  try {
    setIsSubmitting(true);
    setErrors({});

    // Enhanced validation
    const validationErrors: Record<string, string> = {};
    
    if (!data.propertyType) validationErrors.propertyType = 'Property type is required';
    if (!data.name) validationErrors.contactName = 'Contact name is required';
    if (!data.email) validationErrors.contactEmail = 'Contact email is required';
    if (!data.phone) validationErrors.contactPhone = 'Contact phone is required';
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      validationErrors.contactEmail = 'Please enter a valid email address';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Convert squareFootage to squareMeters (1 sq ft = 0.092903 sq m)
    const squareMeters = data.squareFootage ? Math.round(data.squareFootage * 0.092903) : 0;

    // Process images for backend
    const processedImages = data.photos.map((photo: any, index: number) => ({
      url: photo.preview || '',
      caption: `Property image ${index + 1}`,
      isPrimary: index === 0,
      order: index
    }));

    // ...existing code...
    // Map apartment to condo for backend compatibility
    const mappedPropertyType = data.propertyType === 'apartment' ? 'condo' : data.propertyType;

    const propertyData = {
      title: data.title || `${mappedPropertyType} in ${data.address.city}`,
      address: data.address.street,
      city: data.address.city,
      state: data.address.state,
      zipCode: data.address.postalCode,
      price: data.price,
      beds: data.bedrooms,
      baths: data.bathrooms,
      squareMeters: squareMeters,
      propertyType: mappedPropertyType,
      yearBuilt: data.yearBuilt,
      description: data.description,
      features: data.features,
      contactName: data.name,
      contactEmail: data.email,
      contactPhone: data.phone,
      images: processedImages,
      timeframe: data.timeframe,
      latitude: 0, // TODO: Implement geocoding
      longitude: 0 // TODO: Implement geocoding
    };

    const response = await fetch('/api/properties/public-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propertyData),
    });

    const result = await response.json();

    if (result.success) {
      setCurrentPhase(5); // Move to success phase
    } else {
      setErrors({ submit: result.message || 'Failed to submit property' });
    }
  } catch (error) {
    console.error('Submission error:', error);
    setErrors({ submit: 'Network error. Please try again.' });
  } finally {
    setIsSubmitting(false);
  }
};