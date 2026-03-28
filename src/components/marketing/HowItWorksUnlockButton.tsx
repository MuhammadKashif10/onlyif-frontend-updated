'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const buttonClassName =
  'w-full inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed';

function isBuyerFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return false;
    const u = JSON.parse(raw) as { role?: string; type?: string };
    return u.role === 'buyer' || u.type === 'buyer';
  } catch {
    return false;
  }
}

export function HowItWorksUnlockButton() {
  const { isBuyer } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/signin');
      return;
    }

    const buyerOk = isBuyer || isBuyerFromStorage();
    if (!buyerOk) {
      router.push('/signin');
      return;
    }

    const backendBase =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
      '';

    if (!backendBase) {
      alert('Payment service is not configured.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${backendBase.replace(/\/$/, '')}/api/payment/checkout/buyer-unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      let data: { url?: string; message?: string } = {};
      try {
        data = await res.json();
      } catch {
        /* non-JSON */
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      alert(data.message || 'Unable to start checkout. Please try again.');
    } catch {
      alert('Unable to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={buttonClassName}>
      {loading ? 'Redirecting…' : 'Unlock $49'}
    </button>
  );
}
