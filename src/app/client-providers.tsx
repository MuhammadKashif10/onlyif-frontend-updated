'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import { PropertyProvider } from '../context/PropertyContext';
import { BuyerProvider } from '../context/BuyerContext';
import { UIProvider } from '../context/UIContext';
import { NotificationProvider } from '../context/NotificationContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
      },
    },
  }));

  return (
    <UIProvider>
      <AuthProvider>
        <PropertyProvider>
          <BuyerProvider>
            <QueryClientProvider client={queryClient}>
              <NotificationProvider>
                {children}
              </NotificationProvider>
              <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            </QueryClientProvider>
          </BuyerProvider>
        </PropertyProvider>
      </AuthProvider>
    </UIProvider>
  );
}