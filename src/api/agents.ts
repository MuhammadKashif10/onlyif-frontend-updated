import { apiClient } from '../lib/api-client';
import { Agent, PaginatedResponse } from '../types/api';

interface AgentSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  state?: string;
  specialization?: string;
  minExperience?: number;
  maxExperience?: number;
  rating?: number;
  sortBy?: 'name' | 'experience' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Remove all mock data and implement real API calls
export const agentsApi = {
  // Get paginated agents with filters
  async getAgents(params: AgentSearchParams = {}): Promise<PaginatedResponse<Agent>> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await apiClient.get(`/agents?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw new Error('Failed to fetch agents');
    }
  },

  // Get single agent by ID
  async getAgentById(id: string): Promise<Agent> {
    try {
      const response = await apiClient.get(`/agents/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw new Error('Failed to fetch agent details');
    }
  },

  // Get top-rated agents
  async getTopAgents(limit: number = 6): Promise<Agent[]> {
    try {
      const response = await this.getAgents({
        limit,
        sortBy: 'rating',
        sortOrder: 'desc'
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top agents:', error);
      throw new Error('Failed to fetch top agents');
    }
  },

  // Search agents by location and specialization
  async searchAgents(params: AgentSearchParams): Promise<PaginatedResponse<Agent>> {
    try {
      const response = await apiClient.post('/agents/search', params);
      return response.data;
    } catch (error) {
      console.error('Error searching agents:', error);
      throw new Error('Failed to search agents');
    }
  },

  // Get agents in specific area
  async getAgentsByArea(city: string, state: string, params: Partial<AgentSearchParams> = {}): Promise<PaginatedResponse<Agent>> {
    try {
      return await this.getAgents({
        ...params,
        city,
        state
      });
    } catch (error) {
      console.error('Error fetching agents by area:', error);
      throw new Error('Failed to fetch agents in area');
    }
  },

  // Get agent's properties
  async getAgentProperties(agentId: string, params: any = {}): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await apiClient.get(`/agents/${agentId}/properties?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent properties:', error);
      throw new Error('Failed to fetch agent properties');
    }
  },

  // Update agent profile
  async updateAgentProfile(agentId: string, profileData: Partial<Agent>): Promise<Agent> {
    try {
      const response = await apiClient.put(`/agents/${agentId}`, profileData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating agent profile:', error);
      throw new Error('Failed to update agent profile');
    }
  },

  // Upload agent avatar
  async uploadAgentAvatar(agentId: string, avatar: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('avatar', avatar);
      
      const response = await apiClient.post(
        `/agents/${agentId}/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data.data.avatarUrl;
    } catch (error) {
      console.error('Error uploading agent avatar:', error);
      throw new Error('Failed to upload agent avatar');
    }
  },

  // Get agent statistics
  async getAgentStats(agentId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/agents/${agentId}/stats`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching agent stats:', error);
      throw new Error('Failed to fetch agent statistics');
    }
  },

  // Add new method for general agent statistics
  async getGeneralStats(): Promise<any> {
    try {
      const response = await apiClient.get('/agents/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching general agent stats:', error);
      throw new Error('Failed to fetch general agent statistics');
    }
  },

  // Get agent reviews
  async getAgentReviews(agentId: string, params: any = {}): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await apiClient.get(`/agents/${agentId}/reviews?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent reviews:', error);
      throw new Error('Failed to fetch agent reviews');
    }
  },

  // Add agent review
  async addAgentReview(agentId: string, reviewData: any): Promise<any> {
    try {
      const response = await apiClient.post(`/agents/${agentId}/reviews`, reviewData);
      return response.data.data;
    } catch (error) {
      console.error('Error adding agent review:', error);
      throw new Error('Failed to add agent review');
    }
  },

  // Contact agent
  async contactAgent(agentId: string, contactData: any): Promise<any> {
    try {
      const response = await apiClient.post(`/agents/${agentId}/contact`, contactData);
      return response.data.data;
    } catch (error) {
      console.error('Error contacting agent:', error);
      throw new Error('Failed to contact agent');
    }
  }
};

// Add named export for getAgents function
export const getAgents = agentsApi.getAgents;

export default agentsApi;
