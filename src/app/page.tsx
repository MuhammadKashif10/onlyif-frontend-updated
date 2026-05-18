'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, EyeOff, Handshake, LockKeyhole, ShieldCheck, WalletCards } from 'lucide-react';
import { Navbar } from '@/components';
import PropertyGrid from '@/components/sections/PropertyGrid';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  const handlePrimaryCtaClick = () => {
    console.log('Primary CTA clicked');
  };

  const handleSecondaryCtaClick = () => {
    console.log('Secondary CTA clicked');
  };

  return (
    <div className="min-h-screen bg-[#edfbea] text-[#071109]">
      <Navbar logo="/images/logo.PNG" logoText="" />

      <main className="overflow-hidden">
        <section className="bg-[#edfbea] px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1fr] lg:gap-16">
            <div className="max-w-xl">
              <h1 className="text-4xl font-bold leading-[1.05] tracking-normal text-[#071109] sm:text-5xl lg:text-[4.25rem]">
                The Real Estate Market You&apos;ve Been Missing.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-[#4b5b4e] sm:text-lg">
                Only If connects local owners and serious buyers quietly, transparently and in complete control, giving you a smarter way to buy and sell without the pressure or the noise.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={user ? '/buy' : '/signin'}
                  onClick={handleSecondaryCtaClick}
                  className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#087735] px-7 text-sm font-bold text-white shadow-sm hover:bg-[#06662d] focus:outline-none focus:ring-2 focus:ring-[#087735] focus:ring-offset-2"
                >
                  Browse Listings
                </Link>
                <Link
                  href="/signin"
                  onClick={handlePrimaryCtaClick}
                  className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#b8cfbc] bg-white px-7 text-sm font-bold text-[#0a3d20] shadow-sm hover:border-[#087735] hover:bg-[#f8fff8] focus:outline-none focus:ring-2 focus:ring-[#087735] focus:ring-offset-2"
                >
                  List Your Home
                </Link>
              </div>
            </div>

            <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-[#0f2616]/20 bg-[#d8ecd7] shadow-[0_22px_60px_rgba(8,38,18,0.18)] sm:min-h-[460px] lg:min-h-[595px]">
              <Image
                src="/images/01.png"
                alt="Premium modern home"
                fill
                priority
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-[#d4e7d2] bg-[#edfbea] px-5 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-[#071109] sm:text-4xl">How it Works</h2>
              <p className="mt-3 text-sm leading-6 text-[#58695b] sm:text-base">
                A refined process designed for control, privacy and trust.
              </p>
            </div>

            <div className="mt-12 grid gap-7 md:grid-cols-3">
              {[
                {
                  icon: EyeOff,
                  title: 'Set Your Price',
                  body: 'Choose the price that would genuinely make you sell, then test the market without public pressure.'
                },
                {
                  icon: LockKeyhole,
                  title: 'Stay Private',
                  body: 'Your home stays hidden until serious buyers register, verify and unlock access to the opportunity.'
                },
                {
                  icon: Handshake,
                  title: 'Sell Only If It Is Right',
                  body: 'When a buyer meets your terms, Only If helps manage the next steps through to a professional close.'
                }
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <article
                    key={step.title}
                    className="rounded-lg border border-[#bfcfc1] bg-white px-7 py-9 text-center shadow-[0_18px_40px_rgba(21,49,27,0.08)]"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#dff6df]">
                      <Icon className="h-6 w-6 text-[#087735]" aria-hidden="true" />
                    </div>
                    <h3 className="mt-7 text-lg font-semibold text-[#071109]">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#5a675d]">{step.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#edfbea] px-5 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-[#071109] sm:text-4xl">The Vault</h2>
                <p className="mt-2 text-sm text-[#58695b]">Homes available only if the price is right.</p>
              </div>
              <Link href={user ? '/buy' : '/signin'} className="text-sm font-semibold text-[#087735] hover:text-[#065b28]">
                View All Properties
              </Link>
            </div>
            <PropertyGrid
              showFilters={false}
              showPagination={false}
              itemsPerPage={3}
              featuredOnly={false}
              cardVariant="vault"
              emptyStateMessage="Be among the first."
              emptyStateSuggestion="New properties are being added. Register to get early access."
              emptyStateCtaLabel="Join as a Buyer"
              emptyStateCtaHref={user ? '/buy' : '/signin'}
            />
          </div>
        </section>

        <section className="bg-[#edfbea] px-5 py-16 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-7xl rounded-lg bg-[#162d1d] px-7 py-12 text-white shadow-[0_24px_60px_rgba(9,29,14,0.28)] sm:px-12 lg:px-16 lg:py-16">
            <div className="max-w-4xl">
              <h2 className="text-3xl font-bold leading-tight text-white sm:text-5xl">
                Privacy is our highest currency.
              </h2>
              <p className="mt-6 max-w-3xl text-base leading-7 text-white/85">
                High-value property decisions require a specialised environment. Only If provides a private ecosystem for discreet property conversations, verified buyers and owners who stay in control.
              </p>
            </div>

            <div className="mt-10 grid gap-7 md:grid-cols-2">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Zero Digital Footprint',
                  body: 'Properties remain hidden from public portals and search engines until qualified buyers unlock access.'
                },
                {
                  icon: BadgeCheck,
                  title: 'Verified Buyers',
                  body: 'Buyer access is guided by registration, verification and a clear payment filter.'
                },
                {
                  icon: LockKeyhole,
                  title: 'Bank-Level Security',
                  body: 'Communications, documents and next steps are handled inside the secure Only If experience.'
                },
                {
                  icon: WalletCards,
                  title: 'Transparent Success Fee',
                  body: 'Owners can test the market privately, then proceed only when the terms make sense.'
                }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#087735]">
                      <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 max-w-md text-sm leading-6 text-white/72">{item.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#edfbea] px-5 pb-20 sm:px-6 lg:pb-28">
          <div className="mx-auto max-w-7xl border-t border-[#d4e7d2] pt-16 text-center">
            <h2 className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-[#071109] sm:text-5xl">
              Ready to move only if the terms are right?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#4b5b4e]">
              Join Australian homeowners quietly testing the market and serious buyers looking for opportunities they will not find everywhere else.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signin"
                onClick={handlePrimaryCtaClick}
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#087735] px-7 text-sm font-bold text-white shadow-sm hover:bg-[#06662d] focus:outline-none focus:ring-2 focus:ring-[#087735] focus:ring-offset-2"
              >
                I&apos;ll sell, Only IF
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#b8cfbc] bg-white px-7 text-sm font-bold text-[#0a3d20] shadow-sm hover:border-[#087735] hover:bg-[#f8fff8] focus:outline-none focus:ring-2 focus:ring-[#087735] focus:ring-offset-2"
              >
                How it Works
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
