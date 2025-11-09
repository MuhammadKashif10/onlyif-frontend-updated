import { NextRequest, NextResponse } from 'next/server';

interface SellerData {
  name: string;
  email: string;
  phone: string;
  propertyAddress: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// Hardcoded list of mock agents
const MOCK_AGENTS: Agent[] = [
  {
    id: 'A123',
    name: 'John Smith',
    email: 'john.smith@agency.com',
    phone: '+61 400 123 456'
  },
  {
    id: 'A124',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@agency.com',
    phone: '+61 400 234 567'
  },
  {
    id: 'A125',
    name: 'Michael Brown',
    email: 'michael.brown@agency.com',
    phone: '+61 400 345 678'
  },
  {
    id: 'A126',
    name: 'Emma Wilson',
    email: 'emma.wilson@agency.com',
    phone: '+61 400 456 789'
  },
  {
    id: 'A127',
    name: 'David Lee',
    email: 'david.lee@agency.com',
    phone: '+61 400 567 890'
  }
];

// Validate seller data
const validateSellerData = (data: any): SellerData => {
  const errors: string[] = [];

  if (!data.name?.trim()) errors.push('Name is required');
  if (!data.email?.trim()) errors.push('Email is required');
  if (!data.phone?.trim()) errors.push('Phone is required');
  if (!data.propertyAddress?.trim()) errors.push('Property address is required');

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Phone format validation (basic)
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  if (data.phone && !phoneRegex.test(data.phone)) {
    errors.push('Invalid phone format');
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  return {
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    propertyAddress: data.propertyAddress.trim()
  };
};

// Randomly select an agent
const selectRandomAgent = (): Agent => {
  const randomIndex = Math.floor(Math.random() * MOCK_AGENTS.length);
  return MOCK_AGENTS[randomIndex];
};

// Send email notifications
const sendEmailNotifications = async (sellerData: SellerData, assignedAgent: Agent) => {
  try {
    const notificationPayload = {
      sellerName: sellerData.name,
      sellerEmail: sellerData.email,
      propertyAddress: sellerData.propertyAddress,
      agentName: assignedAgent.name,
      agentEmail: assignedAgent.email,
      agentPhone: assignedAgent.phone
    };

    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send notifications');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to send email notifications:', error);
    throw error;
  }
};

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate seller data
    const sellerData = validateSellerData(body);
    
    // Select random agent
    const assignedAgent = selectRandomAgent();
    
    // Log assignment for debugging
    console.log(`Assigned agent ${assignedAgent.name} (${assignedAgent.id}) to seller ${sellerData.name} for property at ${sellerData.propertyAddress}`);
    
    // Prepare success response
    const successResponse = {
      status: 'success',
      assignedAgent: {
        id: assignedAgent.id,
        name: assignedAgent.name,
        email: assignedAgent.email,
        phone: assignedAgent.phone
      }
    };
    
    // Try to send email notifications
    try {
      await sendEmailNotifications(sellerData, assignedAgent);
      console.log('Email notifications sent successfully');
      
      return NextResponse.json({
        ...successResponse,
        notification: 'success'
      });
    } catch (notificationError) {
      console.error('Email notification failed:', notificationError);
      
      // Still return success for assignment, but indicate notification failure
      return NextResponse.json({
        ...successResponse,
        notification: 'failed',
        notificationError: notificationError instanceof Error ? notificationError.message : 'Unknown error'
      });
    }
    
  } catch (error) {
    console.error('Error in assign-agent API:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return NextResponse.json(
        { status: 'error', message: 'Missing or invalid fields' },
        { status: 400 }
      );
    }
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid JSON format' },
        { status: 400 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle non-POST methods
export async function GET() {
  return NextResponse.json(
    { status: 'error', message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { status: 'error', message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { status: 'error', message: 'Method not allowed' },
    { status: 405 }
  );
}