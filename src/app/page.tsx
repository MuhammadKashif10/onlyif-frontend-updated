'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Navbar,
  HeroSection,
  CTASection,
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
    size: 2200,
    featured: true,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    ],
    description: 'Elegant townhouse with modern amenities and great location.',
    yearBuilt: 2020,
    lotSize: 0.15,
    propertyType: 'Townhouse',
    status: 'For Sale'
  }
];

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePrimaryCtaClick = () => {
    console.log('Primary CTA clicked');
  };

  const handleSecondaryCtaClick = () => {
    console.log('Secondary CTA clicked');
  };

  const handlePropertyClick = (property: any) => {
    console.log('Property clicked:', property.id);
    router.push(`/property/${property.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
<Navbar 
        logo="/images/logo.PNG"
        logoText=""
      />
      
      {/* Hero Section */}
      <HeroSection
        backgroundImage="/images/01.png"
        headline={
          <>
            <span className="block text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Australia’s trusted way to buy and
            </span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              sell property on your terms.
            </span>
          </>
        }
        subheadline="Only If connects local owners and serious buyers quietly, transparently and in complete control – giving you a smarter way to buy and sell without the pressure or the noise."
        primaryCtaText="I'm a Seller"
        primaryCtaHref="/signin"
        secondaryCtaText="I'm a Buyer"
        secondaryCtaHref="/signin"
        onPrimaryCtaClick={handlePrimaryCtaClick}
        onSecondaryCtaClick={handleSecondaryCtaClick}
        badges={[
          { className: 'left-10 md:left-16 bottom-16 md:bottom-24' },
          { className: 'left-1/2 -translate-x-1/2 bottom-20 md:bottom-28' },
          { className: 'right-10 md:right-16 bottom-16 md:bottom-24' },
        ]}
      />

      {/* Mission highlight */}
      <section className="bg-white py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Our Mission
          </h2>
          <p className="mt-3 text-lg text-gray-700 max-w-3xl mx-auto">
            To give homeowners control over how and when they sell — on their terms.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Ready to Sell Your Home?"
        subtitle="Join Australian homeowners selling on their terms"
        description="Only If is an Australian home-selling platform that connects you with serious buyers in your neighbourhood, with transparent pricing, personalised support and a sale timeline that suits you – no pressure and no hard sell."
        primaryCtaText="Get Your Offer"
        primaryCtaHref="/sell/get-offer"
        secondaryCtaText="Learn More"
        secondaryCtaHref="/how-it-works"
        variant="primary"
        alignment="center"
      />

      {/* Footer removed - already handled by layout.tsx */}
    </div>
  );
}