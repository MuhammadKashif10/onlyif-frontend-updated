import { apiClient } from '../lib/api-client';

export interface CashOfferRequest {
  address: string;
  zipCode: string;
  name: string;
  email: string;
  phone?: string;
}

export interface CashOfferResponse {
  offerId: string;
  estimatedValue: number;
  offerAmount: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  estimatedClosingDate: string;
  message: string;
  nextSteps: string[];
}

export const cashOffersApi = {
  // Submit cash offer request
  async submitCashOffer(data: CashOfferRequest): Promise<CashOfferResponse> {
    try {
      const response = await apiClient.post('/cash-offers', data);
      return response.data;
    } catch (error) {
      console.error('Error submitting cash offer:', error);
      throw new Error('Failed to submit cash offer request');
    }
  },

  // Get cash offer by ID
  async getCashOfferById(offerId: string) {
    try {
      const response = await apiClient.get(`/cash-offers/${offerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cash offer:', error);
      throw new Error('Failed to fetch cash offer');
    }
  },

  // Schedule inspection for cash offer
  async scheduleInspection(offerId: string, inspectionDate: string, timeSlot: string) {
    try {
      const response = await apiClient.put(`/cash-offers/${offerId}/schedule-inspection`, {
        inspectionDate,
        timeSlot
      });
      return response.data;
    } catch (error) {
      console.error('Error scheduling inspection:', error);
      throw new Error('Failed to schedule inspection');
    }
  }
};