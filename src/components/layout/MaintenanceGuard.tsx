"use client";

import { useEffect, useState } from "react";
// Removed usePathname to avoid relying on App Router context at root layout level
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

interface Props {
  children: React.ReactNode;
}

export default function MaintenanceGuard({ children }: Props) {
  const [checked, setChecked] = useState(false);
  const [isOn, setIsOn] = useState(false);
  const [pathname, setPathname] = useState<string>('');
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isMaintenanceRoute, setIsMaintenanceRoute] = useState(false);
  const { user } = useAuth();

  // Derived flags; for safety we will recompute from window.location inside effect
  const isAdminUser = user?.role === "admin";

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
    // Determine route flags from current URL
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : pathname;
    const adminRoute = currentPath?.startsWith('/admin');
    const maintenanceRoute = currentPath === '/maintenance';
    
    setIsAdminRoute(adminRoute);
    setIsMaintenanceRoute(maintenanceRoute);

    // Skip checks for admin area to avoid blocking dashboard/login
    if (adminRoute) {
      setChecked(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res: any = await apiClient.get('/settings');
        const on = !!(res?.data?.maintenanceMode ?? res?.maintenanceMode);
        if (!cancelled) {
          setIsOn(on);
          setChecked(true);
          if (on && !isAdminUser && !maintenanceRoute) {
            window.location.href = '/maintenance';
          }
          if (!on && maintenanceRoute) {
            window.location.href = '/';
          }
        }
      } catch (_) {
        // Fail open: allow site if settings fetch fails
        if (!cancelled) setChecked(true);
      }
    })();

    return () => { cancelled = true; };
  }, [isAdminUser]);

  if (!checked) return null;
  if (isOn && !isAdminUser && !isAdminRoute && !isMaintenanceRoute) return null; // redirecting

  return <>{children}</>;
}