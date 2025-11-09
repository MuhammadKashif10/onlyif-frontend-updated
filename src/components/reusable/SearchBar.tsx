'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, LoaderCircle } from 'lucide-react';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;

    setIsLoading(true);

    try {
      // Simulate API call for location validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to browse page with search query
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      router.push(`/browse?location=${encodedQuery}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const popularCities = [
    'Austin, TX',
    'Phoenix, AZ',
    'Miami, FL',
    'Seattle, WA',
    'Denver, CO',
    'Nashville, TN'
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Find Your Dream Home
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Search by city or ZIP code to discover available properties
          </p>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon color="#47C96F" strokeWidth={2} size={24} aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter city or ZIP code"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !searchQuery.trim()}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="animate-spin -ml-1 mr-3" color="#47C96F" strokeWidth={2} size={24} aria-hidden="true" />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </form>

          {/* Popular Cities */}
          <div>
            <p className="text-blue-100 mb-4">Popular cities:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularCities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSearchQuery(city);
                    const encodedQuery = encodeURIComponent(city);
                    router.push(`/browse?location=${encodedQuery}`);
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 