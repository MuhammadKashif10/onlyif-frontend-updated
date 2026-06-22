'use client';

import React from 'react';
import { Property } from '@/types/api';
import { getAvailabilityLabel } from '@/utils/availability';
import { formatDate } from '@/utils/formatDate';

interface InvestmentDetailsProps {
  property: Partial<Property> | null | undefined;
}

const occupancyLabels: Record<string, string> = {
  vacant: 'Vacant',
  tenanted: 'Tenanted',
  investment: 'Investment',
};

function formatCurrency(value: number): string {
  return `A$${value.toLocaleString('en-AU')}`;
}

// Safely format a full date; returns null on missing/invalid input.
function safeDate(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : formatDate(d);
}

/**
 * Read-only "Investment Details" section for the property detail page.
 * - Every row is conditionally rendered, so undefined fields are hidden.
 * - If nothing meaningful exists, the whole section renders null (no empty block).
 * - Fully optional-chained, so old listings render without errors.
 */
const InvestmentDetails: React.FC<InvestmentDetailsProps> = ({ property }) => {
  if (!property) return null;

  const availability = getAvailabilityLabel(property);
  const occupancy = property.occupancyStatus
    ? occupancyLabels[property.occupancyStatus] ?? property.occupancyStatus
    : null;
  const rent =
    typeof property.monthlyRent === 'number' && property.monthlyRent > 0
      ? formatCurrency(property.monthlyRent)
      : null;
  const tenant = property.tenantDetails?.trim() || null;
  const leaseEnd = safeDate(property.leaseEndDate);

  const rows: Array<{ label: string; value: string }> = [];
  if (occupancy) rows.push({ label: 'Occupancy', value: occupancy });
  if (availability) rows.push({ label: 'Availability', value: availability.text });
  if (rent) rows.push({ label: 'Monthly Rent', value: rent });
  if (leaseEnd) rows.push({ label: 'Lease Ends', value: leaseEnd });

  // Nothing meaningful to show → hide the section entirely (no empty UI).
  if (rows.length === 0 && !tenant) return null;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-3">Investment Details</h2>
      {rows.length > 0 && (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between border-b border-gray-100 pb-2">
              <dt className="text-sm text-gray-500">{row.label}</dt>
              <dd className="text-sm font-semibold text-gray-900 text-right">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {tenant && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-1">Tenant Details</p>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{tenant}</p>
        </div>
      )}
    </div>
  );
};

export default InvestmentDetails;
