'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components';
import { NoResults } from '@/components/ui/ErrorMessage';
import { useProperties, useFilterOptions } from '@/hooks/useProperties';
import { PropertySearchParams } from '@/types/api';
import EnhancedPropertyFilters from '@/components/sections/EnhancedPropertyFilters';
import EnhancedPropertyGrid from '@/components/sections/EnhancedPropertyGrid';
import { useDebounce } from '@/hooks/useDebounce';
import { ChevronDown } from 'lucide-react';

/** Aerial coastal homes, water and skyline at golden hour — verified Unsplash CDN */
const BUY_HERO_IMAGE =
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=2400&q=80';

export default function EnhancedBuyPageClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PropertySearchParams>({});
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const searchParams = useMemo(
    () => ({
      ...filters,
      search: debouncedSearchQuery?.trim() || undefined,
      page: currentPage.toString(),
      limit: '100',
      status: 'active',
    }),
    [filters, debouncedSearchQuery, currentPage]
  );

  const {
    data: propertiesData,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useProperties(searchParams);

  const { data: filterOptions } = useFilterOptions();

  const properties = propertiesData?.properties || [];
  const totalProperties = propertiesData?.total || 0;
  const totalPages = propertiesData?.totalPages || 1;

  const handleFilterChange = useCallback((newFilters: PropertySearchParams) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleReset = useCallback(() => {
    setSearchQuery('');
    setFilters({});
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).length > 0 || searchQuery.length > 0;
  }, [filters, searchQuery]);

  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar
          logo="/images/logo.PNG"
          logoText=""
          navigationItems={[
            { label: 'Buy', href: '/buy', isActive: true },
            { label: 'Sell', href: '/sell', isActive: false },
            { label: 'How it Works', href: '/how-it-works', isActive: false },
            { label: 'Agents', href: '/agents', isActive: false },
          ]}
          ctaText="Sign In"
          ctaHref="/signin"
        />
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Properties</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        logo="/images/logo.PNG"
        logoText=""
        navigationItems={[
          { label: 'Buy', href: '/buy', isActive: true },
          { label: 'Sell', href: '/sell', isActive: false },
          { label: 'How it Works', href: '/how-it-works', isActive: false },
          { label: 'Agents', href: '/agents', isActive: false },
        ]}
        ctaText="Sign In"
        ctaHref="/signin"
      />

      {/* Hero — copy centered on image; pill search + filter strip overlap into beige band below */}
      <section className="relative min-h-[520px] sm:min-h-[580px] lg:min-h-[620px]">
        <Image
          src={BUY_HERO_IMAGE}
          alt="Aerial view of coastal homes, marina and city skyline at sunset"
          fill
          priority
          className="object-cover object-[center_35%] sm:object-center"
          sizes="100vw"
        />
        {/* Even dark scrim (~45%) so white headline stays legible over bright sky/water */}
        <div className="absolute inset-0 bg-black/45" aria-hidden />
        <div className="relative z-10 mx-auto flex min-h-[520px] sm:min-h-[580px] lg:min-h-[620px] max-w-5xl flex-col px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 flex-col justify-center pb-6 pt-28 text-center sm:pt-32">
            <h1 className="text-3xl font-semibold tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl lg:text-[2.75rem]">
              Homes You Can Buy...{' '}
              <span className="font-extrabold">If the Price Is Right</span>
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-white/95 drop-shadow sm:mt-5 sm:text-lg md:text-xl">
              These homes aren&apos;t actively for sale — but the owners are open to the right offer.
            </p>
          </div>
          <div className="relative z-20 -mb-16 w-full sm:-mb-20 md:-mb-24">
            <EnhancedPropertyFilters
              embedded
              heroStacked
              hideLocationPill
              searchPlaceholder="Search suburb, postcode, or keywords..."
              filters={filters}
              searchQuery={searchQuery}
              onFilterChange={handleFilterChange}
              onSearchChange={handleSearchChange}
              filterOptions={filterOptions}
              isLoading={isLoading}
            />
          </div>
        </div>
      </section>

      {/* How Only If Works — beige band (generous top padding clears filter overlap + shadow) */}
      <section className="border-y border-stone-200/80 bg-[#f4f1eb] pb-10 pt-24 sm:pb-12 sm:pt-28 md:pt-32">
        <div className="max-w-4xl mx-auto space-y-6 px-4 text-center sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900 sm:text-sm">
            How Only If Works
          </p>
          <p className="text-base leading-relaxed text-gray-800 sm:text-lg">
            Owners list a price they&apos;d consider selling for.
          </p>
          <div className="flex justify-center text-[#3AB861]">
            <ChevronDown className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <p className="text-base leading-relaxed text-gray-800 sm:text-lg">
            You browse privately and make an offer —{' '}
            <strong className="font-semibold text-gray-900">only if it suits you.</strong>
          </p>
        </div>
      </section>

      {/* Results — same section + empty state pattern as home page (PropertyGrid); cards unchanged when listed */}
      <section className="py-14 bg-white" aria-labelledby="buy-property-grid-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2
              id="buy-property-grid-heading"
              className="text-2xl sm:text-3xl font-extrabold text-gray-900"
            >
              Homes Available Only If the Price Is Right
            </h2>
          </div>

          {isLoading && !isFetching && (
            <div className="flex justify-center items-center min-h-[320px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3AB861] mx-auto mb-4" />
                <p className="text-gray-600">Loading properties...</p>
              </div>
            </div>
          )}

          {!isLoading && (
            <>
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm sm:text-base text-gray-700 font-medium text-left">
                  Showing {totalProperties.toLocaleString()} homes
                  {hasActiveFilters && <span className="text-gray-500 font-normal"> (filtered)</span>}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-sm text-[#3AB861] hover:text-[#2d8f4e] font-medium self-start sm:self-auto"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {properties.length > 0 ? (
                <EnhancedPropertyGrid
                  properties={properties}
                  isLoading={isFetching}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalProperties}
                  itemsPerPage={100}
                  onPageChange={handlePageChange}
                />
              ) : searchQuery.trim() ? (
                <NoResults
                  message={`No results for "${searchQuery.trim()}"`}
                  suggestion="Try different keywords, check for typos, or clear your search to see more homes."
                />
              ) : hasActiveFilters ? (
                <NoResults
                  message="No properties found"
                  suggestion="Try adjusting your search criteria or filters."
                />
              ) : (
                <NoResults
                  message="Be among the first."
                  suggestion="New properties are being added — register to get early access."
                  ctaHref="/dashboards/buyer/register"
                  ctaLabel="Join as a Buyer"
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
