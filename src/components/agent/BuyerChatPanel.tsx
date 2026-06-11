'use client';

import { useEffect, useState } from 'react';
import { Users, MessageSquare } from 'lucide-react';
import OneToOneChat from '@/components/ui/ContactAgentModal';

interface BuyerUser {
  _id: string;
  name: string;
  email?: string;
}

interface PurchaseEntry {
  id?: string;
  _id?: string;
  user: BuyerUser;
}

/**
 * Buyer communication panel for agents — extracted verbatim from the previous
 * "Manage" modal so behavior is unchanged. Fetches buyers who unlocked the
 * property (existing /api/payment/purchases/:id endpoint) and opens the
 * existing OneToOneChat (/api/chatting) for the selected buyer.
 */
export default function BuyerChatPanel({
  propertyId,
  propertyTitle = 'Property',
}: {
  propertyId: string;
  propertyTitle?: string;
}) {
  const [buyers, setBuyers] = useState<PurchaseEntry[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      setSelectedBuyer(null);
      try {
        const backendBase = (
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
          ''
        ).replace(/\/$/, '');
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`${backendBase}/api/payment/purchases/${propertyId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) {
          if (active) setBuyers([]);
          return;
        }
        const data = await res.json().catch(() => []);
        if (active) setBuyers(Array.isArray(data) ? data : data?.data || []);
      } catch {
        if (active) setError('Failed to load buyers.');
      } finally {
        if (active) setLoading(false);
      }
    };
    if (propertyId) load();
    return () => {
      active = false;
    };
  }, [propertyId]);

  if (loading) {
    return <div className="py-12 text-center text-gray-500 font-medium">Loading buyers…</div>;
  }

  if (selectedBuyer) {
    return (
      <div>
        <button
          onClick={() => setSelectedBuyer(null)}
          className="mb-4 text-sm font-bold text-emerald-700 hover:text-emerald-900"
        >
          ← Back to buyers
        </button>
        <div className="h-[60vh]">
          <OneToOneChat
            agent={{ id: selectedBuyer._id, name: selectedBuyer.name, email: selectedBuyer.email }}
            propertyTitle={propertyTitle}
          />
        </div>
      </div>
    );
  }

  if (!buyers.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-400 font-medium">
          {error || 'No buyers have unlocked this property yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
      {buyers.map((b) => (
        <button
          key={b.id || b._id || b.user?._id}
          onClick={() => setSelectedBuyer(b.user)}
          className="w-full text-left p-5 border-2 border-gray-50 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
              {b.user?.name?.[0]?.toUpperCase() || 'B'}
            </div>
            <div>
              <p className="font-bold text-gray-900">{b.user?.name}</p>
              <p className="text-xs text-gray-400 font-medium">Buyer</p>
            </div>
          </div>
          <MessageSquare className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
        </button>
      ))}
    </div>
  );
}
