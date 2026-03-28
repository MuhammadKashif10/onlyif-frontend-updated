import { Navbar } from '@/components';
import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { HowItWorksSellerSteps } from '@/components/marketing/HowItWorksSellerSteps';

/** Unsplash (see next.config.ts remotePatterns) */
const HERO_STOCK_IMAGE =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2400&q=80';
/** Living space with large windows / city light (stock) */
const SMARTER_SECTION_STOCK_IMAGE =
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80';

function SmarterTick() {
  return (
    <span
      className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-sm border-2 border-[#24A148] bg-transparent flex items-center justify-center mt-0.5"
      aria-hidden
    >
      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#24A148]" strokeWidth={2.5} />
    </span>
  );
}

export default function SellPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero — full-bleed image, left-aligned copy (header unchanged) */}
      <section className="relative min-h-[72vh] sm:min-h-[78vh] flex items-center bg-neutral-900">
        <Image
          src={HERO_STOCK_IMAGE}
          alt="Luxury modern villa with swimming pool at sunset"
          fill
          priority
          className="object-cover object-right sm:object-[75%_center]"
          sizes="100vw"
        />
        {/* Base dim + left-heavy gradient so white copy stays readable on bright exteriors */}
        <div className="absolute inset-0 bg-black/35" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/[0.78] via-black/[0.5] to-black/[0.22]"
          aria-hidden
        />
        <div
          className="absolute inset-y-0 left-0 w-[min(100%,42rem)] bg-gradient-to-r from-black/45 to-transparent"
          aria-hidden
        />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28">
          {/* Narrow column (~550px) — matches client hero: left band, multi-line wrap */}
          <div className="w-full max-w-[550px] text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white leading-[1.15] tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.75)]">
              Sell Only If the Price Is Right
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/95 leading-relaxed drop-shadow-[0_1px_12px_rgba(0,0,0,0.65)]">
              Set your price. Stay in control. Connect with serious buyers without committing to a traditional
              campaign.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
              <Link
                href="/dashboards/seller/register"
                className="inline-flex items-center justify-center rounded-lg bg-[#3AB861] hover:bg-[#329d56] text-white px-7 py-3.5 text-base font-semibold shadow-lg transition-colors text-center"
              >
                List Your Property
              </Link>
              <Link
                href="#how-it-works-steps"
                className="inline-flex items-center justify-center rounded-lg bg-white text-gray-900 px-7 py-3.5 text-base font-semibold border border-white shadow-md hover:bg-gray-50 transition-colors text-center"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HowItWorksSellerSteps />

      {/* A smarter way — split (ticks: green border square + green check, per design) */}
      <section className="py-16 sm:py-20 md:py-24 bg-[#f9f9f9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                A smarter way to test the market
              </h2>
              <p className="mt-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                Only If gives homeowners a private, flexible way to gauge real buyer demand without jumping
                straight into a full public campaign.
              </p>
              <ul className="mt-8 space-y-5">
                <li className="flex gap-3.5 text-left items-start">
                  <SmarterTick />
                  <span className="text-gray-800 text-sm sm:text-base leading-relaxed pt-0.5">
                    <strong>You set the price</strong>
                  </span>
                </li>
                <li className="flex gap-3.5 text-left items-start">
                  <SmarterTick />
                  <span className="text-gray-800 text-sm sm:text-base leading-relaxed pt-0.5">
                    <strong>Quietly</strong> test the market
                  </span>
                </li>
                <li className="flex gap-3.5 text-left items-start">
                  <SmarterTick />
                  <span className="text-gray-800 text-sm sm:text-base leading-relaxed pt-0.5">
                    <strong>Serious buyers only</strong>
                  </span>
                </li>
                <li className="flex gap-3.5 text-left items-start">
                  <SmarterTick />
                  <span className="text-gray-800 text-sm sm:text-base leading-relaxed pt-0.5">
                    <strong>Move forward only</strong> when it suits you
                  </span>
                </li>
              </ul>
            </div>
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-gray-200/80">
              <Image
                src={SMARTER_SECTION_STOCK_IMAGE}
                alt="Modern living room with large windows"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA — solid brand green; white copy; contrasting button */}
      <section className="w-full bg-[#3AB861] py-12 sm:py-14 md:py-16 border-t border-black/10">
        <div className="max-w-7xl mx-auto w-full px-5 sm:px-8 lg:px-10 xl:px-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-10 lg:gap-12">
            <div className="max-w-2xl w-full text-center md:text-left">
              <h2 className="text-white font-bold text-2xl sm:text-[1.65rem] md:text-[1.75rem] leading-snug tracking-tight">
                Ready to see what your property could attract?
              </h2>
              <p className="mt-3 text-[#e0e0e0] text-base font-normal leading-relaxed">
                Create your listing, set your price, and start attracting serious buyer interest — without
                the pressure of a traditional sale.
              </p>
            </div>
            <div className="flex w-full md:w-auto justify-center md:justify-end md:shrink-0">
              <Link
                href="/dashboards/seller/register"
                className="inline-flex w-full max-w-sm md:max-w-none md:w-auto items-center justify-center rounded-xl bg-white px-8 sm:px-10 py-3.5 text-base font-bold text-[#2e7d32] shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition hover:bg-white/95 hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Create Seller Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
