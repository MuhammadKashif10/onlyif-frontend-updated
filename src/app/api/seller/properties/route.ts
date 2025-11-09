import { NextRequest, NextResponse } from 'next/server';

// GET /api/seller/properties - Get seller's properties
export async function GET(request: NextRequest) {
  try {
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Access denied. No token provided.',
        data: []
      }, { status: 401 });
    }

    // Extract token
    const token = authHeader.substring(7);
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Access denied. Token is empty.',
        data: []
      }, { status: 401 });
    }

    // Get sellerId from query params
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');

    // Forward request to backend with authorization header and seller ID
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/sellers/properties`;
    
    console.log('🔗 Fetching seller properties from backend:', backendUrl);
    console.log('👤 Seller ID:', sellerId);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        // Pass seller ID to backend for additional validation
        'X-Seller-Id': sellerId || '',
      },
      cache: 'no-store',
    });
    
    console.log('📡 Backend response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Backend API error:', response.status, response.statusText);
      
      if (response.status === 401) {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized access',
          data: []
        }, { status: 401 });
      }
      
      if (response.status === 403) {
        return NextResponse.json({
          success: false,
          error: 'Access forbidden - Only sellers can access this endpoint',
          data: []
        }, { status: 403 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch properties',
        data: []
      }, { status: response.status });
    }
    
    const data = await response.json();
    console.log('✅ Backend response data:', data);
    
    // Return the data from backend (already filtered by seller ID)
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ API route error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      data: []
    }, { status: 500 });
  }
}