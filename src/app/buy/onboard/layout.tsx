import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buy Your Dream Home | Buyer Onboarding | OnlyIf Real Estate',
  description: 'Start your home buying journey with OnlyIf. Register, browse properties, unlock details, and connect with agents in our streamlined buyer flow.',
  keywords: [
    'buy home',
    'home buyer',
    'property search',
    'real estate buyer',
    'home buying process',
    'property buyer registration',
    'home search',
    'real estate onboarding'
  ],
  openGraph: {
    title: 'Buy Your Dream Home | Buyer Onboarding | OnlyIf Real Estate',
    description: 'Start your home buying journey with OnlyIf. Register, browse properties, unlock details, and connect with agents.',
    type: 'website',
    locale: 'en_US',
    url: 'https://onlyif.com/buy/onboard',
    siteName: 'OnlyIf',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BuyOnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}