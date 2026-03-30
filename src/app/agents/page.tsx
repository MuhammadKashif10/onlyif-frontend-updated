'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, MinusCircle } from 'lucide-react';
import { Navbar } from '@/components';

const AGENTS_HERO_IMAGE =
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=80';

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-[#f4f5f6]">
      <Navbar
        logo="/images/logo.PNG"
        logoText=""
        navigationItems={[
          { label: 'Buy', href: '/buy', isActive: false },
          { label: 'Sell', href: '/sell', isActive: false },
          { label: 'How it Works', href: '/how-it-works', isActive: false },
          { label: 'Agents', href: '/agents', isActive: true },
        ]}
        ctaText="Sign In"
        ctaHref="/signin"
      />

      <section className="relative overflow-hidden pb-24 pt-10 sm:pb-28 sm:pt-14">
        <Image
          src={AGENTS_HERO_IMAGE}
          alt="Modern home at dusk"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/58" aria-hidden />

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:mt-8 sm:text-4xl md:text-5xl">
              Expert agents, only when you need them.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90 sm:text-2xl">
              Stay in control. When the time is right, trusted local agents will handle everything.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-white/70 bg-white/95 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-[#3AB861]" strokeWidth={2.5} />
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                You don&apos;t need an agent to start
              </h2>
            </div>

            <p className="mt-4 text-lg leading-relaxed text-gray-700">
              List your home, set your price, and test the market privately-without committing to an
              agent or campaign.
            </p>

            <div className="mt-7 grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 sm:grid-cols-2">
              <div className="bg-[#eef1ec] p-6">
                <h3 className="text-3xl font-bold text-gray-900">Traditional Real Estate</h3>
                <ul className="mt-4 space-y-3">
                  {[
                    'Hire an agent first',
                    'Commit to a campaign',
                    'Pay regardless of result',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-lg text-gray-800">
                      <MinusCircle className="h-5 w-5 shrink-0 text-[#f4d96b]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#e7efe8] p-6">
                <h3 className="text-3xl font-bold text-[#2d6d48]">With Only If</h3>
                <ul className="mt-4 space-y-3">
                  {[
                    'Test the market first',
                    'Agent steps in only when needed',
                    'Pay only on success',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-lg text-gray-800">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#3AB861]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-6 text-center text-2xl text-gray-800 sm:text-4xl">
              We&apos;ve teamed up with top-performing agents who know how to close when it matters.
            </p>

            <div className="mt-6 flex justify-center">
              <Link
                href="/contact"
                className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-[#3AB861] px-8 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-[#2f9c52]"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}