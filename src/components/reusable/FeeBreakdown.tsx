import { formatCurrencyCompact } from '@/utils/currency';
import { Check } from 'lucide-react';

interface FeeBreakdownProps {
  offerAmount: number;
  fees: {
    name: string;
    amount: number;
    description?: string;
  }[];
  netProceeds: number;
  className?: string;
}

export default function FeeBreakdown({
  offerAmount,
  fees,
  netProceeds,
  className = ""
}: FeeBreakdownProps) {
  // Remove the old formatCurrency function
  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: 'USD',
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: 0,
  //   }).format(amount);
  // };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Breakdown</h3>
      
      {/* Offer Amount */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-900">Cash Offer</span>
          <span className="text-2xl font-bold text-blue-600">{formatCurrencyCompact(offerAmount)}</span>
        </div>
      </div>

      {/* Fees */}
      <div className="space-y-3 mb-6">
        <h4 className="font-medium text-gray-900">Fees & Deductions</h4>
        {fees.map((fee, index) => (
          <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{fee.name}</div>
              {fee.description && (
                <div className="text-xs text-gray-500 mt-1">{fee.description}</div>
              )}
            </div>
            <div className="text-sm font-medium text-gray-900">
              -{formatCurrencyCompact(fee.amount)}
            </div>
          </div>
        ))}
      </div>

      {/* Net Proceeds */}
      <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Net Proceeds</span>
          <span className="text-2xl font-bold text-green-600">{formatCurrencyCompact(netProceeds)}</span>
        </div>
        <p className="text-sm text-green-700 mt-2">
          This is the amount you'll receive at closing
        </p>
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-gray-900 mb-2">What's Included:</h5>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-center">
            <Check className="mr-2" color="#47C96F" strokeWidth={2} size={24} />
            No real estate agent commissions
          </li>
          <li className="flex items-center">
            <Check className="mr-2" color="#47C96F" strokeWidth={2} size={24} />
            No repair costs
          </li>
          <li className="flex items-center">
            <Check className="mr-2" color="#47C96F" strokeWidth={2} size={24} />
            Flexible closing date
          </li>
        </ul>
      </div>
    </div>
  );
}