import { Navbar, CTASection } from '@/components';
import StepCard from '@/components/reusable/StepCard';
import Link from 'next/link';
import HeroSection from '@/components/sections/HeroSection';
import { UserPlus, Home, LockOpen, PhoneCall, Handshake, CheckCircle2, DollarSign, CalendarDays, Quote, Star, Clock3 } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: (
        <UserPlus className="w-6 h-6 text-[#47C96F]" strokeWidth={2} />
      ),
      title: 'Seller signs up & lists property',
      description: 'Create a free seller account and add your property details, photos, and pricing. Your listing goes live instantly for buyers to discover.',
      stepNumber: 1
    },
    {
      icon: (
        <LockOpen className="w-6 h-6 text-[#47C96F]" strokeWidth={2} />
      ),
      title: 'Buyer signs up & unlocks property',
      description: 'Interested buyers create an account and unlock full property details with a small access fee to verify genuine interest.',
      stepNumber: 2
    },
    {
      icon: (
        <PhoneCall className="w-6 h-6 text-[#47C96F]" strokeWidth={2} />
      ),
      title: 'Buyer contacts the agent',
      description: 'After unlocking, buyers can message or call the assigned agent to ask questions, arrange inspections, and progress the deal.',
      stepNumber: 3
    },
    {
      icon: (
        <Handshake className="w-6 h-6 text-[#47C96F]" strokeWidth={2} />
      ),
      title: 'Deal closes',
      description: 'Agent guides both parties through negotiation and paperwork. Close smoothly with our secure workflow and get the keys handed over.',
      stepNumber: 4
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection
        backgroundImage="/images/04.jpg"
        headline="How OnlyIf Works"
        subheadline="Simple, transparent, and stress-free real estate transactions"
        primaryCtaText="Get Started"
        primaryCtaHref="/sell/get-offer"
        secondaryCtaText="Browse Homes"
        secondaryCtaHref="/browse"
      />

      {/* Steps Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {steps.map((step, index) => (
                <StepCard
                  key={index}
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                  stepNumber={step.stepNumber}
                  className="h-full border border-transparent hover:border-blue-500 transition-all duration-300"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              Why Choose OnlyIf?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock3 className="w-8 h-8 text-[#47C96F]" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Process</h3>
                <p className="text-gray-600">From offer to closing in as little as 7 days</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-[#47C96F]" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Competitive Offers</h3>
                <p className="text-gray-600">Get fair market value for your home</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="w-8 h-8 text-[#47C96F]" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Flexible Closing</h3>
                <p className="text-gray-600">Choose when you want to close</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 md:p-12 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Quote className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              
              <blockquote className="text-xl md:text-2xl text-gray-800 mb-8 leading-relaxed italic">
                "OnlyIf made selling our home incredibly easy. We got an offer in 24 hours and closed in just 7 days. No showings, no repairs - just a smooth process from start to finish."
              </blockquote>
              
              <div className="mb-6">
                <div className="text-lg font-semibold text-gray-900">Sarah Johnson</div>
                <div className="text-gray-600">Austin, TX • Seller</div>
              </div>
              
              <div className="flex justify-center items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" strokeWidth={2} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Using the same component as localhost:3010 */}
      <CTASection
        title="Ready to Get Started?"
        subtitle="Join thousands of satisfied sellers"
        description="Get your competitive cash offer in 24 hours. No obligation, no hassle."
        primaryCtaText="Get Your Offer Now"
        primaryCtaHref="/sell/get-offer"
        secondaryCtaText="Learn More"
        secondaryCtaHref="/sell"
        variant="primary"
        alignment="center"
      />
    </div>
  );
}
