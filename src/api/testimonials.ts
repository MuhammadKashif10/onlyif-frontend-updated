import { USE_MOCKS, withDatabaseOnly } from '@/utils/mockWrapper';
import { request } from '@/utils/api';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock testimonials data
const mockTestimonials = [
  {
    id: 'testimonial-1',
    clientName: 'Sarah Mitchell',
    clientLocation: 'Austin, TX',
    agentId: 'agent-1',
    agentName: 'Sarah Johnson',
    propertyId: '1',
    propertyAddress: '123 Main St, Austin, TX',
    rating: 5,
    title: 'Exceptional Service and Expertise',
    content: 'Sarah made our home buying experience incredibly smooth. Her knowledge of the Austin market and attention to detail helped us find the perfect home. Highly recommended!',
    date: '2024-01-15T00:00:00Z',
    verified: true,
    featured: true,
    transactionType: 'purchase',
    propertyType: 'Condo'
  },
  {
    id: 'testimonial-2',
    clientName: 'Michael Rodriguez',
    clientLocation: 'Austin, TX',
    agentId: 'agent-2',
    agentName: 'Michael Chen',
    propertyId: '2',
    propertyAddress: '456 Oak Ave, Austin, TX',
    rating: 5,
    title: 'Professional and Knowledgeable',
    content: 'Michael\'s expertise in luxury properties is unmatched. He guided us through every step of the process and negotiated an excellent deal. We couldn\'t be happier with our new home.',
    date: '2024-01-10T00:00:00Z',
    verified: true,
    featured: true,
    transactionType: 'purchase',
    propertyType: 'Single Family'
  },
  {
    id: 'testimonial-3',
    clientName: 'Jennifer Lee',
    clientLocation: 'Austin, TX',
    agentId: 'agent-3',
    agentName: 'Emily Rodriguez',
    propertyId: '3',
    propertyAddress: '789 Pine St, Austin, TX',
    rating: 4,
    title: 'Great First-Time Buyer Experience',
    content: 'Emily was patient and helpful throughout our first home purchase. She explained everything clearly and made sure we understood each step. Great experience overall!',
    date: '2024-01-05T00:00:00Z',
    verified: true,
    featured: false,
    transactionType: 'purchase',
    propertyType: 'Townhouse'
  },
  {
    id: 'testimonial-4',
    clientName: 'David Thompson',
    clientLocation: 'Austin, TX',
    agentId: 'agent-1',
    agentName: 'Sarah Johnson',
    propertyId: '4',
    propertyAddress: '321 Elm St, Austin, TX',
    rating: 5,
    title: 'Sold Our Home Quickly',
    content: 'Sarah helped us sell our home in just two weeks! Her marketing strategy and pricing advice were spot on. Professional service from start to finish.',
    date: '2023-12-28T00:00:00Z',
    verified: true,
    featured: true,
    transactionType: 'sale',
    propertyType: 'Single Family'
  }
];

export const testimonialsApi = {
  // Get all testimonials
  async getTestimonials(limit?: number) {
    return withDatabaseOnly(async () => {
      await delay(500);
      const testimonials = mockTestimonials
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return limit ? testimonials.slice(0, limit) : testimonials;
    });
  },

  // Get featured testimonials
  async getFeaturedTestimonials(limit: number = 3) {
    return withDatabaseOnly(async () => {
      await delay(400);
      return mockTestimonials
        .filter(t => t.featured)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
    });
  },

  // Get testimonials by agent
  async getTestimonialsByAgent(agentId: string) {
    return withDatabaseOnly(async () => {
      await delay(450);
      return mockTestimonials
        .filter(t => t.agentId === agentId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  },

  // Get testimonial by ID
  async getTestimonialById(id: string) {
    return withDatabaseOnly(async () => {
      await delay(300);
      const testimonial = mockTestimonials.find(t => t.id === id);
      if (!testimonial) {
        throw new Error('Testimonial not found');
      }
      return testimonial;
    });
  },

  // Submit new testimonial
  async submitTestimonial(testimonialData: any) {
    return withDatabaseOnly(async () => {
      await delay(800);
      const newTestimonial = {
        id: `testimonial-${Date.now()}`,
        ...testimonialData,
        date: new Date().toISOString(),
        verified: false,
        featured: false
      };
      mockTestimonials.push(newTestimonial);
      return newTestimonial;
    });
  },

  // Get testimonial statistics
  async getTestimonialStats() {
    return withDatabaseOnly(async () => {
      await delay(300);
      const totalTestimonials = mockTestimonials.length;
      const averageRating = mockTestimonials.reduce((sum, t) => sum + t.rating, 0) / totalTestimonials;
      const verifiedCount = mockTestimonials.filter(t => t.verified).length;
      const featuredCount = mockTestimonials.filter(t => t.featured).length;
      
      return {
        totalTestimonials,
        averageRating: Math.round(averageRating * 10) / 10,
        verifiedCount,
        featuredCount,
        ratingDistribution: {
          5: mockTestimonials.filter(t => t.rating === 5).length,
          4: mockTestimonials.filter(t => t.rating === 4).length,
          3: mockTestimonials.filter(t => t.rating === 3).length,
          2: mockTestimonials.filter(t => t.rating === 2).length,
          1: mockTestimonials.filter(t => t.rating === 1).length
        }
      };
    });
  }
};
