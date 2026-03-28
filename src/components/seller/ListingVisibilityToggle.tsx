'use client';

import React, { useState } from 'react';
import { Toggle, Modal, Button, Alert } from '@/components/reusable';
import { updateListingVisibility } from '@/api/listingVisibility';
import { useUI } from '@/context/UIContext';

interface ListingVisibilityToggleProps {
  listing: {
    id: string;
    status: 'pending' | 'private' | 'public' | 'sold';
    canChangeVisibility: boolean;
    address: string;
  };
  onStatusChange: (newStatus: 'private' | 'public') => void;
  disabled?: boolean;
}

const ListingVisibilityToggle: React.FC<ListingVisibilityToggleProps> = ({
  listing,
  onStatusChange,
  disabled = false
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'private' | 'public' | null>(null);
  const [updating, setUpdating] = useState(false);
  const { addNotification } = useUI();

  const handleToggleClick = (enabled: boolean) => {
    const newStatus = enabled ? 'public' : 'private';
    setPendingStatus(newStatus);
    setShowConfirmModal(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;

    setUpdating(true);
    try {
      const result = await updateListingVisibility(listing.id, { status: pendingStatus });
      
      if (result.success) {
        onStatusChange(pendingStatus);
        addNotification({
          type: 'success',
          message: `Listing is now ${pendingStatus}`,
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to update listing visibility. Please try again.',
      });
    } finally {
      setUpdating(false);
      setShowConfirmModal(false);
      setPendingStatus(null);
    }
  };

  if (listing.status === 'pending' || listing.status === 'sold') {
    return (
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Visibility</p>
            <p className="text-xs text-gray-500">
              {listing.status === 'pending' ? 'Awaiting approval' : 'Listing sold'}
            </p>
          </div>
          <div className="text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Visibility</p>
            <p className="text-xs text-gray-500">
              {listing.status === 'public' ? 'Visible in search results' : 'Hidden from search'}
            </p>
          </div>
          <Toggle
            enabled={listing.status === 'public'}
            onChange={handleToggleClick}
            disabled={!listing.canChangeVisibility || disabled || updating}
            size="md"
          />
        </div>
        {!listing.canChangeVisibility && (
          <Alert
            type="warning"
            message="Listing must be approved before changing visibility"
            className="mt-2"
          />
        )}
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Visibility Change"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to make this listing <strong>{pendingStatus}</strong>?
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-1">
              {pendingStatus === 'public' ? 'Public Listing' : 'Private Listing'}
            </h4>
            <p className="text-sm text-blue-700">
              {pendingStatus === 'public'
                ? 'Your listing will appear in search results but remain locked until buyers unlock it.'
                : 'Your listing will be hidden from search results and only visible to buyers who have already unlocked it.'}
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
              disabled={updating}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {updating ? 'Updating...' : `Make ${pendingStatus}`}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ListingVisibilityToggle;