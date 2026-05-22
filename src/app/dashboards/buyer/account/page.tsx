'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components';
import BuyerSidebar from '@/components/buyer/BuyerSidebar';
import {
  ArrowRight,
  AlertCircle,
  Bell,
  CheckCircle,
  Calendar,
  Eye,
  EyeOff,
  Heart,
  Key,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquare,
  Save,
  Settings,
  Shield,
  TrendingUp,
  User,
  X,
} from 'lucide-react';

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ValidationErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const MOBILE_NAV: { href: string; label: string; icon: typeof Bell; active?: boolean }[] = [
  { href: '/dashboards/buyer?tab=overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboards/buyer/saved', label: 'Watchlist', icon: Heart },
  { href: '/dashboards/buyer/tracking', label: 'Property Tracking', icon: TrendingUp },
  { href: '/dashboards/buyer?tab=notifications', label: 'Updates', icon: Bell },
  { href: '/dashboards/buyer/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboards/buyer/account', label: 'Settings', icon: Settings, active: true },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const canAccessBuyerDashboard = !!user?.roles?.includes('buyer');

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/signin');
      return;
    }
    if (!user.roles?.includes('buyer')) {
      router.push('/signin');
    }
  }, [canAccessBuyerDashboard, user, authLoading, router]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setErrors({});
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to update password. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof PasswordData, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (message) setMessage(null);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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

  if (!user || !canAccessBuyerDashboard) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6fb]">
      {/* Global Header (same as rest of buyer dashboard) */}
      <Navbar />

      {/* Mobile sticky bar */}
      <div className="sticky top-20 z-40 border-b border-gray-200/70 bg-[#f5f6fb]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold text-gray-950">Settings</p>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm cursor-pointer"
            aria-label="Open buyer dashboard menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

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
        <BuyerSidebar activeKey="settings" user={user} />

        <div className="flex min-w-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <main className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <header>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">Account</p>
              <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">Settings</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                Manage your account information and security settings.
              </p>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Profile card */}
              <section className="rounded-[28px] border border-gray-200/80 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.05)]">
                <div className="text-center">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-700 overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name || 'Buyer'} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-10 w-10" />
                    )}
                  </div>
                  <h2 className="mt-4 text-lg font-black tracking-tight text-gray-950">{user.name || 'Buyer'}</h2>
                  <p className="text-sm font-semibold text-gray-500">{user.email}</p>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3 rounded-2xl border border-gray-100 p-3">
                    <Mail className="mt-0.5 h-4 w-4 text-gray-400" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Email</p>
                      <p className="truncate text-sm font-semibold text-gray-700">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-gray-100 p-3">
                    <Shield className="mt-0.5 h-4 w-4 text-gray-400" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Role</p>
                      <p className="truncate text-sm font-semibold text-gray-700 capitalize">
                        {user.roles?.includes('buyer') ? 'Buyer' : user.role}
                      </p>
                    </div>
                  </div>

                  {user.createdAt && (
                    <div className="flex items-start gap-3 rounded-2xl border border-gray-100 p-3">
                      <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Member Since</p>
                        <p className="truncate text-sm font-semibold text-gray-700">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Change Password card */}
              <section className="rounded-[28px] border border-gray-200/80 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.05)] lg:col-span-2">
                <div className="mb-6 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gray-50">
                    <Key className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400">Security</p>
                    <h2 className="text-xl font-black tracking-tight text-gray-950">Change Password</h2>
                  </div>
                </div>

                {message && (
                  <div
                    className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${
                      message.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-red-200 bg-red-50 text-red-800'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <p>{message.text}</p>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-5">
                  {(
                    [
                      { id: 'currentPassword', label: 'Current Password', field: 'currentPassword' as const, toggle: 'current' as const, placeholder: 'Enter your current password' },
                      { id: 'newPassword', label: 'New Password', field: 'newPassword' as const, toggle: 'new' as const, placeholder: 'Enter your new password' },
                      { id: 'confirmPassword', label: 'Confirm New Password', field: 'confirmPassword' as const, toggle: 'confirm' as const, placeholder: 'Confirm your new password' },
                    ]
                  ).map(({ id, label, field, toggle, placeholder }) => (
                    <div key={id}>
                      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-[0.18em] text-gray-500 mb-2">
                        {label}
                      </label>
                      <div className="relative">
                        <input
                          id={id}
                          type={showPasswords[toggle] ? 'text' : 'password'}
                          value={passwordData[field]}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          placeholder={placeholder}
                          className={`w-full rounded-xl border bg-white px-4 py-3 pr-11 text-sm font-semibold text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-emerald-500 ${
                            errors[field] ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(toggle)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                          aria-label="Toggle password visibility"
                        >
                          {showPasswords[toggle] ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors[field] && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors[field]}</p>}
                      {field === 'newPassword' && !errors.newPassword && (
                        <p className="mt-1.5 text-xs font-semibold text-gray-400">Password must be at least 6 characters long.</p>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Update Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </main>
        </div>
      </div>

      {/* Global green footer is rendered once by AppReadyShell; it auto-offsets past #buyer-sidebar. */}
    </div>
  );
}
