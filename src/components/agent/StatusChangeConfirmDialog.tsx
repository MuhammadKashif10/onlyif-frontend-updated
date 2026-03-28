'use client';
import { useState } from 'react';
import { Button } from '@/components/reusable/Button';

interface StatusChangeConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (details: StatusChangeDetails) => Promise<void>;
  currentStatus: string | null;
  newStatus: string;
  propertyTitle: string;
}

interface StatusChangeDetails {
  changeReason?: string;
  settlementDetails?: {
    settlementDate?: string;
    commissionRate?: number;
    solicitorName?: string;
    solicitorEmail?: string;
  };
}

const StatusChangeConfirmDialog: React.FC<StatusChangeConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  newStatus,
  propertyTitle
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [settlementDate, setSettlementDate] = useState('');
  const [commissionRate, setCommissionRate] = useState<number>(3);
  const [solicitorName, setSolicitorName] = useState('');
  const [solicitorEmail, setSolicitorEmail] = useState('');

  if (!isOpen) return null;

  const getStatusDisplayName = (status: string | null) => {
    switch (status) {
      case 'contract-exchanged': return 'Contract Exchanged';
      case 'unconditional': return 'Unconditional';
      case 'settled': return 'Settled';
      default: return 'No Status';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'contract-exchanged':
        return 'Contracts have been exchanged between buyer and seller. The sale is now legally binding.';
      case 'unconditional':
        return 'All conditions have been met and the sale is now unconditional. Settlement can proceed.';
      case 'settled':
        return 'Settlement has been completed. Ownership has transferred and commission invoice will be generated.';
      default:
        return '';
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const details: StatusChangeDetails = {
        changeReason: changeReason.trim() || undefined
      };

      if (newStatus === 'settled') {
        details.settlementDetails = {
          settlementDate: settlementDate || undefined,
          commissionRate: commissionRate !== 3 ? commissionRate : undefined,
          solicitorName: solicitorName.trim() || undefined,
          solicitorEmail: solicitorEmail.trim() || undefined
        };
      }

      await onConfirm(details);
      onClose();
    } catch (error) {
      console.error('Status change confirmation failed:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Confirm Status Change
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isConfirming}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Property Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Property</h3>
            <p className="text-gray-700">{propertyTitle}</p>
          </div>

          {/* Status Change Summary */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Status Change</h3>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="text-sm text-gray-600">From</div>
                <div className="font-medium">{getStatusDisplayName(currentStatus)}</div>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600">To</div>
                <div className="font-medium text-green-600">{getStatusDisplayName(newStatus)}</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
              {getStatusDescription(newStatus)}
            </p>
          </div>

          {/* Change Reason */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Reason for Change (Optional)
            </label>
            <textarea
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="e.g., Documents signed, conditions met, settlement completed..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              rows={3}
              maxLength={500}
              disabled={isConfirming}
            />
            <div className="text-xs text-gray-500 text-right">
              {changeReason.length}/500 characters
            </div>
          </div>

          {/* Settlement Details (only for 'settled' status) */}
          {newStatus === 'settled' && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-medium text-gray-900">Settlement Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Settlement Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Settlement Date
                  </label>
                  <input
                    type="date"
                    value={settlementDate}
                    onChange={(e) => setSettlementDate(e.target.value)}
                    min={today}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={isConfirming}
                  />
                </div>

                {/* Commission Rate */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={isConfirming}
                  />
                </div>

                {/* Solicitor Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Solicitor Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={solicitorName}
                    onChange={(e) => setSolicitorName(e.target.value)}
                    placeholder="Solicitor handling settlement"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={isConfirming}
                  />
                </div>

                {/* Solicitor Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Solicitor Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={solicitorEmail}
                    onChange={(e) => setSolicitorEmail(e.target.value)}
                    placeholder="solicitor@lawfirm.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={isConfirming}
                  />
                </div>
              </div>

              {/* Invoice Notice */}
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-green-800">
                      Invoice Generation
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      A commission invoice will be automatically generated and sent to the seller once settlement is confirmed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
            disabled={isConfirming}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="primary"
            className="flex-1"
            disabled={isConfirming}
          >
            {isConfirming ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </div>
            ) : (
              `Update to ${getStatusDisplayName(newStatus)}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeConfirmDialog;