import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/properties/count - Get total properties count
export async function GET(request: NextRequest) {
  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/properties/count`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Backend API error: ${response.status}`,
        count: 0
      }, { status: response.status });
    }
    
    const result = await response.json();
    return NextResponse.json({
      success: true,
      count: result.count || 0
    });
    
  } catch (error) {
    console.error('Error fetching properties count:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to backend',
      count: 0
    }, { status: 500 });
  }
}