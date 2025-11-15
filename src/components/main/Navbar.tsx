'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
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
    { label: 'Buy', href: '/browse', isActive: false },
    { label: 'Sell', href: '/sell', isActive: false },
    { label: 'How it Works', href: '/how-it-works', isActive: false },
    { label: 'About', href: '/about', isActive: false },
    { label: 'Contact', href: '/contact', isActive: false },
  ],
  ctaText = 'Get Started',
  ctaHref = '/signin'
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Image
              src={logo}
              alt="OnlyIf Logo"
              width={220}
              height={64}
className="h-12 sm:h-14 md:h-16 lg:h-16 xl:h-16 w-auto transition-transform group-hover:scale-105"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  item.isActive
                    ? 'text-blue-600'
                    : 'text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={ctaHref}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {ctaText}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors text-gray-900 hover:bg-gray-100"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? (
              <motion.div whileHover={{ scale: 1.1 }}>
                <X color="#47C96F" strokeWidth={2} size={24} />
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.1 }}>
                <Menu color="#47C96F" strokeWidth={2} size={24} />
              </motion.div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                  item.isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={ctaHref}
              className="block w-full mt-4 bg-blue-600 text-white px-3 py-2 rounded text-base font-medium hover:bg-blue-700 transition-colors text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              {ctaText}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}