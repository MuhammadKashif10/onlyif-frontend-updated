import Link from 'next/link';
import { Navbar } from '@/components';
import {
  Lightbulb,
  Home,
  Lock,
  Handshake,
  Search,
  Check,
  MessageCircle,
  Tag,
} from 'lucide-react';

const EMERALD = 'text-emerald-600';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar
        navigationItems={[
          { label: 'Buy', href: '/buy', isActive: false },
          { label: 'Sell', href: '/sell', isActive: false },
          { label: 'How it Works', href: '/how-it-works', isActive: true },
          { label: 'Agents', href: '/agents', isActive: false },
        ]}
        ctaText="Sign In"
        ctaHref="/signin"
      />

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-10 pb-14 sm:pt-14 sm:pb-20 px-4 sm:px-6">
          <div className="max-w-[1200px] mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wide border border-emerald-200 bg-emerald-50 text-[#3AB861]">
              <Lightbulb className="h-4 w-4 shrink-0 text-[#3AB861]" aria-hidden />
              You don&apos;t need to be selling to get started
            </div>
            <h1 className="mt-8 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              How{' '}
              <span className="text-[#3AB861]">Only If</span> Works
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              A smarter way to sell — without committing to the market.
            </p>
            <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Only If gives you control, privacy, and the chance to sell only if the price is right.
            </p>
          </div>
        </section>

        {/* For Sellers */}
        <section className="py-14 sm:py-20 px-4 sm:px-6 bg-white border-t border-gray-100">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-10">
              <div className="flex items-center gap-3">
                <span className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Home className="h-6 w-6" strokeWidth={2} aria-hidden />
                  <span className="absolute -bottom-1 -right-1 rounded bg-emerald-600 px-1 text-[9px] font-bold text-white leading-none py-0.5">
                    SALE
                  </span>
                </span>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest ${EMERALD}`}>For sellers</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                    Sell on Your Terms, Not the Market&apos;s
                  </h2>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-base sm:text-lg max-w-3xl mb-12">
              List privately, set your price, and decide if — and when — you want to sell.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  step: 'STEP 1',
                  title: 'Set Your Price',
                  body: 'Choose the price that would genuinely make you sell.',
                  icon: <Tag className="h-8 w-8 text-[#3AB861]" strokeWidth={1.75} />,
                },
                {
                  step: 'STEP 2',
                  title: 'Stay Private',
                  body: 'Your home is hidden from the public and only visible to serious, verified buyers.',
                  icon: <Lock className="h-8 w-8 text-[#3AB861]" strokeWidth={1.75} />,
                },
                {
                  step: 'STEP 3',
                  title: "Sell Only If It's Right",
                  body: 'If an offer meets your price, our licensed agents handle the negotiation, paperwork, and settlement.',
                  icon: <Handshake className="h-8 w-8 text-[#3AB861]" strokeWidth={1.75} />,
                },
              ].map((card) => (
                <article
                  key={card.step}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md shadow-gray-200/60 hover:shadow-lg transition-shadow"
                >
                  <div className="flex h-14 items-center justify-center rounded-xl bg-emerald-50 mb-4">
                    {card.icon}
                  </div>
                  <span className="inline-block rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-800">
                    {card.step}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-gray-900">{card.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{card.body}</p>
                </article>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 sm:px-8 sm:py-5">
              <Lock className="h-6 w-6 text-emerald-700 shrink-0" aria-hidden />
              <p className="text-sm sm:text-base text-gray-800 text-left">
                <strong className="text-gray-900">You&apos;re in control the entire time.</strong> No inspections.
                No open homes. No pressure to sell.
              </p>
            </div>
          </div>
        </section>

        {/* For Buyers */}
        <section className="py-14 sm:py-20 px-4 sm:px-6 bg-slate-50/80 border-t border-gray-100">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-10">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                  <Search className="h-6 w-6" strokeWidth={2} aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-sky-600">For buyers</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                    Unlock Exclusive, Off-Market Properties
                  </h2>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-base sm:text-lg max-w-3xl mb-12">
              Serious buyers get access to homes you won&apos;t find anywhere else.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  n: 1,
                  title: 'Browse Hidden Homes',
                  body: 'Explore a curated selection of privately listed properties.',
                  icon: <Home className="h-6 w-6 text-sky-600" />,
                },
                {
                  n: 2,
                  title: 'Unlock Full Details',
                  body: 'Pay $49 to reveal the address, photos, and connect with the seller.',
                  icon: <Lock className="h-6 w-6 text-sky-600" />,
                },
                {
                  n: 3,
                  title: 'Make Your Move',
                  body: "If it's the right fit, submit an offer directly through the platform.",
                  icon: <MessageCircle className="h-6 w-6 text-sky-600" />,
                },
              ].map((card) => (
                <article
                  key={card.n}
                  className="rounded-2xl border border-sky-100 bg-sky-50/90 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
                      {card.n}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-sky-600 shadow-sm">
                      {card.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{card.body}</p>
                  {card.n === 2 && (
                    <p className="mt-3 text-sm font-medium text-sky-600">$49 unlock fee applies</p>
                  )}
                </article>
              ))}
            </div>

            <ul className="mt-12 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4 sm:gap-10 text-sm sm:text-base text-gray-800">
              {['Verified buyers only', 'Secure & transparent process', 'Direct connection with sellers'].map(
                (line) => (
                  <li key={line} className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3AB861] text-white">
                      <Check
                        className="h-3.5 w-3.5 shrink-0 text-white stroke-white"
                        strokeWidth={3}
                        aria-hidden
                      />
                    </span>
                    {line}
                  </li>
                )
              )}
            </ul>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gray-100">
          <div className="max-w-[1200px] mx-auto">
            <div className="rounded-2xl bg-[#3AB861] px-6 py-12 sm:px-10 sm:py-14 text-center shadow-lg border border-black/10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                Ready to See What Your Home Could Fetch?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-white/95 max-w-2xl mx-auto leading-relaxed">
                List privately today — and only sell if the offer is worth it.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/dashboards/seller/register"
                  className="inline-flex w-full sm:w-auto min-w-[200px] items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-bold text-[#3AB861] shadow-md hover:bg-white/95 transition-colors"
                >
                  Sell Only If
                </Link>
                <Link
                  href="/buy"
                  className="inline-flex w-full sm:w-auto min-w-[200px] items-center justify-center rounded-xl border-2 border-[#2a8f4e] bg-transparent px-8 py-3.5 text-base font-semibold text-white hover:bg-black/10 transition-colors"
                >
                  Browse Homes
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
