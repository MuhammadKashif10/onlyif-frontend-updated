import { propertiesApi } from '@/api/properties';
import { testimonialsApi } from '@/api/testimonials';
import { Property, Testimonial, FilterOptions, PaginationOptions, SearchOptions } from '@/types/api';

export class DataService {
  // Replace all static mock data with API calls
  static async getProperties(filters?: FilterOptions, pagination?: PaginationOptions) {
    try {
      const response = await propertiesApi.getProperties({ ...filters, ...pagination });
      return {
        properties: response.data || response.properties || [],
        total: response.meta?.total || response.total || 0,
        page: response.meta?.page || response.page || 1,
        totalPages: response.meta?.totalPages || response.totalPages || 1
      };
    } catch (error) {
      console.error('Error fetching properties:', error);
      return { properties: [], total: 0, page: 1, totalPages: 1 };
    }
  }

  static async getPropertyById(id: string): Promise<Property | null> {
    try {
      const response = await propertiesApi.getPropertyById(id);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  }

  static async getFeaturedProperties(limit: number = 4): Promise<Property[]> {
    try {
      const response = await propertiesApi.getFeaturedProperties(limit);
      return response.data || response || [];
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      return [];
    }
  }

  static async searchProperties(options: SearchOptions) {
    try {
      const response = await propertiesApi.searchProperties(options);
      return {
        properties: response.data || response.properties || [],
        total: response.meta?.total || response.total || 0,
        page: response.meta?.page || response.page || 1,
        totalPages: response.meta?.totalPages || response.totalPages || 1
      };
    } catch (error) {
      console.error('Error searching properties:', error);
      return { properties: [], total: 0, page: 1, totalPages: 1 };
    }
  }

  static async getTestimonials(limit?: number): Promise<Testimonial[]> {
    try {
      const response = await testimonialsApi.getTestimonials(limit);
      return response.data || response || [];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  }

  // Remove all other mock data methods and replace with real API calls
}
