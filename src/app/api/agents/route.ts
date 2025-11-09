import { NextRequest, NextResponse } from 'next/server';

// GET /api/agents - Get all agents with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Forward all query parameters to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/agents?${searchParams.toString()}`;
    
    console.log('🔗 Fetching agents from backend:', backendUrl);
    
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
      return NextResponse.json({
        success: false,
        error: `Backend API error: ${response.status}`,
        data: [],
        total: 0
      }, { status: response.status });
    }
    
    const result = await response.json();
    console.log('📦 Backend response data:', result);
    
    // Return the backend response directly since it already has the correct format
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to backend',
      data: [],
      total: 0
    }, { status: 500 });
  }
}
