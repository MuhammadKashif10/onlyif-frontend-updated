'use client';

import React from 'react';
import { getAvailabilityLabel, AvailabilityTone } from '@/utils/availability';

interface OccupancyBadgeProps {
  // Accept any property-like object (old or new schema) — the util guards internally.
  property: Parameters<typeof getAvailabilityLabel>[0];
  className?: string;
}

const toneClasses: Record<AvailabilityTone, string> = {
  occupied: 'bg-amber-100 text-amber-800',
  available: 'bg-blue-100 text-blue-800',
  vacant: 'bg-green-100 text-green-800',
};

/**
 * Small, self-hiding availability pill.
 * Renders nothing when there is no meaningful label, so it is safe to drop
 * into any tile or detail layout without creating empty UI.
 */
const OccupancyBadge: React.FC<OccupancyBadgeProps> = ({ property, className = '' }) => {
  const label = getAvailabilityLabel(property);
  if (!label) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClasses[label.tone]} ${className}`}
    >
      {label.text}
    </span>
  );
};

export default OccupancyBadge;
