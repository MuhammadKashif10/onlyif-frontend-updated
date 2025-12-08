import { Metadata } from 'next';
import { Navbar } from '@/components';

export const metadata: Metadata = {
  title: 'About OnlyIf - Revolutionizing Real Estate',
  description: 'Learn about OnlyIf\'s mission to make buying and selling homes simple, transparent, and stress-free. Discover our story, values, and commitment to transforming the real estate industry.',
  keywords: 'about OnlyIf, real estate company, home buying, home selling, company mission, values',
  openGraph: {
    title: 'About OnlyIf - Revolutionizing Real Estate',
    description: 'Learn about OnlyIf\'s mission to make buying and selling homes simple, transparent, and stress-free.',
    type: 'website',
    locale: 'en_US',
  },
};

const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Founder',
    bio: 'Former real estate agent with 15+ years of experience. Passionate about making real estate accessible to everyone.',
    image: '/images/team-sarah.jpg',
    linkedin: 'https://linkedin.com/in/sarah-johnson',
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    bio: 'Tech veteran with expertise in building scalable platforms. Led engineering teams at multiple successful startups.',
    image: '/images/team-michael.jpg',
    linkedin: 'https://linkedin.com/in/michael-chen',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Operations',
    bio: 'Operations expert with a background in customer success and process optimization.',
    image: '/images/team-emily.jpg',
    linkedin: 'https://linkedin.com/in/emily-rodriguez',
  },
  {
    name: 'David Kim',
    role: 'Head of Sales',
    bio: 'Sales leader with deep understanding of the real estate market and customer needs.',
    image: '/images/team-david.jpg',
    linkedin: 'https://linkedin.com/in/david-kim',
  },
];

const testimonials = [
  {
    id: '1',
    name: 'Jennifer Martinez',
    role: 'Home Seller',
    content: 'OnlyIf transformed my selling experience. The team was professional, transparent, and made everything so easy.',
    rating: 5,
    avatar: '/images/testimonial-jennifer.jpg',
  },
  {
    id: '2',
    name: 'Robert Wilson',
    role: 'Home Buyer',
    content: 'As a first-time buyer, I was nervous about the process. OnlyIf guided me every step of the way with patience and expertise.',
    rating: 5,
    avatar: '/images/testimonial-robert.jpg',
  },
  {
    id: '3',
    name: 'Lisa Thompson',
    role: 'Real Estate Investor',
    content: 'OnlyIf\'s platform is revolutionary. The transparency and efficiency have changed how I think about real estate transactions.',
    rating: 5,
    avatar: '/images/testimonial-lisa.jpg',
  },
];

const stats = [
  { number: '10,000+', label: 'Homes Sold' },
  { number: '50,000+', label: 'Happy Customers' },
  { number: '4.9/5', label: 'Customer Rating' },
  { number: '24hr', label: 'Cash Offers' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
<Navbar
        logo="/images/logo.PNG"
        logoText=""
        navigationItems={[
          { label: 'Buy', href: '/browse', isActive: false },
          { label: 'Sell', href: '/sell', isActive: false },
          { label: 'How It Works', href: '/how-it-works', isActive: false },
          { label: 'About', href: '/about', isActive: true },
        ]}
        ctaText="Get Started"
        ctaHref="/signin"
      />

      {/* Hero Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
            About Only If
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600">
            Only If is a new kind of real estate platform built in Australia for owners who are open to selling – but only if the price is right.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="bg-white">
        {/* Why Only If Exists */}
        <section className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Why Only If Exists
            </h2>
            <div className="mt-4 sm:mt-6 text-gray-600 space-y-4">
              <p>About ‘’Only If’’</p>
              <p>
                Only If is a new kind of real estate platform built in Australia for owners who are open to selling – but only if the price is right.
              </p>
              <p>
                Instead of committing to a full campaign, paying big marketing fees, and putting your life on display, Only If lets you quietly list your home at the price you’d actually be happy to sell for. Serious buyers can then discover your property, request more information and, when the time is right, move forward with inspections and negotiations.
              </p>
              <p>
                We exist for the owners who say, “I’d sell… but only if I got X.”
              </p>
              <p>
                Traditional real estate is built around the idea that you’re either “on the market” or you’re not. In reality, there’s a huge group of people who are thinking about selling, but don’t want the stress, cost and pressure of a full public campaign on the major portals.
              </p>
              <p>
                At the same time, there are motivated buyers who are tired of missing out, watching homes sell off-market, or never even knowing a property could have been available if they’d just known who to talk to.
              </p>
              <p>Only If connects these two groups.</p>
              <p>
                We give owners a simple way to raise their hand and say, “if someone pays my price, I’ll talk.” And we give serious buyers a way to find those opportunities before they hit the open market.
              </p>
            </div>
          </div>
        </section>

        {/* How Only If Works */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              How Only If Works
            </h2>
            <div className="mt-4 sm:mt-6 text-gray-600">
              <p>How Only If works</p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex flex-col">
                <span className="text-sm font-medium text-blue-600 mb-1">Step 1</span>
                <h3 className="text-lg font-semibold text-gray-900">
                  Owners set their “Only If” price
                </h3>
                <p className="mt-3 text-gray-600 flex-1">
                  You decide the price you’d be comfortable selling for and create your listing. You stay in control – there’s no obligation to sell unless the right offer appears.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex flex-col">
                <span className="text-sm font-medium text-blue-600 mb-1">Step 2</span>
                <h3 className="text-lg font-semibold text-gray-900">
                  Buyers pay to unlock full details
                </h3>
                <p className="mt-3 text-gray-600 flex-1">
                  Interested buyers pay a small fee to unlock the full property details, including address, photos and owner/agent contact details. This filters out the tyre-kickers and keeps enquiries serious.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex flex-col">
                <span className="text-sm font-medium text-blue-600 mb-1">Step 3</span>
                <h3 className="text-lg font-semibold text-gray-900">
                  Simple, transparent fees
                </h3>
                <p className="mt-3 text-gray-600 flex-1">
                  There are no upfront marketing costs or expensive campaigns. If an Only If buyer goes on to purchase your property and the sale goes unconditional, you pay a simple 1.1% (inc GST) success fee. Only If then shares this fee with a trusted, licensed local agent who handles inspections, negotiations and the contract process with you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Built With Agents — Not Against Them */}
        <section className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Built With Agents — Not Against Them
            </h2>
            <div className="mt-4 sm:mt-6 text-gray-600 space-y-4">
              <p>Built with agents, not against them!</p>
              <p>Only If is not trying to replace real estate agents.</p>
              <p>
                We believe great agents are essential in achieving the best outcome for both sellers and buyers. That’s why we partner with selected agents who are paid a transparent share of the success fee when a sale occurs through the platform.
              </p>
              <p>
                Agents gain access to serious, pre-qualified buyers and genuine off-market opportunities, while owners benefit from professional advice and negotiation without the traditional big-ticket marketing spend.
              </p>
            </div>
          </div>
        </section>

        {/* Our Vision */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Our Vision
            </h2>
            <div className="mt-4 sm:mt-6 text-gray-600 space-y-4">
              <p>Our vision is simple:</p>
              <p>
                To give Australian property owners more control, more transparency and more options – without forcing them into an “all or nothing” sale campaign.
              </p>
              <p>
                If you’ve ever said, “I’d sell… but only if the price was right,” Only If was built for you.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg px-8 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Button 1
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg px-8 py-3 text-base font-semibold text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 transition-colors duration-200"
              >
                Button 2
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer removed - now global */}
    </div>
  );
}
