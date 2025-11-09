import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/dashboard/stats - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/dashboard/stats`;
    
    console.log('🔗 Fetching admin dashboard stats from backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error('❌ Backend API error:', response.status);
      return NextResponse.json({
        success: false,
        error: `Backend API error: ${response.status}`,
        data: {
          totalProperties: 0,
          totalAgents: 0,
          totalUsers: 0,
          pendingApprovals: 0,
          recentPayments: 0,
          monthlyRevenue: 0
        }
      }, { status: response.status });
    }
    
    const result = await response.json();
    
    // Transform the backend response to match frontend expectations
    const transformedStats = {
      success: result.success,
      data: {
        totalProperties: result.data.totalProperties || 0,
        totalAgents: result.data.totalAgents || 0,
        totalUsers: result.data.totalUsers || 0,
        pendingApprovals: result.data.pendingApprovals || 0,
        recentPayments: result.data.recentPayments || 0,
        monthlyRevenue: result.data.monthlyRevenue || 0
      },
      message: result.message
    };
    
    return NextResponse.json(transformedStats);
    
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to backend',
      data: {
        totalProperties: 0,
        totalAgents: 0,
        totalUsers: 0,
        pendingApprovals: 0,
        recentPayments: 0,
        monthlyRevenue: 0
      }
    }, { status: 500 });
  }
}