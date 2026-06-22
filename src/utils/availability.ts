// Unified availability/occupancy label logic.
// Single source of truth so copy is never hardcoded across pages.
// Fully defensive: works with old listings (fields undefined) and bad date values.

export type AvailabilityTone = 'occupied' | 'available' | 'vacant';

export interface AvailabilityLabel {
  text: string;
  tone: AvailabilityTone;
}

// Loose shape — accepts any property-like object (old or new schema).
type PropertyLike = {
  leaseEndDate?: string | Date | null;
  availableFromDate?: string | Date | null;
  occupancyStatus?: 'vacant' | 'tenanted' | 'investment' | string | null;
} | null | undefined;

// Safely format a date as e.g. "Jan 2027"; returns null for missing/invalid input.
function formatMonthYear(value?: string | Date | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Returns a human-readable availability label, or null if nothing meaningful to show.
 * Priority: leaseEndDate → availableFromDate → vacant → null.
 */
export function getAvailabilityLabel(property: PropertyLike): AvailabilityLabel | null {
  if (!property) return null;

  const leaseEnd = formatMonthYear(property.leaseEndDate);
  if (leaseEnd) {
    return { text: `Occupied until ${leaseEnd}`, tone: 'occupied' };
  }

  const availableFrom = formatMonthYear(property.availableFromDate);
  if (availableFrom) {
    return { text: `Available from ${availableFrom}`, tone: 'available' };
  }

  if (property.occupancyStatus === 'vacant') {
    return { text: 'Vacant — available now', tone: 'vacant' };
  }

  return null;
}
