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
  badges?: {
    className: string;
    icon?: React.ReactNode;
  }[];
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
  alignment = 'center',
  badges = [],
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
      className={`relative min-h-[85vh] flex items-center justify-center px-6 ${className}`}
    >
      {/* Background Image */}
      <img
        src={backgroundImage}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-center object-cover md:object-cover"
        style={{ objectPosition: 'center 45%' }}
      />

      {/* Floating badges (optional) */}
      {badges.length > 0 && (
        <div className="pointer-events-none absolute inset-0 z-10">
          {badges.map((badge, index) => (
            <div key={index} className={`absolute ${badge.className}`}>
              <div className="inline-flex items-center justify-center rounded-xl bg-[#FFE94F] px-3 py-2 shadow-lg shadow-black/20 border border-black/10">
                {badge.icon ?? (
                  <Check className="w-6 h-6 text-[#0C304B]" strokeWidth={3} aria-hidden="true" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logo/Tagline at top left */}
      <div className="absolute top-8 left-6 md:top-12 md:left-12 z-30">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#FFE94F] rounded-lg flex items-center justify-center shadow-md">
              <Check className="w-5 h-5 md:w-6 md:h-6 text-[#0C304B]" strokeWidth={3} />
            </div>
            <span className="text-xl md:text-2xl font-bold text-gray-900">ONLY IF</span>
          </div>
          <p className="text-xs md:text-sm text-gray-700 font-medium ml-0 md:ml-12">Your Home. Your Rules. Your Price.</p>
        </div>
      </div>

      {/* Content */}
      <div className={`relative z-20 w-full max-w-6xl mx-auto py-16 md:py-20 ${textAlignment} text-white`}>
        <div className={`${alignment === 'center' ? 'mx-auto' : ''}`}>
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
            {headline}
          </h1>

          {/* Subheadline */}
          {subheadline && (
            <p
              className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-white/90 max-w-3xl md:max-w-4xl leading-relaxed ${
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
