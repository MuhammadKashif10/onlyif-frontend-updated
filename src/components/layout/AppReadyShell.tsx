'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Footer from '@/components/layout/Footer';
import MaintenanceGuard from '@/components/layout/MaintenanceGuard';
import GlobalAppLoader from '@/components/layout/GlobalAppLoader';

export default function AppReadyShell({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = useState(false);
  const [hasInitialLoadCompleted, setHasInitialLoadCompleted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && !isLoading) {
      setHasInitialLoadCompleted(true);
    }
  }, [hasMounted, isLoading]);

  if (!hasInitialLoadCompleted) {
    return <GlobalAppLoader />;
  }

  // Buyer dashboard renders its own footer via app/dashboards/buyer/layout.tsx
  // wrapped in lg:pl-[280px] so the green footer doesn't slide under the fixed sidebar.
  const isBuyerDashboard = pathname?.startsWith('/dashboards/buyer') ?? false;

  return (
    <MaintenanceGuard fallback={<GlobalAppLoader />}>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        {!isBuyerDashboard && <Footer />}
      </div>
    </MaintenanceGuard>
  );
}
