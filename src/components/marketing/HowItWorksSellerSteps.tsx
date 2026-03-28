import { Check } from 'lucide-react';

/** Shared compact icon size for step illustrations */
const ICON_BOX = 'mx-auto h-11 w-11 sm:h-12 sm:w-12 shrink-0';

/** Inline SVGs styled to match the reference “How It Works” illustrations */

function IconSellerProfile() {
  return (
    <svg viewBox="0 0 80 80" className={ICON_BOX} aria-hidden>
      <circle cx="40" cy="24" r="14" fill="#5b21b6" />
      <path
        d="M12 76c0-14 11.5-26 28-26s28 12 28 26"
        fill="#5b21b6"
      />
    </svg>
  );
}

function IconHouse() {
  return (
    <svg viewBox="0 0 80 80" className={ICON_BOX} aria-hidden>
      {/* Orange roof */}
      <path d="M40 10 L8 38 V72 H72 V38 Z" fill="#f97316" />
      {/* Walls */}
      <rect x="14" y="38" width="52" height="34" fill="#fed7aa" />
      {/* Green door */}
      <rect x="32" y="46" width="16" height="26" rx="2" fill="#22c55e" />
      {/* Window */}
      <rect x="20" y="44" width="10" height="10" rx="1" fill="#bae6fd" stroke="#38bdf8" strokeWidth="1" />
      <rect x="50" y="44" width="10" height="10" rx="1" fill="#bae6fd" stroke="#38bdf8" strokeWidth="1" />
    </svg>
  );
}

function IconMoneyBag() {
  return (
    <svg viewBox="0 0 80 80" className={ICON_BOX} aria-hidden>
      <path
        d="M40 14c-6 0-11 4-12 10l-2 6c-8 5-13 14-13 24 0 16 13 30 27 30s27-14 27-30c0-10-5-19-13-24l-2-6c-1-6-6-10-12-10z"
        fill="#78350f"
      />
      <ellipse cx="40" cy="22" rx="10" ry="5" fill="#92400e" />
      <text
        x="40"
        y="52"
        textAnchor="middle"
        fill="#fbbf24"
        fontSize="22"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        $
      </text>
    </svg>
  );
}

function IconBuyerInterest() {
  return (
    <svg viewBox="0 0 80 80" className={ICON_BOX} aria-hidden>
      <circle cx="40" cy="22" r="13" fill="#eab308" />
      <path d="M18 76c0-12 9.5-22 22-22s22 10 22 22" fill="#16a34a" />
    </svg>
  );
}

/** Green border + green tick (matches “smarter way” checklist style) */
function IconProceedCheck() {
  return (
    <span
      className={`flex ${ICON_BOX} items-center justify-center rounded-md border-2 border-[#24A148] bg-white shadow-sm`}
      aria-hidden
    >
      <Check className="h-5 w-5 text-[#24A148] sm:h-6 sm:w-6" strokeWidth={2.5} />
    </span>
  );
}

const CARDS = [
  {
    n: 1,
    title: 'Create Your Seller Profile',
    description:
      'Sign up for free and get access to your ready easy seller dashboard.',
    Icon: IconSellerProfile,
  },
  {
    n: 2,
    title: 'Add Your Property',
    description: 'Upload photos, write a description, and highlight your property’s best features.',
    Icon: IconHouse,
  },
  {
    n: 3,
    title: 'Set Your Price',
    description: 'Decide your price and quietly test the market with serious buyers.',
    Icon: IconMoneyBag,
  },
  {
    n: 4,
    title: 'Receive Buyer Interest',
    description: "Serious buyers can express interest, and you'll receive offers.",
    Icon: IconBuyerInterest,
  },
  {
    n: 5,
    title: 'Proceed Only If It Suits You',
    description: "Negotiate and move forward with the buyer who's willing to meet your terms.",
    Icon: IconProceedCheck,
  },
] as const;

export function HowItWorksSellerSteps() {
  return (
    <section
      id="how-it-works-steps"
      className="scroll-mt-20 bg-[#ececec] pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 md:pb-20"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-8 sm:mb-10 md:mb-12">
          How It Works
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-3 lg:gap-3 xl:gap-4">
          {CARDS.map(({ n, title, description, Icon }) => (
            <div
              key={n}
              className="flex flex-col items-center text-center bg-white rounded-xl sm:rounded-2xl shadow-[0_2px_14px_rgba(0,0,0,0.06)] border border-gray-100/90 px-3.5 pt-4 pb-4 sm:px-4 sm:pt-5 sm:pb-5"
            >
              <div
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#24A148] text-sm sm:text-base font-bold text-white shadow-sm"
                aria-hidden
              >
                {n}
              </div>
              <div className="mt-2.5 flex h-12 w-full items-center justify-center sm:h-14">
                <Icon />
              </div>
              <h3 className="mt-2 text-[13px] sm:text-sm font-bold text-gray-900 leading-tight px-0.5">
                {title}
              </h3>
              <p className="mt-1.5 text-[11px] sm:text-xs md:text-sm text-gray-600 leading-snug">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
