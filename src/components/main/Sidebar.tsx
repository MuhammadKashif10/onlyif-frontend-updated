'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  Heart, 
  MessageSquare, 
  Settings, 
  User,
  Building,
  FileText,
  BarChart3,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  userType: 'buyer' | 'seller' | 'agent';
  className?: string;
  userId?: string; // Add userId prop for API calls
}

interface MenuItem {
  label: string;
  path: string;
  icon: string;
}

interface MenuResponse {
  menu: MenuItem[];
}

// Icon mapping for dynamic icons
const iconMap = {
  Home,
  Search,
  Heart,
  MessageSquare,
  Settings,
  User,
  Building,
  FileText,
  BarChart3,
  Users
};

// Sidebar component (buyer menu updates)
export default function Sidebar({ userType, className = '', userId = '1' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const { user } = useAuth();

  // Fetch dynamic menu items for seller
  useEffect(() => {
    if (userType === 'seller') {
      fetchSellerMenu();
    } else {
      // Use static menus for buyer and agent
      setMenuItems(userType === 'buyer' ? buyerLinks : agentLinks);
    }
  }, [userType, userId]);

  const fetchSellerMenu = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/seller/${userId}/menu`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch menu configuration');
      }
      
      const data: MenuResponse = await response.json();
      
      // Transform API response to component format
      const transformedItems = data.menu.map(item => ({
        href: item.path,
        label: item.label,
        icon: iconMap[item.icon as keyof typeof iconMap] || Home
      }));
      
      // Remove Offers and Analytics from seller sidebar
      const filteredItems = transformedItems.filter((item) => {
        const label = (item.label || '').toLowerCase();
        const href = (item.href || '').toLowerCase();
        return !label.includes('offers') &&
               !label.includes('analytics') &&
               !href.includes('/offers') &&
               !href.includes('/analytics');
      });

      setMenuItems(filteredItems);
    } catch (err) {
      console.error('Error fetching seller menu:', err);
      setError('Unable to load dashboard menu.');
      // Don't set fallback menu - strictly follow the requirement
      setMenuItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getLinks = () => {
    if (userType === 'seller') {
      return menuItems;
    }
    
    switch (userType) {
      case 'buyer':
        return buyerLinks;
      case 'agent':
        return agentLinks;
      default:
        return buyerLinks;
    }
  };

  const links = getLinks();

  return (
    <aside id="dashboard-sidebar" className={`fixed left-0 top-[85px] bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${className}`}>
      {/* Brand header */}
      <div className="h-[5px] border-b border-gray-200" />
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-600" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-gray-600" />
        )}
      </button>

      {/* Navigation */}
      <nav className="h-full pt-[5px] pb-20 overflow-y-auto">
        {/* Loading State */}
        {isLoading && userType === 'seller' && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            {!isCollapsed && (
              <span className="ml-2 text-sm text-gray-600">Loading menu...</span>
            )}
          </div>
        )}

        {/* Error State */}
        {error && userType === 'seller' && (
          <div className="p-4">
            <div className={`text-red-600 text-sm ${
              isCollapsed ? 'text-center' : ''
            }`}>
              {isCollapsed ? '!' : error}
            </div>
          </div>
        )}

        {/* Menu Items */}
        {!isLoading && !error && (
          <ul className="space-y-1 px-3">
            {links.map((link, index) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <li key={index}>
                  <Link
                    href={link.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title={isCollapsed ? link.label : undefined}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-blue-700' : 'text-gray-500'
                    }`} />
                    {!isCollapsed && (
                      <span className="font-medium">{link.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* User Profile Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className={`flex items-center space-x-3 ${
          isCollapsed ? 'justify-center' : ''
        }`}>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || ''}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {((user?.role || userType) as string).charAt(0).toUpperCase() + (user?.role || userType).slice(1)}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

const agentLinks = [
  { href: '/dashboards/agent', label: 'Dashboard', icon: Home },
  { href: '/dashboards/agent/clients', label: 'Clients', icon: Users },
  { href: '/dashboards/agent/listings', label: 'Listings', icon: Building },
  { href: '/dashboards/agent/leads', label: 'Leads', icon: User },
  { href: '/dashboards/agent/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboards/agent/account', label: 'Account Settings', icon: Settings },
];

// Static fallback menus (only used if API fails)
// Updated: removed Viewed, Scheduled, and Active Offers; renamed Saved → Unlock
const buyerLinks = [
  { href: '/dashboards/buyer', label: 'Dashboard', icon: Home },
  { href: '/browse', label: 'Browse Properties', icon: Search },
  { href: '/dashboards/buyer/saved', label: 'Unlock Properties', icon: Heart },
  { href: '/dashboards/buyer/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboards/buyer/account', label: 'Account Settings', icon: Settings },
];