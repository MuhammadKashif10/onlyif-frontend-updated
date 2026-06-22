'use client';

import React from 'react';
import InputField from '@/components/reusable/InputField';
import TextArea from '@/components/reusable/TextArea';
import Checkbox from '@/components/reusable/Checkbox';

// Controlled value shape shared by both the Add and Edit property forms.
// All values are strings/boolean so they map cleanly onto form state.
export interface InvestmentAvailabilityValues {
  isInvestmentProperty: boolean;
  occupancyStatus: string;        // 'vacant' | 'tenanted' | 'investment'
  tenantDetails: string;
  monthlyRent: string;
  leaseEndDate: string;           // yyyy-mm-dd (native date input)
  availableFromDate: string;      // yyyy-mm-dd
  settlementAfterDate: string;    // yyyy-mm-dd
}

interface Props {
  values: InvestmentAvailabilityValues;
  onFieldChange: (field: keyof InvestmentAvailabilityValues, value: string | boolean) => void;
  // Optional real documents UI. When provided it replaces the placeholder
  // (used in the edit flow, where the property already exists and can store files).
  documentsContent?: React.ReactNode;
}

// Collapsible section wrapper using native <details> — no extra state, accessible.
function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="rounded-lg border border-gray-200 bg-white">
      <summary className="cursor-pointer select-none px-4 py-3 text-base font-semibold text-gray-900 marker:text-gray-400">
        {title}
      </summary>
      <div className="border-t border-gray-100 px-4 py-4">{children}</div>
    </details>
  );
}

const selectClasses =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

/**
 * Reusable Investment / Availability / Documents form sections.
 * Presentational + fully controlled — the parent owns the state and submit.
 * All fields are optional; nothing here changes existing form behavior.
 */
export default function InvestmentAvailabilityFields({ values, onFieldChange, documentsContent }: Props) {
  // Tenant/rent/lease fields are only relevant when the property is not vacant.
  const showTenantFields = values.occupancyStatus !== 'vacant';

  return (
    <div className="space-y-6">
      {/* ── 1. Investment Details ── */}
      <Section title="Investment Details">
        <div className="space-y-5">
          <Checkbox
            id="isInvestmentProperty"
            label="This is an investment property"
            checked={values.isInvestmentProperty}
            onChange={(checked) => onFieldChange('isInvestmentProperty', checked)}
          />

          <div>
            <label htmlFor="occupancyStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Occupancy Status
            </label>
            <select
              id="occupancyStatus"
              className={selectClasses}
              value={values.occupancyStatus || 'vacant'}
              onChange={(e) => onFieldChange('occupancyStatus', e.target.value)}
            >
              <option value="vacant">Vacant</option>
              <option value="tenanted">Tenanted</option>
              <option value="investment">Investment</option>
            </select>
          </div>

          {/* Tenant fields appear only when not vacant */}
          {showTenantFields && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InputField
                  label="Monthly Rent"
                  type="number"
                  placeholder="e.g. 2400"
                  value={values.monthlyRent}
                  onChange={(e) => onFieldChange('monthlyRent', e.target.value)}
                />
                <InputField
                  label="Lease End Date"
                  type="date"
                  value={values.leaseEndDate}
                  onChange={(e) => onFieldChange('leaseEndDate', e.target.value)}
                />
              </div>
              <TextArea
                label="Tenant Details"
                placeholder="Lease terms, tenant arrangement, notice period, etc."
                value={values.tenantDetails}
                onChange={(e) => onFieldChange('tenantDetails', e.target.value)}
              />
            </div>
          )}
        </div>
      </Section>

      {/* ── 2. Availability ── */}
      <Section title="Availability">
        <p className="text-sm text-gray-500 mb-4">
          When will this property be available for buyers?
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InputField
            label="Available From"
            type="date"
            value={values.availableFromDate}
            onChange={(e) => onFieldChange('availableFromDate', e.target.value)}
          />
          <InputField
            label="Settlement After"
            type="date"
            value={values.settlementAfterDate}
            onChange={(e) => onFieldChange('settlementAfterDate', e.target.value)}
          />
        </div>
      </Section>

      {/* ── 3. Documents — real UI when provided, else placeholder ── */}
      <Section title="Documents" defaultOpen={false}>
        {documentsContent ?? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
            <p className="text-sm text-gray-500">
              Documents can be uploaded after the property is created
            </p>
          </div>
        )}
      </Section>
    </div>
  );
}
