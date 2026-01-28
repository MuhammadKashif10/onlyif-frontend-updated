'use client';

import React, { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }
  
    // Client-side validation
    const requiredFields = ['title', 'price', 'location', 'city', 'state', 'zipCode', 'bedrooms', 'bathrooms', 'squareMeters', 'propertyType', 'contactName', 'contactEmail', 'contactPhone'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
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
      formDataToSend.append('title', formData.title);
      formDataToSend.append('street', formData.location);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('zipCode', formData.zipCode);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('beds', formData.bedrooms);
      formDataToSend.append('baths', formData.bathrooms);
      if (formData.carSpaces) formDataToSend.append('carSpaces', formData.carSpaces);
      formDataToSend.append('squareMeters', formData.squareMeters);
      formDataToSend.append('propertyType', formData.propertyType.toLowerCase().replace(' ', '-'));
      formDataToSend.append('description', formData.description);
      formDataToSend.append('contactName', formData.contactName);
      formDataToSend.append('contactEmail', formData.contactEmail);
      formDataToSend.append('contactPhone', formData.contactPhone);
      
      if (formData.yearBuilt) formDataToSend.append('yearBuilt', formData.yearBuilt);
      if (formData.lotSize) formDataToSend.append('lotSize', formData.lotSize);
      
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
        toast.error(response.error || 'Failed to add property');
      }
    } catch (error: any) {
      console.error('Error adding property:', error);
      toast.error(error.message || 'An error occurred while adding the property');
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
                    <InputField
                      label="Property Title"
                      placeholder="Enter property title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                      id="title"
                      name="title"
                    />
                    
                    <InputField
                      label="Price"
                      type="number"
                      placeholder="Enter price"
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
                      label="ZIP Code"
                      placeholder="Enter ZIP code"
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

                {/* Contact Information - ADD THIS SECTION */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
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
                      placeholder="Enter contact phone"
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
                        <p className="text-sm text-gray-600">{propertyImages.length} image(s) selected</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {propertyImages.map((file, index) => (
                            <div key={index} className="flex items-center bg-gray-100 px-2 py-1 rounded">
                              <span className="text-sm">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(index, 'images')}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
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
