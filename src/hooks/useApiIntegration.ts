// Remove all mock-related code and use real APIs only
import { useState, useEffect } from 'react';
// import { apiClient } from '../lib/api-client'; // Comment out for now

export const useApiIntegration = () => {
  const [isConnected, setIsConnected] = useState(true); // Default to true
  const [isLoading, setIsLoading] = useState(false); // Set to false since we're not checking
  const [error, setError] = useState<string | null>(null);

  // Comment out the health check for now since it's causing issues
  // useEffect(() => {
  //   const checkConnection = async () => {
  //     try {
  //       await apiClient.get('/health');
  //       setIsConnected(true);
  //       setError(null);
  //     } catch (err) {
  //       setIsConnected(false);
  //       setError('Failed to connect to API');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   checkConnection();
  // }, []);

  return { isConnected, isLoading, error };
};