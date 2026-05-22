'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components';
import BuyerSidebar from '@/components/buyer/BuyerSidebar';
import {
  ArrowRight,
  Bed,
  Bath,
  ChevronDown,
  Heart,
  Home,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageSquare,
  Settings,
  Square,
  Sparkles,
  TrendingUp,
  Bell,
  X,
} from 'lucide-react';
import { formatPropertyAddress } from '@/utils/addressUtils';
import { getSafeImageUrl } from '@/utils/imageUtils';
import { formatCurrencyCompact } from '@/utils/currency';

interface SavedProperty {
  _id?: string;
  id?: string;
  title?: string;
  address?: any;
  price?: number;
  beds?: number;
  baths?: number;
  size?: number;
  carSpaces?: number;
  status?: string;
  isNew?: boolean;
  createdAt?: string;
  dateAdded?: string;
  images?: any[];
  mainImage?: any;
  primaryImage?: string;
}

type SortOption = 'recent' | 'price-asc' | 'price-desc';

const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Recently Added',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
};

const MOBILE_NAV: { href: string; label: string; icon: typeof Heart; active?: boolean }[] = [
  { href: '/dashboards/buyer?tab=overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboards/buyer/saved', label: 'Watchlist', icon: Heart, active: true },
  { href: '/dashboards/buyer/tracking', label: 'Property Tracking', icon: TrendingUp },
  { href: '/dashboards/buyer?tab=notifications', label: 'Updates', icon: Bell },
  { href: '/dashboards/buyer/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboards/buyer/account', label: 'Settings', icon: Settings },
];

const getPropertyId = (p: SavedProperty): string | null => {
  const candidate = p._id || p.id;
  if (!candidate || typeof candidate !== 'string') return null;
  const trimmed = candidate.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;
  return trimmed;
};

const getLocationLabel = (address: any): string => {
  if (!address) return '';
  if (typeof address === 'string') return address;
  return [address.city, address.state].filter(Boolean).join(', ');
};

const getCityKey = (address: any): string => {
  if (!address) return '';
  if (typeof address === 'string') return address.split(',')[0]?.trim() || address;
  return (address.city || address.state || '').toString().trim();
};

export default function BuyerSavedPropertiesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const canAccess = !!user?.roles?.includes('buyer');

  const [watchlist, setWatchlist] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/signin');
      return;
    }
    if (!user.roles?.includes('buyer')) {
      router.push('/dashboard');
      return;
    }
    fetchWatchlist();
  }, [user, authLoading, router]);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/buyer/watchlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setWatchlist(data.data || []);
      } else {
        setWatchlist([]);
      }
    } catch (err) {
      console.error('Error fetching watchlist:', err);
      toast.error('Failed to load saved properties');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (propertyId: string) => {
    const previous = watchlist;
    setWatchlist((prev) => prev.filter((p) => (p._id || p.id) !== propertyId));
    try {
      const response = await fetch(`/api/buyer/watchlist/${encodeURIComponent(propertyId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Removed from watchlist');
      } else {
        setWatchlist(previous);
        toast.error(data.message || 'Could not update watchlist');
      }
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      setWatchlist(previous);
      toast.error('Could not update watchlist');
    }
  };

  // Distinct locations for the dropdown
  const locations = useMemo(() => {
    const set = new Set<string>();
    watchlist.forEach((p) => {
      const city = getCityKey(p.address);
      if (city) set.add(city);
    });
    return Array.from(set).sort();
  }, [watchlist]);

  // Apply filters + sort
  const visible = useMemo(() => {
    let list = [...watchlist];

    if (locationFilter !== 'all') {
      list = list.filter((p) => getCityKey(p.address).toLowerCase() === locationFilter.toLowerCase());
    }

    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'price-desc':
        list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'recent':
      default:
        list.sort((a, b) => {
          const aTime = new Date(a.createdAt || a.dateAdded || 0).getTime();
          const bTime = new Date(b.createdAt || b.dateAdded || 0).getTime();
          return bTime - aTime;
        });
    }
    return list;
  }, [watchlist, sortBy, locationFilter]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f6fb]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
        </div>
      </div>
    );
  }

  if (!user || !canAccess) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6fb]">
      <Navbar />

      {/* Mobile sticky bar */}
      <div className="sticky top-20 z-40 border-b border-gray-200/70 bg-[#f5f6fb]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold text-gray-950">Watchlist</p>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm cursor-pointer"
            aria-label="Open buyer dashboard menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white overflow-y-auto pb-20">
          <div className="pt-24 px-6 space-y-6">
            <nav className="flex flex-col space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 mb-2">Dashboard Menu</p>
              {MOBILE_NAV.map(({ href, label, icon: Icon, active }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-between py-4 px-3 rounded-xl transition-all cursor-pointer ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 shadow-sm'
                      : 'text-gray-900 font-bold border-b border-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                    {label}
                  </span>
                  {active ? <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> : <ArrowRight className="w-4 h-4 text-gray-300" />}
                </Link>
              ))}
            </nav>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-all cursor-pointer"
            >
              Close Menu
            </button>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex w-full flex-1 bg-[#f5f6fb] lg:pl-[280px]">
        <BuyerSidebar activeKey="watchlist" user={user} />

        <div className="flex min-w-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <main className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <header className="flex flex-col gap-5">
              {/* Breadcrumb */}
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">
                <Link href="/dashboards/buyer" className="hover:text-gray-700 transition cursor-pointer">Dashboard</Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-700">Watchlist</span>
              </nav>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-3">
                  <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">Saved Properties</h1>
                  <span className="mb-1 inline-flex h-7 min-w-[2rem] items-center justify-center rounded-full bg-gray-100 px-2 text-sm font-bold text-gray-600">
                    {watchlist.length}
                  </span>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full appearance-none cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm font-bold text-gray-700 shadow-sm transition hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-auto"
                      aria-label="Sort saved properties"
                    >
                      {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                        <option key={key} value={key}>{SORT_LABELS[key]}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>

                  <div className="relative">
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full appearance-none cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm font-bold text-gray-700 shadow-sm transition hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-auto"
                      aria-label="Filter by location"
                    >
                      <option value="all">All Locations</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </header>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
              </div>
            ) : watchlist.length === 0 ? (
              <section className="rounded-[28px] border border-dashed border-gray-200 bg-white px-6 py-20 text-center shadow-[0_24px_70px_rgba(15,23,42,0.04)]">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gray-50">
                  <Heart className="h-8 w-8 text-gray-300" />
                </div>
                <h2 className="mt-5 text-xl font-black tracking-tight text-gray-950">No saved properties yet</h2>
                <p className="mt-2 mx-auto max-w-sm text-sm text-gray-500">
                  Tap the heart on any listing to add it to your watchlist and get price alerts when it changes.
                </p>
                <button
                  onClick={() => router.push('/buy')}
                  className="mt-7 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-black px-7 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-gray-900"
                >
                  Explore Homes
                  <ArrowRight className="h-4 w-4" />
                </button>
              </section>
            ) : (
              <section
                className="grid gap-6"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
              >
                {visible.map((property, idx) => {
                  const propId = getPropertyId(property) ?? `${idx}`;
                  const image = (property.images && property.images[0]?.url) || (property as any).mainImage?.url || (property as any).mainImage || (property as any).primaryImage || '/images/01.jpg';
                  const isNew = property.status === 'new' || property.isNew || idx === 0; // safe heuristic
                  return (
                    <article
                      key={propId}
                      className="group cursor-pointer overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(15,23,42,0.1)]"
                      onClick={() => router.push(`/property/${propId}`)}
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={getSafeImageUrl(image)}
                          alt={property.title || 'Saved property'}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {isNew && (
                          <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-900 shadow-sm">
                            New Listing
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const id = getPropertyId(property);
                            if (!id) {
                              toast.error('Missing property id');
                              return;
                            }
                            removeFromWatchlist(id);
                          }}
                          className="absolute right-3 top-3 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/90 text-red-500 shadow-sm backdrop-blur transition hover:bg-white"
                          aria-label="Remove from watchlist"
                        >
                          <Heart className="h-4 w-4 fill-red-500" />
                        </button>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="truncate text-lg font-black tracking-tight text-gray-950">
                            {property.title || 'Untitled property'}
                          </h3>
                          <p className="text-base font-black tracking-tight text-gray-950 whitespace-nowrap">
                            {formatCurrencyCompact(property.price || 0)}
                          </p>
                        </div>
                        <p className="mt-1 flex items-center gap-1 truncate text-xs font-semibold text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {getLocationLabel(property.address) || formatPropertyAddress(property.address)}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 text-[11px] font-bold text-gray-600">
                            <Bed className="h-3 w-3 text-gray-400" />
                            {property.beds ?? '—'}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 text-[11px] font-bold text-gray-600">
                            <Bath className="h-3 w-3 text-gray-400" />
                            {property.baths ?? '—'}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 text-[11px] font-bold text-gray-600">
                            <Square className="h-3 w-3 text-gray-400" />
                            {property.size ? `${property.size.toLocaleString()} sqft` : '—'}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {/* Discover More card */}
                <article
                  onClick={() => router.push('/buy')}
                  className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white/60 p-8 text-center transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-50/40"
                >
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm transition group-hover:bg-emerald-100">
                    <Sparkles className="h-6 w-6 text-gray-400 transition group-hover:text-emerald-600" />
                  </div>
                  <h3 className="mt-5 text-base font-black tracking-tight text-gray-950">Discover More</h3>
                  <p className="mt-2 max-w-[220px] text-xs font-semibold text-gray-500">
                    Explore our curated collection of luxury properties tailored to your taste.
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                    Browse Homes
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </article>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Global green footer is rendered once by AppReadyShell; it auto-offsets past #buyer-sidebar. */}
    </div>
  );
}
