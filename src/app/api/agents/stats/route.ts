import { NextRequest, NextResponse } from 'next/server';

// GET /api/agents/stats - Get general agent statistics
export async function GET(request: NextRequest) {
  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/agents/stats`;
    
    console.log('🔗 Fetching agent stats from backend:', backendUrl);
    
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
        data: {
          totalAgents: 0,
          totalPropertiesSold: 0,
          averageRating: 0
        }
      }, { status: response.status });
    }
    
    const result = await response.json();
    
    // Transform the backend stats to match frontend expectations
    const transformedStats = {
      success: result.success,
      data: {
        totalAgents: result.data.totalAgents || 0,
        totalPropertiesSold: result.data.totalProperties || 0,
        averageRating: 4.8 // Mock average rating
      },
      message: result.message
    };
    
    return NextResponse.json(transformedStats);
    
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to backend',
      data: {
        totalAgents: 0,
        totalPropertiesSold: 0,
        averageRating: 0
      }
    }, { status: 500 });
  }
}