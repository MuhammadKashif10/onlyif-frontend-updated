import { Metadata } from 'next';
import {
  Navbar,
  Footer,
  PropertyGridSkeleton,
  LoadingError,
  NoResults,
  StatsSkeleton,
  TestimonialSkeleton
} from '@/components';
import { propertiesApi, testimonialsApi, agentsApi, offersApi } from '@/api';

export const metadata: Metadata = {
  title: 'API Integration Example - OnlyIf',
  description: 'Example page demonstrating API integration with loading states and error handling.',
};

export default async function ApiExamplePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
<Navbar 
        logo="/images/logo.png"
        logoText=""
        navigationItems={[
          { label: 'Buy', href: '/browse', isActive: false },
          { label: 'Sell', href: '/sell', isActive: false },
          { label: 'How It Works', href: '/how-it-works', isActive: false },
          { label: 'About', href: '/about', isActive: false },
        ]}
        ctaText="Get Started"
        ctaHref="/signin"
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            API Integration Example
          </h1>
          <p className="text-xl text-blue-100">
            Demonstrating the new API structure with loading skeletons and error handling
          </p>
        </div>
      </section>

      {/* API Examples Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Properties API Example */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Properties API</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Loading Skeleton Example</h3>
                <PropertyGridSkeleton count={4} />
              </div>
            </div>

            {/* Testimonials API Example */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Testimonials API</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Testimonial Skeleton</h3>
                <div className="space-y-4">
                  <TestimonialSkeleton />
                  <TestimonialSkeleton />
                </div>
              </div>
            </div>

            {/* Error Handling Examples */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Error Handling</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Loading Error</h3>
                  <LoadingError 
                    message="Failed to load properties"
                    onRetry={() => console.log('Retry clicked')}
                  />
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">No Results</h3>
                  <NoResults 
                    message="No properties found"
                    suggestion="Try adjusting your search criteria"
                  />
                </div>
              </div>
            </div>

            {/* Stats API Example */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Statistics API</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Stats Skeleton</h3>
                <StatsSkeleton />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* API Documentation Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            API Structure Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Properties API */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Properties API</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• getProperties()</li>
                <li>• getPropertyById()</li>
                <li>• getFeaturedProperties()</li>
                <li>• searchProperties()</li>
                <li>• getPropertyStats()</li>
                <li>• getFilterOptions()</li>
              </ul>
            </div>

            {/* Testimonials API */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Testimonials API</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• getTestimonials()</li>
                <li>• getFeaturedTestimonials()</li>
                <li>• getTestimonialsByPropertyType()</li>
                <li>• getTestimonialsByLocation()</li>
                <li>• getTestimonialStats()</li>
              </ul>
            </div>

            {/* Agents API */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Agents API</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• getAgents()</li>
                <li>• getAgentById()</li>
                <li>• getTopAgents()</li>
                <li>• getAgentsBySpecialization()</li>
                <li>• searchAgents()</li>
                <li>• getAgentStats()</li>
              </ul>
            </div>

            {/* Contact API */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact API</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• submitContactForm()</li>
                <li>• getContactSubmissions()</li>
                <li>• getContactSubmissionById()</li>
                <li>• getContactStats()</li>
              </ul>
            </div>

            {/* Offers API */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Offers API</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• submitOfferRequest()</li>
                <li>• getOfferById()</li>
                <li>• getOffersByEmail()</li>
                <li>• updateOfferStatus()</li>
                <li>• getOfferStats()</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
