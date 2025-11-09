class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    // Point directly to backend server
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Automatic JWT token handling with browser check
  private getAuthHeaders(): Record<string, string> {
    // Check if we're in the browser environment and use localStorage instead of sessionStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      return token ? { ...this.defaultHeaders, Authorization: `Bearer ${token}` } : this.defaultHeaders;
    }
    return this.defaultHeaders;
  }

  // Retry logic with exponential backoff for 429 errors
  private async retryRequest<T>(endpoint: string, options: RequestInit, maxRetries: number = 3): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.makeRequest<T>(endpoint, options);
      } catch (error: any) {
        if (error.status === 429 && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`Rate limited. Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }

  // Standardized request method with error handling
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.retryRequest<T>(endpoint, options);
  }

  // Actual request implementation (renamed from request)
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const headers: Record<string, any> = {
        ...this.defaultHeaders,
        ...this.getAuthHeaders(),
        ...options.headers,
      };

      // If sending FormData, let the browser set the Content-Type (boundary)
      const isFormData = (typeof FormData !== 'undefined') && (options.body instanceof FormData);
      if (isFormData && headers['Content-Type']) {
        delete headers['Content-Type'];
      }
  
      // Handle Next.js API routes (start with /api/) vs backend routes
      const fullUrl = endpoint.startsWith('/api/') 
        ? endpoint // Use relative path for Next.js API routes
        : `${this.baseURL}${endpoint}`; // Use full URL for backend routes
      console.log('🌐 Making request to:', fullUrl);
      
      const response = await fetch(fullUrl, {
        ...options,
        headers,
      });
  
      console.log('📡 Response status:', response.status, response.statusText);
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('❌ Failed to parse JSON response:', jsonError);
        data = {};
      }
  
      if (!response.ok) {
        // For 404s on buyer endpoints, return empty data instead of throwing
        if (response.status === 404 && endpoint.includes('/buyer/')) {
          console.debug(`Expected 404 for buyer endpoint: ${endpoint} - returning empty data`);
          
          // Return appropriate empty response based on endpoint
          if (endpoint.includes('/stats')) {
            return { savedProperties: 0, viewedProperties: 0, scheduledViewings: 0, activeOffers: 0 } as T;
          } else if (endpoint.includes('/properties') || endpoint.includes('/viewings') || endpoint.includes('/offers') || endpoint.includes('/activity')) {
            return { success: true, data: [], properties: [], viewings: [], offers: [] } as T;
          }
          return { success: true, data: [] } as T;
        }
        
        // Create a more detailed error with status information for other cases
        const error = new Error(data.message || `API request failed with status ${response.status}`);
        (error as any).status = response.status;
        (error as any).statusText = response.statusText;
        (error as any).url = fullUrl;
        
        // console.error(`🚨 API Error: ${error.message}`, { endpoint, status: response.status, url: fullUrl });
        throw error;
      }
  
      // Transform backend response to frontend format
      return this.transformResponse(data);
    } catch (error) {
      // Enhanced error logging
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('🔥 Network Error - Backend might be down or CORS issue:', {
          endpoint,
          baseURL: this.baseURL,
          fullUrl: fullUrl,
          error: error.message
        });
        
        // Create a more descriptive error
        const networkError = new Error(`Network error: Cannot connect to ${fullUrl}. Please check if the server is running.`);
        (networkError as any).isNetworkError = true;
        (networkError as any).endpoint = endpoint;
        throw networkError;
      }
      
      // For 404s on buyer endpoints, return empty data instead of re-throwing
      if ((error as any).status === 404 && endpoint.includes('/buyer/')) {
        console.debug(`Handling 404 for buyer endpoint: ${endpoint} - returning empty data`);
        
        if (endpoint.includes('/stats')) {
          return { savedProperties: 0, viewedProperties: 0, scheduledViewings: 0, activeOffers: 0 } as T;
        } else if (endpoint.includes('/properties') || endpoint.includes('/viewings') || endpoint.includes('/offers') || endpoint.includes('/activity')) {
          return { success: true, data: [], properties: [], viewings: [], offers: [] } as T;
        }
        return { success: true, data: [] } as T;
      }
      
      // Re-throw with additional context for other errors
      if (error instanceof Error) {
        (error as any).endpoint = endpoint;
        console.error(`💥 API Request failed:`, error);
      }
      throw error;
    }
  }

  // Transform backend response format to match frontend expectations
  private transformResponse(data: any): any {
    if (data.success && data.data) {
      // Transform _id to id for all objects
      const transformedData = this.transformIds(data.data);
      return {
        success: data.success,
        data: transformedData,
        message: data.message,
        meta: data.meta // for pagination
      };
    }
    return data;
  }

  // Recursively transform _id to id
  private transformIds(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.transformIds(item));
    }
    if (obj && typeof obj === 'object') {
      const transformed = { ...obj };
      if (transformed._id) {
        transformed.id = transformed._id;
        delete transformed._id;
      }
      Object.keys(transformed).forEach(key => {
        transformed[key] = this.transformIds(transformed[key]);
      });
      return transformed;
    }
    return obj;
  }

  // API Methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const isFormData = (typeof FormData !== 'undefined') && (data instanceof FormData);
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const isFormData = (typeof FormData !== 'undefined') && (data instanceof FormData);
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const isFormData = (typeof FormData !== 'undefined') && (data instanceof FormData);
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Add method for public requests (no authentication required)
  async publicPost<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      method: 'POST',
      headers: this.defaultHeaders, // Use default headers without auth
      body: data ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(url, config);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'API request failed');
    }

    return this.transformResponse(responseData);
  }
}

export const apiClient = new ApiClient();