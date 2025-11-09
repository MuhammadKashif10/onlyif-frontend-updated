import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/users - Get all users for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Forward all query parameters to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/users?${searchParams.toString()}`;
    
    console.log('🔗 Fetching admin users from backend:', backendUrl);
    
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
    if (result.success && result.data) {
      const transformedData = result.data.map((user: any) => ({
        ...user,
        _id: user.id || user._id,
        id: user.id || user._id,
        // Map backend fields to frontend expected format
        status: user.isSuspended ? 'suspended' : (user.isActive ? 'active' : 'inactive'),
        joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
        lastActive: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never',
        totalTransactions: user.totalTransactions || 0
      }));
      
      return NextResponse.json({
        ...result,
        data: transformedData
      });
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to backend',
      data: [],
      total: 0
    }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user (if needed)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/users`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      },
      body: JSON.stringify(body),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create user'
    }, { status: 500 });
  }
}

// PUT /api/admin/users/:id/status - Update user status
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const body = await request.json();
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }
    
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/users/${userId}/status`;
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store', // Prevent caching
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({
        success: false,
        error: errorData.message || `Backend API error: ${response.status}`
      }, { status: response.status });
    }
    
    const result = await response.json();
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update user status'
    }, { status: 500 });
  }
}

// DELETE /api/admin/users/:id - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }
    
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/users/${userId}`;
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Prevent caching
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({
        success: false,
        error: errorData.message || `Backend API error: ${response.status}`
      }, { status: response.status });
    }
    
    const result = await response.json();
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user'
    }, { status: 500 });
  }
}