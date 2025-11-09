import { NextRequest, NextResponse } from 'next/server';
import { USE_MOCKS } from '@/utils/mockWrapper';

// Mock agents data removed - using real database only
const mockAgents: any[] = [];

// Mock property assignments storage
const propertyAssignments = new Map<string, any>();

// POST /api/properties/[id]/assign-agent - Assign agent to property
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id;
    const { agentId, message } = await request.json();
    
    if (USE_MOCKS) {
      // Since mock agents are removed, return error
      return NextResponse.json(
        { success: false, error: 'Mock agents removed - cannot assign mock agent', message: 'Only real user-registered agents can be assigned' },
        { status: 404 }
      );
    }
    
    // Real API implementation would go here
    return NextResponse.json(
      { success: false, error: 'Real API not implemented yet' },
      { status: 501 }
    );
    
  } catch (error) {
    console.error('Error assigning agent:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/properties/[id]/assign-agent - Get available agents for assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (USE_MOCKS) {
      // Return empty array since all mock agents have been removed
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Mock agents removed - only real user-registered agents available for assignment'
      });
    }
    
    // Real API implementation would go here
    return NextResponse.json(
      { success: false, error: 'Real API not implemented yet' },
      { status: 501 }
    );
    
  } catch (error) {
    console.error('Error fetching available agents:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}