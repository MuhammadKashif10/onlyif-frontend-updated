'use client';

import React, { useCallback, useState } from 'react';
import { useSellerContext } from '@/context/SellerContext';
import Button from '@/components/reusable/Button';

interface FileWithPreview extends File {
  preview?: string;
}

export default function MediaUploadPhase() {
  const { data, updateData, setCurrentPhase, errors, setErrors } = useSellerContext();
  const [dragActive, setDragActive] = useState<string | null>(null);

  const validateFiles = (files: FileList, type: 'photos' | 'floorplans' | 'videos') => {
    const newErrors: Record<string, string> = {};
    const maxSizes = {
      photos: 5 * 1024 * 1024, // 5MB
      floorplans: 10 * 1024 * 1024, // 10MB
      videos: 100 * 1024 * 1024 // 100MB
    };
    
    const allowedTypes = {
      photos: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      floorplans: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
      videos: ['video/mp4', 'video/webm', 'video/ogg']
    };

    Array.from(files).forEach((file, index) => {
      if (!allowedTypes[type].includes(file.type)) {
        newErrors[`${type}_${index}_type`] = `Invalid file type for ${file.name}`;
      }
      if (file.size > maxSizes[type]) {
        newErrors[`${type}_${index}_size`] = `File ${file.name} is too large`;
      }
    });

    return newErrors;
  };

  const handleFileUpload = (files: FileList, type: 'photos' | 'floorplans' | 'videos') => {
    const fileErrors = validateFiles(files, type);
    if (Object.keys(fileErrors).length > 0) {
      setErrors(fileErrors);
      return;
    }

    const newFiles = Array.from(files).map(file => {
      const fileWithPreview = file as FileWithPreview;
      if (type === 'photos' || type === 'floorplans') {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      return fileWithPreview;
    });

    updateData({
      [type]: [...data[type], ...newFiles]
    });
    setErrors({});
  };

  const removeFile = (type: 'photos' | 'floorplans' | 'videos', index: number) => {
    const files = [...data[type]];
    if (files[index] && (files[index] as FileWithPreview).preview) {
      URL.revokeObjectURL((files[index] as FileWithPreview).preview!);
    }
    files.splice(index, 1);
    updateData({ [type]: files });
  };

  const handleDrag = useCallback((e: React.DragEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(type);
    } else if (e.type === 'dragleave') {
      setDragActive(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'photos' | 'floorplans' | 'videos') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files, type);
    }
  }, []);

  const handleNext = () => {
    if (data.photos.length === 0) {
      setErrors({ photos: 'At least one photo is required' });
      return;
    }
    setCurrentPhase(4);
  };

  const handleBack = () => {
    setCurrentPhase(2);
  };

  const FileUploadSection = ({ 
    type, 
    title, 
    description, 
    accept, 
    required = false 
  }: {
    type: 'photos' | 'floorplans' | 'videos';
    title: string;
    description: string;
    accept: string;
    required?: boolean;
  }) => (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title} {required && <span className="text-red-500">*</span>}
      </h3>
      <p className="text-gray-600 mb-4">{description}</p>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive === type
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={(e) => handleDrag(e, type)}
        onDragLeave={(e) => handleDrag(e, type)}
        onDragOver={(e) => handleDrag(e, type)}
        onDrop={(e) => handleDrop(e, type)}
      >
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-gray-600 mb-2">Drag and drop files here, or</p>
        <label className="cursor-pointer">
          <span className="text-blue-600 hover:text-blue-700 font-medium">browse files</span>
          <input
            type="file"
            multiple
            accept={accept}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files, type)}
            className="hidden"
          />
        </label>
      </div>
      
      {errors[type] && <p className="mt-2 text-sm text-red-600">{errors[type]}</p>}
      
      {/* File Previews */}
      {data[type].length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Uploaded Files ({data[type].length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data[type].map((file, index) => (
              <div key={index} className="relative group">
                {type === 'videos' ? (
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  </div>
                ) : (
                  <img
                    src={(file as FileWithPreview).preview}
                    alt={file.name}
                    className="aspect-square object-cover rounded-lg"
                  />
                )}
                <button
                  onClick={() => removeFile(type, index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Media</h2>
        <p className="text-gray-600">Add photos, floorplans, and videos to showcase your property</p>
      </div>

      <div className="space-y-8">
        <FileUploadSection
          type="photos"
          title="Property Photos"
          description="Upload high-quality photos of your property (JPEG, PNG, WebP - Max 5MB each)"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          required
        />
        
        <FileUploadSection
          type="floorplans"
          title="Floor Plans"
          description="Upload floor plans or property layouts (JPEG, PNG, WebP, PDF - Max 10MB each)"
          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
        />
        
        <FileUploadSection
          type="videos"
          title="Property Videos"
          description="Upload property tour videos (MP4, WebM, OGG - Max 100MB each)"
          accept="video/mp4,video/webm,video/ogg"
        />

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
            Next: Review & Submit
          </Button>
        </div>
      </div>
    </div>
  );
}