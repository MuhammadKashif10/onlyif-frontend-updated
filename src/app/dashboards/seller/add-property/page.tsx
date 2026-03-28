'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components';
import Sidebar from '@/components/main/Sidebar';
import { Button } from '@/components/reusable/Button';
import InputField from '@/components/reusable/InputField';
import TextArea from '@/components/reusable/TextArea';
import { useRouter } from 'next/navigation';
import { usePropertyContext } from '@/context/PropertyContext';
import { useAuth } from '@/context/AuthContext';
import { Property } from '@/types/api';
import { toast } from 'react-hot-toast';
import { propertiesApi } from '@/api/properties';
import AutoDescriptionButton from '@/components/seller/AutoDescriptionButton';

interface PropertyFormData {
  title: string;
  price: string;
  location: string; // This will be the street address
  description: string;
  bedrooms: string;
  bathrooms: string;
  squareMeters: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  yearBuilt: string;
  lotSize: string;
  // Add contact fields
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  carSpaces?: string;
}

export default function AddProperty() {
  const router = useRouter();
  const { addProperty, refreshProperties } = usePropertyContext();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    price: '',
    location: '',
    description: '',
    bedrooms: '',
    bathrooms: '',
    squareMeters: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'Single Family',
    yearBuilt: '',
    lotSize: '',
    // Add missing contact fields
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });

  const [propertyImages, setPropertyImages] = useState<File[]>([]);
  const [floorPlans, setFloorPlans] = useState<File[]>([]);
  const [videoTours, setVideoTours] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contactAutoFilled, setContactAutoFilled] = useState(false);

  // Auto-fill contact details from seller's account profile
  useEffect(() => {
    if (user && !contactAutoFilled) {
      setFormData((prev) => ({
        ...prev,
        contactName: user.name || prev.contactName,
        contactEmail: user.email || prev.contactEmail,
        contactPhone: (user as { phone?: string }).phone || prev.contactPhone
      }));
      setContactAutoFilled(true);
    }
  }, [user, contactAutoFilled]);

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files: FileList | null, type: 'images' | 'floorPlans' | 'videos') => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    
    switch (type) {
      case 'images':
        setPropertyImages(prev => [...prev, ...fileArray]);
        break;
      case 'floorPlans':
        setFloorPlans(prev => [...prev, ...fileArray]);
        break;
      case 'videos':
        setVideoTours(prev => [...prev, ...fileArray]);
        break;
    }
  };

  const removeFile = (index: number, type: 'images' | 'floorPlans' | 'videos') => {
    switch (type) {
      case 'images':
        setPropertyImages(prev => prev.filter((_, i) => i !== index));
        break;
      case 'floorPlans':
        setFloorPlans(prev => prev.filter((_, i) => i !== index));
        break;
      case 'videos':
        setVideoTours(prev => prev.filter((_, i) => i !== index));
        break;
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setPropertyImages(prev => {
      const newArr = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newArr.length) return prev;
      [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
      return newArr;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }
  
    // Keep client validation aligned with backend-required fields.
    // Optional fields should never block submission.
    const normalizedFormData = {
      ...formData,
      contactName: formData.contactName?.trim() || user?.name || '',
      contactEmail: formData.contactEmail?.trim() || user?.email || '',
      contactPhone: formData.contactPhone?.trim() || ((user as { phone?: string })?.phone || ''),
      description: formData.description?.trim() || 'No description provided'
    };

    const requiredFields: Array<keyof typeof normalizedFormData> = [
      'price',
      'location',
      'city',
      'state',
      'zipCode',
      'bedrooms',
      'bathrooms',
      'squareMeters',
      'propertyType',
      'contactName',
      'contactEmail',
      'contactPhone'
    ];
    const missingFields = requiredFields.filter(field => !normalizedFormData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
  
    try {
      setIsSubmitting(true);
      
      // Create FormData object for file uploads
      const formDataToSend = new FormData();
      
      // Append text data
      formDataToSend.append('owner', user.id);
      if (normalizedFormData.title?.trim()) formDataToSend.append('title', normalizedFormData.title.trim());
      formDataToSend.append('street', normalizedFormData.location);
      formDataToSend.append('city', normalizedFormData.city);
      formDataToSend.append('state', normalizedFormData.state);
      formDataToSend.append('zipCode', normalizedFormData.zipCode);
      formDataToSend.append('price', normalizedFormData.price);
      formDataToSend.append('beds', normalizedFormData.bedrooms);
      formDataToSend.append('baths', normalizedFormData.bathrooms);
      if (normalizedFormData.carSpaces) formDataToSend.append('carSpaces', normalizedFormData.carSpaces);
      formDataToSend.append('squareMeters', normalizedFormData.squareMeters);
      formDataToSend.append('propertyType', normalizedFormData.propertyType.toLowerCase().replace(' ', '-'));
      formDataToSend.append('description', normalizedFormData.description);
      formDataToSend.append('contactName', normalizedFormData.contactName);
      formDataToSend.append('contactEmail', normalizedFormData.contactEmail);
      formDataToSend.append('contactPhone', normalizedFormData.contactPhone);
      
      if (normalizedFormData.yearBuilt) formDataToSend.append('yearBuilt', normalizedFormData.yearBuilt);
      if (normalizedFormData.lotSize) formDataToSend.append('lotSize', normalizedFormData.lotSize);
      
      // Append image files
      propertyImages.forEach((file, index) => {
        formDataToSend.append('images', file);
      });
      
      // Append other files if needed
      floorPlans.forEach((file, index) => {
        formDataToSend.append('floorPlans', file);
      });
      
      videoTours.forEach((file, index) => {
        formDataToSend.append('videos', file);
      });
  
      const response = await propertiesApi.createPropertyWithFiles(formDataToSend);
      
      if (response.success) {
        toast.success('Property added successfully!');
        
        // Reset form
        setFormData({
          title: '',
          price: '',
          location: '',
          city: '',
          state: '',
          zipCode: '',
          bedrooms: '',
          bathrooms: '',
          squareMeters: '',
          propertyType: 'single-family',
          description: '',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          yearBuilt: '',
          lotSize: ''
        });
        setPropertyImages([]);
        setFloorPlans([]);
        setVideoTours([]);
        
        // Redirect to seller dashboard
        router.push('/dashboards/seller');
      } else {
        toast.error(response.error || 'Failed to add property. Please check required fields and try again.');
      }
    } catch (error: any) {
      console.error('Error adding property:', error);
      toast.error(error.message || 'Failed to submit property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex flex-col md:flex-row">
        <Sidebar userType="seller" />
        
        <main className="flex-1 md:ml-64 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 lg:p-8">
              <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Property</h1>
                <p className="text-gray-600">Fill in the details below to list your property</p>
              </header>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <InputField
                        label="Property Title (optional)"
                        placeholder="e.g. 4 Bedroom Home in Chelsea — or leave blank to auto-generate"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        id="title"
                        name="title"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.bedrooms && formData.city && formData.propertyType) {
                            const type = formData.propertyType.replace(/-/g, ' ');
                            const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
                            handleInputChange('title', `${formData.bedrooms} Bedroom ${typeLabel} in ${formData.city}`);
                          }
                        }}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Generate from details
                      </button>
                    </div>
                    
                    <InputField
                      label="Only If Price (trigger price)"
                      type="number"
                      placeholder="The price at which you would sell"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      required
                      id="price"
                      name="price"
                    />
                  </div>
                  
                  <div className="mt-6">
                    <InputField
                      label="Address"
                      placeholder="Enter full address"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      required
                      id="location"
                      name="location"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <InputField
                      label="City"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                      id="city"
                      name="city"
                    />
                    
                    <InputField
                      label="State"
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      required
                      id="state"
                      name="state"
                    />
                    
                    <InputField
                      label="Postcode"
                      placeholder="AU: 4 digits (e.g. 3000)"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      required
                      id="zipCode"
                      name="zipCode"
                    />
                  </div>
                </section>

                {/* Property Details */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField
                      label="Bedrooms"
                      type="number"
                      placeholder="Number of bedrooms"
                      value={formData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                      required
                      id="bedrooms"
                      name="bedrooms"
                    />
                    
                    <InputField
                      label="Bathrooms"
                      type="number"
                      placeholder="Number of bathrooms"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                      required
                      id="bathrooms"
                      name="bathrooms"
                    />
                    
                    <InputField
                      label="Car Spaces"
                      type="number"
                      placeholder="Number of car spaces (garage/parking)"
                      value={formData.carSpaces}
                      onChange={(e) => handleInputChange('carSpaces', e.target.value)}
                      id="carSpaces"
                      name="carSpaces"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <InputField
                      label="Square Meters"
                      type="number"
                      placeholder="Property size in sq m"
                      value={formData.squareMeters}
                      onChange={(e) => handleInputChange('squareMeters', e.target.value)}
                      required
                      id="squareMeters"
                      name="squareMeters"
                    />
                  </div>
                </section>

                {/* Contact Information - auto-filled from account */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                  <p className="text-sm text-gray-500 mb-4">Pre-filled from your account. You can edit if needed.</p>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <InputField
                      label="Contact Name"
                      placeholder="Enter contact name"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      required
                      id="contactName"
                      name="contactName"
                    />
                    
                    <InputField
                      label="Contact Email"
                      type="email"
                      placeholder="Enter contact email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      required
                      id="contactEmail"
                      name="contactEmail"
                    />
                    
                    <InputField
                      label="Contact Phone"
                      type="tel"
                      placeholder="e.g. 04XX XXX XXX (AU, no country code needed)"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      required
                      id="contactPhone"
                      name="contactPhone"
                    />
                  </div>
                </section>

                {/* Description */}
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Description</h2>
                    <AutoDescriptionButton
                      propertyData={{
                        houseName: formData.title,
                        address: formData.location,
                        location: `${formData.city}, ${formData.state}`,
                        bedrooms: formData.bedrooms,
                        bathrooms: formData.bathrooms,
                        size: formData.squareMeters ? `${formData.squareMeters} sq ft` : '',
                        price: formData.price,
                        features: `${formData.propertyType} built in ${formData.yearBuilt || 'N/A'}`
                      }}
                      onDescriptionGenerated={(description) => {
                        handleInputChange('description', description);
                      }}
                      existingDescription={formData.description}
                      disabled={!formData.location || !formData.bedrooms || !formData.bathrooms || !formData.price}
                    />
                  </div>
                  <TextArea
                    label="Property Description"
                    placeholder="Describe your property... or use the 'Generate Description' button above"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    rows={6}
                    id="description"
                    name="description"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    💡 Tip: Fill in the basic property details above, then click "Generate Description" for an AI-powered professional description.
                  </p>
                </section>

                {/* File Uploads */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Media</h2>
                  
                  {/* Property Images */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Images</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files, 'images')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {propertyImages.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">{propertyImages.length} image(s) selected. Drag order: first = primary.</p>
                        <div className="flex flex-col gap-2 mt-2">
                          {propertyImages.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded">
                              <div className="flex flex-col">
                                <button type="button" onClick={() => moveImage(index, 'up')} disabled={index === 0} className="text-gray-500 hover:text-gray-700 disabled:opacity-30">↑</button>
                                <button type="button" onClick={() => moveImage(index, 'down')} disabled={index === propertyImages.length - 1} className="text-gray-500 hover:text-gray-700 disabled:opacity-30">↓</button>
                              </div>
                              <span className="text-sm flex-1">{file.name}</span>
                              {index === 0 && <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Primary</span>}
                              <button type="button" onClick={() => removeFile(index, 'images')} className="text-red-500 hover:text-red-700">×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Floor Plans */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Floor Plans (Optional)</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e.target.files, 'floorPlans')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {floorPlans.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">{floorPlans.length} floor plan(s) selected</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Video Tours */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video Tours (Optional)</label>
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e.target.files, 'videos')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {videoTours.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">{videoTours.length} video(s) selected</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Adding Property...' : 'Add Property'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
