import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface BookingData {
  propertyId?: string;
  propertyAddress: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  preferredDateTime: string;
  assignedAgentId: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  availableSlots: string[];
}

interface BookingResponse {
  success: boolean;
  bookingId?: string;
  message: string;
  bookingDetails?: {
    propertyAddress: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    confirmedDateTime: string;
    agent: Agent;
  };
  suggestedSlots?: string[];
  notification?: string;
}

// Mock agent availability data
const MOCK_AGENTS: Agent[] = [
  {
    id: 'A123',
    name: 'John Smith',
    email: 'john.smith@agency.com',
    phone: '+61 400 123 456',
    availableSlots: [
      '2024-01-15T10:00:00Z',
      '2024-01-15T14:00:00Z',
      '2024-01-16T09:00:00Z',
      '2024-01-16T15:00:00Z',
      '2024-01-17T11:00:00Z'
    ]
  },
  {
    id: 'A124',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@agency.com',
    phone: '+61 400 234 567',
    availableSlots: [
      '2024-01-15T11:00:00Z',
      '2024-01-15T16:00:00Z',
      '2024-01-16T10:00:00Z',
      '2024-01-17T09:00:00Z',
      '2024-01-17T14:00:00Z'
    ]
  },
  {
    id: 'A125',
    name: 'Michael Brown',
    email: 'michael.brown@agency.com',
    phone: '+61 400 345 678',
    availableSlots: [
      '2024-01-15T09:00:00Z',
      '2024-01-15T13:00:00Z',
      '2024-01-16T11:00:00Z',
      '2024-01-16T16:00:00Z',
      '2024-01-17T10:00:00Z'
    ]
  }
];

const validateBookingData = (data: any): BookingData => {
  const requiredFields = ['propertyAddress', 'buyerName', 'buyerEmail', 'buyerPhone', 'preferredDateTime', 'assignedAgentId'];
  
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
      throw new Error(`Missing or invalid required field: ${field}`);
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.buyerEmail)) {
    throw new Error('Invalid email format');
  }

  // Validate phone format (basic validation)
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,}$/;
  if (!phoneRegex.test(data.buyerPhone.replace(/\s/g, ''))) {
    throw new Error('Invalid phone number format');
  }

  // Validate datetime format
  const dateTime = new Date(data.preferredDateTime);
  if (isNaN(dateTime.getTime())) {
    throw new Error('Invalid datetime format');
  }

  // Check if datetime is in the future
  if (dateTime <= new Date()) {
    throw new Error('Preferred datetime must be in the future');
  }

  return {
    propertyId: data.propertyId || undefined,
    propertyAddress: data.propertyAddress.trim(),
    buyerName: data.buyerName.trim(),
    buyerEmail: data.buyerEmail.trim().toLowerCase(),
    buyerPhone: data.buyerPhone.trim(),
    preferredDateTime: data.preferredDateTime,
    assignedAgentId: data.assignedAgentId.trim()
  };
};

const checkAgentAvailability = (agentId: string, preferredDateTime: string): { available: boolean; agent?: Agent; suggestedSlots?: string[] } => {
  const agent = MOCK_AGENTS.find(a => a.id === agentId);
  
  if (!agent) {
    throw new Error('Agent not found');
  }

  const isAvailable = agent.availableSlots.includes(preferredDateTime);
  
  if (isAvailable) {
    return { available: true, agent };
  } else {
    // Return next 3 available slots as suggestions
    const futureSlots = agent.availableSlots
      .filter(slot => new Date(slot) > new Date())
      .slice(0, 3);
    
    return { 
      available: false, 
      agent, 
      suggestedSlots: futureSlots 
    };
  }
};

const generateBookingId = (): string => {
  return 'INS-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const sendInspectionNotifications = async (bookingData: BookingData, agent: Agent, bookingId: string): Promise<boolean> => {
  try {
    // Check if email credentials are configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Email credentials not configured. Skipping email notifications.');
      return false;
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const formattedDateTime = new Date(bookingData.preferredDateTime).toLocaleString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Email to buyer
    const buyerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Inspection Booking Confirmed</h2>
        <p>Dear ${bookingData.buyerName},</p>
        <p>Your property inspection has been successfully booked. Here are the details:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Booking Details</h3>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Property:</strong> ${bookingData.propertyAddress}</p>
          <p><strong>Date & Time:</strong> ${formattedDateTime}</p>
          <p><strong>Your Contact:</strong> ${bookingData.buyerPhone}</p>
        </div>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #065f46;">Your Agent</h3>
          <p><strong>Name:</strong> ${agent.name}</p>
          <p><strong>Phone:</strong> ${agent.phone}</p>
          <p><strong>Email:</strong> ${agent.email}</p>
        </div>
        
        <p>Please arrive on time for your inspection. If you need to reschedule or have any questions, please contact your agent directly.</p>
        <p>Best regards,<br>OnlyIf Real Estate Team</p>
      </div>
    `;

    // Email to agent
    const agentEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">New Inspection Booking</h2>
        <p>Dear ${agent.name},</p>
        <p>You have a new property inspection booking. Please review the details below:</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #991b1b;">Booking Details</h3>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Property:</strong> ${bookingData.propertyAddress}</p>
          <p><strong>Date & Time:</strong> ${formattedDateTime}</p>
        </div>
        
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Buyer Information</h3>
          <p><strong>Name:</strong> ${bookingData.buyerName}</p>
          <p><strong>Email:</strong> ${bookingData.buyerEmail}</p>
          <p><strong>Phone:</strong> ${bookingData.buyerPhone}</p>
        </div>
        
        <p>Please confirm your availability and prepare for the inspection. Contact the buyer if you need to make any arrangements.</p>
        <p>Best regards,<br>OnlyIf Real Estate Team</p>
      </div>
    `;

    // Send emails
    await Promise.all([
      transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: bookingData.buyerEmail,
        subject: `Inspection Confirmed - ${bookingData.propertyAddress}`,
        html: buyerEmailHtml,
      }),
      transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: agent.email,
        subject: `New Inspection Booking - ${bookingData.propertyAddress}`,
        html: agentEmailHtml,
      })
    ]);

    return true;
  } catch (error) {
    console.error('Failed to send inspection notifications:', error);
    return false;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate booking data
    const bookingData = validateBookingData(body);
    
    // Check agent availability
    const availabilityCheck = checkAgentAvailability(bookingData.assignedAgentId, bookingData.preferredDateTime);
    
    if (!availabilityCheck.available) {
      return NextResponse.json({
        success: false,
        message: 'Selected time slot is not available',
        suggestedSlots: availabilityCheck.suggestedSlots
      } as BookingResponse, { status: 409 });
    }
    
    // Generate booking ID
    const bookingId = generateBookingId();
    
    // Send email notifications
    const notificationSent = await sendInspectionNotifications(bookingData, availabilityCheck.agent!, bookingId);
    
    // Prepare response
    const response: BookingResponse = {
      success: true,
      bookingId,
      message: 'Inspection booking confirmed successfully',
      bookingDetails: {
        propertyAddress: bookingData.propertyAddress,
        buyerName: bookingData.buyerName,
        buyerEmail: bookingData.buyerEmail,
        buyerPhone: bookingData.buyerPhone,
        confirmedDateTime: bookingData.preferredDateTime,
        agent: availabilityCheck.agent!
      },
      notification: notificationSent ? 'sent' : 'failed'
    };
    
    return NextResponse.json(response, { status: 201 });
    
  } catch (error) {
    console.error('Inspection booking error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        message: error.message
      } as BookingResponse, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error occurred while processing booking'
    } as BookingResponse, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Inspection booking API is running',
    availableAgents: MOCK_AGENTS.map(agent => ({
      id: agent.id,
      name: agent.name,
      availableSlots: agent.availableSlots
    }))
  }, { status: 200 });
}

export async function PUT() {
  return NextResponse.json({
    message: 'Method not implemented'
  }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({
    message: 'Method not implemented'
  }, { status: 501 });
}