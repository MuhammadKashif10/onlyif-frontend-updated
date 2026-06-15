'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Box,
  Camera,
  Check,
  Home,
  LayoutDashboard,
  Map,
  Plane,
  Ruler,
  Settings,
  Sparkles,
  Store,
  BarChart3,
  Video,
  MessageSquare,
} from 'lucide-react';
import { Navbar } from '@/components';
import { useAuth } from '@/hooks/useAuth';

const services = [
  {
    id: 'full-media-package',
    title: 'Full Media Package',
    price: '$999',
    badge: 'Most Popular',
    image:
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85',
    description: 'Complete cinematic production suite for high-intent property campaigns.',
    features: [
      { label: '25x HDR Photography', icon: Camera },
      { label: '4K Cinematic Video Walkthrough', icon: Video },
      { label: 'Detailed 2D Floor Plan', icon: Ruler },
      { label: '4K Drone Aerial Shots', icon: Plane },
    ],
    featured: true,
  },
  {
    id: 'virtual-staging',
    title: 'Virtual Staging',
    price: '$499',
    image:
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85',
    description:
      'Transform vacant spaces into inviting rooms with realistic lighting, textures, and elevated styling.',
    features: [
      { label: 'Up to 5 Key Rooms', icon: Check },
      { label: '48h Turnaround', icon: Check },
      { label: 'Editorial Furniture Styling', icon: Sparkles },
    ],
  },
  {
    id: 'lidar-spatial-map',
    title: 'LiDAR Spatial Map',
    price: '$199',
    image:
      'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=85',
    description:
      'High-precision laser scanning for immersive 3D walkthroughs and exact measurement data.',
    features: [
      { label: '99% Measurement Accuracy', icon: Check },
      { label: 'Matterport Integration', icon: Box },
      { label: 'Renovation Planning Data', icon: Map },
    ],
  },
];

export default function SellerMarketplacePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookingId, setBookingId] = useState<string | null>(null);

  const handleBook = async (service: { id: string }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
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

    setBookingId(service.id);
    try {
      const res = await fetch(`${backendBase.replace(/\/$/, '')}/api/service-orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ serviceId: service.id }),
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
      setBookingId(null);
    }
  };

  const sidebarButtonClass = (isActive: boolean) =>
    `w-full flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ease-out hover:shadow-sm ${
      isActive
        ? 'bg-black text-white shadow-lg shadow-black/10'
        : 'text-gray-600 hover:bg-white hover:text-gray-950'
    }`;

  const sidebarIconClass = (isActive: boolean) =>
    `h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`;

  return (
    <div className="min-h-screen bg-[#f5f6fb] flex flex-col">
      <Navbar />

      <div className="flex w-full flex-1 bg-[#f5f6fb] lg:pl-[280px]">
        <aside id="dashboard-sidebar" className="fixed left-0 top-20 bottom-0 z-30 hidden w-[280px] shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white px-5 py-4 lg:flex">
          <div className="flex-1">
            <nav className="space-y-2 pt-3">
              <button onClick={() => router.push('/dashboards/seller')} className={sidebarButtonClass(false)}>
                <LayoutDashboard className={sidebarIconClass(false)} />
                <span>Dashboard</span>
              </button>
              <button onClick={() => router.push('/dashboards/seller/listings')} className={sidebarButtonClass(false)}>
                <Home className={sidebarIconClass(false)} />
                <span>Listings</span>
              </button>
              <button onClick={() => router.push('/dashboards/seller/messages')} className={sidebarButtonClass(false)}>
                <MessageSquare className={sidebarIconClass(false)} />
                <span>Messages</span>
              </button>
              <button className={sidebarButtonClass(true)}>
                <Store className={sidebarIconClass(true)} />
                <span>Marketplace</span>
              </button>
              <button onClick={() => router.push('/dashboards/seller/analytics')} className={sidebarButtonClass(false)}>
                <BarChart3 className={sidebarIconClass(false)} />
                <span>Analytics</span>
              </button>
              <button onClick={() => router.push('/dashboards/seller/account')} className={sidebarButtonClass(false)}>
                <Settings className={sidebarIconClass(false)} />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          <div className="border-t border-gray-200 pt-5">
            <button
              onClick={() => router.push('/dashboards/seller/add-property')}
              className="mb-5 w-full cursor-pointer rounded-xl bg-black px-4 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all duration-200 ease-out hover:bg-gray-900 hover:shadow-xl"
            >
              List Property
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-sm">
                {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-950">{user?.name || 'Seller Name'}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Premium Account
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 grid grid-cols-2 gap-3 lg:hidden">
            <button onClick={() => router.push('/dashboards/seller')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">
              Dashboard
            </button>
            <button onClick={() => router.push('/dashboards/seller/listings')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">
              Listings
            </button>
            <button onClick={() => router.push('/dashboards/seller/messages')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">
              Messages
            </button>
            <button className="rounded-xl bg-black px-4 py-3 text-sm font-bold text-white shadow-sm">
              Marketplace
            </button>
            <button onClick={() => router.push('/dashboards/seller/analytics')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">
              Analytics
            </button>
            <button onClick={() => router.push('/dashboards/seller/account')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">
              Settings
            </button>
          </div>

          <section className="mb-10 grid gap-6 xl:grid-cols-[1fr_320px] xl:items-start">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">
                Seller Media Studio
              </p>
              <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                Media Studio Marketplace
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                Premium production services to elevate your property&apos;s digital presence.
              </p>
              <Link
                href="/dashboards/seller/marketplace/orders"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-gray-950 underline-offset-4 hover:underline"
              >
                View My Orders
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-[20px] border border-gray-300/80 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-bold tracking-wide text-gray-500">Listing Health</p>
                <p className="text-3xl font-black text-gray-950">65%</p>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className="h-full w-[65%] rounded-full bg-black" />
              </div>
              <div className="mt-5 flex items-start gap-3 text-sm font-bold leading-5 text-emerald-600">
                <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0" />
                <span>+35% potential boost with Full Media Package</span>
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className={`group flex min-h-[620px] flex-col overflow-hidden rounded-[18px] border bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(15,23,42,0.10)] ${
                  service.featured ? 'border-black' : 'border-gray-200'
                }`}
              >
                <div className="relative h-56 overflow-hidden bg-gray-200">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  {service.badge && (
                    <div className="absolute left-5 top-5 rounded-full bg-black px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                      {service.badge}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-8">
                  <div className="mb-5 flex items-start justify-between gap-5">
                    <h2 className="text-2xl font-black leading-tight tracking-tight text-gray-950">
                      {service.title}
                    </h2>
                    <p className="shrink-0 text-2xl font-black text-gray-950">{service.price}</p>
                  </div>

                  <p className="mb-7 text-sm leading-6 text-gray-600">{service.description}</p>

                  <ul className="space-y-4">
                    {service.features.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <li key={feature.label} className="flex items-start gap-4 text-sm leading-6 text-gray-600">
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-950" />
                          <span>{feature.label}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <button
                    onClick={() => handleBook(service)}
                    disabled={bookingId === service.id}
                    className={`mt-auto inline-flex w-full items-center justify-center rounded-xl px-6 py-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70 ${
                      service.featured
                        ? 'bg-black text-white shadow-lg shadow-black/10 hover:bg-gray-900'
                        : 'border border-gray-950 bg-transparent text-gray-950 hover:bg-black hover:text-white'
                    }`}
                  >
                    {bookingId === service.id ? 'Redirecting…' : 'Book Now'}
                  </button>
                </div>
              </article>
            ))}
          </section>
        </main>
      </div>

    </div>
  );
}
