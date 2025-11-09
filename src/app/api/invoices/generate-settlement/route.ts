import { NextRequest, NextResponse } from 'next/server';

// Function to create payment record via backend API
async function createPaymentRecord(invoiceData: any, propertyData: any, sellerData: any, agentData: any) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/admin/payment-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seller: sellerData._id,
        agent: agentData._id,
        property: propertyData._id,
        invoice: invoiceData._id,
        amount: invoiceData.totalAmount,
        currency: 'AUD',
        status: 'pending',
        invoiceDetails: {
          invoiceNumber: invoiceData.invoiceNumber,
          commissionAmount: invoiceData.commissionAmount,
          gstAmount: invoiceData.gstAmount,
          totalAmount: invoiceData.totalAmount,
          dueDate: invoiceData.dueDate
        },
        propertyDetails: {
          title: propertyData.title,
          address: propertyData.address || 'Property Address',
          price: propertyData.price || invoiceData.propertyValue
        },
        sellerDetails: {
          name: sellerData.name,
          email: sellerData.email
        },
        agentDetails: {
          name: agentData.name,
          email: agentData.email || 'agent@onlyif.com'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create payment record: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Payment record created successfully:', result.data?._id);
    return result.data;
  } catch (error) {
    console.error('❌ Error creating payment record:', error);
    throw error;
  }
}

interface SettlementInvoiceRequest {
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  agentId: string;
  agentName: string;
  settlementDate: string;
}

interface InvoiceDetails {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  propertyValue: number;
  commissionRate: number;
  commissionAmount: number;
  gstAmount: number;
  totalAmount: number;
  bankDetails: {
    accountName: string;
    bsb: string;
    accountNumber: string;
    reference: string;
  };
}

// Bank account details for commission payments
const COMPANY_BANK_DETAILS = {
  accountName: "OnlyIf Real Estate Pty Ltd",
  bsb: "062-001", // Commonwealth Bank BSB (example)
  accountNumber: "1234-5678", // Example account number
  swift: "CTBAAU2S", // Commonwealth Bank SWIFT code
  bankName: "Commonwealth Bank of Australia"
};

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Invoice generation API called');
    
    const body: SettlementInvoiceRequest = await request.json();
    console.log('📋 Received invoice request:', {
      propertyId: body.propertyId,
      propertyTitle: body.propertyTitle,
      propertyPrice: body.propertyPrice,
      sellerId: body.sellerId,
      sellerName: body.sellerName,
      sellerEmail: body.sellerEmail,
      agentName: body.agentName
    });
    
    const {
      propertyId,
      propertyTitle,
      propertyPrice,
      sellerId,
      sellerName,
      sellerEmail,
      agentId,
      agentName,
      settlementDate
    } = body;

    // Validate required fields
    if (!propertyId || !propertyPrice || !sellerId) {
      const missingFields = [];
      if (!propertyId) missingFields.push('propertyId');
      if (!propertyPrice) missingFields.push('propertyPrice');
      if (!sellerId) missingFields.push('sellerId');
      
      console.error('❌ Missing required fields:', missingFields);
      return NextResponse.json(
        { 
          success: false, 
          message: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Calculate commission details
    const commissionRate = 1.1; // 1.1% commission rate
    const commissionAmount = (propertyPrice * commissionRate) / 100;
    const gstRate = 10; // 10% GST in Australia
    const gstAmount = (commissionAmount * gstRate) / 100;
    const totalAmount = commissionAmount + gstAmount;
    
    console.log('💰 Commission calculation:', {
      propertyPrice,
      commissionRate: `${commissionRate}%`,
      commissionAmount,
      gstAmount,
      totalAmount
    });

    // Generate invoice number (format: INV-YYYYMMDD-XXXX)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    const invoiceNumber = `INV-${dateStr}-${randomNum}`;

    // Set due date (30 days from invoice date)
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 30);

    // Create invoice details
    const invoiceDetails: InvoiceDetails = {
      invoiceNumber,
      invoiceDate: today.toISOString(),
      dueDate: dueDate.toISOString(),
      propertyValue: propertyPrice,
      commissionRate,
      commissionAmount,
      gstAmount,
      totalAmount,
      bankDetails: {
        accountName: COMPANY_BANK_DETAILS.accountName,
        bsb: COMPANY_BANK_DETAILS.bsb,
        accountNumber: COMPANY_BANK_DETAILS.accountNumber,
        reference: `${invoiceNumber}-${sellerId.slice(-6).toUpperCase()}`
      }
    };

    // Create invoice record (in real implementation, save to database)
    const invoice = {
      _id: `inv_${Date.now()}`,
      invoiceNumber: invoiceDetails.invoiceNumber,
      property: {
        _id: propertyId,
        title: propertyTitle,
        address: "Property Address" // Would get from property data
      },
      seller: {
        _id: sellerId,
        name: sellerName,
        email: sellerEmail
      },
      agent: {
        _id: agentId,
        name: agentName
      },
      invoiceDate: invoiceDetails.invoiceDate,
      dueDate: invoiceDetails.dueDate,
      settlementDate: settlementDate,
      propertyValue: invoiceDetails.propertyValue,
      commissionRate: invoiceDetails.commissionRate,
      commissionAmount: invoiceDetails.commissionAmount,
      gstAmount: invoiceDetails.gstAmount,
      totalAmount: invoiceDetails.totalAmount,
      amountPaid: 0,
      amountDue: invoiceDetails.totalAmount,
      status: 'sent' as const,
      isOverdue: false,
      bankDetails: invoiceDetails.bankDetails,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real implementation, you would:
    // 1. Save invoice to database
    // 2. Generate PDF invoice
    // 3. Send email to seller with invoice attachment
    // 4. Log the invoice generation event

    console.log('📄 Settlement invoice generated:', {
      invoiceNumber: invoice.invoiceNumber,
      propertyTitle,
      totalAmount: invoiceDetails.totalAmount,
      sellerEmail
    });

    // Create payment record in database
    console.log('💳 Creating payment record...');
    let paymentRecord = null;
    try {
      paymentRecord = await createPaymentRecord(
        invoice,
        { _id: propertyId, title: propertyTitle, address: 'Property Address', price: propertyPrice },
        { _id: sellerId, name: sellerName, email: sellerEmail },
        { _id: agentId, name: agentName }
      );
      console.log('✅ Payment record created:', paymentRecord._id);
    } catch (error) {
      console.error('⚠️ Warning: Failed to create payment record:', error);
      // Continue with invoice generation even if payment record creation fails
    }

    // Simulate PDF generation and email sending
    console.log('📧 Starting email simulation...');
    const emailSent = await simulateInvoiceEmail(invoice, sellerEmail);
    console.log('📧 Email simulation result:', emailSent);

    console.log('✅ Invoice generation completed successfully, returning response...');
    return NextResponse.json({
      success: true,
      message: 'Settlement invoice generated and sent successfully',
      data: {
        invoice,
        paymentRecord,
        emailSent,
        downloadUrl: `/api/invoices/${invoice._id}/pdf`,
        paymentInstructions: {
          bankName: COMPANY_BANK_DETAILS.bankName,
          accountName: invoiceDetails.bankDetails.accountName,
          bsb: invoiceDetails.bankDetails.bsb,
          accountNumber: invoiceDetails.bankDetails.accountNumber,
          reference: invoiceDetails.bankDetails.reference,
          amount: invoiceDetails.totalAmount,
          dueDate: invoiceDetails.dueDate
        }
      }
    });

  } catch (error) {
    console.error('Error generating settlement invoice:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate settlement invoice',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Simulate sending invoice email to seller
async function simulateInvoiceEmail(invoice: any, sellerEmail: string): Promise<boolean> {
  try {
    // In a real implementation, this would:
    // 1. Generate PDF invoice using a library like puppeteer or jsPDF
    // 2. Send email using a service like SendGrid, AWS SES, or similar
    // 3. Include bank details and payment instructions
    
    console.log('📧 Simulating invoice email to:', sellerEmail);
    console.log('📄 Invoice details:', {
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      dueDate: invoice.dueDate,
      bankDetails: invoice.bankDetails
    });
    
    // Simulate email delivery delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return false;
  }
}