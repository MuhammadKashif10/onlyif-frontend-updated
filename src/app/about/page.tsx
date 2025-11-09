import { Metadata } from 'next';
import {
  Navbar,
  HeroSection,
  CTASection,
  TestimonialSlider,
  Footer
} from '@/components';

export const metadata: Metadata = {
  title: 'About OnlyIf - Revolutionizing Real Estate',
  description: 'Learn about OnlyIf\'s mission to make buying and selling homes simple, transparent, and stress-free. Discover our story, values, and commitment to transforming the real estate industry.',
  keywords: 'about OnlyIf, real estate company, home buying, home selling, company mission, values',
  openGraph: {
    title: 'About OnlyIf - Revolutionizing Real Estate',
    description: 'Learn about OnlyIf\'s mission to make buying and selling homes simple, transparent, and stress-free.',
    type: 'website',
    locale: 'en_US',
  },
};

const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Founder',
    bio: 'Former real estate agent with 15+ years of experience. Passionate about making real estate accessible to everyone.',
    image: '/images/team-sarah.jpg',
    linkedin: 'https://linkedin.com/in/sarah-johnson',
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    bio: 'Tech veteran with expertise in building scalable platforms. Led engineering teams at multiple successful startups.',
    image: '/images/team-michael.jpg',
    linkedin: 'https://linkedin.com/in/michael-chen',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Operations',
    bio: 'Operations expert with a background in customer success and process optimization.',
    image: '/images/team-emily.jpg',
    linkedin: 'https://linkedin.com/in/emily-rodriguez',
  },
  {
    name: 'David Kim',
    role: 'Head of Sales',
    bio: 'Sales leader with deep understanding of the real estate market and customer needs.',
    image: '/images/team-david.jpg',
    linkedin: 'https://linkedin.com/in/david-kim',
  },
];

const testimonials = [
  {
    id: '1',
    name: 'Jennifer Martinez',
    role: 'Home Seller',
    content: 'OnlyIf transformed my selling experience. The team was professional, transparent, and made everything so easy.',
    rating: 5,
    avatar: '/images/testimonial-jennifer.jpg',
  },
  {
    id: '2',
    name: 'Robert Wilson',
    role: 'Home Buyer',
    content: 'As a first-time buyer, I was nervous about the process. OnlyIf guided me every step of the way with patience and expertise.',
    rating: 5,
    avatar: '/images/testimonial-robert.jpg',
  },
  {
    id: '3',
    name: 'Lisa Thompson',
    role: 'Real Estate Investor',
    content: 'OnlyIf\'s platform is revolutionary. The transparency and efficiency have changed how I think about real estate transactions.',
    rating: 5,
    avatar: '/images/testimonial-lisa.jpg',
  },
];

const stats = [
  { number: '10,000+', label: 'Homes Sold' },
  { number: '50,000+', label: 'Happy Customers' },
  { number: '4.9/5', label: 'Customer Rating' },
  { number: '24hr', label: 'Cash Offers' },
];

export default function AboutPage() {
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
          { label: 'About', href: '/about', isActive: true },
        ]}
        ctaText="Get Started"
        ctaHref="/signin"
      />

      {/* Hero Section */}
      <HeroSection
        backgroundImage="/images/06.jpg"
        headline="Revolutionizing real estate, one home at a time"
        subheadline="We're on a mission to make buying and selling homes simple, transparent, and stress-free for everyone"
        secondaryCtaText="Learn More"
        secondaryCtaHref="#our-story"
        variant="secondary"
      />

      {/* Mission banner */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xl sm:text-2xl font-semibold text-gray-800">
            To give homeowners control over how and when they sell — on their terms.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section id="our-story" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">
                Our Story
              </h2>
              <div className="prose prose-lg text-gray-600 space-y-6">
                <p>
                  OnlyIf was founded in 2020 with a simple yet powerful vision: to transform the real estate industry by making it more accessible, transparent, and efficient for everyone.
                </p>
                <p>
                  Our founder, Sarah Johnson, spent 15 years as a real estate agent witnessing firsthand the frustrations that buyers and sellers faced with traditional real estate processes. From endless paperwork to opaque pricing to months of uncertainty, she knew there had to be a better way.
                </p>
                <p>
                  Today, OnlyIf has helped over 10,000 families buy and sell their homes with confidence. We've built a platform that combines cutting-edge technology with human expertise to deliver an experience that's not just better—it's revolutionary.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="/images/01.jpg"
                alt="OnlyIf team working together"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      
      

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Transparency
              </h3>
              <p className="text-gray-600">
                We believe in complete transparency in all our dealings. No hidden fees, no surprises, just honest communication every step of the way.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Innovation
              </h3>
              <p className="text-gray-600">
                We constantly push the boundaries of what's possible in real estate, using technology to create better experiences for our customers.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Customer First
              </h3>
              <p className="text-gray-600">
                Every decision we make is guided by what's best for our customers. Their success is our success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      

      {/* CTA */}
      <CTASection
        title="Ready to Experience the OnlyIf Difference?"
        description="Join thousands of homeowners who've simplified their real estate journey with us."
        primaryCtaText="Get Started Today"
        primaryCtaHref="/signin"
        secondaryCtaText="Contact Us"
        secondaryCtaHref="/contact"
        backgroundGradient={true}
        variant="primary"
        alignment="center"
      />

      {/* Footer removed - now global */}
    </div>
  );
}
