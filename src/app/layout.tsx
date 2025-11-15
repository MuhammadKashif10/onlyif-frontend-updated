



import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Poppins } from "next/font/google";
import "./globals.css";
import "../styles/custom.css";
import Footer from "@/components/main/Footer";
import ClientProviders from "./client-providers";
import MaintenanceGuard from "@/components/layout/MaintenanceGuard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"], // SemiBold, Bold
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' }
  ],
};

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.FRONTEND_URL;

export const metadata: Metadata = {
  metadataBase: FRONTEND_URL ? new URL(FRONTEND_URL) : undefined,
  title: {
    default: "OnlyIf - Real Estate Platform | Buy and Sell Homes with Confidence",
    template: "%s | OnlyIf"
  },
  description: "OnlyIf makes buying and selling homes simple, transparent, and stress-free. Get a cash offer in minutes or browse our inventory of move-in ready homes. Connect with trusted real estate agents.",
  keywords: [
    "real estate",
    "property",
    "homes for sale",
    "real estate agents",
    "property listings",
    "buy home",
    "sell home",
    "cash offer",
    "housing",
    "real estate platform",
    "property search",
    "home buying",
    "home selling"
  ],
  authors: [{ name: "OnlyIf Team", url: "https://onlyif.com" }],
  creator: "OnlyIf",
  publisher: "OnlyIf",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: FRONTEND_URL || undefined,
    siteName: "OnlyIf",
    title: "OnlyIf - Real Estate Platform | Buy and Sell Homes with Confidence",
    description: "OnlyIf makes buying and selling homes simple, transparent, and stress-free. Get a cash offer in minutes or browse our inventory of move-in ready homes.",
    images: [
      {
        url: "/images/hero-home.jpg",
        width: 1200,
        height: 630,
        alt: "OnlyIf - Real Estate Platform",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@onlyif",
    creator: "@onlyif",
    title: "OnlyIf - Real Estate Platform | Buy and Sell Homes with Confidence",
    description: "OnlyIf makes buying and selling homes simple, transparent, and stress-free. Get a cash offer in minutes or browse our inventory of move-in ready homes.",
    images: ["/images/hero-home.jpg"],
  },
  alternates: {
    canonical: FRONTEND_URL || undefined,
  },
  category: "Real Estate",
  classification: "Real Estate Platform",
  other: {
    "msapplication-TileColor": "#1f2937",
    "theme-color": "#1f2937",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ClientProviders>
          <MaintenanceGuard>
            {children}
          </MaintenanceGuard>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
