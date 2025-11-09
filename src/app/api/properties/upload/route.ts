import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔄 Upload API: Handling file upload request');
  
  try {
    // Get the FormData from the request
    const formData = await request.formData();
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';
    
    console.log('🔐 Auth token present:', !!token);
    console.log('📁 FormData entries:', Array.from(formData.entries()).map(([key, value]) => 
      `${key}: ${value instanceof File ? `File(${value.name})` : value}`
    ));
    
    // Forward the FormData to the backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/properties/upload`;
    console.log('🔗 Forwarding to backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type - let fetch handle it for FormData
      },
      body: formData,
    });
    
    console.log('📡 Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend upload error:', response.status, errorText);
      throw new Error(`Backend upload failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Upload successful:', result);
    
    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Property created with files successfully'
    });
    
  } catch (error) {
    console.error('❌ Upload API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload property with files'
      },
      { status: 500 }
    );
  }
}