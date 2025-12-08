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
      const res = await fetch(`${backendBase}/payment/checkout/${id}`,  {
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
      className={`group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${className}`}
    >
      <button
        type="button"
        onClick={handleCheckout}
        className="block w-full text-left focus:outline-none"
        aria-label={`View details for ${title} - ${formatSafePrice(price)}`}
      >
        {/* --- CardContent (your existing markup unchanged) --- */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {hasValidImage ? (
            <img
              src={safeImageUrl}
              alt={`${title} - ${address}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <p className="text-xs text-gray-400">No Image</p>
            </div>
          )}
          {featured && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Featured
              </span>
            </div>
          )}
          {status && (
            <div className="absolute top-3 left-3 mt-8">
              <StatusBadge status={status} size="sm" />
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded-md shadow-sm">
            {formatSafePrice(price)}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-1">{address}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-semibold text-gray-900">
              {formatSafePrice(price)}
            </span>
            <div className="flex gap-4 text-sm text-gray-600">
              {/* Number first, then colored icon */}
              {beds != null && !isNaN(beds) && (
                <span className="inline-flex items-center gap-1">
                  {formatSafeNumber(beds)}
                  <Bed className="w-4 h-4" color="#47C96F" strokeWidth={2} size={24} />
                </span>
              )}
              {baths != null && !isNaN(baths) && (
                <span className="inline-flex items-center gap-1">
                  {formatSafeNumber(baths)}
                  <Bath className="w-4 h-4" color="#47C96F" strokeWidth={2} size={24} />
                </span>
              )}
              {carSpaces != null && !isNaN(carSpaces) && (
                <span className="inline-flex items-center gap-1">
                  {formatSafeNumber(carSpaces)}
                  <Car className="w-4 h-4" color="#47C96F" strokeWidth={2} size={24} />
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 text-blue-600 font-medium text-sm">
            View Details →
          </div>
        </div>
      </button>
    </article>
  );
}
// Module imports
import { Bed, Bath, Car } from 'lucide-react'
