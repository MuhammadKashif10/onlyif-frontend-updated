import { Navbar } from '@/components';
import HeroSection from '@/components/sections/HeroSection';
import Image from 'next/image';
import { LockOpen, CheckCircle2 } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection
        backgroundImage="/images/04.jpg"
        headline="How OnlyIf Works"
        subheadline="Simple, transparent, and stress-free real estate transactions"
        primaryCtaText=""
        secondaryCtaText="Browse Homes"
        secondaryCtaHref="/browse"
      />

      {/* Steps Section – 3 cards, matching client layout */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How <span className="text-emerald-600">Only If</span> Works
            </h2>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-2xl bg-white shadow-md border border-gray-200 flex flex-col overflow-hidden">
              <div className="px-6 pt-6">
                <p className="text-sm font-semibold text-emerald-600 mb-1">
                  1. Name Your Price
                </p>
              </div>
              <div className="px-6 flex-1">
                <div className="w-full h-32 relative rounded-lg overflow-hidden mb-4 bg-emerald-50">
                  <Image
                    src="/images/how-onlyif-step-1.png"
                    alt="Name your price"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                    <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Set the price you&apos;d sell for.
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  You choose your Only If price – the number that would make you genuinely consider selling.
                </p>
              </div>
              <div className="px-6 pb-6">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  Unlock for $49
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl bg-white shadow-md border border-gray-200 flex flex-col overflow-hidden">
              <div className="px-6 pt-6">
                <p className="text-sm font-semibold text-emerald-600 mb-1">
                  2. Buyers Unlock
                </p>
              </div>
              <div className="px-6 flex-1">
                <div className="w-full h-32 relative rounded-lg overflow-hidden mb-4 bg-emerald-50">
                  <Image
                    src="/images/how-onlyif-step-2.png"
                    alt="Buyers unlock"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                    <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Serious buyers pay to unlock &amp; connect.
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Interested buyers pay $49 to unlock full details and contact, filtering out the time‑wasters.
                </p>
              </div>
              <div className="px-6 pb-6">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  Unlock for $49
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl bg-white shadow-md border border-gray-200 flex flex-col overflow-hidden">
              <div className="px-6 pt-6">
                <p className="text-sm font-semibold text-emerald-600 mb-1">
                  3. Sell When Ready
                </p>
              </div>
              <div className="px-6 flex-1">
                <div className="w-full h-32 relative rounded-lg overflow-hidden mb-4 bg-emerald-50">
                  <Image
                    src="/images/how-onlyif-step-3.png"
                    alt="Sell when ready"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                    <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  If the price is right, we handle the sale.
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  When an offer meets your Only If price, our partner agents manage inspections, negotiation and contracts.
                </p>
              </div>
              <div className="px-6 pb-6">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  Unlock for $49
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose OnlyIf? – comparison table style */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
              Why Choose <span className="text-emerald-600">OnlyIf</span>?
            </h2>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Traditional Real Estate */}
                <div className="px-6 py-6 md:py-8 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Traditional Real Estate
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✓ Public listings</li>
                    <li>✓ Endless inspections</li>
                    <li>✓ Pressure to sell</li>
                    <li>✓ High agent fees</li>
                  </ul>
                </div>

                {/* With OnlyIf */}
                <div className="px-6 py-6 md:py-8 bg-emerald-50/70">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    With <span className="text-emerald-600">OnlyIf</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-800">
                    <li>✓ Private &amp; hidden until buyers unlock</li>
                    <li>✓ No pressure to sell</li>
                    <li>✓ Your price, your terms</li>
                    <li>✓ 1.1% success fee (inc. GST)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
