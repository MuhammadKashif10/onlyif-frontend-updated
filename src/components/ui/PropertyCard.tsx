// Top-level imports (ensure this import is near other imports)
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSafeImageUrl } from '@/utils/imageUtils';
import { StatusBadge } from '@/components/reusable';
import { formatCurrencyCompact } from '@/utils/currency';
import { generatePropertyUrl } from '@/utils/slugify';

type PropertyStatus = 'pending' | 'private' | 'public' | 'sold' | 'withdrawn';

interface PropertyCardProps {
  id: string;
  slug?: string;
  title: string;
  address: string;
  price: number | null | undefined;
  beds: number | null | undefined;
  baths: number | null | undefined;
  size: number | null | undefined;
  image: string;
  status?: PropertyStatus;
  featured?: boolean;
  className?: string;
  onClick?: () => void;
  carSpaces?: number | null | undefined;
}

export default function PropertyCard({
  id,
  slug,
  title,
  address,
  price,
  beds,
  baths,
  size,
  image,
  status,
  featured = false,
  className = '',
  onClick,
  carSpaces
}: PropertyCardProps) {
  const [targetPath, setTargetPath] = useState('/signin');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        // Generate SEO-friendly URL using title
        const seoUrl = generatePropertyUrl(id, title);
        setTargetPath(seoUrl);
      } else {
        setTargetPath('/signin');
      }
    }
  }, [id, title]);

  // --- 🔑 Stripe Checkout Logic ---
  const handleCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      // Not logged in → redirect to signin
      window.location.href = '/signin';
      return;
    }

    try {
      const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
      const res = await fetch(`${backendBase}/payment/checkout/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.alreadyPaid) {
        // Already purchased → go directly to SEO-friendly details page
        const seoUrl = generatePropertyUrl(id, title);
        window.location.href = seoUrl;
      } else if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert('Something went wrong creating checkout session.');
      }
    } catch (err) {
      console.error('Stripe checkout error:', err);
      alert('Unable to start checkout.');
    }
  };

  // --- Size, Price, Safe Formatters (your original functions) ---
  const formatSize = (size: number | undefined | null) =>
    size == null || isNaN(size) ? 'N/A' : `${size.toLocaleString()}`;

  const formatSafePrice = (price: number | null) =>
    price == null || isNaN(price) ? 'Price on Request' : formatCurrencyCompact(price);

  const formatSafeNumber = (num: number | undefined | null) =>
    num == null || isNaN(num) ? 0 : num;

  const safeImageUrl = getSafeImageUrl(image, 'property');
  const hasValidImage = safeImageUrl && safeImageUrl.trim() !== '';

  // --- Render ---
  return (
    <article
      className={`group rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${className}`}
    >
      <button
        type="button"
        onClick={handleCheckout}
        className="block w-full text-left focus:outline-none"
        aria-label={`View details for ${title} - ${formatSafePrice(price)}`}
      >
        {/* Full image with strong top + bottom overlays so text is always readable */}
        <div className="relative h-56 bg-gray-200 overflow-hidden">
          {hasValidImage ? (
            <img
              src={safeImageUrl}
              alt={`${title} - ${address}`}
              className="w-full h-full object-cover scale-105 blur-[1.5px] brightness-50 transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <p className="text-xs text-gray-400">No Image</p>
            </div>
          )}

          {/* Optional badges (top-left) */}
          {featured && (
            <div className="absolute top-2 left-2 z-20">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Featured
              </span>
            </div>
          )}
          {status && (
            <div className="absolute top-2 left-2 mt-6 z-20">
              <StatusBadge status={status} size="sm" />
            </div>
          )}

          {/* TOP overlay: title + bed/bath/car */}
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/95 via-black/85 to-transparent px-4 pt-3 pb-8">
            <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              {title}
            </h3>
            <div className="text-xs text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {[
                beds != null && !isNaN(beds) ? `${formatSafeNumber(beds)} Bed` : null,
                baths != null && !isNaN(baths) ? `${formatSafeNumber(baths)} Bath` : null,
                carSpaces != null && !isNaN(carSpaces) ? `${formatSafeNumber(carSpaces)} Car` : null,
              ]
                .filter(Boolean)
                .join(' | ')}
            </div>
          </div>

          {/* BOTTOM overlay: Seller's price + Unlock button */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/85 to-transparent px-4 pt-3 pb-3">
            <div className="flex items-center justify-between text-xs text-white/90 mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              <span>Seller&apos;s Price</span>
              <span className="text-sm font-semibold">
                {price == null || isNaN(price)
                  ? 'Price on Request'
                  : `A$${price.toLocaleString('en-AU')}`}
              </span>
            </div>
            <div className="mt-1">
              <span className="inline-flex w-full items-center justify-center px-3 py-2 rounded-sm text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm">
                Unlock for $49
              </span>
            </div>
          </div>
        </div>
      </button>
    </article>
  );
}
// Module imports
import { Bed, Bath, Car } from 'lucide-react'
