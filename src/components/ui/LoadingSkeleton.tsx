// Loading Skeleton Components using Tailwind CSS
import React from 'react';

interface SkeletonProps {
  className?: string;
}

// Base skeleton component
const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// Property card skeleton
export const PropertyCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    {/* Image skeleton */}
    <div className="relative h-48 bg-gray-200 animate-pulse">
      <div className="absolute top-2 right-2 w-8 h-8 bg-gray-300 rounded-full" />
    </div>
    
    {/* Content skeleton */}
    <div className="p-4 space-y-3">
      {/* Title skeleton */}
      <Skeleton className="h-4 w-3/4" />
      
      {/* Address skeleton */}
      <Skeleton className="h-3 w-full" />
      
      {/* Price skeleton */}
      <Skeleton className="h-6 w-1/2" />
      
      {/* Details skeleton */}
      <div className="flex justify-between">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-16" />
      </div>
      
      {/* Button skeleton */}
      <Skeleton className="h-10 w-full mt-4" />
    </div>
  </div>
);

// Property grid skeleton
export const PropertyGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <PropertyCardSkeleton key={index} />
    ))}
  </div>
);

// Property detail skeleton
export const PropertyDetailSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Image carousel skeleton */}
    <div className="relative h-96 bg-gray-200 animate-pulse rounded-lg">
      <div className="absolute bottom-4 left-4 flex space-x-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="w-16 h-12 rounded" />
        ))}
      </div>
    </div>
    
    {/* Content skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Title and price */}
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
        </div>
        
        {/* Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="text-center">
              <Skeleton className="h-8 w-8 mx-auto mb-2" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          ))}
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        {/* Features */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
      
      {/* Sidebar */}
      <div className="space-y-6">
        {/* Agent card */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        {/* Map placeholder */}
        <div className="bg-gray-200 h-48 rounded-lg animate-pulse" />
      </div>
    </div>
  </div>
);

// Testimonial skeleton
export const TestimonialSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-start space-x-4">
      <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  </div>
);

// Agent card skeleton
export const AgentCardSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-lg shadow-md text-center">
    <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
    <Skeleton className="h-5 w-32 mx-auto mb-2" />
    <Skeleton className="h-4 w-24 mx-auto mb-3" />
    <div className="flex justify-center space-x-1 mb-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="w-4 h-4 rounded" />
      ))}
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4 mx-auto" />
    </div>
  </div>
);

// Form skeleton
export const FormSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-32 w-full" />
    </div>
    <Skeleton className="h-12 w-full" />
  </div>
);

// Table skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index} className="px-6 py-3 text-left">
              <Skeleton className="h-4 w-20" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <td key={colIndex} className="px-6 py-4">
                <Skeleton className="h-4 w-16" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Hero section skeleton
export const HeroSkeleton: React.FC = () => (
  <div className="relative h-96 bg-gray-200 animate-pulse">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-96 mx-auto" />
        <Skeleton className="h-6 w-80 mx-auto" />
        <div className="flex justify-center space-x-4">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    </div>
  </div>
);

// Stats skeleton
export const StatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="text-center">
        <Skeleton className="h-8 w-16 mx-auto mb-2" />
        <Skeleton className="h-4 w-20 mx-auto" />
      </div>
    ))}
  </div>
);
