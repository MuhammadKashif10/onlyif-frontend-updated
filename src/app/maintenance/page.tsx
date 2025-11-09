'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MaintenancePage() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 10);
    // Hide any global footers while maintenance page is visible
    const footers = Array.from(document.querySelectorAll('footer')) as HTMLElement[];
    const prevDisplays = footers.map(f => f.style.display);
    footers.forEach(f => (f.style.display = 'none'));
    return () => {
      clearTimeout(t);
      footers.forEach((f, i) => (f.style.display = prevDisplays[i] ?? ''));
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0ea5e9]/5 via-white to-[#22c55e]/5">
      <div className={`text-center max-w-xl px-6 transition-all duration-300 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
        <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-blue-600/10 flex items-center justify-center">
          <span className="text-3xl">🚧</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          We’ll be right back
        </h1>
        <p className="text-gray-600 mb-8">
          We’re currently performing scheduled maintenance to improve your experience.
          Please check back soon.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            Refresh
          </button>
          <a href="mailto:info@onlyif.com.au" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
