'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Navbar } from '@/components';
import {
  Phone,
  Mail,
  Home,
  Search,
  Users,
  Headset,
  Lock,
  DollarSign,
  ShieldCheck,
  Plus,
  Minus,
  ArrowRight,
  Loader2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const supportItems = [
  {
    Icon: Home,
    title: 'Sellers',
    body: 'Questions about listing, pricing, the selling process or how Only If works for you.',
  },
  {
    Icon: Search,
    title: 'Buyers',
    body: 'Help finding off-market opportunities and understanding how the platform gives you an advantage.',
  },
  {
    Icon: Users,
    title: 'Agents',
    body: 'Partnerships, access, onboarding or general enquiries.',
  },
  {
    Icon: Headset,
    title: 'Support',
    body: 'Technical issues, account help or general support.',
  },
];

const reasons = [
  {
    Icon: Lock,
    title: 'Private & Discreet',
    body: 'Test the market without committing to sell.',
  },
  {
    Icon: DollarSign,
    title: 'You Set the Price',
    body: "You decide the price you'd be happy to sell for.",
  },
  {
    Icon: Users,
    title: 'Serious Buyers',
    body: 'Connect with qualified buyers who are ready to talk.',
  },
  {
    Icon: ShieldCheck,
    title: 'No Obligation',
    body: "There's never any obligation to sell.",
  },
];

const faqs = [
  {
    q: 'What areas do you serve?',
    a: 'We currently serve major metropolitan areas across Australia, with plans to expand our coverage even further.',
  },
  {
    q: 'Are there any fees for sellers?',
    a: "There are no upfront costs to list. You only pay a simple 1.1% (inc GST) success fee if your property sells through Only If.",
  },
  {
    q: 'How does Only If protect my privacy?',
    a: 'Your full address, photos and contact details stay hidden until a serious, verified buyer unlocks your listing. You stay in control the whole way.',
  },
];

const subjectOptions = [
  'General enquiry',
  'Selling a property',
  'Buying a property',
  'Agent partnership',
  'Technical support',
  'Other',
];

/* ------------------------------------------------------------------ */
/*  Reusable building blocks                                           */
/* ------------------------------------------------------------------ */

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

const fieldBase =
  'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-[15px] text-[#111827] placeholder:text-gray-400 transition-colors duration-200 focus:border-[#2FA553] focus:outline-none focus:ring-2 focus:ring-[#2FA553]/30';

function Field({
  label,
  required,
  children,
  htmlFor,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  htmlFor: string;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold text-[#374151]"
      >
        {label}
        {required && <span className="text-[#2FA553]"> *</span>}
      </label>
      {children}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-[15px] font-semibold text-[#111827] transition-colors group-hover:text-[#2FA553]">
          {q}
        </span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF6EE] text-[#2FA553] transition-colors group-hover:bg-[#2FA553] group-hover:text-white">
          {open ? (
            <Minus className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          )}
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] pb-4 opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <p className="overflow-hidden text-sm leading-6 text-gray-600">{a}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const MAX_MESSAGE = 1000;

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  newsletter: false,
};

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Request failed');
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm(initialForm);
    } catch {
      toast.error('Something went wrong. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      {/* Navigation (header unchanged) */}
      <Navbar
        logo="/images/logo.PNG"
        logoText=""
        navigationItems={[
          { label: 'Buy', href: '/buy' },
          { label: 'Sell', href: '/sell' },
          { label: 'How It Works', href: '/how-it-works' },
          { label: 'Agents', href: '/agents' },
          { label: 'About', href: '/about' },
        ]}
        ctaText="Sign In"
        ctaHref="/signin"
      />

      {/* ============ SECTION 1 — HERO ============ */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Left */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2FA553]">
                Get in touch
              </p>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-[#111827] sm:text-5xl">
                We&apos;re here to help.
                <br />
                <span className="text-[#2FA553]">Let&apos;s talk.</span>
              </h1>
              <span className="mt-5 block h-1 w-12 rounded-full bg-[#2FA553]" />
              <p className="mt-6 max-w-md text-base leading-7 text-gray-600">
                Have a question? Need support? Our Australian-based team is ready
                to assist you with all your real estate needs.
              </p>

              {/* Contact cards */}
              <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:gap-10">
                <a href="tel:1300123456" className="group flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2FA553] text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-[#111827]">
                      Call Our Local Team
                    </span>
                    <span className="block text-base font-bold text-[#2FA553]">
                      1300 123 456
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      Mon – Fri, 9am – 5pm AEST
                    </span>
                  </span>
                </a>

                <a
                  href="mailto:hello@onlyif.com.au"
                  className="group flex items-start gap-4"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EAF6EE] text-[#2FA553] transition-colors duration-200 group-hover:bg-[#2FA553] group-hover:text-white">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-[#111827]">
                      Email Support
                    </span>
                    <span className="block text-base font-semibold text-[#2FA553]">
                      hello@onlyif.com.au
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      We&apos;ll respond within 24 hours
                    </span>
                  </span>
                </a>
              </div>
            </div>

            {/* Right image */}
            <div className="group overflow-hidden rounded-[20px] shadow-lg">
              <img
                src="/images/03.jpg"
                alt="A bright, modern living space"
                className="h-72 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 sm:h-96 lg:h-[480px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTION 2 — FORM + SUPPORT ============ */}
      <section className="bg-[#F3F8F4]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
                Send Us a Message
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Fill out the form below and we&apos;ll get back to you within 24
                hours.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="First Name" required htmlFor="firstName">
                    <input
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Enter your first name"
                      className={fieldBase}
                    />
                  </Field>
                  <Field label="Last Name" required htmlFor="lastName">
                    <input
                      id="lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Enter your last name"
                      className={fieldBase}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Email Address" required htmlFor="email">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email address"
                      className={fieldBase}
                    />
                  </Field>
                  <Field label="Phone Number" htmlFor="phone">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className={fieldBase}
                    />
                  </Field>
                </div>

                <Field label="Subject" required htmlFor="subject">
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className={`${fieldBase} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%236b7280%22 stroke-width=%222%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/></svg>')] bg-[length:1.1rem] bg-[right_1rem_center] bg-no-repeat pr-10 ${
                      form.subject ? 'text-[#111827]' : 'text-gray-400'
                    }`}
                  >
                    <option value="" disabled>
                      Select a subject
                    </option>
                    {subjectOptions.map((opt) => (
                      <option key={opt} value={opt} className="text-[#111827]">
                        {opt}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Message" required htmlFor="message">
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    maxLength={MAX_MESSAGE}
                    placeholder="Tell us how we can help you…"
                    className={`${fieldBase} resize-none`}
                  />
                  <div className="mt-1 text-right text-xs text-gray-400">
                    {form.message.length}/{MAX_MESSAGE} characters
                  </div>
                </Field>

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    name="newsletter"
                    checked={form.newsletter}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#2FA553] accent-[#2FA553] focus:ring-[#2FA553]/40"
                  />
                  <span className="text-sm text-gray-600">
                    Subscribe to our newsletter for property updates and market
                    insights
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2FA553] px-6 py-3.5 text-base font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#268a47] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>

            {/* Support card */}
            <div className="lg:col-span-2">
              <div className="rounded-[20px] bg-white p-6 shadow-[0_8px_30px_rgba(17,24,39,0.06)] sm:p-9">
                <h3 className="text-xl font-extrabold tracking-tight text-[#111827]">
                  We&apos;re here for:
                </h3>
                <ul className="mt-6 divide-y divide-gray-100">
                  {supportItems.map(({ Icon, title, body }) => (
                    <li key={title} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF6EE] text-[#2FA553]">
                        <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <div>
                        <h4 className="text-base font-bold text-[#111827]">
                          {title}
                        </h4>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                          {body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTION 3 — WHY CHOOSE ONLY IF ============ */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <SectionHeading align="center">Why people choose Only If</SectionHeading>

          <div className="mt-14 grid grid-cols-1 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-gray-200">
            {reasons.map(({ Icon, title, body }) => (
              <div key={title} className="group px-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF6EE] text-[#2FA553] transition-colors duration-300 group-hover:bg-[#2FA553] group-hover:text-white">
                  <Icon className="h-7 w-7" strokeWidth={1.8} aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-base font-bold text-[#111827]">{title}</h3>
                <p className="mx-auto mt-2 max-w-[14rem] text-sm leading-6 text-gray-600">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SECTION 4 — FAQ + CTA ============ */}
      <section className="bg-[#F3F8F4]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
            {/* FAQ */}
            <div className="rounded-[20px] bg-white p-6 shadow-[0_8px_30px_rgba(17,24,39,0.06)] sm:p-9">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#111827]">
                Frequently Asked Questions
              </h2>
              <div className="mt-5">
                {faqs.map((f) => (
                  <FaqItem key={f.q} q={f.q} a={f.a} />
                ))}
              </div>
              <Link
                href="/how-it-works"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2FA553] underline-offset-4 hover:underline"
              >
                View all FAQs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* CTA */}
            <div className="relative overflow-hidden rounded-[20px] shadow-[0_18px_50px_rgba(20,83,45,0.25)]">
              <img
                src="/images/05.jpg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#14532D]/95 via-[#1B5E3A]/95 to-[#14532D]/85" />
              <div className="relative flex h-full flex-col justify-center p-8 sm:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
                  Ready to take control?
                </p>
                <h2 className="mt-4 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                  Let&apos;s make your real estate goals a reality.
                </h2>
                <p className="mt-4 max-w-md text-base leading-7 text-emerald-50/90">
                  Whether you&apos;re buying or selling, our team is here to help
                  you every step of the way.
                </p>
                <div className="mt-7">
                  <Link
                    href="/buy"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-bold text-[#1B5E3A] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-md"
                  >
                    Browse Homes
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer is global (unchanged) */}
    </div>
  );
}
