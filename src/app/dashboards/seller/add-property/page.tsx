'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, Settings, Bell, Home } from 'lucide-react';
import { Navbar } from '@/components';
import Sidebar from '@/components/main/Sidebar';
import { Button } from '@/components/reusable/Button';
import InputField from '@/components/reusable/InputField';
import TextArea from '@/components/reusable/TextArea';
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
  const { user, logout } = useAuth();
  
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30 w-full">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <img src="/images/logo.PNG" alt="Only If" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Center: Main Site Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link href="/buy" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">Buy</Link>
          <Link href="/signin" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">Sell</Link>
          <Link href="/how-it-works" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">How it Works</Link>
          <Link href="/agents" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">Agents</Link>
        </nav>

        {/* Right: Dashboard & Sign Out */}
        <div className="flex items-center space-x-6">
          <Link 
            href="/dashboard"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Dashboard
          </Link>
          <button 
            onClick={logout}
            className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors"
          >
            Sign Out
          </button>
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex-shrink-0">
              <img 
                src="/images/user-avatar.jpg" 
                alt="User" 
                className="w-full h-full object-cover" 
                onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${user?.name || 'S'}&background=10b981&color=fff`)} 
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar - Fixed Position */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-20 bottom-0 z-20 overflow-y-auto">
          <div className="p-8 flex-1">
            <nav className="space-y-2">
              <button
                onClick={() => router.push('/dashboards/seller')}
                className="w-full flex items-center space-x-3 px-5 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              >
                <LayoutDashboard className="w-5 h-5 text-gray-400" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => router.push('/dashboards/seller/listings')}
                className="w-full flex items-center space-x-3 px-5 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              >
                <Building2 className="w-5 h-5 text-gray-400" />
                <span>My Listings</span>
              </button>
              <button
                onClick={() => router.push('/dashboards/seller/account')}
                className="w-full flex items-center space-x-3 px-5 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              >
                <Settings className="w-5 h-5 text-gray-400" />
                <span>Account Settings</span>
              </button>
            </nav>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center space-x-4 p-2">
              <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Seller Name'}</p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Seller</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 ml-72 flex flex-col">
          <main className="p-10 w-full max-w-7xl mx-auto min-h-[calc(100vh-5rem)]">
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm p-10">
                <header className="mb-10">
                  <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Add Property</h1>
                  <p className="text-gray-500 font-medium text-lg">Fill in the details below to list your property</p>
                </header>
                
                <form onSubmit={handleSubmit} className="space-y-12">
                  {/* Basic Information */}
                  <section className="space-y-6">
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">1</span>
                      Basic Information
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <InputField
                          label="Property Title (optional)"
                          placeholder="e.g. 4 Bedroom Home in Chelsea"
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
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider px-1"
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
                    
                    <InputField
                      label="Address"
                      placeholder="Enter full address"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      required
                      id="location"
                      name="location"
                    />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  <section className="space-y-6">
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">2</span>
                      Property Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                        placeholder="Number of car spaces"
                        value={formData.carSpaces}
                        onChange={(e) => handleInputChange('carSpaces', e.target.value)}
                        id="carSpaces"
                        name="carSpaces"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

                  {/* Contact Information */}
                  <section className="space-y-6">
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">3</span>
                      Contact Information
                    </h2>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-widest px-1">Pre-filled from your account. You can edit if needed.</p>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                        placeholder="e.g. 04XX XXX XXX"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        required
                        id="contactPhone"
                        name="contactPhone"
                      />
                    </div>
                  </section>

                  {/* Description */}
                  <section className="space-y-6">
                    <div className="flex justify-between items-end mb-4">
                      <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">4</span>
                        Description
                      </h2>
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
                      placeholder="Describe your property..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                      rows={8}
                      id="description"
                      name="description"
                    />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2">
                      <span className="text-emerald-500">💡</span> Tip: Fill in the details above, then click "Generate Description" for an AI professional write-up.
                    </p>
                  </section>

                  {/* Media */}
                  <section className="space-y-6">
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">5</span>
                      Media
                    </h2>
                    
                    {/* Property Images */}
                    <div className="space-y-4">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Property Images</label>
                      <div className="relative group">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e.target.files, 'images')}
                          className="w-full px-6 py-10 border-2 border-dashed border-gray-200 rounded-3xl focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer bg-gray-50/50 hover:bg-gray-50"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-400 group-hover:text-emerald-500 transition-colors">
                          <Home className="w-10 h-10 mb-2" />
                          <span className="font-bold text-sm uppercase tracking-wider">Upload Property Photos</span>
                        </div>
                      </div>
                      
                      {propertyImages.length > 0 && (
                        <div className="mt-6 space-y-3">
                          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest ml-1">{propertyImages.length} image(s) selected • first = primary</p>
                          <div className="grid grid-cols-1 gap-3">
                            {propertyImages.map((file, index) => (
                              <div key={index} className="flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm group hover:border-emerald-100 transition-colors">
                                <div className="flex flex-col gap-1">
                                  <button type="button" onClick={() => moveImage(index, 'up')} disabled={index === 0} className="text-gray-300 hover:text-emerald-600 disabled:opacity-0 transition-colors">▲</button>
                                  <button type="button" onClick={() => moveImage(index, 'down')} disabled={index === propertyImages.length - 1} className="text-gray-300 hover:text-emerald-600 disabled:opacity-0 transition-colors">▼</button>
                                </div>
                                <span className="text-sm font-bold text-gray-700 flex-1 truncate">{file.name}</span>
                                {index === 0 && <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">Primary</span>}
                                <button type="button" onClick={() => removeFile(index, 'images')} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all">×</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Submit Button */}
                  <div className="pt-10 border-t border-gray-100 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-12 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.5rem] font-black text-xl transition-all duration-300 shadow-xl shadow-emerald-100 hover:shadow-emerald-200 active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Create Property Listing'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
