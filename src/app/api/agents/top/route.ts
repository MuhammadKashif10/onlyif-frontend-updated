import { NextRequest, NextResponse } from 'next/server';

// GET /api/agents/top - Get top-rated agents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '6';
    
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/agents/top?limit=${limit}`;
    
    console.log('🔗 Fetching top agents from backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error('❌ Backend API error:', response.status);
      return NextResponse.json({
        success: false,
        error: `Backend API error: ${response.status}`,
        data: []
      }, { status: response.status });
    }
    
    const result = await response.json();
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error fetching top agents:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to backend',
      data: []
    }, { status: 500 });
  }
}