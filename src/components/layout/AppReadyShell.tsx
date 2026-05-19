'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Footer from '@/components/layout/Footer';
import MaintenanceGuard from '@/components/layout/MaintenanceGuard';
import GlobalAppLoader from '@/components/layout/GlobalAppLoader';

export default function AppReadyShell({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
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

  return (
    <MaintenanceGuard fallback={<GlobalAppLoader />}>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </MaintenanceGuard>
  );
}
