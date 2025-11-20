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

// Reusable helper for query params
const buildQueryString = (params: Record<string, any>) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  const qs = queryParams.toString();
  return qs ? `?${qs}` : '';
};

export const agentsApi = {

  // -----------------------
  // GET PAGINATED AGENTS
  // -----------------------
  async getAgents(params: AgentSearchParams = {}): Promise<PaginatedResponse<Agent>> {
    try {
      const query = buildQueryString(params);
      const response = await apiClient.get(`/agents${query}`);
      return response.data; // FIXED: Safe return
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw new Error('Failed to fetch agents');
    }
  },

  // -----------------------
  // GET SINGLE AGENT
  // -----------------------
  async getAgentById(id: string): Promise<Agent> {
    try {
      const response = await apiClient.get(`/agents/${id}`);
      return response.data.data; // FIXED: data path consistent
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw new Error('Failed to fetch agent details');
    }
  },

  // -----------------------
  // TOP AGENTS
  // -----------------------
  async getTopAgents(limit: number = 6): Promise<Agent[]> {
    try {
      const result = await this.getAgents({
        limit,
        sortBy: 'rating',
        sortOrder: 'desc'
      });

      return result.data; // FIXED: correct return type
    } catch (error) {
      console.error('Error fetching top agents:', error);
      throw new Error('Failed to fetch top agents');
    }
  },

  // -----------------------
  // SEARCH AGENTS
  // -----------------------
  async searchAgents(params: AgentSearchParams): Promise<PaginatedResponse<Agent>> {
    try {
      const response = await apiClient.post('/agents/search', params);
      return response.data;
    } catch (error) {
      console.error('Error searching agents:', error);
      throw new Error('Failed to search agents');
    }
  },

  // -----------------------
  // GET AGENTS BY AREA
  // -----------------------
  async getAgentsByArea(city: string, state: string, params: Partial<AgentSearchParams> = {}) {
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

  // -----------------------
  // GET PROPERTIES BY AGENT
  // -----------------------
  async getAgentProperties(agentId: string, params: any = {}): Promise<any> {
    try {
      const query = buildQueryString(params);
      const response = await apiClient.get(`/agents/${agentId}/properties${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent properties:', error);
      throw new Error('Failed to fetch agent properties');
    }
  },

  // -----------------------
  // UPDATE AGENT PROFILE
  // -----------------------
  async updateAgentProfile(agentId: string, profileData: Partial<Agent>): Promise<Agent> {
    try {
      const response = await apiClient.put(`/agents/${agentId}`, profileData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating agent profile:', error);
      throw new Error('Failed to update agent profile');
    }
  },

  // -----------------------
  // UPLOAD AVATAR
  // -----------------------
  async uploadAgentAvatar(agentId: string, avatar: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('avatar', avatar);

      const response = await apiClient.post(
        `/agents/${agentId}/avatar`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      return response.data.data.avatarUrl;
    } catch (error) {
      console.error('Error uploading agent avatar:', error);
      throw new Error('Failed to upload agent avatar');
    }
  },

  // -----------------------
  // AGENT STATS
  // -----------------------
  async getAgentStats(agentId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/agents/${agentId}/stats`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching agent stats:', error);
      throw new Error('Failed to fetch agent statistics');
    }
  },

  async getGeneralStats(): Promise<any> {
    try {
      const response = await apiClient.get('/agents/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching general agent stats:', error);
      throw new Error('Failed to fetch general agent statistics');
    }
  },

  // -----------------------
  // AGENT REVIEWS
  // -----------------------
  async getAgentReviews(agentId: string, params: any = {}): Promise<any> {
    try {
      const query = buildQueryString(params);
      const response = await apiClient.get(`/agents/${agentId}/reviews${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent reviews:', error);
      throw new Error('Failed to fetch agent reviews');
    }
  },

  async addAgentReview(agentId: string, reviewData: any): Promise<any> {
    try {
      const response = await apiClient.post(`/agents/${agentId}/reviews`, reviewData);
      return response.data.data;
    } catch (error) {
      console.error('Error adding agent review:', error);
      throw new Error('Failed to add agent review');
    }
  },

  // -----------------------
  // CONTACT AGENT
  // -----------------------
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

// Named export
export const getAgents = agentsApi.getAgents;
export default agentsApi;
