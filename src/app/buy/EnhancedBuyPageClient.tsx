'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Navbar } from '@/components';
import { NoResults } from '@/components/ui/ErrorMessage';
import { useProperties, useFilterOptions } from '@/hooks/useProperties';
import { PropertySearchParams } from '@/types/api';
import EnhancedPropertyFilters from '@/components/sections/EnhancedPropertyFilters';
import EnhancedPropertyGrid from '@/components/sections/EnhancedPropertyGrid';
import { useDebounce } from '@/hooks/useDebounce';
import { UNLOCK_FEE_LABEL } from '@/utils/constants';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

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
        <Navbar logo="/images/logo.PNG" logoText="" />
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
    <div className="min-h-screen bg-[#effdea] text-[#071109]">
      <Navbar logo="/images/logo.PNG" logoText="" />

      <main>
        {/* Hero */}
        <section className="px-4 pb-10 pt-16 sm:px-6 sm:pb-14 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#d9f0d5] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#007a38] shadow-sm ring-1 ring-[#c8e5c4]">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Exclusive Buyer Network
            </div>
            <h1 className="mx-auto mt-8 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-[#071109] sm:text-5xl lg:text-6xl">
              Discover Homes That Haven&apos;t Hit the Market Yet
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-[#46604f] sm:text-lg">
              Access a curated selection of off-market properties. No bidding wars. No public listings. Just direct connections with serious sellers.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#hidden-homes"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#007a38] px-7 text-sm font-black text-white shadow-[0_16px_35px_rgba(0,122,56,0.18)] transition hover:bg-[#006b31] sm:w-auto"
              >
                Browse Hidden Homes
              </a>
              <a
                href="#unlock-benefit"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-[#c9dcc7] bg-[#f7fff4] px-7 text-sm font-black text-[#071109] transition hover:border-[#007a38] hover:bg-white sm:w-auto"
              >
                How it Works
              </a>
            </div>
          </div>
        </section>

        {/* Unlock Benefit */}
        <section id="unlock-benefit" className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[28px] bg-[#008d3f] p-6 text-white shadow-[0_24px_70px_rgba(0,122,56,0.18)] sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-12">
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                The {UNLOCK_FEE_LABEL} Unlock Benefit
              </h2>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-white/82">
                Public real estate sites only show you what&apos;s already for sale. We show you what&apos;s potentially for sale. Our unique model protects seller privacy while giving serious buyers a massive edge.
              </p>
              <ul className="mt-8 space-y-4 text-sm font-black text-white">
                {[
                  'Access full address, high-res photos, and seller documents',
                  'Direct messaging channel with verified homeowners',
                  "Fee is fully refundable if the property doesn't match the description",
                ].map((benefit) => (
                  <li key={benefit} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" aria-hidden="true" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/18 bg-white/10 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/75">Pricing</p>
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#008d3f]">
                  One-time fee
                </span>
              </div>
              <div className="mt-8 flex flex-wrap items-end gap-x-2 gap-y-1">
                <span className="text-4xl font-black tracking-tight text-white sm:text-5xl">AUD {UNLOCK_FEE_LABEL}</span>
                <span className="pb-2 text-sm font-bold text-white/70">/ per property</span>
              </div>
              <p className="mt-6 text-sm font-semibold leading-7 text-white/78">
                Unlock the details of any off-market property and start a direct negotiation with the owner today.
              </p>
              <a
                href="#hidden-homes"
                className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#f7fff4] px-6 text-sm font-black text-[#007a38] shadow-sm transition hover:bg-white"
              >
                Start Browsing
              </a>
            </div>
          </div>
        </section>

        {/* Results */}
        <section id="hidden-homes" className="px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="buy-property-grid-heading">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2
                  id="buy-property-grid-heading"
                  className="text-3xl font-black tracking-tight text-[#071109] sm:text-4xl"
                >
                  Hidden Homes
                </h2>
                <p className="mt-2 text-sm font-medium text-[#395342]">
                  Currently browsing exclusive listings in Victoria
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-[#395342]">
                <span className="rounded-full bg-[#dff4da] px-4 py-2 text-[#007a38]">
                  {totalProperties.toLocaleString()} homes
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-full border border-[#c9dcc7] bg-[#f7fff4] px-4 py-2 text-[#071109] hover:border-[#007a38] hover:bg-white"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>

            <div className="mb-10">
              <EnhancedPropertyFilters
                embedded
                heroStacked
                searchPlaceholder="Search suburb, postcode, or keywords..."
                filters={filters}
                searchQuery={searchQuery}
                onFilterChange={handleFilterChange}
                onSearchChange={handleSearchChange}
                filterOptions={filterOptions}
                isLoading={isLoading}
              />
            </div>

            <div className="mb-8 flex flex-col gap-2 border-t border-[#d3e7d0] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-[#395342]">
                Showing {totalProperties.toLocaleString()} homes
                {hasActiveFilters && <span className="text-[#6c8172]"> (filtered)</span>}
              </p>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6c8172]">
                Private off-market access
              </p>
            </div>

            <div className="text-center mb-10 hidden">
            <h2
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

        {/* Bottom CTA */}
        <section className="px-4 pb-16 pt-4 sm:px-6 sm:pb-20 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[#007a38] px-6 py-14 text-center text-white shadow-[0_24px_70px_rgba(0,122,56,0.2)] sm:px-10 sm:py-16">
            <div className="absolute inset-0 opacity-20" aria-hidden="true">
              <div className="absolute -left-24 bottom-0 h-72 w-[120%] rounded-[50%] border border-white/40" />
              <div className="absolute -right-28 top-20 h-72 w-[120%] rounded-[50%] border border-white/30" />
            </div>
            <div className="relative mx-auto max-w-3xl">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/12">
                <Sparkles className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                Ready to See More?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-8 text-white/86">
                New exclusive properties are added every day. Join serious buyers getting early access to Melbourne&apos;s finest off-market homes.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href="/dashboards/buyer/register"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-8 text-sm font-black text-[#007a38] transition hover:bg-[#f7fff4]"
                >
                  Create Free Buyer Account
                </a>
                <a
                  href="#hidden-homes"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/22 bg-white/8 px-8 text-sm font-black text-white transition hover:bg-white/14"
                >
                  View All Hidden Homes
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
