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
  backgroundImage = '/images/01.png',
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
    <section
      className={`relative min-h-[60vh] md:min-h-[80vh] pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-16 md:pb-20 flex items-center justify-center ${className}`}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            // Fine-tuned position so the check icons sit more in the middle
            // similar to the provided reference image.
            backgroundPosition: 'center 40%',
          }}
          aria-hidden="true"
        />
        {/* Top-to-bottom dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <div className={`relative z-20 container mx-auto px-4 ${textAlignment} text-white`}>
        <div className={`max-w-3xl md:max-w-4xl ${alignment === 'center' ? 'mx-auto' : ''}`}>
          {/* Main Headline */}
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 leading-snug md:leading-tight">
            {headline}
          </h1>

          {/* Subheadline */}
          {subheadline && (
            <p
              className={`text-base md:text-lg lg:text-xl mb-6 md:mb-8 text-gray-100 max-w-2xl ${
                alignment === 'center' ? 'mx-auto' : ''
              }`}
            >
              {subheadline}
            </p>
          )}

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${justifyContent} items-center mb-8 md:mb-12`}
          >
            {primaryCtaText && (
              <Link
                href={primaryCtaHref}
                onClick={handlePrimaryClick}
                className="bg-[#24A148] hover:bg-[#1b7f37] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg inline-block w-full sm:w-auto text-center"
              >
                {primaryCtaText}
              </Link>
            )}
            {secondaryCtaText && (
              <Link
                href={secondaryCtaHref}
                onClick={handleSecondaryClick}
                className="inline-flex items-center justify-center bg-white/95 hover:bg-white text-black px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 backdrop-blur-sm w-full sm:w-auto text-center"
              >
                {secondaryCtaText}
              </Link>
            )}
          </div>

          {/* Trust Indicators */}
          {trustIndicators.length > 0 && (
            <div
              className={`flex flex-wrap ${justifyContent} items-center gap-4 md:gap-8 text-xs sm:text-sm text-gray-200`}
            >
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    color="#47C96F"
                    strokeWidth={2}
                    size={24}
                    aria-hidden="true"
                  />
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
