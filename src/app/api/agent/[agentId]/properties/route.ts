import { NextRequest, NextResponse } from 'next/server';

// GET /api/agent/[agentId]/properties - Get agent's assigned properties
export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = await params;
    
    if (!agentId) {
      return NextResponse.json({
        success: false,
        error: 'Agent ID is required'
      }, { status: 400 });
    }
    
    console.log('🔍 Fetching properties for agent:', agentId);
    
    // Connect to backend API
    try {
      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/agent/${agentId}/properties`;
      
      console.log('🔗 Calling backend:', backendUrl);
      
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
        },
        cache: 'no-store',
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Backend response:', result);
        
        if (result.success) {
          return NextResponse.json({
            success: true,
            data: result.data
          });
        }
      }
      
      console.log('⚠️ Backend request failed, status:', response.status);
    } catch (backendError) {
      console.log('⚠️ Backend connection failed:', backendError);
    }
    
    // Fallback: return empty array if backend fails
    return NextResponse.json({
      success: true,
      data: {
        properties: [],
        totalPages: 0,
        currentPage: 1,
        total: 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching agent properties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agent properties' },
      { status: 500 }
    );
  }
}
