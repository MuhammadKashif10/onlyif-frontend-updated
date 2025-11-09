import { NextRequest, NextResponse } from 'next/server';

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/users/${id}`;
    
    console.log('🔗 Deleting user at backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      },
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
    console.error('❌ Error deleting user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user'
    }, { status: 500 });
  }
}

// GET /api/admin/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/users/${id}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      },
      cache: 'no-store',
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }
    
    // Transform the backend response to match frontend expectations
    if (result.success && result.data) {
      const transformedUser = {
        ...result.data,
        _id: result.data.id || result.data._id,
        id: result.data.id || result.data._id,
        status: result.data.isSuspended ? 'suspended' : (result.data.isActive ? 'active' : 'inactive'),
        joinedDate: result.data.createdAt ? new Date(result.data.createdAt).toLocaleDateString() : 'Unknown',
        lastActive: result.data.lastLoginAt ? new Date(result.data.lastLoginAt).toLocaleDateString() : 'Never',
        totalTransactions: result.data.totalTransactions || 0
      };
      
      return NextResponse.json({
        ...result,
        data: transformedUser
      });
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user'
    }, { status: 500 });
  }
}