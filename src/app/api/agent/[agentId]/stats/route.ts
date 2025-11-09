import { NextRequest, NextResponse } from 'next/server';

// GET /api/agent/[agentId]/stats - Get individual agent statistics
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
    
    console.log('🔍 Fetching stats for agent:', agentId);
    
    // Try to fetch from backend stats endpoint
    try {
      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/agent/${agentId}/stats`;
      
      console.log('🔗 Fetching agent stats from backend:', backendUrl);
      
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
        console.log('✅ Backend stats response:', result);
        
        if (result.success && result.data) {
          return NextResponse.json({
            success: true,
            data: {
              assignedProperties: result.data.assignedProperties || 0,
              pendingInspections: result.data.pendingInspections || 0,
              newMessages: result.data.newMessages || 0,
              completedInspections: result.data.completedInspections || 0
            }
          });
        }
      }
      
      console.log('⚠️ Backend stats request failed, status:', response.status);
    } catch (backendError) {
      console.log('⚠️ Backend connection failed:', backendError);
    }
    
    // Fallback: Return zero stats if backend fails
    return NextResponse.json({
      success: true,
      data: {
        assignedProperties: 0,
        pendingInspections: 0,
        newMessages: 0,
        completedInspections: 0
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching agent stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch agent statistics',
      data: {
        assignedProperties: 0,
        pendingInspections: 0,
        newMessages: 0,
        completedInspections: 0
      }
    }, { status: 500 });
  }
}