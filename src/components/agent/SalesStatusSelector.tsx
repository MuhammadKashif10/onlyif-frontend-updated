'use client';
import { useState } from 'react';
import StatusChangeConfirmDialog from './StatusChangeConfirmDialog';

interface SalesStatusSelectorProps {
  propertyId: string;
  propertyTitle: string;
  currentStatus: string | null;
  onStatusUpdate: (propertyId: string, newStatus: string, details?: any) => Promise<void>;
  disabled?: boolean;
}

const SalesStatusSelector: React.FC<SalesStatusSelectorProps> = ({
  propertyId,
  propertyTitle,
  currentStatus,
  onStatusUpdate,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(currentStatus);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>('');

  const statusOptions = [
    { value: '', label: 'Select Status', disabled: true },
    { value: 'contract-exchanged', label: 'Contract Exchanged', disabled: false },
    { value: 'unconditional', label: 'Unconditional', disabled: false },
    { value: 'settled', label: 'Settled', disabled: false }
  ];

  const getStatusDisplayName = (status: string | null) => {
    switch (status) {
      case 'contract-exchanged':
        return 'Contract Exchanged';
      case 'unconditional':
        return 'Unconditional';
      case 'settled':
        return 'Settled';
      default:
        return 'No Status Set';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'contract-exchanged':
        return 'bg-yellow-100 text-yellow-800';
      case 'unconditional':
        return 'bg-blue-100 text-blue-800';
      case 'settled':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleStatusChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value;
    // Compare against local state to avoid redundant updates when already set
    if (!newStatus || newStatus === localStatus) return;

    setIsLoading(true);
    try {
      await onStatusUpdate(propertyId, newStatus);
      setLocalStatus(newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
      // Reset to previous value on error
      event.target.value = localStatus || '';
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmStatusChange = async (details: any) => {
    setIsLoading(true);
    setShowConfirmDialog(false);
    
    try {
      await onStatusUpdate(propertyId, pendingStatus, details);
      setLocalStatus(pendingStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
      // The error will be handled by the parent component and shown in toast
    } finally {
      setIsLoading(false);
      setPendingStatus('');
    }
  };

  const handleCancelStatusChange = () => {
    setShowConfirmDialog(false);
    setPendingStatus('');
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Sales Status:</span>
          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(localStatus)}`}>
            {getStatusDisplayName(localStatus)}
          </span>
        </div>
        
        <div className="relative">
          <select
            value={localStatus || ''}
            onChange={handleStatusChange}
            disabled={disabled || isLoading}
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              disabled || isLoading
                ? 'bg-gray-100 cursor-not-allowed'
                : 'bg-white hover:border-gray-400'
            }`}
          >
            {statusOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={option.disabled ? 'text-gray-400' : ''}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {isLoading && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            </div>
          )}
        </div>
        
        {localStatus === 'settled' && (
          <div className="flex items-center space-x-2 text-xs text-green-600 font-medium">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Invoice generated automatically</span>
          </div>
        )}
        
        {isLoading && (
          <div className="text-xs text-blue-600 font-medium flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span>Updating status...</span>
          </div>
        )}
      </div>
      
      {/* Professional Confirmation Dialog - Temporarily disabled for testing */}
      {/* 
      <StatusChangeConfirmDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelStatusChange}
        onConfirm={handleConfirmStatusChange}
        currentStatus={localStatus}
        newStatus={pendingStatus}
        propertyTitle={propertyTitle}
      />
      */}
    </>
  );
};

export default SalesStatusSelector;