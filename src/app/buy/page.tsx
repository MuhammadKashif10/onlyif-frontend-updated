import { Metadata } from 'next';
import EnhancedBuyPageClient from './EnhancedBuyPageClient';

export const metadata: Metadata = {
  title: 'Buy | Homes for Sale | Property Search | OnlyIf Real Estate',
  description:
    'Browse homes for sale with advanced search filters. Find your perfect home by location, price, bedrooms, and more.',
  keywords: [
    'homes for sale',
    'property search',
    'real estate listings',
    'buy house',
    'property listings',
    'home search',
  ],
  openGraph: {
    title: 'Buy | Homes for Sale | OnlyIf Real Estate',
    description:
      'Browse homes for sale with advanced search filters. Find properties that match your criteria and budget.',
    type: 'website',
    locale: 'en_AU',
    url: 'https://onlyif.com/buy',
    siteName: 'OnlyIf',
    images: [
      {
        url: '/images/01.jpg',
        width: 1200,
        height: 630,
        alt: 'Homes for sale — OnlyIf Real Estate',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buy | Homes for Sale | OnlyIf Real Estate',
    description: 'Browse homes for sale with advanced search and filters.',
    images: ['/images/01.jpg'],
  },
  alternates: {
    canonical: 'https://onlyif.com/buy',
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

export default function BuyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Homes for Sale',
            description: 'Browse homes for sale with advanced search filters',
            url: 'https://onlyif.com/buy',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                item: {
                  '@type': 'RealEstateListing',
                  name: 'Homes for Sale',
                  description: 'Browse our collection of homes for sale',
                  url: 'https://onlyif.com/buy',
                },
              },
            ],
          }),
        }}
      />
      <EnhancedBuyPageClient />
    </>
  );
}
