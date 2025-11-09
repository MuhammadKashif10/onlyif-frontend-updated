import { API_ENDPOINTS } from '@/utils/constants';
import { request } from '@/utils/api';

export interface ListingVisibilityData {
  propertyId: string;
  status: 'pending' | 'private' | 'public';
  hasRequiredMedia: boolean;
  isAdminApproved: boolean;
  canChangeVisibility: boolean;
  lastUpdated: string;
}

export interface VisibilityUpdateRequest {
  status: 'private' | 'public';
}

export interface AdminApprovalRequest {
  approved: boolean;
  reason?: string;
}

// Get listing visibility status
export const getListingVisibility = async (propertyId: string): Promise<ListingVisibilityData> => {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        propertyId,
        status: 'public',
        hasRequiredMedia: true,
        isAdminApproved: true,
        canChangeVisibility: true,
        lastUpdated: new Date().toISOString(),
      });
    }, 500);
  });
};

// Update listing visibility (seller action)
export const updateListingVisibility = async (
  propertyId: string,
  data: VisibilityUpdateRequest
): Promise<{ success: boolean; message: string }> => {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Listing visibility updated to ${data.status}`,
      });
    }, 1000);
  });
};

// Admin approve/reject listing
export const adminApproveListing = async (
  propertyId: string,
  data: AdminApprovalRequest
): Promise<{ success: boolean; message: string }> => {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: data.approved ? 'Listing approved successfully' : 'Listing rejected',
      });
    }, 1000);
  });
};

// Check if listing has required media
export const checkRequiredMedia = async (propertyId: string): Promise<{
  hasRequiredMedia: boolean;
  missingItems: string[];
}> => {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        hasRequiredMedia: true,
        missingItems: [],
      });
    }, 500);
  });
};