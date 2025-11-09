import { apiClient } from '../lib/api-client';

export interface Addon {
  id: string;
  type: 'photo' | 'floorplan' | 'drone' | 'walkthrough';
  title: string;
  price: number;
  features: string[];
  image: string;
  status: 'active' | 'inactive';
}

// Mock data for development
const mockAddons: Addon[] = [
  {
    id: 'professional-photography',
    type: 'photo',
    title: 'Professional Photography',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&h=300&q=80',
    features: [
      'Professional photographer',
      'HDR photography',
      'Interior & exterior shots',
      'Same-day delivery',
      'High-resolution images'
    ],
    status: 'active'
  },
  {
    id: 'floorplan',
    type: 'floorplan',
    title: 'Floorplan',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&h=300&q=80',
    features: [
      'Detailed floor plan',
      'Room measurements',
      'High-resolution PDF',
      '2-3 day delivery',
      'Multiple format options'
    ],
    status: 'active'
  },
  {
    id: 'drone-footage',
    type: 'drone',
    title: 'Drone Footage',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=400&h=300&q=80',
    features: [
      'Aerial photography',
      'HD video footage',
      'Multiple angles',
      'Weather-dependent scheduling',
      'Neighborhood overview'
    ],
    status: 'active'
  },
  {
    id: 'guided-video-walkthrough',
    type: 'walkthrough',
    title: 'Guided Video Walkthrough',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=400&h=300&q=80',
    features: [
      'Professional videography',
      'Guided narration',
      'Multiple room coverage',
      'Mobile-friendly viewing',
      'Virtual staging options'
    ],
    status: 'active'
  }
];

export const addonsApi = {
  // Get available add-ons
  async getAddons(): Promise<Addon[]> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock data for now
      return mockAddons;
      
      // Uncomment below for real API call
      // const response = await apiClient.get('/addons');
      // return response.data;
    } catch (error) {
      console.error('Error fetching add-ons:', error);
      throw new Error('Failed to fetch add-ons');
    }
  },

  // Purchase add-on
  async purchaseAddon(addonId: string, propertyId: string) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock success response
      return {
        success: true,
        message: 'Add-on purchased successfully',
        addonId,
        propertyId,
        purchaseDate: new Date().toISOString()
      };
      
      // Uncomment below for real API call
      // const response = await apiClient.post(`/addons/${addonId}/purchase`, {
      //   propertyId
      // });
      // return response.data;
    } catch (error) {
      console.error('Error purchasing add-on:', error);
      throw new Error('Failed to purchase add-on');
    }
  }
};