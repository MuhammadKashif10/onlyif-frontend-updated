'use client';

import { useState, useEffect } from 'react';

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating: number;
  image?: string;
  location?: string;
  propertyType?: string;
}

interface TestimonialSliderProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showNavigation?: boolean;
  showDots?: boolean;
  variant?: 'default' | 'card' | 'minimal';
  className?: string;
}

export default function TestimonialSlider({
  testimonials = [],
  title = 'What Our Customers Say',
  subtitle = 'Real stories from real people who sold their homes with us',
  autoPlay = true,
  autoPlayInterval = 5000,
  showNavigation = true,
  showDots = true,
  variant = 'default',
  className = ''
}: TestimonialSliderProps) {
  // Ensure testimonials is always an array
  const safeTestimonials = Array.isArray(testimonials) ? testimonials : [];
  
  // If no testimonials, show a fallback message or return null
  if (safeTestimonials.length === 0) {
    return (
      <section className={`py-16 bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600">No testimonials available at the moment.</p>
        </div>
      </section>
    );
  }
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, autoPlayInterval, testimonials.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const renderTestimonial = (testimonial: Testimonial, index: number) => {
    const isActive = index === currentSlide;

    switch (variant) {
      case 'card':
        return (
          <div
            key={testimonial.id}
            className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-500 ${
              isActive ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95 absolute inset-0'
            }`}
          >
            <div className="flex items-center mb-6">
              {testimonial.image && (
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
              )}
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                {testimonial.role && (
                  <p className="text-gray-600">{testimonial.role}</p>
                )}
                {testimonial.location && (
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center mb-4">
              {renderStars(testimonial.rating)}
            </div>
            
            <blockquote className="text-gray-700 text-lg leading-relaxed mb-4">
              "{testimonial.content}"
            </blockquote>
            
            {testimonial.propertyType && (
              <p className="text-sm text-blue-600 font-medium">
                Sold their {testimonial.propertyType}
              </p>
            )}
          </div>
        );

      case 'minimal':
        return (
          <div
            key={testimonial.id}
            className={`text-center transition-all duration-500 ${
              isActive ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
          >
            <div className="flex justify-center mb-4">
              {renderStars(testimonial.rating)}
            </div>
            
            <blockquote className="text-xl text-gray-700 mb-6 max-w-3xl mx-auto">
              "{testimonial.content}"
            </blockquote>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
              {testimonial.location && (
                <p className="text-gray-600">{testimonial.location}</p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div
            key={testimonial.id}
            className={`bg-white rounded-lg shadow-md p-6 sm:p-8 transition-all duration-500 ${
              isActive ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-full absolute inset-0'
            }`}
          >
            <div className="flex items-center mb-4">
              {renderStars(testimonial.rating)}
            </div>
            
            <blockquote className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
              "{testimonial.content}"
            </blockquote>
            
            <div className="flex items-center">
              {testimonial.image && (
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
              )}
              <div>
                <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                {testimonial.location && (
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section 
      className={`py-16 sm:py-20 lg:py-24 bg-gray-50 ${className}`}
      role="region"
      aria-labelledby="testimonials-title"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          {title && (
            <h2 
              id="testimonials-title"
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Testimonials Slider */}
        <div className="relative max-w-4xl mx-auto">
          <div className="relative overflow-hidden px-16 sm:px-20">
            <div className="relative">
              {/* Update the map function to use safeTestimonials */}
              <div className="relative">
                {safeTestimonials.map((testimonial, index) => (
                  <div key={testimonial.id} className="relative">
                    {renderTestimonial(testimonial, index)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {showNavigation && testimonials.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
                aria-label="Previous testimonial"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
                aria-label="Next testimonial"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Dots Navigation */}
          {showDots && testimonials.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    index === currentSlide 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-current={index === currentSlide ? 'true' : 'false'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Auto-play indicator - REMOVED */}
        {/* 
        {isAutoPlaying && testimonials.length > 1 && (
          <div className="text-center mt-6">
            <div className="inline-flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Auto-playing testimonials
            </div>
          </div>
        )}
        */}
      </div>
    </section>
  );
}
