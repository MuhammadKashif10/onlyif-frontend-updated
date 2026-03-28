import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, zipCode, email, phone } = body;

    // Validate required fields
    if (!address || !zipCode) {
      return NextResponse.json(
        { error: 'Address and ZIP code are required' },
        { status: 400 }
      );
    }

    // Validate ZIP code format
    const zipCodeRegex = /^\d{5}(-\d{4})?$/;
    if (!zipCodeRegex.test(zipCode)) {
      return NextResponse.json(
        { error: 'Please enter a valid ZIP code' },
        { status: 400 }
      );
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Please enter a valid email address' },
          { status: 400 }
        );
      }
    }

    // Validate phone if provided
    if (phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        return NextResponse.json(
          { error: 'Please enter a valid phone number' },
          { status: 400 }
        );
      }
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock response - in a real app, this would save to database and trigger notifications
    const mockOfferId = `OFF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return NextResponse.json({
      success: true,
      message: 'Offer request submitted successfully',
      offerId: mockOfferId,
      estimatedResponseTime: '24 hours',
      nextSteps: [
        'We will review your property details',
        'Our team will conduct a market analysis',
        'You will receive a competitive cash offer within 24 hours'
      ]
    });

  } catch (error) {
    console.error('Error processing offer request:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
} 