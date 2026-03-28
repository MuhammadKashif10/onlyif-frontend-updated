import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const { invoiceId } = params;

    // In a real implementation, you would:
    // 1. Fetch invoice details from database
    // 2. Generate PDF using a library like puppeteer, jsPDF, or PDFKit
    // 3. Return the PDF as a blob

    // For now, return a mock PDF response
    const mockInvoicePDF = await generateMockInvoicePDF(invoiceId);

    return new NextResponse(mockInvoicePDF, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${invoiceId}.pdf"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate invoice PDF',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Mock PDF generation - in production, use proper PDF library
async function generateMockInvoicePDF(invoiceId: string): Promise<Buffer> {
  // In production, fetch invoice data from database and generate proper PDF
  // For now, we'll create a more complete mock that includes agent account info
  
  // Mock fetch invoice data (in production, query the database)
  // This should include agent.bankAccountNumber from populated data
  const mockInvoiceData = {
    invoiceNumber: 'INV-2025-000022',
    property: { title: 'House no 55', price: 96.58 },
    amount: 96.58,
    date: new Date().toISOString(),
    agentAccountNumber: '—' // This will be populated from actual agent data
  };
  
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Times-Roman
>>
endobj

5 0 obj
<<
/Length 350
>>
stream
BT
/F1 12 Tf
72 720 Td
(OnlyIf - Payment Receipt) Tj
0 -24 Td
(Invoice #: ${mockInvoiceData.invoiceNumber}) Tj
0 -24 Td
(Property: ${mockInvoiceData.property.title}) Tj
0 -24 Td
(Amount: $${mockInvoiceData.amount}) Tj
0 -24 Td
(Date: ${new Date(mockInvoiceData.date).toLocaleDateString()}) Tj
0 -36 Td
(Account Number: ${mockInvoiceData.agentAccountNumber}) Tj
0 -24 Td
(Note: In production, agent account number will be fetched from database) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000019 00000 n 
0000000073 00000 n 
0000000114 00000 n 
0000000244 00000 n 
0000000323 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
574
%%EOF`;

  return Buffer.from(pdfContent, 'utf8');
}
