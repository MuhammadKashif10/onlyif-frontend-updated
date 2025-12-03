'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check } from 'lucide-react';

interface TrustIndicator {
  icon: string;
  text: string;
}

interface HeroSectionProps {
  backgroundImage?: string;
  headline: React.ReactNode;
  subheadline?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  trustIndicators?: TrustIndicator[];
  onPrimaryCtaClick?: () => void;
  onSecondaryCtaClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  alignment?: 'center' | 'left';
}

export default function HeroSection({
  backgroundImage = '/images/01.jpg',
  headline,
  subheadline,
  primaryCtaText = 'Get Started',
  primaryCtaHref = '#',
  secondaryCtaText,
  secondaryCtaHref = '#',
  trustIndicators = [],
  onPrimaryCtaClick,
  onSecondaryCtaClick,
  className = '',
  variant = 'primary',
  alignment = 'center'
}: HeroSectionProps) {
  const [showOfferForm, setShowOfferForm] = useState(false);

  const handlePrimaryClick = () => {
    if (onPrimaryCtaClick) {
      onPrimaryCtaClick();
    }
  };

  const handleSecondaryClick = () => {
    if (onSecondaryCtaClick) {
      onSecondaryCtaClick();
    }
  };

  const textAlignment = alignment === 'center' ? 'text-center' : 'text-left';
  const justifyContent = alignment === 'center' ? 'justify-center' : 'justify-start';

  return (
    <section className={`relative min-h-screen pt-4 sm:pt-6 md:pt-8 flex items-center justify-center ${className}`}>
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          aria-hidden="true"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
      </div>

      {/* Content */}
      <div className={`relative z-20 container mx-auto px-4 ${textAlignment} text-white`}>
        <div className={`max-w-4xl ${alignment === 'center' ? 'mx-auto' : ''}`}>
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {headline}
          </h1>

          {/* Subheadline */}
          {subheadline && (
            <p className={`text-lg md:text-xl lg:text-2xl mb-8 text-gray-100 max-w-2xl ${
              alignment === 'center' ? 'mx-auto' : ''
            }`}>
              {subheadline}
            </p>
          )}

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 ${justifyContent} items-center mb-12`}>
            {primaryCtaText && (
              <Link
                href={primaryCtaHref}
                onClick={handlePrimaryClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg inline-block"
              >
                {primaryCtaText}
              </Link>
            )}
            {secondaryCtaText && (
              <Link
                href={secondaryCtaHref}
                onClick={handleSecondaryClick}
                className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 backdrop-blur-sm"
              >
                {secondaryCtaText}
              </Link>
            )}
          </div>

          {/* Trust Indicators */}
          {trustIndicators.length > 0 && (
            <div className={`flex flex-wrap ${justifyContent} items-center gap-8 text-sm text-gray-200`}>
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-5 h-5" color="#47C96F" strokeWidth={2} size={24} aria-hidden="true" />
                  <span>{indicator.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}