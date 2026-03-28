'use client';

import { ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  className = '' 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
}