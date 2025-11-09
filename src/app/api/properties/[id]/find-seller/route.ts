import { NextRequest, NextResponse } from 'next/server';

// GET /api/properties/[id]/find-seller - Fallback method to find seller for a property
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`🔍 Finding seller for property ${id} using fallback methods`);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    
    // Connect to backend API to find seller using fallback methods
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    console.log('🔗 Finding seller through backend fallback:', `${backendUrl}/api/properties/${id}/find-seller`);

    const backendResponse = await fetch(`${backendUrl}/api/properties/${id}/find-seller`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
      }
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend seller lookup failed:', errorText);
      
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
    console.log('✅ Seller found through fallback method');
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error finding seller through fallback:', error);
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