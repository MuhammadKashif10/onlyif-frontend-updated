import { NextRequest, NextResponse } from 'next/server';

// GET /api/agent/[agentId]/activities - Get agent's recent activities
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
    
    console.log('🔍 Fetching activities for agent:', agentId);
    
    // Try to fetch from backend first
    try {
      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/agent/${agentId}/activities`;
      
      console.log('🔗 Fetching agent activities from backend:', backendUrl);
      
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
        console.log('✅ Backend activities response:', result);
        
        if (result.success && result.data) {
          return NextResponse.json({
            success: true,
            activities: result.data.activities || [],
            message: 'Activities retrieved successfully'
          });
        }
      }
      
      console.log('⚠️ Backend activities request failed, status:', response.status);
    } catch (backendError) {
      console.log('⚠️ Backend connection failed:', backendError);
    }
    
    // Fallback: Return mock activities for demonstration
    const mockActivities = [
      {
        id: '1',
        type: 'property_assigned',
        title: 'New property assigned: Modern Family Home',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        id: '2',
        type: 'property_assigned',
        title: 'Property assignment updated: Downtown Condo',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
      },
      {
        id: '3',
        type: 'property_assigned',
        title: 'New property assigned: Suburban Villa',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      }
    ];
    
    return NextResponse.json({
      success: true,
      activities: mockActivities,
      message: 'Mock activities retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error fetching agent activities:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch agent activities',
      activities: []
    }, { status: 500 });
  }
}