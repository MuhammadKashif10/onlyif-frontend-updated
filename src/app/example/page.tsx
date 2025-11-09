'use client';

import { useState } from 'react';
import {
  Navbar,
  HeroSection,
  PropertyGrid,
  CTASection,
  TestimonialSlider,
  Footer
} from '@/components';

// Sample data for demonstration
const sampleProperties = [
  {
    id: '1',
    title: 'Modern Downtown Condo',
    address: '123 Main St, Austin, TX 78701',
    price: 450000,
    beds: 2,
    baths: 2,
    size: 1200,
    featured: true,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop',
    ],
    description: 'Beautiful modern condo in the heart of downtown Austin.',
    yearBuilt: 2018,
    lotSize: 0.1,
    propertyType: 'Condo',
    status: 'For Sale'
  },
  {
    id: '2',
    title: 'Spacious Family Home',
    address: '456 Oak Ave, Austin, TX 78702',
    price: 750000,
    beds: 4,
    baths: 3,
    size: 2800,
    featured: false,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    ],
    description: 'Perfect family home with large backyard and updated kitchen.',
    yearBuilt: 2015,
    lotSize: 0.3,
    propertyType: 'Single Family',
    status: 'For Sale'
  },
  {
    id: '3',
    title: 'Luxury Townhouse',
    address: '789 Pine St, Austin, TX 78703',
    price: 650000,
    beds: 3,
    baths: 2.5,
    size: 2100,
    featured: true,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    ],
    description: 'Elegant townhouse with modern amenities and community pool.',
    yearBuilt: 2020,
    lotSize: 0.15,
    propertyType: 'Townhouse',
    status: 'For Sale'
  },
  {
    id: '4',
    title: 'Cozy Bungalow',
    address: '321 Elm St, Austin, TX 78704',
    price: 380000,
    beds: 2,
    baths: 1,
    size: 1100,
    featured: false,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    ],
    description: 'Charming bungalow with character and fenced backyard.',
    yearBuilt: 1950,
    lotSize: 0.2,
    propertyType: 'Single Family',
    status: 'For Sale'
  }
];

const sampleTestimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Home Seller',
    content: 'OnlyIf made selling my home incredibly easy. I got a great offer within 24 hours and closed in just 2 weeks. No showings, no repairs, no stress!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    location: 'Austin, TX',
    propertyType: 'Single Family Home'
  },
  {
    id: '2',
    name: 'Mike Chen',
    role: 'Property Investor',
    content: 'As an investor, I appreciate the transparency and speed of OnlyIf. They provided a fair market value and the process was seamless from start to finish.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: 'Dallas, TX',
    propertyType: 'Investment Property'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'First-time Seller',
    content: 'I was nervous about selling my first home, but OnlyIf guided me through every step. The team was professional, responsive, and made everything simple.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    location: 'Houston, TX',
    propertyType: 'Townhouse'
  }
];

export default function ExamplePage() {
  const [loading, setLoading] = useState(false);

  const handlePrimaryCtaClick = () => {
    console.log('Primary CTA clicked');
  };

  const handleSecondaryCtaClick = () => {
    console.log('Secondary CTA clicked');
  };

  const handlePropertyClick = (property: any) => {
    console.log('Property clicked:', property);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection
        headline="Sell Your Home in Days, Not Months"
        subheadline="Get a competitive cash offer in 24 hours. No showings, no repairs, no hassle. Close on your timeline."
        primaryCtaText="Get Cash Offer"
        primaryCtaHref="/sell/get-offer"
        secondaryCtaText="Browse Homes"
        secondaryCtaHref="/browse"
        onPrimaryCtaClick={handlePrimaryCtaClick}
        onSecondaryCtaClick={handleSecondaryCtaClick}
      />

      {/* Property Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <PropertyGrid
            properties={sampleProperties}
            loading={loading}
            totalProperties={sampleProperties.length}
            onPropertyClick={handlePropertyClick}
          />
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Ready to Sell Your Home?"
        subtitle="Join thousands of satisfied sellers"
        description="Get a competitive cash offer in 24 hours with no obligation. Our team of experts will guide you through every step of the process."
        primaryCtaText="Get Your Offer"
        primaryCtaHref="/sell/get-offer"
        secondaryCtaText="Learn More"
        secondaryCtaHref="/how-it-works"
        variant="primary"
        onPrimaryCtaClick={handlePrimaryCtaClick}
        onSecondaryCtaClick={handleSecondaryCtaClick}
      />

      {/* Testimonials */}
      <TestimonialSlider
        testimonials={sampleTestimonials}
        title="What Our Customers Say"
        subtitle="Real stories from real people who sold their homes with us"
        variant="card"
        autoPlay={true}
        autoPlayInterval={5000}
      />

      {/* Secondary CTA */}
      <CTASection
        title="Have Questions?"
        description="Our team is here to help you understand the selling process and answer any questions you may have."
        primaryCtaText="Contact Us"
        primaryCtaHref="/contact"
        secondaryCtaText="View FAQ"
        secondaryCtaHref="/faq"
        variant="secondary"
        alignment="center"
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
