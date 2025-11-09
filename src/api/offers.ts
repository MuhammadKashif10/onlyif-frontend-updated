import { USE_MOCKS, withMockFallback } from '@/utils/mockWrapper';
import { request } from '@/utils/api';

// Define the missing types
export interface OfferRequest {
  propertyId: string;
  buyerId: string;
  agentId: string;
  offerAmount: number;
  earnestMoney: number;
  closingDate: string;
  inspectionPeriod: number;
  financingType: string;
  contingencies: string[];
  notes?: string;
}

export interface OfferResponse {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  agentId: string;
  agentName: string;
  offerAmount: number;
  listingPrice: number;
  earnestMoney: number;
  closingDate: string;
  inspectionPeriod: number;
  financingType: string;
  contingencies: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offered' | 'expired';
  submittedAt: string;
  expiresAt: string;
  notes?: string;
  counterOffers: any[];
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock offers data - removed all mock agents
const mockOffers: OfferResponse[] = [];

export const offersApi = {
  // Get all offers for a property
  async getOffersByProperty(propertyId: string) {
    return withMockFallback(
      // Mock implementation
      async () => {
        await delay(500);
        return mockOffers.filter(offer => offer.propertyId === propertyId)
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      },
      // Real API call
      async () => {
        const response = await request(`/offers/property/${propertyId}`);
        return response.data;
      }
    );
  },

  // Get offers by buyer
  async getOffersByBuyer(buyerId: string) {
    return withMockFallback(
      // Mock implementation
      async () => {
        await delay(400);
        return mockOffers.filter(offer => offer.buyerId === buyerId)
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      },
      // Real API call
      async () => {
        const response = await request(`/offers/buyer/${buyerId}`);
        return response.data;
      }
    );
  },

  // Get offers by agent
  async getOffersByAgent(agentId: string) {
    return withMockFallback(
      // Mock implementation
      async () => {
        await delay(450);
        return mockOffers.filter(offer => offer.agentId === agentId)
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      },
      // Real API call
      async () => {
        const response = await request(`/offers/agent/${agentId}`);
        return response.data;
      }
    );
  },

  // Submit a new offer
  async submitOffer(offerData: any) {
    return withMockFallback(
      // Mock implementation
      async () => {
        await delay(800);
        const newOffer = {
          id: `offer-${Date.now()}`,
          ...offerData,
          status: 'pending',
          submittedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
          counterOffers: []
        };
        mockOffers.push(newOffer);
        return newOffer;
      },
      // Real API call
      async () => {
        const response = await request('/offers', {
          method: 'POST',
          body: JSON.stringify(offerData)
        });
        return response.data;
      }
    );
  },

  // Update offer status
  async updateOfferStatus(offerId: string, status: string, notes?: string) {
    return withMockFallback(
      // Mock implementation
      async () => {
        await delay(400);
        const offer = mockOffers.find(o => o.id === offerId);
        if (!offer) {
          throw new Error('Offer not found');
        }
        offer.status = status;
        if (notes) {
          offer.notes = notes;
        }
        return offer;
      },
      // Real API call
      async () => {
        const response = await request(`/offers/${offerId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status, notes })
        });
        return response.data;
      }
    );
  },

  // Submit counter offer
  submitCounterOffer: async (offerId: string, counterOfferData: any) => {
    return withMockFallback(
      // Real API call
      async () => {
        const response = await apiClient.post(`/offers/${offerId}/counter`, counterOfferData);
        return response.data;
      },
      // Mock implementation
      async () => {
        await delay(1000);
        const offer = mockOffers.find(o => o.id === offerId);
        if (!offer) {
          throw new Error('Offer not found');
        }
        const counterOffer = {
          id: `counter-${Date.now()}` ,
          amount: counterOfferData.amount,
          submittedAt: new Date().toISOString(),
          status: 'pending'
        };
        offer.counterOffers.push(counterOffer);
        return counterOffer;
      }
    );
  },

  submitOfferRequest: async (offerData: OfferRequestData) => {
    return withMockFallback(
      // Real API call
      async () => {
        const response = await apiClient.post('/offers/submit', offerData);
        return response.data;
      },
      // Mock implementation
      async () => {
        await delay(1500);
        const estimatedValue = Math.floor(Math.random() * (500000 - 200000 + 1)) + 200000;
        return {
          success: true,
          offerId: `OFF-${Date.now()}` ,
          estimatedValue,
          message: 'Your cash offer request has been submitted successfully.',
          nextSteps: 'Proceed to schedule an inspection.'
        };
      }
    );
  },

  // Add implementations for other functions here, following the same pattern
  getOfferById: async (offerId: string) => {
    return withMockFallback(
      // Mock implementation
      async () => {
        await delay(500);
        return mockOffers.filter(offer => offer.propertyId === propertyId)
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      },
      // Real API call
      async () => {
        const response = await request(`/offers/property/${propertyId}`);
        return response.data;
      }
    );
  },
  // Continue for scheduleInspection, acceptOffer, etc.

};
