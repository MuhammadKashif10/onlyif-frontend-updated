'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] pt-4 sm:pt-6 md:pt-8 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/filter.jpg)' }}
          aria-hidden="true"
        />
        {/* Subtle gradient tint */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Sell Your Home
            <span className="block text-blue-200">in Days, Not Months</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-2xl mx-auto">
            Take control of your real estate journey with OnlyIf. Set your price, 
            choose your timeline, and make decisions that work for you.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Learn More
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 backdrop-blur-sm"
            >
              Browse Homes
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#47C96F]" strokeWidth={2} />
              <span>No Obligation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#47C96F]" strokeWidth={2} />
              <span>24-Hour Response</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#47C96F]" strokeWidth={2} />
              <span>Flexible Close Date</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
