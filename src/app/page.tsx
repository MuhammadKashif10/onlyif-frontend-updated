'use client';

import { useRouter } from 'next/navigation';
import {
  Navbar,
  HeroSection,
  CTASection,
  Footer
} from '@/components';
import PropertyGrid from '@/components/sections/PropertyGrid';
import { HowItWorksUnlockButton } from '@/components/marketing/HowItWorksUnlockButton';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  const handlePrimaryCtaClick = () => {
    console.log('Primary CTA clicked');
  };

  const handleSecondaryCtaClick = () => {
    console.log('Secondary CTA clicked');
  };

  return (
    <div className="min-h-screen bg-white">
<Navbar 
        logo="/images/logo.PNG"
        logoText=""
      />
      
      {/* Hero Section */}
      <HeroSection
        backgroundImage="/images/01.png"
        headline={
          <>
            <span className="block text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Australia's trusted way to buy and
            </span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              sell property on your terms.
            </span>
          </>
        }
        subheadline="Only If connects local owners and serious buyers quietly, transparently and in complete control – giving you a smarter way to buy and sell without the pressure or the noise."
        primaryCtaText="I'll sell, Only IF"
        primaryCtaHref="/signin"
        secondaryCtaText="I'm a Buyer"
        secondaryCtaHref={user ? "/buy" : "/signin"}
        onPrimaryCtaClick={handlePrimaryCtaClick}
        onSecondaryCtaClick={handleSecondaryCtaClick}
        showOverlay={false}
      />

      {/* Property cards (after hero) */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Homes Available Only If the Price Is Right
            </h2>
          </div>
          <PropertyGrid
            showFilters={false}
            showPagination={false}
            itemsPerPage={12}
            featuredOnly={false}
            emptyStateMessage="Be among the first."
            emptyStateSuggestion="New properties are being added — register to get early access."
            emptyStateCtaLabel="Join as a Buyer"
            emptyStateCtaHref={user ? "/buy" : "/signin"}
          />
        </div>
      </section>

      {/* How Only If Works (home) */}
      <section className="py-20 bg-white">
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
                  1. Set Your Price
                </p>
              </div>
              <div className="px-6 flex-1 pb-6">
                <div className="w-full h-32 relative rounded-lg overflow-hidden mb-4 bg-emerald-50">
                  <Image
                    src="/images/how-onlyif-step-1.png"
                    alt="Set your price"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                    <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Choose the price that would genuinely make you sell.
                </p>
              </div>
            </div>

            {/* Card 2 — unlock CTA only here (buyer unlock example) */}
            <div className="rounded-2xl bg-white shadow-md border border-gray-200 flex flex-col overflow-hidden">
              <div className="px-6 pt-6">
                <p className="text-sm font-semibold text-emerald-600 mb-1">
                  2. Stay Private
                </p>
              </div>
              <div className="px-6 flex-1">
                <div className="w-full h-32 relative rounded-lg overflow-hidden mb-4 bg-emerald-50">
                  <Image
                    src="/images/how-onlyif-step-2.png"
                    alt="Stay private until buyers unlock"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                    <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Your home stays hidden until serious buyers unlock it.
                </p>
              </div>
              <div className="px-6 pb-6">
                <HowItWorksUnlockButton />
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl bg-white shadow-md border border-gray-200 flex flex-col overflow-hidden">
              <div className="px-6 pt-6">
                <p className="text-sm font-semibold text-emerald-600 mb-1">
                  3. Sell Only If It&apos;s Right
                </p>
              </div>
              <div className="px-6 flex-1 pb-6">
                <div className="w-full h-32 relative rounded-lg overflow-hidden mb-4 bg-emerald-50">
                  <Image
                    src="/images/how-onlyif-step-3.png"
                    alt="Sell only if the price is right"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                    <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  If a buyer meets your price, we handle everything from there.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose OnlyIf? (home) */}
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

      {/* Mission highlight */}
      <section className="bg-white py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Our Mission
          </h2>
          <p className="mt-3 text-lg text-gray-700 max-w-3xl mx-auto">
            To give homeowners control over how and when they sell — on their terms.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Ready to Sell Your Home?"
        subtitle="Join Australian homeowners selling on their terms"
        description="Only If is an Australian home-selling platform that connects you with serious buyers in your neighbourhood, with transparent pricing, personalised support and a sale timeline that suits you – no pressure and no hard sell."
        primaryCtaText="I'll sell, Only IF"
        primaryCtaHref="/signin"
        secondaryCtaText="How it Works"
        secondaryCtaHref="/how-it-works"
        showPrimary={true}
        variant="primary"
        alignment="center"
      />

      {/* Footer removed - already handled by layout.tsx */}
    </div>
  );
}