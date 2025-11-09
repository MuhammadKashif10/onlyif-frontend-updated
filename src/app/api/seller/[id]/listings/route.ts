import { NextRequest, NextResponse } from 'next/server';

// GET /api/seller/:id/listings - Get seller's listings
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sellerId = params.id;
    
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

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status');

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (status) queryParams.append('status', status);

    // Forward request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/sellers/${sellerId}/listings?${queryParams}`;
    
    console.log('🔗 Fetching seller listings from backend:', backendUrl);
    console.log('👤 Seller ID:', sellerId);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
          error: 'Access forbidden - You can only view your own listings',
          data: []
        }, { status: 403 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch listings',
        data: []
      }, { status: response.status });
    }
    
    const data = await response.json();
    console.log('✅ Backend response data:', data);
    
    // Return the data from backend
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