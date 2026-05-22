'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useBuyer } from '@/context/BuyerContext';
import { Navbar } from '@/components';
import BuyerSidebar from '@/components/buyer/BuyerSidebar';
import {
  ArrowRight,
  Bell,
  Briefcase,
  CheckCircle,
  ClipboardList,
  Clock,
  FileText,
  Heart,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  TrendingUp,
  X,
  Home as HomeIcon,
  CircleDot,
  Hammer,
  Key,
} from 'lucide-react';
import { formatPropertyAddress } from '@/utils/addressUtils';
import { getSafeImageUrl } from '@/utils/imageUtils';
import { formatCurrencyCompact } from '@/utils/currency';

type Stage = 'offer' | 'inspection' | 'escrow' | 'closing';

interface TrackedProperty {
  _id?: string;
  id?: string;
  title?: string;
  address?: any;
  price?: number;
  status?: string;
  salesStatus?: string | null;
  images?: any[];
  mainImage?: any;
  agent?: { name?: string; email?: string };
  createdAt?: string;
  dateAdded?: string;
}

interface StatusUpdate {
  _id: string;
  property: TrackedProperty;
  previousStatus: string;
  newStatus: string;
  updatedAt: string;
  agent?: { name: string; email?: string };
}

const STAGES: { key: Stage; label: string; icon: typeof CircleDot }[] = [
  { key: 'offer', label: 'Offer', icon: FileText },
  { key: 'inspection', label: 'Inspection', icon: Hammer },
  { key: 'escrow', label: 'Escrow', icon: ShieldCheck },
  { key: 'closing', label: 'Closing', icon: Key },
];

const STAGE_INDEX: Record<Stage, number> = {
  offer: 0,
  inspection: 1,
  escrow: 2,
  closing: 3,
};

const STAGE_PERCENT: Record<Stage, number> = {
  offer: 25,
  inspection: 50,
  escrow: 75,
  closing: 100,
};

const STAGE_PILL: Record<Stage, string> = {
  offer: 'bg-amber-50 text-amber-700',
  inspection: 'bg-blue-50 text-blue-700',
  escrow: 'bg-emerald-50 text-emerald-700',
  closing: 'bg-gray-900 text-white',
};

const STAGE_LABEL_LONG: Record<Stage, string> = {
  offer: 'Offer Submitted',
  inspection: 'Inspection',
  escrow: 'In Escrow',
  closing: 'Closing',
};

const MOBILE_NAV: { href: string; label: string; icon: typeof Bell; active?: boolean }[] = [
  { href: '/dashboards/buyer?tab=overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboards/buyer/saved', label: 'Watchlist', icon: Heart },
  { href: '/dashboards/buyer/tracking', label: 'Property Tracking', icon: TrendingUp, active: true },
  { href: '/dashboards/buyer?tab=notifications', label: 'Updates', icon: Bell },
  { href: '/dashboards/buyer/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboards/buyer/account', label: 'Settings', icon: Settings },
];

const getPropertyId = (p: TrackedProperty): string =>
  (p._id || p.id || '').toString();

const inferStage = (status?: string | null): Stage | null => {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s.includes('settled') || s.includes('closed') || s === 'unconditional') return 'closing';
  if (s.includes('contract') || s.includes('escrow')) return 'escrow';
  if (s.includes('inspect')) return 'inspection';
  if (s.includes('offer') || s.includes('pending')) return 'offer';
  return null;
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function BuyerPropertyTrackingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { unlockedProperties } = useBuyer();
  const canAccess = !!user?.roles?.includes('buyer');

  const [watchlist, setWatchlist] = useState<TrackedProperty[]>([]);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [loading, setLoading] = useState(false);
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

    const load = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const [wlRes, upRes] = await Promise.all([
          fetch('/api/buyer/watchlist', { headers }),
          fetch('/api/buyer/property-updates', { headers }),
        ]);
        const wlData = await wlRes.json().catch(() => ({}));
        const upData = await upRes.json().catch(() => ({}));
        if (wlData?.success) setWatchlist(wlData.data || []);
        if (upData?.success) setStatusUpdates(upData.data || []);
      } catch (err) {
        console.error('Error loading tracking data:', err);
        toast.error('Failed to load tracking data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, authLoading, router]);

  // Active deals = watchlist + unlocked properties that have a real sales stage.
  // Status updates are folded back into the per-property latest stage when possible.
  const deals = useMemo(() => {
    const byId = new Map<string, { property: TrackedProperty; stage: Stage; lastUpdate?: string }>();

    const considerProperty = (p: TrackedProperty | undefined | null, stage: Stage | null, ts?: string) => {
      if (!p) return;
      const id = getPropertyId(p);
      if (!id) return;
      const existing = byId.get(id);
      const candidateStage = stage ?? existing?.stage ?? null;
      if (!candidateStage) return; // need an actual transaction stage to show
      const candidateTs = ts || existing?.lastUpdate;
      // Prefer the latest known stage progression
      if (existing) {
        const better = STAGE_INDEX[candidateStage] >= STAGE_INDEX[existing.stage];
        byId.set(id, {
          property: { ...existing.property, ...p },
          stage: better ? candidateStage : existing.stage,
          lastUpdate: candidateTs,
        });
      } else {
        byId.set(id, { property: p, stage: candidateStage, lastUpdate: candidateTs });
      }
    };

    // Seed from watchlist (TrackedProperty has salesStatus)
    (watchlist || []).forEach((p) => considerProperty(p, inferStage((p as any).salesStatus)));
    // Layer status updates on top — most recent first
    [...(statusUpdates || [])]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .forEach((u) => considerProperty(u.property, inferStage(u.newStatus), u.updatedAt));

    // Optional: pull in unlockedProperties that happen to have a sales status
    (unlockedProperties || []).forEach((p: any) => considerProperty(p, inferStage(p?.salesStatus)));

    return Array.from(byId.values()).sort((a, b) => STAGE_INDEX[b.stage] - STAGE_INDEX[a.stage]);
  }, [watchlist, statusUpdates, unlockedProperties]);

  const activeDealsCount = deals.length;
  const totalValue = deals.reduce((sum, d) => sum + (d.property.price || 0), 0);

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
          <p className="truncate text-sm font-semibold text-gray-950">Property Tracking</p>
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

      <div className="flex w-full flex-1 bg-[#f5f6fb] lg:pl-[280px]">
        <BuyerSidebar activeKey="tracking" user={user} />

        <div className="flex min-w-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <main className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">Transaction Management</p>
                <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">Property Tracking</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                  Stage-by-stage visibility into every property advancing through your buying pipeline.
                </p>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <div className="rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Active Deals</p>
                  <p className="mt-1 text-3xl font-black tracking-tight text-gray-950">{String(activeDealsCount).padStart(2, '0')}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Total Value</p>
                  <p className="mt-1 text-3xl font-black tracking-tight text-gray-950">
                    {totalValue > 0 ? formatCurrencyCompact(totalValue) : '—'}
                  </p>
                </div>
              </div>
            </header>

            {/* Body: tracking cards + right sidebar */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              {/* Tracking cards */}
              <div className="space-y-5">
                {loading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
                  </div>
                ) : deals.length === 0 ? (
                  <section className="rounded-[28px] border border-dashed border-gray-200 bg-white px-6 py-20 text-center shadow-[0_24px_70px_rgba(15,23,42,0.04)]">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gray-50">
                      <Briefcase className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="mt-5 text-xl font-black tracking-tight text-gray-950">No active deals yet</h3>
                    <p className="mt-2 mx-auto max-w-md text-sm text-gray-500">
                      When a property in your watchlist enters offer, inspection, escrow or closing, you&apos;ll see its full transaction trail here.
                    </p>
                    <button
                      onClick={() => router.push('/dashboards/buyer/saved')}
                      className="mt-7 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-black px-7 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-gray-900"
                    >
                      View Watchlist
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </section>
                ) : (
                  deals.map(({ property, stage }) => {
                    const id = getPropertyId(property);
                    const image =
                      (property.images && (property.images[0]?.url || property.images[0])) ||
                      (property as any).mainImage?.url ||
                      (property as any).mainImage ||
                      '/images/01.jpg';
                    const percent = STAGE_PERCENT[stage];
                    const stageIndex = STAGE_INDEX[stage];
                    const isEscrow = stage === 'escrow';
                    const isInspection = stage === 'inspection';

                    return (
                      <article
                        key={id || property.title}
                        className="overflow-hidden rounded-[28px] border border-gray-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_80px_rgba(15,23,42,0.1)]"
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Image */}
                          <div className="relative h-48 w-full md:h-auto md:w-56 shrink-0 overflow-hidden">
                            <img
                              src={getSafeImageUrl(image)}
                              alt={property.title || 'Tracked property'}
                              className="h-full w-full object-cover"
                            />
                            <span className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm ${STAGE_PILL[stage]}`}>
                              <CircleDot className="h-3 w-3" />
                              {STAGE_LABEL_LONG[stage]}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-5 sm:p-6">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <h3 className="truncate text-lg font-black tracking-tight text-gray-950 sm:text-xl">
                                  {property.title || 'Tracked property'}
                                </h3>
                                <p className="mt-1 flex items-center gap-1 truncate text-xs font-semibold text-gray-500">
                                  <MapPin className="h-3 w-3" />
                                  {formatPropertyAddress(property.address)}
                                </p>
                              </div>
                              <p className="text-xl font-black tracking-tight text-gray-950 whitespace-nowrap">
                                {property.price ? formatCurrencyCompact(property.price) : '—'}
                              </p>
                            </div>

                            {/* Progress */}
                            <div className="mt-5">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-gray-500">
                                  Current Stage: <span className="text-gray-950">{STAGE_LABEL_LONG[stage]}</span>
                                </span>
                                <span className="text-emerald-700">{percent}% Complete</span>
                              </div>
                              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>

                            {/* Step indicators */}
                            <ol className="mt-5 grid grid-cols-4 gap-2">
                              {STAGES.map(({ key, label, icon: StepIcon }, i) => {
                                const reached = i <= stageIndex;
                                const current = i === stageIndex;
                                return (
                                  <li key={key} className="flex flex-col items-center text-center">
                                    <div
                                      className={`grid h-8 w-8 place-items-center rounded-full transition ${
                                        current
                                          ? 'bg-black text-white shadow-md'
                                          : reached
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-gray-100 text-gray-400'
                                      }`}
                                    >
                                      {reached && !current ? (
                                        <CheckCircle className="h-4 w-4" />
                                      ) : (
                                        <StepIcon className="h-4 w-4" />
                                      )}
                                    </div>
                                    <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${current ? 'text-gray-950' : reached ? 'text-emerald-700' : 'text-gray-400'}`}>
                                      {label}
                                    </span>
                                  </li>
                                );
                              })}
                            </ol>

                            {/* Actions */}
                            <div className="mt-6 flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => router.push('/dashboards/buyer/payments')}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                View Documents
                              </button>
                              {isEscrow && (
                                <button
                                  onClick={() => router.push('/dashboards/buyer/messages')}
                                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-gray-900"
                                >
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  Contact Escrow Officer
                                </button>
                              )}
                              {isInspection && (
                                <>
                                  <button
                                    onClick={() => router.push('/dashboards/buyer/payments')}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                                  >
                                    <ClipboardList className="h-3.5 w-3.5" />
                                    Inspection Report
                                  </button>
                                  <button
                                    onClick={() => router.push('/dashboards/buyer/messages')}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-gray-900"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    Message Inspector
                                  </button>
                                </>
                              )}
                              {!isEscrow && !isInspection && (
                                <button
                                  onClick={() => router.push('/dashboards/buyer/messages')}
                                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-gray-900"
                                >
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  Message Agent
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              {/* Right sidebar */}
              <aside className="space-y-5">
                {/* Recent Activity */}
                <div className="rounded-[24px] border border-gray-200/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400">Recent Activity</p>
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  {statusUpdates.length > 0 ? (
                    <ol className="relative space-y-4 border-l border-gray-100 pl-4">
                      {statusUpdates.slice(0, 4).map((update) => {
                        const stage = inferStage(update.newStatus);
                        const tone = stage ? STAGE_PILL[stage] : 'bg-gray-100 text-gray-600';
                        return (
                          <li key={update._id} className="relative">
                            <span className={`absolute -left-[21px] top-1.5 grid h-4 w-4 place-items-center rounded-full border-2 border-white ${tone.split(' ')[0]}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${stage ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            </span>
                            <p className="text-xs font-bold text-gray-950">
                              {stage ? STAGE_LABEL_LONG[stage] : (update.newStatus || 'Status update').replace('-', ' ')}
                              <span className="font-semibold text-gray-500">{' for '}{update.property?.title || 'Tracked property'}</span>
                            </p>
                            <p className="mt-1 text-[11px] font-semibold text-gray-400">{formatRelativeTime(update.updatedAt)}</p>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center">
                      <Bell className="mx-auto h-6 w-6 text-gray-300" />
                      <p className="mt-2 text-xs font-semibold text-gray-500">Activity will surface here as your deals progress.</p>
                    </div>
                  )}
                </div>

              </aside>
            </div>
          </main>
        </div>
      </div>

      {/* Global green footer is rendered once by AppReadyShell; it auto-offsets past #buyer-sidebar. */}
    </div>
  );
}
