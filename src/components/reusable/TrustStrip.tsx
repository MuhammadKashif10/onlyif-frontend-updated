import { DollarSign, EyeOff, Calendar, BadgeCheck } from 'lucide-react';

export default function TrustStrip() {
  const benefits = [
    {
      icon: (
        <DollarSign color="#47C96F" strokeWidth={2} size={24} />
      ),
      title: 'Instant Offers',
      description: 'Get a competitive cash offer in 24 hours or less'
    },
    {
      icon: (
        <EyeOff color="#47C96F" strokeWidth={2} size={24} />
      ),
      title: 'No Showings',
      description: 'Skip the hassle of open houses and private showings'
    },
    {
      icon: (
        <Calendar color="#47C96F" strokeWidth={2} size={24} />
      ),
      title: 'Flexible Close Dates',
      description: 'Choose when you want to close - we work around your schedule'
    },
    {
      icon: (
        <BadgeCheck color="#47C96F" strokeWidth={2} size={24} />
      ),
      title: 'Inspection Included',
      description: 'We handle all inspections and repairs at no cost to you'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose OnlyIf?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We make selling your home simple, fast, and stress-free
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <div className="text-blue-600">
                  {benefit.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Trust Indicators */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Homes Sold</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">4.8/5</div>
              <div className="text-gray-600">Customer Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">24hrs</div>
              <div className="text-gray-600">Average Response Time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 