'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import EnhancedNotificationPanel from '@/components/reusable/EnhancedNotificationPanel';
import { Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavbarProps {
  logo?: string;
  logoText?: string;
  navigationItems?: Array<{
    label: string;
    href: string;
    isActive?: boolean;
  }>;
  ctaText?: string;
  ctaHref?: string;
  className?: string;
}

export default function Navbar({
  logo = '/images/logo.PNG',
  logoText = '',
  navigationItems = [
    { label: 'Buy', href: '/buy' },
    { label: 'Sell', href: '/sell' },
    { label: 'How it Works', href: '/how-it-works' },
    { label: 'Agents', href: '/agents' },
  ],
  ctaText = 'Sign In',
  ctaHref = '/signin',
  className = ''
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      menuButtonRef.current &&
      !menuButtonRef.current.contains(event.target as Node)
    ) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex flex-col leading-tight">
              <div className="flex items-center space-x-2">
                <img 
                  src={logo} 
                  alt="OnlyIf logo" 
                  className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto transition-transform duration-200 group-hover:scale-105"
                />
                {logoText && (
                  <span className="text-base font-bold text-gray-900 group-hover:text-blue-600">{logoText}</span>
                )}
              </div>
             
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-semibold transition-colors duration-200 relative group ${
                  item.isActive
                    ? 'text-[#3AB861]'
                    : 'text-gray-700 hover:text-[#3AB861]'
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-[#3AB861] transition-all duration-200 ${
                    item.isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {!user ? (
              <Link
                href={ctaHref}
                className="bg-[#3AB861] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#329d56] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3AB861] focus:ring-offset-2 shadow-sm"
              >
                {ctaText}
              </Link>
            ) : (
              <div className="flex items-center space-x-6">
                <Link
                  href="/dashboard"
                  className="text-sm font-bold text-[#3AB861] hover:text-[#329d56] transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-bold text-gray-600 hover:text-red-600 transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <X color="#3AB861" strokeWidth={2.5} size={28} />
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Menu color="#3AB861" strokeWidth={2.5} size={28} />
              </motion.div>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div ref={menuRef} className="lg:hidden py-6 border-t border-gray-100 animate-in slide-in-from-top duration-300">
            <div className="space-y-2 mb-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3.5 transition-colors duration-200 rounded-xl ${
                    item.isActive
                      ? 'text-[#3AB861] bg-emerald-50 font-bold'
                      : 'text-gray-700 hover:text-[#3AB861] hover:bg-emerald-50/50 font-semibold'
                  }`}
                  onClick={handleMenuClose}
                >
                  {item.label}
                  <ArrowRight className={`w-4 h-4 ${item.isActive ? 'text-emerald-400' : 'text-gray-300'}`} />
                </Link>
              ))}
            </div>
            
            {/* Mobile Actions */}
            <div className="pt-6 border-t border-gray-100 space-y-3 px-2">
              {!user ? (
                <Link
                  href={ctaHref}
                  className="flex items-center justify-center w-full px-4 py-4 bg-[#3AB861] text-white hover:bg-[#329d56] transition-colors duration-200 rounded-2xl font-bold shadow-lg shadow-emerald-100"
                  onClick={handleMenuClose}
                >
                  {ctaText}
                </Link>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-between px-4 py-4 text-[#3AB861] bg-emerald-50 hover:bg-emerald-100 transition-colors duration-200 rounded-2xl font-bold"
                    onClick={handleMenuClose}
                  >
                    Dashboard
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      handleMenuClose();
                    }}
                    className="flex items-center justify-between w-full px-4 py-4 text-red-600 bg-red-50 hover:bg-red-100 transition-colors duration-200 rounded-2xl font-bold"
                  >
                    Sign Out
                    <X className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
