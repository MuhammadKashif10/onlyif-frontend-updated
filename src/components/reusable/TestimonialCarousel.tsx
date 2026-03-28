'use client';

import { useState, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      quote: "OnlyIf made selling our home incredibly easy. We got an offer in 24 hours and closed in just 7 days. No showings, no repairs - just a smooth process from start to finish.",
      author: "Sarah Johnson",
      location: "Austin, TX",
      type: "Seller",
      rating: 5
    },
    {
      quote: "I was skeptical at first, but the team at OnlyIf exceeded my expectations. They handled everything professionally and I got a fair price for my home without any hassle.",
      author: "Michael Chen",
      location: "Phoenix, AZ",
      type: "Seller",
      rating: 5
    },
    {
      quote: "As a buyer, I found the perfect home through OnlyIf. The process was transparent and the team was incredibly helpful throughout the entire journey.",
      author: "Emily Rodriguez",
      location: "Miami, FL",
      type: "Buyer",
      rating: 5
    },
    {
      quote: "We needed to sell quickly due to a job relocation. OnlyIf came through with a competitive offer and we closed in just 5 days. Highly recommend!",
      author: "David Thompson",
      location: "Seattle, WA",
      type: "Seller",
      rating: 5
    },
    {
      quote: "The customer service at OnlyIf is outstanding. They kept us informed every step of the way and made what could have been stressful very smooth.",
      author: "Lisa Park",
      location: "Denver, CO",
      type: "Buyer",
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what real customers have to say about their experience.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Testimonial Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="text-center">
              {/* Quote Icon */}
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Quote color="#47C96F" strokeWidth={2} size={24} />
              </div>

              {/* Quote */}
              <blockquote className="text-xl md:text-2xl text-gray-800 mb-8 leading-relaxed italic">
                "{testimonials[currentIndex].quote}"
              </blockquote>

              {/* Author Info */}
              <div className="mb-6">
                <div className="text-lg font-semibold text-gray-900">
                  {testimonials[currentIndex].author}
                </div>
                <div className="text-gray-600">
                  {testimonials[currentIndex].location} • {testimonials[currentIndex].type}
                </div>
              </div>

              {/* Rating */}
              <div className="flex justify-center items-center gap-1 mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5" color="#47C96F" strokeWidth={2} size={24} />
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" color="#47C96F" strokeWidth={2} size={24} aria-hidden="true" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" color="#47C96F" strokeWidth={2} size={24} aria-hidden="true" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-[#47C96F]' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
            <div className="text-gray-600">Customer Satisfaction</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">4.9/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
        </div>
      </div>
    </section>
  );
} 