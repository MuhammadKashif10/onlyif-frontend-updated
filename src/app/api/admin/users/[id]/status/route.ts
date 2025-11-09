import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/admin/users/[id]/status - Update user status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/users/${id}/status`;
    
    console.log('🔗 Updating user status at backend:', backendUrl);
    console.log('📦 Request body:', body);
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      },
      body: JSON.stringify(body),
    });
    
    console.log('📡 Backend response status:', response.status);
    
    const result = await response.json();
    console.log('📦 Backend response data:', result);
    
    if (!response.ok) {
      console.error('❌ Backend API error:', response.status, result);
      return NextResponse.json(result, { status: response.status });
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Error updating user status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update user status'
    }, { status: 500 });
  }
}