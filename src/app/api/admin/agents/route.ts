import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/agents - Get all agents for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Forward all query parameters to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/agents?${searchParams.toString()}`;
    
    console.log('🔗 Fetching admin agents from backend:', backendUrl);
    
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
    
    // Transform the backend response to match frontend expectations
    // Backend returns 'id' but frontend expects '_id'
    if (result.success && result.data) {
      const transformedData = result.data.map((agent: any) => ({
        ...agent,
        _id: agent.id || agent._id, // Ensure _id field exists
        id: agent.id || agent._id    // Keep id for backward compatibility
      }));
      
      return NextResponse.json({
        ...result,
        data: transformedData
      });
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error fetching admin agents:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to backend',
      data: [],
      total: 0
    }, { status: 500 });
  }
}