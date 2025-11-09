import { apiClient } from '../lib/api-client';

export interface InspectionRequest {
  propertyId: string;
  datetime: string;
  inspector: {
    name: string;
    phone?: string;
    email?: string;
    company?: string;
  };
  notes?: string;
}

export const inspectionsApi = {
  // Schedule inspection
  async scheduleInspection(data: InspectionRequest) {
    try {
      const response = await apiClient.post('/inspections/schedule', data);
      return response.data;
    } catch (error) {
      console.error('Error scheduling inspection:', error);
      throw new Error('Failed to schedule inspection');
    }
  },

  // Get inspections for seller
  async getSellerInspections(sellerId: string) {
    try {
      const response = await apiClient.get(`/seller/${sellerId}/inspections`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inspections:', error);
      throw new Error('Failed to fetch inspections');
    }
  }
};