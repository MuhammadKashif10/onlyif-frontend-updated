import { MapPin, DollarSign, CheckCircle2, CalendarDays, ArrowDown } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Submit Your Address',
      description: 'Enter your property address and basic details to get started',
      icon: (
        <MapPin className="w-12 h-12 text-[#47C96F]" strokeWidth={2} />
      )
    },
    {
      number: '02',
      title: 'Get Your Offer',
      description: 'Receive a competitive cash offer within 24 hours',
      icon: (
        <DollarSign className="w-12 h-12 text-[#47C96F]" strokeWidth={2} />
      )
    },
    {
      number: '03',
      title: 'Schedule Inspection',
      description: 'We handle all inspections and repairs at no cost to you',
      icon: (
        <CheckCircle2 className="w-12 h-12 text-[#47C96F]" strokeWidth={2} />
      )
    },
    {
      number: '04',
      title: 'Close on Your Timeline',
      description: 'Choose your closing date and we handle the rest',
      icon: (
        <CalendarDays className="w-12 h-12 text-[#47C96F]" strokeWidth={2} />
      )
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Selling your home has never been easier. Our simple 4-step process gets you from listing to closing in as little as 7 days.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-blue-200 transform -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  {/* Step Number */}
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold relative z-10">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-blue-100 relative z-10">
                    <div className="text-[#47C96F]">
                      {step.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center mt-6">
                    <ArrowDown className="w-6 h-6 text-blue-300" strokeWidth={2} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6">
              Get your competitive cash offer in 24 hours. No obligation, no hassle.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
              Get Your Offer Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
