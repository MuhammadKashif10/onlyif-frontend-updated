import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components';
import {
  Check,
  Quote,
  Users,
  Handshake,
  Search,
  BarChart3,
  CheckSquare,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About OnlyIf - Revolutionizing Real Estate',
  description:
    "Learn about OnlyIf's mission to make buying and selling homes simple, transparent, and stress-free. Discover our story, values, and commitment to transforming the real estate industry.",
  keywords:
    'about OnlyIf, real estate company, home buying, home selling, company mission, values',
  openGraph: {
    title: 'About OnlyIf - Revolutionizing Real Estate',
    description:
      "Learn about OnlyIf's mission to make buying and selling homes simple, transparent, and stress-free.",
    type: 'website',
    locale: 'en_US',
  },
};

const audiences = [
  {
    title: 'For Owners',
    body: 'Test the market privately, set your price and stay in control. No obligation to sell.',
  },
  {
    title: 'For Buyers',
    body: 'Access genuine off-market opportunities before they hit the open market.',
  },
  {
    title: 'For Agents',
    body: 'Qualified buyer enquiries, more listing opportunities and paid on success.',
  },
];

const agentFeatures = [
  {
    Icon: Users,
    title: 'We partner with trusted local agents',
    body: 'Only licensed agents manage the process, inspections and negotiations.',
  },
  {
    Icon: Handshake,
    title: 'Agents earn a transparent share of success',
    body: "You're paid fairly when a sale happens. No upfront fees, no risk.",
  },
  {
    Icon: Search,
    title: 'Access to serious, pre-qualified buyers',
    body: 'We filter out tyre-kickers so you spend time on enquiries that are real.',
  },
  {
    Icon: BarChart3,
    title: 'Professional advice, without the big campaign',
    body: 'Get the benefit of experience and negotiation — without the big-ticket marketing spend.',
  },
];

const visionPoints = [
  'More control',
  'Without pressure',
  'More transparency',
  'Without committing to an "all or nothing" sale',
  'More choice',
];

function CheckBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'h-6 w-6' : 'h-7 w-7';
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <span
      className={`${dim} shrink-0 inline-flex items-center justify-center rounded-full bg-[#2FA553]`}
    >
      <Check
        className={`${icon} text-white`}
        color="#ffffff"
        strokeWidth={3.5}
        aria-hidden="true"
      />
    </span>
  );
}

function SectionHeading({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'center';
}) {
  return (
    <div className={align === 'center' ? 'text-center' : ''}>
      <h2 className="text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">
        {children}
      </h2>
      <span
        className={`mt-4 block h-1 w-12 rounded-full bg-[#2FA553] ${
          align === 'center' ? 'mx-auto w-14' : ''
        }`}
      />
    </div>
  );
}

function PremiumImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="group overflow-hidden rounded-[20px] shadow-lg">
      <img
        src={src}
        alt={alt}
        className="h-72 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 sm:h-96 lg:h-[460px]"
      />
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827]">
      {/* Navigation (header unchanged) */}
      <Navbar
        logo="/images/logo.PNG"
        logoText=""
        navigationItems={[
          { label: 'Buy', href: '/buy', isActive: false },
          { label: 'Sell', href: '/sell', isActive: false },
          { label: 'How It Works', href: '/how-it-works', isActive: false },
          { label: 'About', href: '/about', isActive: true },
        ]}
        ctaText="Get Started"
        ctaHref="/signin"
      />

      {/* Hero */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2FA553]">
                About Only If
              </p>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-[#111827] sm:text-5xl lg:text-6xl">
                I&apos;d sell…
                <br />
                but only if I got
                <br />
                <span className="text-[#2FA553]">my price.</span>
              </h1>
              <p className="mt-7 text-lg font-semibold text-[#1f2937]">
                That&apos;s exactly why we built Only If.
              </p>
              <p className="mt-3 max-w-md text-base leading-7 text-gray-600">
                We help Australian property owners privately test the market on
                their terms — and connect with serious buyers who are ready to
                talk.
              </p>
            </div>

            <div className="relative">
              <PremiumImage
                src="/images/05.jpg"
                alt="A modern Australian home at dusk"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-[#F3F8F4]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left: narrative */}
            <div>
              <SectionHeading>Our Story</SectionHeading>

              <div className="mt-7 space-y-5 text-base leading-7 text-gray-600">
                <p>
                  After decades working in Australian real estate, we noticed
                  the same conversation happening over and over again.
                </p>
                <p>Owners weren&apos;t saying &ldquo;I want to sell.&rdquo;</p>
                <p>They were saying:</p>

                <blockquote className="rounded-r-xl border-l-4 border-[#2FA553] bg-[#EAF6EE] px-5 py-4">
                  <Quote
                    className="mb-1 h-5 w-5 text-[#2FA553]"
                    aria-hidden="true"
                  />
                  <p className="text-lg font-semibold text-[#111827]">
                    <span className="text-[#2FA553]">I&apos;d sell…</span> but
                    only if I got the right price.
                  </p>
                </blockquote>

                <p>
                  The problem was there was nowhere for those owners to quietly
                  test the market without committing to a full sales campaign.
                </p>
                <p className="font-semibold text-[#1f2937]">
                  That&apos;s why Only If was created.
                </p>
              </div>
            </div>

            {/* Right: audience card */}
            <div className="rounded-[20px] bg-white p-8 shadow-[0_8px_30px_rgba(17,24,39,0.06)] transition-shadow duration-300 hover:shadow-[0_18px_50px_rgba(17,24,39,0.10)] sm:p-10">
              <ul className="space-y-8">
                {audiences.map(({ title, body }) => (
                  <li key={title} className="flex gap-4">
                    <CheckBadge />
                    <div>
                      <h3 className="text-lg font-bold text-[#111827]">
                        {title}
                      </h3>
                      <p className="mt-1.5 text-base leading-7 text-gray-600">
                        {body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Built With Agents */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <SectionHeading align="center">
            Built With Agents. Not Against Them.
          </SectionHeading>

          <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {agentFeatures.map(({ Icon, title, body }) => (
              <div key={title} className="group text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF6EE] text-[#2FA553] transition-colors duration-300 group-hover:bg-[#2FA553] group-hover:text-white">
                  <Icon className="h-7 w-7" strokeWidth={1.8} aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-base font-bold text-[#111827]">
                  {title}
                </h3>
                <p className="mt-2.5 text-sm leading-6 text-gray-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="bg-[#F3F8F4]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left: image */}
            <div className="order-2 lg:order-1">
              <PremiumImage
                src="/images/03.jpg"
                alt="A bright, modern home interior"
              />
            </div>

            {/* Right: vision */}
            <div className="order-1 lg:order-2">
              <SectionHeading>Our Vision</SectionHeading>

              <p className="mt-7 text-base leading-7 text-gray-600">
                We believe homeowners deserve more options.
              </p>

              <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {visionPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckBadge size="sm" />
                    <span className="text-base leading-6 text-[#1f2937]">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 space-y-2">
                <p className="text-base text-gray-600">
                  Sometimes you just want to know:
                </p>
                <p className="text-lg font-bold text-[#111827]">
                  &ldquo;If someone offered me my price, would I move?&rdquo;
                </p>
                <p className="text-base text-gray-600">
                  Only If gives you a way to find out.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-[20px] bg-[#1B5E3A] px-6 py-8 shadow-[0_18px_50px_rgba(20,83,45,0.25)] sm:px-10 sm:py-10">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:gap-8 md:text-left">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-5 sm:text-left">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30">
                  <CheckSquare className="h-8 w-8" strokeWidth={2} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                    Real estate, on your terms.
                  </h2>
                  <p className="mt-1 text-base text-emerald-50/90">
                    I&apos;d sell… but only if I got my price.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 md:items-end">
                <Link
                  href="/signin"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 text-base font-bold text-[#1B5E3A] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-md"
                >
                  Get Started Today
                </Link>
                <p className="text-sm text-emerald-50/80">
                  It&apos;s free to list. No obligation to sell.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer is global (unchanged) */}
    </div>
  );
}
