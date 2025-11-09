import { Metadata } from 'next';
import EnhancedBrowsePageClient from './EnhancedBrowsePageClient';

export const metadata: Metadata = {
  title: 'Browse Homes for Sale | Property Search | OnlyIf Real Estate',
  description: 'Browse thousands of homes for sale with advanced search filters. Find your perfect home by location, price, bedrooms, and more. Get detailed property information and schedule tours.',
  keywords: [
    'homes for sale',
    'property search',
    'real estate listings',
    'home search',
    'buy house',
    'property listings',
    'real estate search',
    'homes for sale near me',
    'property finder',
    'real estate browse',
    'home listings',
    'property search engine'
  ],
  openGraph: {
    title: 'Browse Homes for Sale | Property Search | OnlyIf Real Estate',
    description: 'Browse thousands of homes for sale with advanced search filters. Find your perfect home by location, price, bedrooms, and more.',
    type: 'website',
    locale: 'en_US',
    url: 'https://onlyif.com/browse',
    siteName: 'OnlyIf',
    images: [
      {
        url: '/images/01.jpg',
        width: 1200,
        height: 630,
        alt: 'Browse Homes for Sale - OnlyIf Real Estate',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Homes for Sale | Property Search | OnlyIf Real Estate',
    description: 'Browse thousands of homes for sale with advanced search filters. Find your perfect home by location, price, bedrooms, and more.',
    images: ['/images/01.jpg'],
  },
  alternates: {
    canonical: 'https://onlyif.com/browse',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function BrowsePage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Homes for Sale",
            "description": "Browse thousands of homes for sale with advanced search filters",
            "url": "https://onlyif.com/browse",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "item": {
                  "@type": "RealEstateListing",
                  "name": "Homes for Sale",
                  "description": "Browse our comprehensive collection of homes for sale",
                  "url": "https://onlyif.com/browse"
                }
              }
            ]
          })
        }}
      />
      
      <EnhancedBrowsePageClient />
    </>
  );
}