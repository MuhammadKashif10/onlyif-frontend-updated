// Single source of truth for mock configuration
export const USE_MOCKS = false;

// Mock fallback wrapper - uses real API when USE_MOCKS is false
export async function withMockFallback<T>(
  mockImplementation: () => Promise<T>,
  realApiCall: () => Promise<T>
): Promise<T> {
  if (USE_MOCKS) {
    console.log('🎭 Using MOCK implementation');
    return mockImplementation();
  } else {
    console.log('🌐 Using REAL API call');
    return realApiCall();
  }
}

// Database-only wrapper functions
export async function withDatabaseOnly<T>(apiCall: () => Promise<T>): Promise<T> {
  console.log('🔄 Making database-only API call');
  try {
    const result = await apiCall();
    console.log('✅ Database API call successful');
    return result;
  } catch (error) {
    console.error('❌ Database API call failed:', error);
    throw error;
  }
}

export function withDatabaseOnlySync<T>(apiCall: () => T): T {
  console.log('🔄 Making synchronous database-only call');
  try {
    const result = apiCall();
    console.log('✅ Synchronous database call successful');
    return result;
  } catch (error) {
    console.error('❌ Synchronous database call failed:', error);
    throw error;
  }
}