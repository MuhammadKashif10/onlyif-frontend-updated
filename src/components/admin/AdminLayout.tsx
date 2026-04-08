import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Home, 
  User, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Properties', href: '/admin/properties', icon: Home },
    { name: 'Agents', href: '/admin/agents', icon: User },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 w-full transition-all">
        {/* Left: Logo (Visible on mobile/tablet, hidden on large if sidebar logo is enough, but user asked for logo on left) */}
        <div className="flex items-center gap-4 min-w-[120px]">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link href="/admin/dashboard" className="flex-shrink-0">
            <img src="/images/logo.PNG" alt="Only If Logo" className="h-8 sm:h-10 w-auto" />
          </Link>
        </div>

        {/* Center: Navigation links */}
        <nav className="hidden lg:flex items-center justify-center flex-1 px-4">
          <div className="flex items-center space-x-8 text-sm font-semibold text-gray-600">
            <Link href="/buy" className="hover:text-green-600 transition-colors">Buy</Link>
            <Link href="/sell" className="hover:text-green-600 transition-colors">Sell</Link>
            <Link href="/how-it-works" className="hover:text-green-600 transition-colors">How it Works</Link>
            <Link href="/agents" className="hover:text-green-600 transition-colors">Agents</Link>
          </div>
        </nav>

        {/* Right: Sign Out */}
        <div className="flex items-center justify-end min-w-[120px]">
          <button 
            onClick={handleLogout}
            className="text-sm font-bold text-gray-600 hover:text-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-24 flex items-center px-6 border-b border-gray-100">
            <Link href="/admin/dashboard">
              <img src="/images/logo.PNG" alt="Only If Logo" className="h-14 w-auto object-contain" />
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-green-50 text-green-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`mr-3 w-5 h-5 transition-colors ${isActive ? 'text-green-600' : 'text-green-600'}`} />
                  {item.name}
                  {isActive && <ChevronRight className="ml-auto w-4 h-4 text-green-600" />}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout at bottom */}
          <div className="p-4 mt-auto border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center px-2 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold border-2 border-white shadow-sm overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name?.charAt(0) || 'A'}</span>
                )}
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 group"
            >
              <LogOut className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className={`lg:ml-64 min-h-[calc(100vh-4rem)] transition-all`}>
        <main className="p-4 sm:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
