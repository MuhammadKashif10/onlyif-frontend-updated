'use client';

import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';

interface AgentDashboardHeaderProps {
  agentName: string;
  agentAvatar?: string;
  notificationCount?: number;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  withSidebarOffset?: boolean;
}

export default function AgentDashboardHeader({
  agentName,
  agentAvatar,
  notificationCount = 0,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
  withSidebarOffset = true
}: AgentDashboardHeaderProps) {
  const initials = agentName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 h-[72px] border-b border-gray-200/70 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className={`flex h-full items-center gap-3 px-4 sm:px-6 lg:pr-8 ${withSidebarOffset ? 'lg:pl-[320px]' : 'lg:pl-8'}`}>
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-gray-200 text-gray-600 transition-all duration-200 hover:bg-gray-50 lg:hidden"
            aria-label="Toggle agent dashboard menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}

        <div className="relative hidden w-full max-w-2xl md:block">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search properties, clients, or files..."
            className="h-12 w-full rounded-full border border-transparent bg-[#eef3ff] pl-14 pr-5 text-sm font-medium text-gray-700 outline-none transition-all duration-200 placeholder:text-gray-500 focus:border-gray-200 focus:bg-white focus:shadow-sm"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-gray-200 bg-gray-950 text-sm font-bold text-white shadow-sm">
            {agentAvatar ? (
              <img src={agentAvatar} alt={agentName} className="h-full w-full object-cover" />
            ) : (
              initials || 'A'
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
