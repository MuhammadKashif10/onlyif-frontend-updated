import { formatCurrencyCompact } from '@/utils/currency';
import { CheckCircle2, Calendar } from 'lucide-react';

interface OfferResultCardProps {
  estimatedValue: number;
  address: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  estimatedClosingDate: string;
  onAccept?: () => void;
  onDecline?: () => void;
  className?: string;
}

export default function OfferResultCard({
  estimatedValue,
  address,
  propertyType,
  bedrooms,
  bathrooms,
  squareFootage,
  estimatedClosingDate,
  onAccept,
  onDecline,
  className = ""
}: OfferResultCardProps) {
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
    <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 color="#47C96F" strokeWidth={2} size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cash Offer</h2>
        <p className="text-gray-600">Based on your property details</p>
      </div>

      {/* Property Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">{address}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Type:</span> {propertyType}
          </div>
          <div>
            <span className="font-medium">Bedrooms:</span> {bedrooms}
          </div>
          <div>
            <span className="font-medium">Bathrooms:</span> {bathrooms}
          </div>
          <div>
            <span className="font-medium">Square Feet:</span> {squareFootage.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Offer Amount */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-blue-600 mb-2">
          {formatCurrencyCompact(estimatedValue)}
        </div>
        <p className="text-gray-600">Estimated Cash Offer</p>
      </div>

      {/* Estimated Closing */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center">
          <Calendar className="mr-2" color="#47C96F" strokeWidth={2} size={24} />
          <span className="text-blue-600 font-medium">
            Estimated Closing: {estimatedClosingDate}
          </span>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">What's Next?</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center">
            <CheckCircle2 className="mr-2" color="#47C96F" strokeWidth={2} size={24} />
            Schedule a property inspection
          </li>
          <li className="flex items-center">
            <CheckCircle2 className="mr-2" color="#47C96F" strokeWidth={2} size={24} />
            Review final offer details
          </li>
          <li className="flex items-center">
            <CheckCircle2 className="mr-2" color="#47C96F" strokeWidth={2} size={24} />
            Choose your closing date
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onAccept}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
        >
          Accept Offer
        </button>
        <button
          onClick={onDecline}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors"
        >
          Decline
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 mt-4 text-center">
        This is an estimated offer. Final offer amount will be determined after property inspection.
      </p>
    </div>
  );
}