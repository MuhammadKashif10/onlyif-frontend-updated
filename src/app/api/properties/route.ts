import { NextRequest, NextResponse } from 'next/server';

// Single GET handler - Database only, no mock fallbacks
export async function GET(request: NextRequest) {
  console.log('🏠 Properties API GET called - Database only mode');
  
  try {
    const { searchParams } = new URL(request.url);
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/properties?${searchParams.toString()}`;
    
    console.log('🔗 Fetching from backend:', backendUrl);
    console.log('🔍 Search params:', searchParams.toString());
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    console.log('📡 Backend response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Backend API error:', response.status, response.statusText);
      
      // Return empty result instead of mock fallback
      return NextResponse.json({
        properties: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
        error: `Backend API error: ${response.status}`
      }, { status: response.status });
    }
    
    const result = await response.json();
    console.log('📦 Backend response data:', result);
    
    // Ensure proper response format
    const formattedResult = {
      properties: result.data || result.properties || [],
      total: result.pagination?.total || result.total || (result.data || result.properties || []).length,
      page: result.pagination?.page || result.page || 1,
      limit: result.pagination?.limit || result.limit || 0, // 0 means no limit
      totalPages: result.pagination?.totalPages || result.totalPages || 1
    };
    
    console.log('✅ Returning database response:', formattedResult);
    return NextResponse.json(formattedResult);
    
  } catch (error) {
    console.error('❌ Network error connecting to backend:', error);
    
    // Return error response instead of mock fallback
    return NextResponse.json({
      properties: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
      error: 'Unable to connect to backend database'
    }, { status: 500 });
  }
}

// Single POST handler for creating properties
export async function POST(request: NextRequest) {
  console.log('🏠 Properties API POST called - Database only mode');
  
  try {
    const propertyData = await request.json();
    console.log('📝 Property data received:', propertyData);
    
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/properties`;
    console.log('🔗 Backend URL:', backendUrl);
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';
    console.log('🔐 Auth token present:', !!token);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(propertyData),
    });

    console.log('📡 Backend POST response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Backend POST API error:', response.status, errorData);
      throw new Error(`Backend API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('✅ Property created successfully:', result);
    
    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Property created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating property:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create property'
      },
      { status: 500 }
    );
  }
}