// Top-level imports (ensure this import is near other imports)
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Bed, Bath, Car, Eye, LockKeyhole } from 'lucide-react';
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
  isWatched?: boolean;
  onToggleWatchlist?: (e: React.MouseEvent) => void;
  variant?: 'default' | 'vault';
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
  carSpaces,
  isWatched,
  onToggleWatchlist,
  variant = 'default'
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

  if (variant === 'vault') {
    return (
      <article
        className={`group relative overflow-hidden rounded-lg border border-[#bfcfc1] bg-white shadow-[0_18px_38px_rgba(21,49,27,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(21,49,27,0.14)] ${className}`}
        onClick={onClick}
      >
        <button
          type="button"
          onClick={handleCheckout}
          className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-[#087735] focus:ring-offset-2"
          aria-label={`Unlock details for ${title}`}
        >
          <div className="relative h-64 overflow-hidden bg-[#d8ecd7]">
            {hasValidImage ? (
              <img
                src={safeImageUrl}
                alt={`${title} - ${address}`}
                className="h-full w-full scale-105 object-cover blur-[7px] brightness-75 transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#d8ecd7]">
                <p className="text-xs text-[#66766a]">No Image</p>
              </div>
            )}
            <div className="absolute inset-0 bg-black/18" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <LockKeyhole className="h-9 w-9 text-white drop-shadow" aria-hidden="true" />
              <p className="mt-3 text-lg font-bold text-white drop-shadow">Details Hidden</p>
            </div>
            {featured && (
              <div className="absolute right-4 top-4 rounded-full bg-[#dff6df] px-3 py-1 text-xs font-semibold text-[#087735]">
                New
              </div>
            )}
          </div>

          <div className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#435346]">
              Confidential Listing
            </p>
            <h3 className="mt-1 text-lg font-semibold leading-snug text-[#071109] line-clamp-1">
              {address || title}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#5b6a5e]">
              <span>{formatSafeNumber(beds)} bed{formatSafeNumber(beds) !== 1 ? 's' : ''}</span>
              <span aria-hidden="true">/</span>
              <span>{formatSafeNumber(baths)} bath{formatSafeNumber(baths) !== 1 ? 's' : ''}</span>
              {carSpaces != null && !isNaN(carSpaces) ? (
                <>
                  <span aria-hidden="true">/</span>
                  <span>{formatSafeNumber(carSpaces)} car</span>
                </>
              ) : null}
              <span aria-hidden="true">/</span>
              <span>{formatSize(size)} sq m</span>
            </div>
            <span className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-[#b9d5c0] bg-[#e3f3e8] px-4 text-sm font-bold text-[#087735] group-hover:border-[#087735] group-hover:bg-[#d7efdf]">
              <Eye className="h-4 w-4" aria-hidden="true" />
              Unlock for $49
            </span>
          </div>
        </button>
      </article>
    );
  }

  // --- Render ---
  return (
    <article
      className={`group relative rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${className}`}
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

      {/* Watchlist Heart (top-right) - Moved outside the checkout button to prevent event conflicts */}
      {onToggleWatchlist && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggleWatchlist(e);
          }}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all hover:bg-white hover:scale-110 active:scale-95"
          aria-label={isWatched ? "Remove from watchlist" : "Add to watchlist"}
        >
          <Heart 
            className={`w-5 h-5 transition-all duration-300 ${
              isWatched ? 'scale-110' : 'hover:scale-110'
            }`}
            stroke={isWatched ? "#ef4444" : "#9ca3af"}
            fill={isWatched ? "#ef4444" : "transparent"}
          />
        </button>
      )}
    </article>
  );
}
