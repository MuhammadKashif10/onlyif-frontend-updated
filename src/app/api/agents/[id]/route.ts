import { NextRequest, NextResponse } from 'next/server';

// GET /api/agents/[id] - Get agent by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;
    
    // Forward request to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/agents/${agentId}`;
    
    console.log('🔗 Fetching agent from backend:', backendUrl);
    
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
        message: 'Agent not found'
      }, { status: response.status });
    }
    
    const result = await response.json();
    console.log('📦 Backend response data:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to backend',
      message: 'Internal server error'
    }, { status: 500 });
  }
}