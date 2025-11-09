import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/payments/monthly-revenue - Get monthly revenue
export async function GET(request: NextRequest) {
  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/payments/monthly-revenue`;
    
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
        revenue: 0
      }, { status: response.status });
    }
    
    const result = await response.json();
    return NextResponse.json({
      success: true,
      revenue: result.revenue || 0
    });
    
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to backend',
      revenue: 0
    }, { status: 500 });
  }
}