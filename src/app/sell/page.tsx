import { Navbar } from '@/components';
import Image from 'next/image';
import Link from 'next/link';
import sellHeroImage from '@/assets/modern-luxury-home-with-contemporary-architecture-landscaping.jpg';
import {
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  EyeOff,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from 'lucide-react';

const HERO_IMAGE = sellHeroImage;
const PROCESS_IMAGE = '/images/How_it_works.jpg';

const advantages = [
  {
    title: 'Set Your Price',
    description:
      "Don't let the market dictate your home's worth. List at the price that would genuinely make you move.",
    Icon: WalletCards,
  },
  {
    title: 'Stay Private',
    description:
      'No public listings, no open homes for neighbours to browse. Only verified, serious buyers gain access.',
    Icon: ShieldCheck,
  },
  {
    title: "Sell Only If It's Right",
    description:
      "There's no pressure to accept. If an offer doesn't hit your target price, you don't sell. Simple.",
    Icon: CheckCircle2,
  },
];

const steps = [
  {
    title: 'Set Your Price',
    description:
      'Define the dream offer that would make selling worthwhile. You are in control of the valuation from day one.',
  },
  {
    title: 'Stay Private',
    description:
      'Your home is only shown to buyers who have been vetted and have expressed direct interest in your specific property type.',
  },
  {
    title: "Sell Only If It's Right",
    description:
      'When a serious offer comes in, our expert agents handle the negotiation. If it meets your price, the deal is done.',
  },
];

export default function SellPage() {
  return (
    <div className="min-h-screen bg-[#effdea] text-[#071109]">
      <Navbar logo="/images/logo.PNG" logoText="" />

      <main>
        {/* Hero */}
        <section className="px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#d9f0d5] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#007a38] shadow-sm ring-1 ring-[#c8e5c4]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Private Marketplace
              </div>
              <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-[#071109] sm:text-5xl lg:text-6xl">
                Sell on Your Terms,{' '}
                <span className="text-[#007a38]">Not the Market&apos;s.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base font-medium leading-8 text-[#294232] sm:text-lg">
                Test the market without the noise. Set your price, keep your privacy, and only sell if an offer meets your exact valuation.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboards/seller/register"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#007a38] px-7 text-sm font-black text-white shadow-[0_16px_35px_rgba(0,122,56,0.22)] transition hover:bg-[#006b31]"
                >
                  List Privately
                </Link>
                <Link
                  href="#how-it-works-sellers"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#c9dcc7] bg-[#f7fff4] px-7 text-sm font-black text-[#007a38] transition hover:border-[#007a38] hover:bg-white"
                >
                  How it Works
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-2xl lg:mx-0">
              <div className="relative aspect-[0.94] overflow-hidden rounded-lg border-4 border-white bg-[#dcefd9] shadow-[0_28px_80px_rgba(7,17,9,0.16)] sm:aspect-[1.02]">
                <Image
                  src={HERO_IMAGE}
                  alt="Private modern luxury home with warm interior lights"
                  fill
                  priority
                  className="h-full w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              </div>
              <div className="absolute -bottom-8 left-4 right-4 rounded-xl border border-[#9de6a8] bg-white p-5 shadow-[0_24px_60px_rgba(7,17,9,0.14)] sm:left-[-2rem] sm:right-auto sm:w-80">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#e6f6e3] text-[#007a38]">
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="text-base font-black tracking-tight text-[#071109]">
                  Zero Visibility
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-[#395342]">
                  Your property remains completely hidden from public real estate portals until you say otherwise.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Seller Advantages */}
        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-black tracking-tight text-[#071109] sm:text-4xl">
                The Only If Seller Advantage
              </h2>
              <p className="mt-4 text-sm font-medium text-[#294232] sm:text-base">
                Discretion is the ultimate luxury in real estate.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {advantages.map(({ title, description, Icon }) => (
                <article
                  key={title}
                  className="group rounded-lg border border-[#9de6a8] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(7,17,9,0.08)]"
                >
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#e6f6e3] text-[#007a38] transition group-hover:bg-[#007a38] group-hover:text-white">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-black tracking-tight text-[#071109]">
                    {title}
                  </h3>
                  <p className="mt-4 text-sm font-medium leading-7 text-[#294232]">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works-sellers"
          className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.98fr_1fr] lg:gap-16">
            <div className="relative">
              <div className="relative aspect-[1.04] overflow-hidden rounded-lg shadow-[0_24px_70px_rgba(7,17,9,0.14)]">
                <Image
                  src={PROCESS_IMAGE}
                  alt="Luxury interior with refined timber and stone finishes"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-lg bg-[#007a38] px-5 py-4 text-sm font-black uppercase tracking-wide text-white shadow-[0_16px_35px_rgba(0,122,56,0.24)]">
                Step-by-Step
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-black tracking-tight text-[#071109] sm:text-4xl">
                How It Works for Sellers
              </h2>
              <ol className="mt-8 space-y-10">
                {steps.map((step, index) => (
                  <li key={step.title} className="grid grid-cols-[3rem_1fr] gap-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#007a38] bg-[#effdea] text-lg font-black text-[#071109]">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#071109]">
                        {step.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-[#294232]">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link
                href="/dashboards/seller/register"
                className="mt-10 inline-flex min-h-12 items-center justify-center rounded-lg bg-[#007a38] px-7 text-sm font-black text-white shadow-[0_16px_35px_rgba(0,122,56,0.18)] transition hover:bg-[#006b31]"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-[#007a38] px-4 py-20 text-center text-white sm:px-6 sm:py-24 lg:px-8">
          <div className="absolute inset-0 opacity-[0.12]" aria-hidden="true">
            <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.55)_1px,transparent_0)] [background-size:18px_18px]" />
          </div>
          <div className="relative mx-auto max-w-4xl">
            <h2 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
              Ready to See What Your Home Could Fetch?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-8 text-[#bdf2c4]">
              List privately today. There are zero upfront marketing fees. You only pay a commission if we find a buyer at your price.
            </p>

            <div className="mx-auto mt-9 max-w-xs rounded-xl bg-white px-8 py-7 text-[#071109] shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#395342]">
                Success Commission
              </p>
              <div className="mt-3 flex items-end justify-center gap-2">
                <span className="pb-2 text-sm font-black text-[#007a38]">AUD</span>
                <span className="text-5xl font-black tracking-tight text-[#007a38]">1.1%</span>
              </div>
              <p className="mt-3 text-xs font-medium text-[#395342]">
                Paid only upon successful settlement
              </p>
            </div>

            <Link
              href="/dashboards/seller/register"
              className="mt-10 inline-flex min-h-14 items-center justify-center rounded-lg bg-[#009447] px-10 text-sm font-black text-white shadow-[0_18px_42px_rgba(0,0,0,0.16)] transition hover:bg-[#00a34f]"
            >
              <BadgeDollarSign className="mr-2 h-5 w-5" aria-hidden="true" />
              List My Home Privately
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
