'use client';
import Image from 'next/image';
import { Search, Calendar, DollarSign, ArrowDown } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Search',
      description: 'Find your perfect home using our advanced search filters',
      icon: (
        <Search color="#47C96F" strokeWidth={2} size={24} />
      )
    },
    {
      number: '02',
      title: 'Visit',
      description: 'Schedule viewings and tour properties at your convenience',
      icon: (
        <Calendar color="#47C96F" strokeWidth={2} size={24} />
      )
    },
    {
      number: '03',
      title: 'Buy',
      description: 'Make an offer and close on your new home with our support',
      icon: (
        <DollarSign color="#47C96F" strokeWidth={2} size={24} />
      )
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/How_it_works.jpg"
          alt="How it works background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gray-900 bg-opacity-30"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our simple 3-step process makes finding and buying your dream home easier than ever
          </p>
        </div>

        <div className="relative">
          {/* Connection Line - REMOVED */}
          {/* <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500/30 transform -translate-y-1/2 z-0"></div> */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  {/* Step Number */}
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold relative z-10">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-blue-100 relative z-10">
                    <div className="text-blue-600">
                      {step.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-2xl font-semibold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Arrow for mobile */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center mt-6" aria-hidden="true">
                      <ArrowDown color="#47C96F" strokeWidth={2} size={24} />
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}