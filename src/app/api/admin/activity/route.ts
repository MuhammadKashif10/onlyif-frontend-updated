import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/activity - Get recent admin activity
export async function GET(request: NextRequest) {
  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/activity`;
    
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
        activities: []
      }, { status: response.status });
    }
    
    const result = await response.json();
    return NextResponse.json({
      success: true,
      activities: result.activities || []
    });
    
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to backend',
      activities: []
    }, { status: 500 });
  }
}