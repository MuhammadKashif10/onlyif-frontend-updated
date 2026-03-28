'use client';

import React from 'react';
import { Building2, RefreshCcw, Search } from 'lucide-react';

interface NoResultsProps {
  title?: string;
  message?: string;
  suggestion?: string;
  onReset?: () => void;
  showResetButton?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function NoResults({
  title = "No properties found",
  message = "We couldn't find any properties matching your criteria.",
  suggestion = "Try adjusting your search terms or filters to find more results.",
  onReset,
  showResetButton = true,
  icon,
  className = ""
}: NoResultsProps) {
  const defaultIcon = (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
      <Building2 className="h-8 w-8" color="#47C96F" strokeWidth={2} size={24} aria-hidden="true" />
    </div>
  );

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto max-w-md">
        {icon || defaultIcon}
        
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          {title}
        </h3>
        
        <p className="mt-2 text-sm text-gray-600">
          {message}
        </p>
        
        {suggestion && (
          <p className="mt-1 text-sm text-gray-500">
            {suggestion}
          </p>
        )}
        
        {showResetButton && onReset && (
          <div className="mt-6">
            <button
              onClick={onReset}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <RefreshCcw className="mr-2 h-4 w-4" color="#47C96F" strokeWidth={2} size={24} />
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Export variants for different use cases
export const PropertyNoResults = ({ onReset, className }: { onReset?: () => void; className?: string }) => (
  <NoResults
    title="No properties found"
    message="We couldn't find any properties matching your search criteria."
    suggestion="Try adjusting your filters, location, or price range to see more results."
    onReset={onReset}
    className={className}
    icon={
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <Building2 className="h-8 w-8" color="#47C96F" strokeWidth={2} size={24} />
      </div>
    }
  />
);

export const SearchNoResults = ({ query, onReset }: { query?: string; onReset?: () => void }) => (
  <NoResults
    title={`No results for "${query}"`}
    message="We couldn't find any properties matching your search."
    suggestion="Try different keywords, check for typos, or browse all properties."
    onReset={onReset}
    icon={
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50">
        <Search className="h-8 w-8" color="#47C96F" strokeWidth={2} size={24} />
      </div>
    }
  />
);