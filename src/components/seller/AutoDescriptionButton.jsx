'use client';

import React, { useState } from 'react';
import Button from '@/components/reusable/Button';
import { createPropertyDescription } from '@/modules/auto-description';
import { Wand2, Loader2 } from 'lucide-react';

export default function AutoDescriptionButton({ 
  propertyData, 
  onDescriptionGenerated, 
  disabled = false 
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDescription = async () => {
    // Validate that we have enough data
    const requiredFields = ['address', 'bedrooms', 'bathrooms', 'price'];
    const missingFields = requiredFields.filter(field => !propertyData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following fields first: ${missingFields.join(', ')}`);
      return;
    }

    setIsGenerating(true);
    
    try {
      // Prepare the data for the prompt
      const promptData = {
        houseName: propertyData.houseName || propertyData.address,
        address: propertyData.address,
        location: propertyData.location || propertyData.address,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        size: propertyData.size,
        price: propertyData.price ? `$${parseInt(propertyData.price).toLocaleString()}` : '',
        features: propertyData.features || 'Modern amenities and great location'
      };

      const description = await createPropertyDescription(promptData);
      onDescriptionGenerated(description);
      
    } catch (error) {
      console.error('Error generating description:', error);
      alert('Failed to generate description. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGenerateDescription}
      disabled={disabled || isGenerating}
      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="h-4 w-4" />
      )}
      {isGenerating ? 'Generating...' : 'Generate Description'}
    </Button>
  );
}