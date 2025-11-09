'use client';

import Link from 'next/link';

interface CTASectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  backgroundImage?: string;
  backgroundGradient?: boolean;
  variant?: 'primary' | 'secondary' | 'dark';
  alignment?: 'left' | 'center' | 'right';
  onPrimaryCtaClick?: () => void;
  onSecondaryCtaClick?: () => void;
  className?: string;
}

export default function CTASection({
  title,
  subtitle,
  description,
  primaryCtaText = 'Get Started',
  primaryCtaHref = '/sell/get-offer',
  secondaryCtaText,
  secondaryCtaHref,
  backgroundImage,
  backgroundGradient = true,
  variant = 'primary',
  alignment = 'center',
  onPrimaryCtaClick,
  onSecondaryCtaClick,
  className = ''
}: CTASectionProps) {
  const handlePrimaryCtaClick = () => {
    if (onPrimaryCtaClick) {
      onPrimaryCtaClick();
    }
  };

  const handleSecondaryCtaClick = () => {
    if (onSecondaryCtaClick) {
      onSecondaryCtaClick();
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return {
          container: 'bg-blue-600 text-white',
          title: 'text-white',
          subtitle: 'text-blue-100',
          description: 'text-blue-100',
          primaryButton: 'bg-white text-black hover:bg-gray-100',
          secondaryButton: 'border-white text-white hover:bg-white hover:text-blue-600'
        };
      case 'secondary':
        return {
          container: 'bg-gray-50 text-gray-900',
          title: 'text-gray-900',
          subtitle: 'text-blue-600',
          description: 'text-gray-600',
          primaryButton: 'bg-blue-600 text-white hover:bg-blue-700',
          secondaryButton: 'border-gray-300 text-gray-700 hover:bg-gray-100'
        };
      case 'dark':
        return {
          container: 'bg-gray-900 text-white',
          title: 'text-white',
          subtitle: 'text-gray-300',
          description: 'text-gray-300',
          primaryButton: 'bg-blue-600 text-white hover:bg-blue-700',
          secondaryButton: 'border-gray-600 text-gray-300 hover:bg-gray-800'
        };
      default:
        return {
          container: 'bg-blue-600 text-white',
          title: 'text-white',
          subtitle: 'text-blue-100',
          description: 'text-blue-100',
          primaryButton: 'bg-white text-blue-600 hover:bg-gray-100',
          secondaryButton: 'border-white text-white hover:bg-white hover:text-blue-600'
        };
    }
  };

  const getAlignmentClasses = () => {
    switch (alignment) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      case 'center':
      default:
        return 'text-center';
    }
  };

  const variantClasses = getVariantClasses();
  const alignmentClasses = getAlignmentClasses();

  return (
    <section 
      className={`relative overflow-hidden py-16 sm:py-20 lg:py-24 ${variantClasses.container} ${className}`}
      role="region"
      aria-labelledby="cta-title"
    >
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>
        </div>
      )}

      {/* Background Gradient */}
      {backgroundGradient && !backgroundImage && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800"></div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`max-w-5xl mx-auto ${alignmentClasses}`}>
          {/* Subtitle */}
          {subtitle && (
            <p className={`text-sm sm:text-base font-semibold uppercase tracking-wide mb-4 ${variantClasses.subtitle}`}>
              {subtitle}
            </p>
          )}

          {/* Title */}
          <h2 
            id="cta-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
          >
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p className={`text-base sm:text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed ${variantClasses.description}`}>
              {description}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={primaryCtaHref}
              onClick={handlePrimaryCtaClick}
              className={`px-8 py-3 sm:px-10 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${variantClasses.primaryButton}`}
              role="button"
              aria-label={primaryCtaText}
            >
              {primaryCtaText}
            </Link>
            
            {secondaryCtaText && (
              <Link
                href={secondaryCtaHref || '#'}
                onClick={handleSecondaryCtaClick}
                className={`px-8 py-3 sm:px-10 sm:py-4 rounded-lg font-semibold text-base sm:text-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${variantClasses.secondaryButton}`}
                role="button"
                aria-label={secondaryCtaText}
              >
                {secondaryCtaText}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Elements (hidden on small screens) */}
      <div className="hidden lg:block absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white bg-opacity-10 rounded-full"></div>
      </div>
    </section>
  );
}
