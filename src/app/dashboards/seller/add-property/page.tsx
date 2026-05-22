'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Settings, Home, Store, BarChart3 } from 'lucide-react';
import { Navbar } from '@/components';
import { Button } from '@/components/reusable/Button';
import InputField from '@/components/reusable/InputField';
import TextArea from '@/components/reusable/TextArea';
import { useAuth } from '@/context/AuthContext';
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

interface AustralianLocation {
  city: string;
  state: string;
  stateName: string;
  postcode: string;
}

const AUSTRALIAN_STATES = [
  { code: 'NSW', name: 'New South Wales' },
  { code: 'VIC', name: 'Victoria' },
  { code: 'QLD', name: 'Queensland' },
  { code: 'WA', name: 'Western Australia' },
  { code: 'SA', name: 'South Australia' },
  { code: 'TAS', name: 'Tasmania' },
  { code: 'ACT', name: 'Australian Capital Territory' },
  { code: 'NT', name: 'Northern Territory' },
];

const AUSTRALIAN_LOCATIONS: AustralianLocation[] = [
  { city: 'Sydney', state: 'NSW', stateName: 'New South Wales', postcode: '2000' },
  { city: 'Melbourne', state: 'VIC', stateName: 'Victoria', postcode: '3000' },
  { city: 'Brisbane', state: 'QLD', stateName: 'Queensland', postcode: '4000' },
  { city: 'Perth', state: 'WA', stateName: 'Western Australia', postcode: '6000' },
  { city: 'Adelaide', state: 'SA', stateName: 'South Australia', postcode: '5000' },
  { city: 'Gold Coast', state: 'QLD', stateName: 'Queensland', postcode: '4217' },
  { city: 'Canberra', state: 'ACT', stateName: 'Australian Capital Territory', postcode: '2601' },
  { city: 'Hobart', state: 'TAS', stateName: 'Tasmania', postcode: '7000' },
  { city: 'Darwin', state: 'NT', stateName: 'Northern Territory', postcode: '0800' },
  { city: 'Newcastle', state: 'NSW', stateName: 'New South Wales', postcode: '2300' },
  { city: 'Geelong', state: 'VIC', stateName: 'Victoria', postcode: '3220' },
  { city: 'Sunshine Coast', state: 'QLD', stateName: 'Queensland', postcode: '4558' },
  { city: 'Wollongong', state: 'NSW', stateName: 'New South Wales', postcode: '2500' },
  { city: 'Fremantle', state: 'WA', stateName: 'Western Australia', postcode: '6160' },
  { city: 'Parramatta', state: 'NSW', stateName: 'New South Wales', postcode: '2150' },
  { city: 'Bondi', state: 'NSW', stateName: 'New South Wales', postcode: '2026' },
  { city: 'Bondi Beach', state: 'NSW', stateName: 'New South Wales', postcode: '2026' },
  { city: 'Manly', state: 'NSW', stateName: 'New South Wales', postcode: '2095' },
  { city: 'Surry Hills', state: 'NSW', stateName: 'New South Wales', postcode: '2010' },
  { city: 'Chatswood', state: 'NSW', stateName: 'New South Wales', postcode: '2067' },
  { city: 'St Kilda', state: 'VIC', stateName: 'Victoria', postcode: '3182' },
  { city: 'Richmond', state: 'VIC', stateName: 'Victoria', postcode: '3121' },
  { city: 'South Yarra', state: 'VIC', stateName: 'Victoria', postcode: '3141' },
  { city: 'Carlton', state: 'VIC', stateName: 'Victoria', postcode: '3053' },
  { city: 'Fitzroy', state: 'VIC', stateName: 'Victoria', postcode: '3065' },
  { city: 'South Brisbane', state: 'QLD', stateName: 'Queensland', postcode: '4101' },
  { city: 'Fortitude Valley', state: 'QLD', stateName: 'Queensland', postcode: '4006' },
  { city: 'Noosa Heads', state: 'QLD', stateName: 'Queensland', postcode: '4567' },
  { city: 'Surfers Paradise', state: 'QLD', stateName: 'Queensland', postcode: '4217' },
  { city: 'Southport', state: 'QLD', stateName: 'Queensland', postcode: '4215' },
  { city: 'Cottesloe', state: 'WA', stateName: 'Western Australia', postcode: '6011' },
  { city: 'Subiaco', state: 'WA', stateName: 'Western Australia', postcode: '6008' },
  { city: 'Joondalup', state: 'WA', stateName: 'Western Australia', postcode: '6027' },
  { city: 'Glenelg', state: 'SA', stateName: 'South Australia', postcode: '5045' },
  { city: 'Norwood', state: 'SA', stateName: 'South Australia', postcode: '5067' },
  { city: 'North Adelaide', state: 'SA', stateName: 'South Australia', postcode: '5006' },
  { city: 'Launceston', state: 'TAS', stateName: 'Tasmania', postcode: '7250' },
  { city: 'Sandy Bay', state: 'TAS', stateName: 'Tasmania', postcode: '7005' },
  { city: 'Belconnen', state: 'ACT', stateName: 'Australian Capital Territory', postcode: '2617' },
  { city: 'Kingston', state: 'ACT', stateName: 'Australian Capital Territory', postcode: '2604' },
  { city: 'Palmerston', state: 'NT', stateName: 'Northern Territory', postcode: '0830' },
  { city: 'Alice Springs', state: 'NT', stateName: 'Northern Territory', postcode: '0870' },
];

export default function AddProperty() {
  const router = useRouter();
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
    carSpaces: '',
    // Add missing contact fields
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });

  const [propertyImages, setPropertyImages] = useState<File[]>([]);
  const [floorPlans, setFloorPlans] = useState<File[]>([]);
  const [videoTours, setVideoTours] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactAutoFilled, setContactAutoFilled] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  const filteredLocations = formData.city.trim()
    ? AUSTRALIAN_LOCATIONS.filter((location) => {
        const query = formData.city.trim().toLowerCase();
        return (
          location.city.toLowerCase().includes(query) ||
          location.state.toLowerCase().includes(query) ||
          location.stateName.toLowerCase().includes(query) ||
          location.postcode.includes(query)
        );
      }).slice(0, 8)
    : AUSTRALIAN_LOCATIONS.slice(0, 8);

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

  const handleCitySearchChange = (value: string) => {
    setFormData(prev => ({ ...prev, city: value }));
    setIsLocationDropdownOpen(true);
  };

  const handleLocationSelect = (location: AustralianLocation) => {
    setFormData(prev => ({
      ...prev,
      city: location.city,
      state: location.state,
      zipCode: location.postcode || prev.zipCode
    }));
    setIsLocationDropdownOpen(false);
  };

  const handlePostcodeChange = (value: string) => {
    handleInputChange('zipCode', value.replace(/\D/g, '').slice(0, 4));
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

    if (!/^\d{4}$/.test(normalizedFormData.zipCode)) {
      toast.error('Please enter a valid 4-digit Australian postcode.');
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
        toast.success('Your property has been submitted and is awaiting admin approval.');
        
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

  const sidebarButtonClass = (isActive: boolean) =>
    `w-full flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ease-out hover:shadow-sm ${
      isActive
        ? 'bg-black text-white shadow-lg shadow-black/10'
        : 'text-gray-600 hover:bg-white hover:text-gray-950'
    }`;

  const sidebarIconClass = (isActive: boolean) =>
    `h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`;

  return (
    <div className="min-h-screen bg-[#f5f6fb] flex flex-col">
      <Navbar />

      <div className="flex w-full flex-1 bg-[#f5f6fb] lg:pl-[280px]">
        <aside id="dashboard-sidebar" className="fixed left-0 top-20 bottom-0 z-30 hidden w-[280px] shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white px-5 py-4 lg:flex">
          <div className="flex-1">
            <nav className="space-y-2 pt-3">
              <button
                onClick={() => router.push('/dashboards/seller')}
                className={sidebarButtonClass(false)}
              >
                <LayoutDashboard className={sidebarIconClass(false)} />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => router.push('/dashboards/seller/listings')}
                className={sidebarButtonClass(true)}
              >
                <Home className={sidebarIconClass(true)} />
                <span>Listings</span>
              </button>
              <button
                onClick={() => router.push('/dashboards/seller/marketplace')}
                className={sidebarButtonClass(false)}
              >
                <Store className={sidebarIconClass(false)} />
                <span>Marketplace</span>
              </button>
              <button
                onClick={() => router.push('/dashboards/seller/analytics')}
                className={sidebarButtonClass(false)}
              >
                <BarChart3 className={sidebarIconClass(false)} />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => router.push('/dashboards/seller/account')}
                className={sidebarButtonClass(false)}
              >
                <Settings className={sidebarIconClass(false)} />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          <div className="border-t border-gray-200 pt-5">
            <button
              onClick={() => router.push('/dashboards/seller/add-property')}
              className="mb-5 w-full cursor-pointer rounded-xl bg-black px-4 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all duration-200 ease-out hover:bg-gray-900 hover:shadow-xl"
            >
              List Property
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-sm">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-950">{user?.name || 'Seller Name'}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">Verified Seller</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 grid grid-cols-2 gap-3 lg:hidden">
            <button onClick={() => router.push('/dashboards/seller')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Dashboard</button>
            <button onClick={() => router.push('/dashboards/seller/listings')} className="rounded-xl bg-black px-4 py-3 text-sm font-bold text-white shadow-sm">Listings</button>
            <button onClick={() => router.push('/dashboards/seller/marketplace')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Marketplace</button>
            <button onClick={() => router.push('/dashboards/seller/analytics')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Analytics</button>
            <button onClick={() => router.push('/dashboards/seller/account')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Settings</button>
          </div>

          <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="rounded-[24px] border border-gray-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-8 lg:p-10">
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
                      <div className="relative">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          City/Suburb<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleCitySearchChange(e.target.value)}
                          onFocus={() => setIsLocationDropdownOpen(true)}
                          onBlur={() => window.setTimeout(() => setIsLocationDropdownOpen(false), 150)}
                          placeholder="Search suburb or city"
                          required
                          autoComplete="off"
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 focus:border-blue-500"
                        />
                        {isLocationDropdownOpen && filteredLocations.length > 0 && (
                          <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                            {filteredLocations.map((location) => (
                              <button
                                key={`${location.city}-${location.state}-${location.postcode}`}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleLocationSelect(location)}
                                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-emerald-50"
                              >
                                <span>
                                  <span className="block text-sm font-bold text-gray-900">{location.city}</span>
                                  <span className="block text-xs font-semibold text-gray-500">{location.stateName}</span>
                                </span>
                                <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                                  {location.state} {location.postcode}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                          State/Territory<span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          required
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 focus:border-blue-500 bg-white"
                        >
                          <option value="">Select state</option>
                          {AUSTRALIAN_STATES.map((state) => (
                            <option key={state.code} value={state.code}>
                              {state.code} — {state.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                          Postcode<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          id="zipCode"
                          name="zipCode"
                          type="text"
                          value={formData.zipCode}
                          onChange={(e) => handlePostcodeChange(e.target.value)}
                          placeholder="AU: 4 digits (e.g. 3000)"
                          required
                          inputMode="numeric"
                          pattern="\d{4}"
                          maxLength={4}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 focus:border-blue-500"
                        />
                      </div>
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
  );
}
