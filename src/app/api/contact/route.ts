import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  newsletter?: boolean;
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
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'CONTACT_EMAIL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Validate form data
const validateFormData = (data: any): ContactFormData => {
  const errors: string[] = [];

  if (!data.firstName?.trim()) errors.push('First name is required');
  if (!data.lastName?.trim()) errors.push('Last name is required');
  if (!data.email?.trim()) errors.push('Email is required');
  if (!data.subject?.trim()) errors.push('Subject is required');
  if (!data.message?.trim()) errors.push('Message is required');

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Phone validation (optional)
  if (data.phone?.trim()) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Invalid phone number format');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  return {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.trim(),
    phone: data.phone?.trim() || '',
    subject: data.subject.trim(),
    message: data.message.trim(),
    newsletter: Boolean(data.newsletter)
  };
};

// Generate email HTML template
const generateEmailHTML = (data: ContactFormData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Contact Form Submission</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { margin-top: 5px; }
        .message-box { background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Contact Form Submission</h2>
          <p>You have received a new message from your website contact form.</p>
        </div>
        
        <div class="field">
          <div class="label">Name:</div>
          <div class="value">${data.firstName} ${data.lastName}</div>
        </div>
        
        <div class="field">
          <div class="label">Email:</div>
          <div class="value">${data.email}</div>
        </div>
        
        ${data.phone ? `
        <div class="field">
          <div class="label">Phone:</div>
          <div class="value">${data.phone}</div>
        </div>
        ` : ''}
        
        <div class="field">
          <div class="label">Subject:</div>
          <div class="value">${data.subject}</div>
        </div>
        
        <div class="field">
          <div class="label">Newsletter Subscription:</div>
          <div class="value">${data.newsletter ? 'Yes' : 'No'}</div>
        </div>
        
        <div class="field">
          <div class="label">Message:</div>
          <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
        </div>
        
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This email was sent from the OnlyIf contact form on ${new Date().toLocaleString()}.
        </p>
      </div>
    </body>
    </html>
  `;
};

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    validateEnvVars();

    // Parse request body
    const body = await request.json();
    
    // Validate form data
    const formData = validateFormData(body);

    // Create transporter
    const transporter = createTransporter();

    // Verify SMTP connection
    await transporter.verify();

    // Email options
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: process.env.CONTACT_EMAIL,
      subject: `Contact Form: ${formData.subject}`,
      html: generateEmailHTML(formData),
      replyTo: formData.email,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Thank you for your inquiry. We will contact you within 24 hours.',
      data: {
        id: `contact-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'sent'
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Sorry, there was an error sending your message. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}