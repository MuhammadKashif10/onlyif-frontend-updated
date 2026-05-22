'use client';

import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Heart,
  TrendingUp,
  Bell,
  MessageSquare,
  Settings,
} from 'lucide-react';

export type BuyerTabKey = 'overview' | 'notifications';
export type BuyerSidebarKey = BuyerTabKey | 'watchlist' | 'tracking' | 'messages' | 'settings';

interface BuyerSidebarProps {
  activeKey: BuyerSidebarKey;
  // When the buyer dashboard page itself mounts this sidebar, it passes a
  // callback so tab clicks just flip in-page state. From every other buyer
  // route (e.g. /messages), the sidebar falls back to URL navigation with
  // a `?tab=` param so the dashboard restores the right tab.
  onTabClick?: (key: BuyerTabKey) => void;
  user?: { name?: string | null; avatar?: string | null } | null;
}

const TAB_ITEMS: { key: BuyerSidebarKey; label: string; icon: typeof Heart }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'watchlist', label: 'Watchlist', icon: Heart },
  { key: 'tracking', label: 'Property Tracking', icon: TrendingUp },
  { key: 'notifications', label: 'Updates', icon: Bell },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
];

const TAB_SET = new Set<BuyerSidebarKey>(['overview', 'notifications']);
const ROUTE_MAP: Partial<Record<BuyerSidebarKey, string>> = {
  watchlist: '/dashboards/buyer/saved',
  tracking: '/dashboards/buyer/tracking',
  messages: '/dashboards/buyer/messages',
  settings: '/dashboards/buyer/account',
};

export default function BuyerSidebar({ activeKey, onTabClick, user }: BuyerSidebarProps) {
  const router = useRouter();

  const buttonCls = (isActive: boolean) =>
    `w-full flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ease-out ${
      isActive
        ? 'bg-black text-white shadow-lg shadow-black/10'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-950'
    }`;
  const iconCls = (isActive: boolean) => `h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`;

  const handleNav = (key: BuyerSidebarKey) => {
    const route = ROUTE_MAP[key];
    if (route) {
      router.push(route);
      return;
    }
    if (TAB_SET.has(key)) {
      if (onTabClick) {
        onTabClick(key as BuyerTabKey);
      } else {
        router.push(`/dashboards/buyer?tab=${key}`);
      }
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'B';

  return (
    <aside
      id="buyer-sidebar"
      className="fixed left-0 top-20 bottom-0 z-30 hidden w-[280px] shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white px-5 py-6 lg:flex"
    >
      <div className="flex-1">
        <nav className="space-y-2 pt-2">
          {TAB_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleNav(key)}
              className={buttonCls(activeKey === key)}
            >
              <Icon className={iconCls(activeKey === key)} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="my-6 h-px w-full bg-gray-100" />

        <nav className="space-y-2">
          <button
            onClick={() => handleNav('settings')}
            className={buttonCls(activeKey === 'settings')}
          >
            <Settings className={iconCls(activeKey === 'settings')} />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      <div className="border-t border-gray-200 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-sm overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name || 'Buyer'} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-bold text-gray-950">{user?.name || 'Buyer'}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">Premium Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
