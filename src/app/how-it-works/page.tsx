import Link from 'next/link';
import { Navbar } from '@/components';
import { UNLOCK_FEE_LABEL } from '@/utils/constants';
import {
  BadgeCheck,
  Check,
  CheckCircle2,
  Handshake,
  Home,
  KeyRound,
  Lock,
  MapPin,
  MessageSquareText,
  Search,
  ShieldCheck,
  Tag,
} from 'lucide-react';

const sellerCards = [
  {
    step: 'STEP 1',
    title: 'Set Your Price',
    body: 'Choose the price that would genuinely make you sell. No pressure to list lower.',
    Icon: Tag,
  },
  {
    step: 'STEP 2',
    title: 'Stay Private',
    body: 'Your home is hidden from the public and only visible to serious, verified buyers.',
    Icon: Lock,
  },
  {
    step: 'STEP 3',
    title: "Sell Only If It's Right",
    body: 'If an offer meets your price, our licensed agents handle the negotiation and settlement.',
    Icon: Handshake,
  },
];

const buyerCards = [
  {
    n: 1,
    title: 'Browse Hidden Homes',
    body: "Explore a curated selection of privately listed properties before they ever hit the public market.",
    Icon: Home,
  },
  {
    n: 2,
    title: 'Unlock Full Details',
    body: 'Reveal address, private photos, and direct seller requirements to see if it fits.',
    Icon: KeyRound,
    badge: `${UNLOCK_FEE_LABEL} unlock fee applies`,
  },
  {
    n: 3,
    title: 'Make Your Move',
    body: "If it's the right fit, submit a direct offer or request a private viewing through the platform.",
    Icon: MessageSquareText,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#effdea] text-[#071109]">
      <Navbar logo="/images/logo.PNG" logoText="" />

      <main>
        {/* Hero */}
        <section className="px-4 pb-14 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#9ed9ac] bg-[#dff4da] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#007a38] shadow-sm">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              You don&apos;t need to be selling to get started
            </div>
            <h1 className="mt-8 text-4xl font-black leading-tight tracking-tight text-[#071109] sm:text-5xl lg:text-6xl">
              How <span className="text-[#007a38]">Only If</span> Works
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-[#294232]">
              A smarter way to sell without committing to the market.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-7 text-[#6c8172] sm:text-base">
              Only If gives you control, privacy, and the chance to sell only if the price is right.
            </p>
          </div>
        </section>

        {/* For Sellers */}
        <section className="px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-9 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#cfeecd] text-[#007a38] shadow-sm">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#007a38]">
                  For Sellers
                </p>
                <h2 className="mt-1 text-3xl font-black tracking-tight text-[#071109] sm:text-4xl">
                  Sell on Your Terms, Not the Market&apos;s
                </h2>
              </div>
            </div>
            <p className="mb-8 max-w-3xl text-base font-medium leading-8 text-[#294232]">
              List privately, set your price, and decide if, and when, you want to sell.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {sellerCards.map(({ step, title, body, Icon }) => (
                <article
                  key={step}
                  className="group rounded-lg border border-[#9ed9ac] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(7,17,9,0.08)]"
                >
                  <div className="mb-7 flex h-44 items-center justify-center rounded-lg bg-[#e6f6e3] text-[#007a38] transition group-hover:bg-[#d8f0d5]">
                    <Icon className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <span className="inline-flex rounded bg-[#dff4da] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#007a38]">
                    {step}
                  </span>
                  <h3 className="mt-4 text-xl font-black tracking-tight text-[#071109]">
                    {title}
                  </h3>
                  <p className="mt-4 text-sm font-medium leading-7 text-[#294232]">
                    {body}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 rounded-lg border border-[#9ed9ac] bg-[#d8f0d5] px-6 py-5 text-[#071109] shadow-sm sm:flex-row sm:items-center">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#007a38]" aria-hidden="true" />
              <p className="text-sm font-medium leading-6">
                <strong className="font-black">You&apos;re in control the entire time.</strong> No inspections. No open homes. No pressure to sell.
              </p>
            </div>
          </div>
        </section>

        {/* For Buyers */}
        <section className="px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-9 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#dff4da] text-[#005fd6] shadow-sm">
                <Search className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#005fd6]">
                  For Buyers
                </p>
                <h2 className="mt-1 text-3xl font-black tracking-tight text-[#071109] sm:text-4xl">
                  Unlock Exclusive, Off-Market Properties
                </h2>
              </div>
            </div>
            <p className="mb-8 max-w-3xl text-base font-medium leading-8 text-[#294232]">
              Serious buyers get access to homes you won&apos;t find anywhere else.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {buyerCards.map(({ n, title, body, Icon, badge }) => (
                <article
                  key={n}
                  className="rounded-lg border border-[#c9dcc7] bg-[#f9fff6] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(7,17,9,0.07)]"
                >
                  <div className="mb-5 flex items-center gap-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#005fd6] text-sm font-black text-white">
                      {n}
                    </span>
                    <Icon className="h-5 w-5 text-[#005fd6]" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-[#071109]">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-7 text-[#294232]">
                    {body}
                  </p>
                  {badge ? (
                    <span className="mt-5 inline-flex rounded bg-[#d8e8ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#005fd6]">
                      {badge}
                    </span>
                  ) : null}
                </article>
              ))}
            </div>

            <ul className="mt-12 flex flex-col items-center justify-center gap-4 text-sm font-medium text-[#071109] sm:flex-row sm:flex-wrap sm:gap-10">
              {['Verified buyers only', 'Secure & transparent process', 'Direct connection with sellers'].map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#007a38]">
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Agent Support */}
        <section className="border-t border-[#d7e6d4] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#007a38] text-white shadow-[0_14px_30px_rgba(0,122,56,0.2)]">
                <BadgeCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#007a38]">
                Agents
              </p>
              <h2 className="mt-2 max-w-lg text-3xl font-black leading-tight tracking-tight text-[#071109] sm:text-4xl">
                Expert Support, Only When You Need It
              </h2>
              <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-[#294232]">
                Stay in control. When the time is right, trusted local agents will handle everything, negotiation, paperwork, and settlement, only when your price is met.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <article className="rounded-lg border border-[#c9dcc7] bg-white p-7 shadow-[0_18px_45px_rgba(7,17,9,0.06)]">
                <h3 className="text-xl font-black tracking-tight text-[#071109]">
                  With Only If
                </h3>
                <ul className="mt-5 space-y-4">
                  {[
                    'Test the market without committing to an agent',
                    'Agents handle negotiation only when your price is met',
                    'Full support with paperwork and settlement',
                    'Pay commission only on a successful sale',
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-sm font-medium leading-6 text-[#071109]">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-[#007a38]" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-lg border border-[#c9dcc7] bg-[#dcefd9] p-7 shadow-sm">
                <h3 className="text-xl font-black tracking-tight text-[#071109]">
                  Professional Guidance
                </h3>
                <p className="mt-5 text-sm font-medium leading-7 text-[#294232]">
                  Our network of top-performing local agents are experts in their areas. They work for you to ensure that once a serious buyer meets your price, the transaction is smooth, secure, and professional.
                </p>
                <div className="mt-7 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#dcefd9] bg-white text-xs font-black text-[#007a38]">
                      A
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#dcefd9] bg-[#007a38] text-xs font-black text-white">
                      L
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#dcefd9] bg-[#071109] text-xs font-black text-white">
                      M
                    </span>
                  </div>
                  <p className="text-sm font-black text-[#071109]">500+ Local Experts</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 pb-16 pt-8 sm:px-6 sm:pb-20 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-[#007a38] px-6 py-14 text-center text-white shadow-[0_24px_70px_rgba(0,122,56,0.2)] sm:px-10 sm:py-16">
            <div className="absolute inset-0 opacity-[0.12]" aria-hidden="true">
              <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.55)_1px,transparent_0)] [background-size:18px_18px]" />
            </div>
            <div className="relative mx-auto max-w-4xl">
              <h2 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                Ready to See What Your Home Could Fetch?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base font-black leading-8 text-[#bdf2c4]">
                List privately today, and only sell if the offer is worth it.
              </p>
              <Link
                href="/dashboards/seller/register"
                className="mt-9 inline-flex min-h-14 items-center justify-center rounded-lg bg-white px-10 text-sm font-black text-[#007a38] shadow-sm transition hover:bg-[#f7fff4]"
              >
                Sell Only If
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
