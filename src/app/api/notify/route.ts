import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface NotificationData {
  sellerName: string;
  sellerEmail: string;
  propertyAddress: string;
  agentName: string;
  agentEmail: string;
  agentPhone: string;
}

// Create nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Validate required environment variables
const validateEnvVars = () => {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Validate notification data
const validateNotificationData = (data: any): NotificationData => {
  const errors: string[] = [];

  if (!data.sellerName?.trim()) errors.push('Seller name is required');
  if (!data.sellerEmail?.trim()) errors.push('Seller email is required');
  if (!data.propertyAddress?.trim()) errors.push('Property address is required');
  if (!data.agentName?.trim()) errors.push('Agent name is required');
  if (!data.agentEmail?.trim()) errors.push('Agent email is required');
  if (!data.agentPhone?.trim()) errors.push('Agent phone is required');

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.sellerEmail && !emailRegex.test(data.sellerEmail)) {
    errors.push('Invalid seller email format');
  }
  if (data.agentEmail && !emailRegex.test(data.agentEmail)) {
    errors.push('Invalid agent email format');
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  return {
    sellerName: data.sellerName.trim(),
    sellerEmail: data.sellerEmail.trim(),
    propertyAddress: data.propertyAddress.trim(),
    agentName: data.agentName.trim(),
    agentEmail: data.agentEmail.trim(),
    agentPhone: data.agentPhone.trim()
  };
};

// Generate seller email HTML
const generateSellerEmailHTML = (data: NotificationData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Agent Assignment</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .agent-card { background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0; }
        .contact-info { margin: 10px 0; }
        .contact-info strong { color: #2563eb; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Your Agent Assignment</h1>
      </div>
      <div class="content">
        <p>Hi <strong>${data.sellerName}</strong>,</p>
        <p>Great news! Your property at <strong>${data.propertyAddress}</strong> has been successfully assigned to one of our qualified agents.</p>
        
        <div class="agent-card">
          <h3>Your Assigned Agent</h3>
          <div class="contact-info">
            <strong>Name:</strong> ${data.agentName}
          </div>
          <div class="contact-info">
            <strong>Email:</strong> <a href="mailto:${data.agentEmail}">${data.agentEmail}</a>
          </div>
          <div class="contact-info">
            <strong>Phone:</strong> <a href="tel:${data.agentPhone}">${data.agentPhone}</a>
          </div>
        </div>
        
        <p>Your agent will contact you within 24 hours to discuss your property and next steps. If you have any immediate questions, feel free to reach out to them directly using the contact information above.</p>
        
        <p>Thank you for choosing our service!</p>
      </div>
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
};

// Generate agent email HTML
const generateAgentEmailHTML = (data: NotificationData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Seller Assigned</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
        .seller-card { background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #059669; margin: 20px 0; }
        .contact-info { margin: 10px 0; }
        .contact-info strong { color: #059669; }
        .action-required { background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>New Seller Assigned</h1>
      </div>
      <div class="content">
        <p>Hi <strong>${data.agentName}</strong>,</p>
        <p>You've been assigned a new seller! Please review the details below and contact them within 24 hours.</p>
        
        <div class="seller-card">
          <h3>Seller Information</h3>
          <div class="contact-info">
            <strong>Name:</strong> ${data.sellerName}
          </div>
          <div class="contact-info">
            <strong>Email:</strong> <a href="mailto:${data.sellerEmail}">${data.sellerEmail}</a>
          </div>
          <div class="contact-info">
            <strong>Property Address:</strong> ${data.propertyAddress}
          </div>
        </div>
        
        <div class="action-required">
          <h4>⚡ Action Required</h4>
          <p>Please contact <strong>${data.sellerName}</strong> within 24 hours to:</p>
          <ul>
            <li>Introduce yourself and your services</li>
            <li>Schedule a property evaluation</li>
            <li>Discuss their selling timeline and expectations</li>
            <li>Answer any questions they may have</li>
          </ul>
        </div>
        
        <p>Good luck with your new client!</p>
      </div>
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
};

// Send email notifications
const sendNotifications = async (data: NotificationData) => {
  const transporter = createTransporter();
  const fromEmail = process.env.SMTP_FROM!;
  
  // Email to seller
  const sellerMailOptions = {
    from: fromEmail,
    to: data.sellerEmail,
    subject: 'Your Agent Assignment',
    html: generateSellerEmailHTML(data),
    text: `Hi ${data.sellerName}, your property at ${data.propertyAddress} has been assigned to ${data.agentName} (${data.agentEmail}, ${data.agentPhone}).`
  };
  
  // Email to agent
  const agentMailOptions = {
    from: fromEmail,
    to: data.agentEmail,
    subject: 'New Seller Assigned',
    html: generateAgentEmailHTML(data),
    text: `Hi ${data.agentName}, you've been assigned a new seller: ${data.sellerName} (${data.sellerEmail}) for property ${data.propertyAddress}.`
  };
  
  // Send both emails
  const results = await Promise.allSettled([
    transporter.sendMail(sellerMailOptions),
    transporter.sendMail(agentMailOptions)
  ]);
  
  // Check if both emails were sent successfully
  const sellerResult = results[0];
  const agentResult = results[1];
  
  const errors = [];
  if (sellerResult.status === 'rejected') {
    errors.push(`Failed to send email to seller: ${sellerResult.reason}`);
  }
  if (agentResult.status === 'rejected') {
    errors.push(`Failed to send email to agent: ${agentResult.reason}`);
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
  
  return {
    sellerEmailId: sellerResult.status === 'fulfilled' ? sellerResult.value.messageId : null,
    agentEmailId: agentResult.status === 'fulfilled' ? agentResult.value.messageId : null
  };
};

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    validateEnvVars();
    
    // Parse request body
    const body = await request.json();
    
    // Validate notification data
    const notificationData = validateNotificationData(body);
    
    // Send email notifications
    const emailResults = await sendNotifications(notificationData);
    
    console.log(`Email notifications sent successfully:`, {
      seller: notificationData.sellerEmail,
      agent: notificationData.agentEmail,
      sellerEmailId: emailResults.sellerEmailId,
      agentEmailId: emailResults.agentEmailId
    });
    
    return NextResponse.json({
      status: 'success',
      message: 'Email notifications sent successfully',
      emailIds: emailResults
    });
    
  } catch (error) {
    console.error('Error in notify API:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 400 }
      );
    }
    
    // Handle environment variable errors
    if (error instanceof Error && error.message.includes('Missing required environment variables')) {
      return NextResponse.json(
        { status: 'error', message: 'Email service not configured properly' },
        { status: 500 }
      );
    }
    
    // Handle email sending errors
    if (error instanceof Error && error.message.includes('Failed to send email')) {
      return NextResponse.json(
        { status: 'error', message: `Email sending failed: ${error.message}` },
        { status: 500 }
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