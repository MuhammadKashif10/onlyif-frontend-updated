import { apiClient } from '../lib/api-client';
import { Property } from '../types/api';

// Seller statistics interface
export interface SellerStats {
  totalOffers: number;
  pendingOffers: number;
  acceptedOffers: number;
  averageOfferValue: number;
  totalProperties: number;
  totalViews: number;
  averagePropertyValue: number;
}

// Analytics interfaces
export interface AnalyticsData {
  totalViews: number;
  totalInquiries: number;
  totalOffers: number;
  averageViewsPerListing: number;
  conversionRate: number;
  topPerformingListing: {
    id: string;
    title: string;
    views: number;
  } | null;
  chartData: ChartData[];
}

export interface ChartData {
  month: string;
  views: number;
  inquiries: number;
  offers: number;
}

const emptyAnalyticsData: AnalyticsData = {
  totalViews: 0,
  totalInquiries: 0,
  totalOffers: 0,
  averageViewsPerListing: 0,
  conversionRate: 0,
  topPerformingListing: null,
  chartData: []
};

const getEmptyAnalyticsData = (): AnalyticsData => ({
  ...emptyAnalyticsData,
  chartData: []
});

const normalizeAnalyticsData = (payload: any): AnalyticsData => {
  const data = payload?.data?.data || payload?.data || payload || {};

  return {
    totalViews: Number(data.totalViews) || 0,
    totalInquiries: Number(data.totalInquiries) || 0,
    totalOffers: Number(data.totalOffers) || 0,
    averageViewsPerListing: Number(data.averageViewsPerListing) || 0,
    conversionRate: Number(data.conversionRate) || 0,
    topPerformingListing: data.topPerformingListing || null,
    chartData: Array.isArray(data.chartData)
      ? data.chartData.map((item: any) => ({
          month: typeof item?.month === 'string' ? item.month : '',
          views: Number(item?.views) || 0,
          inquiries: Number(item?.inquiries) || 0,
          offers: Number(item?.offers) || 0
        }))
      : []
  };
};

const fetchJsonSafely = async (response: Response): Promise<any> => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return {};

  try {
    return await response.json();
  } catch {
    return {};
  }
};

// Seller API functions
export const sellerApi = {
  // Fix route to match backend implementation
  async getSellerOverview(_sellerId?: string): Promise<SellerStats> {
    try {
      // Use the authenticated seller's overview route to avoid id mismatches
      const response = await apiClient.get('/sellers/me/overview');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching seller overview:', error);
      throw new Error('Failed to fetch seller overview');
    }
  },

  // New analytics endpoint
  async getSellerAnalytics(sellerId: string, timeRange: string = '6months'): Promise<AnalyticsData> {
    try {
      if (!sellerId) {
        return getEmptyAnalyticsData();
      }

      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(
        `${baseUrl}/sellers/${sellerId}/analytics?timeRange=${encodeURIComponent(timeRange)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        return getEmptyAnalyticsData();
      }

      const payload = await fetchJsonSafely(response);
      return normalizeAnalyticsData(payload);
    } catch {
      return getEmptyAnalyticsData();
    }
  },

  async getSellerListings(_sellerId: string, params?: { page?: number; limit?: number; status?: string }): Promise<{ data: Property[]; meta: any }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      
      const qs = queryParams.toString();
      const response = await apiClient.get(`/sellers/me/listings${qs ? `?${qs}` : ''}`);
      
      return {
        data: response.data || [],
        meta: response.meta || {}
      };
    } catch (error) {
      console.error('Error fetching seller listings:', error);
      throw new Error('Failed to fetch seller listings');
    }
  },

  // Add a method specifically for getting seller properties (filtered by seller ID)
  async getProperties(params: { sellerId: string }): Promise<{ data: Property[]; meta: any }> {
    try {
      const response = await apiClient.get(`/sellers/properties?sellerId=${params.sellerId}`);
      return {
        data: response.data.data || response.data.properties || response.data || [],
        meta: response.data.meta || {}
      };
    } catch (error) {
      console.error('Error fetching seller properties:', error);
      throw new Error('Failed to fetch seller properties');
    }
  },
};

export default sellerApi;

export async function getSellerListings(_sellerId: string) {
  try {
    const response = await apiClient.get('/sellers/me/listings');
    // Directly return the array of properties
    return response.data.data;
  } catch (error) {
    console.error("Error fetching seller listings:", error);
    throw error;
  }
}
