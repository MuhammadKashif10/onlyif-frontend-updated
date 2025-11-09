import { NextRequest, NextResponse } from 'next/server';

// GET /api/properties/[id]/with-seller - Get property with populated seller details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`🔍 Getting property ${id} with seller details`);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    
    // Connect to backend API to get property with seller details
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    console.log('🔗 Fetching property with seller from backend:', `${backendUrl}/api/properties/${id}/with-seller`);

    const backendResponse = await fetch(`${backendUrl}/api/properties/${id}/with-seller`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
      }
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend property fetch failed:', errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Backend API error: ${backendResponse.status} ${backendResponse.statusText}`,
          details: errorText
        },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();
    console.log('✅ Property with seller details received from backend');
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching property with seller details:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}