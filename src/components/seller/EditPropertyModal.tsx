'use client';

import React, { useEffect, useState } from 'react';
import Modal from '@/components/reusable/Modal';
import Button from '@/components/reusable/Button';
import InputField from '@/components/reusable/InputField';
import TextArea from '@/components/reusable/TextArea';
import { propertiesApi } from '@/api/properties';

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any | null;
  onUpdated: (updated: any) => void;
}

export default function EditPropertyModal({
  isOpen,
  onClose,
  property,
  onUpdated,
}: EditPropertyModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    bedrooms: '',
    bathrooms: '',
    squareMeters: '',
    propertyType: '',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    yearBuilt: '',
    lotSize: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!property) return;
    setFormData({
      title: property.title || '',
      price: String(property.price ?? ''),
      street: property.address?.street ?? property.address ?? '',
      city: property.address?.city ?? property.city ?? '',
      state: property.address?.state ?? property.state ?? '',
      zipCode: property.address?.zipCode ?? property.zipCode ?? '',
      bedrooms: String(property.beds ?? ''),
      bathrooms: String(property.baths ?? ''),
      squareMeters: String(property.squareMeters ?? property.size ?? ''),
      propertyType: (property.propertyType ?? '').toString(),
      description: property.description ?? '',
      contactName: property.contactInfo?.name ?? '',
      contactEmail: property.contactInfo?.email ?? '',
      contactPhone: property.contactInfo?.phone ?? '',
      yearBuilt: property.yearBuilt ? String(property.yearBuilt) : '',
      lotSize: property.lotSize ? String(property.lotSize) : '',
    });
  }, [property, isOpen]);

  const onChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property?._id && !property?.id) return;

    // Normalize and validate propertyType against allowed values
    const validTypes = ['single-family', 'condo', 'townhouse', 'multi-family', 'land', 'commercial', 'apartment'];
    const normalizedType = formData.propertyType.trim().toLowerCase().replace(/\s+/g, '-');

    const updates: any = {
      title: formData.title,
      price: Number(formData.price),
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state.trim().toUpperCase(),
        zipCode: formData.zipCode,
      },
      beds: Number(formData.bedrooms),
      baths: Number(formData.bathrooms),
      squareMeters: Number(formData.squareMeters),
      description: formData.description,
      contactInfo: {
        name: formData.contactName,
        email: formData.contactEmail,
        phone: formData.contactPhone,
      },
    };

    // Include propertyType only if valid; otherwise keep existing backend value
    if (validTypes.includes(normalizedType)) {
      updates.propertyType = normalizedType;
    }

    if (formData.yearBuilt) updates.yearBuilt = Number(formData.yearBuilt);
    if (formData.lotSize) updates.lotSize = Number(formData.lotSize);

    try {
      setIsSaving(true);
      const id = String(property._id || property.id);
      const updated = await propertiesApi.updateProperty(id, updates);
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Failed to update property');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Property" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InputField
            label="Property Title"
            value={formData.title}
            onChange={(e) => onChange('title', e.target.value)}
            required
          />
          <InputField
            label="Price"
            type="number"
            value={formData.price}
            onChange={(e) => onChange('price', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InputField
            label="Street"
            value={formData.street}
            onChange={(e) => onChange('street', e.target.value)}
            required
          />
          <InputField
            label="City"
            value={formData.city}
            onChange={(e) => onChange('city', e.target.value)}
            required
          />
          <InputField
            label="State"
            value={formData.state}
            onChange={(e) => onChange('state', e.target.value)}
            required
          />
          <InputField
            label="ZIP Code"
            value={formData.zipCode}
            onChange={(e) => onChange('zipCode', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InputField
            label="Bedrooms"
            type="number"
            value={formData.bedrooms}
            onChange={(e) => onChange('bedrooms', e.target.value)}
            required
          />
          <InputField
            label="Bathrooms"
            type="number"
            value={formData.bathrooms}
            onChange={(e) => onChange('bathrooms', e.target.value)}
            required
          />
          <InputField
            label="Square Meters"
            type="number"
            value={formData.squareMeters}
            onChange={(e) => onChange('squareMeters', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InputField
            label="Property Type"
            value={formData.propertyType}
            onChange={(e) => onChange('propertyType', e.target.value)}
            required
          />
          <InputField
            label="Year Built"
            type="number"
            value={formData.yearBuilt}
            onChange={(e) => onChange('yearBuilt', e.target.value)}
          />
        </div>

        <InputField
          label="Lot Size"
          type="number"
          value={formData.lotSize}
          onChange={(e) => onChange('lotSize', e.target.value)}
        />

        <TextArea
          label="Description"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InputField
            label="Contact Name"
            value={formData.contactName}
            onChange={(e) => onChange('contactName', e.target.value)}
          />
          <InputField
            label="Contact Email"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => onChange('contactEmail', e.target.value)}
          />
          <InputField
            label="Contact Phone"
            value={formData.contactPhone}
            onChange={(e) => onChange('contactPhone', e.target.value)}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" type="submit" disabled={isSaving}>
            {isSaving ? 'Updating...' : 'Update Property'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}