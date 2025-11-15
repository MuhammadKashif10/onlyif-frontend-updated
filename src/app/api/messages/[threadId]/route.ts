import { NextRequest, NextResponse } from 'next/server';
import { USE_MOCKS } from '@/utils/mockWrapper';

// Import the same mock data from the main route to ensure consistency
const mockMessages = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'buyer-1',
    messageText: 'Hi, I\'m interested in the property at 123 Main St. Can we schedule a viewing?',
    timestamp: '2024-01-20T10:30:00Z',
    read: true
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'agent-1',
    messageText: 'I\'d be happy to show you the property this weekend.',
    timestamp: '2024-01-20T11:15:00Z',
    read: false
  },
  {
    id: 'msg-3',
    conversationId: 'conv-2',
    senderId: 'agent-1',
    messageText: 'I have a potential buyer interested in your property.',
    timestamp: '2024-01-20T11:30:00Z',
    read: true
  },
  {
    id: 'msg-4',
    conversationId: 'conv-2',
    senderId: 'seller-1',
    messageText: 'The property is available for viewing this weekend.',
    timestamp: '2024-01-20T12:00:00Z',
    read: true
  },
  {
    id: 'msg-settlement',
    conversationId: 'conv-2',
    senderId: 'agent-1',
    messageText: '🎉 Congratulations! Your property "hii hiii" has been successfully settled on 13 October 2025. \n\nThis means the sale is now complete and ownership has been officially transferred to the buyer. All necessary documents have been processed and the transaction is finalized.\n\n📊 COMMISSION INVOICE DETAILS:\n• Invoice Number: INV-20251013-0001\n• Commission Amount: A$4,664\n• GST (10%): A$466.40\n• Total Amount Due: A$5,130.40\n• Due Date: 12 November 2025\n\n🏦 PAYMENT INSTRUCTIONS:\n• Bank: Commonwealth Bank of Australia\n• Account Name: OnlyIf Real Estate Pty Ltd\n• BSB: 062-001\n• Account Number: 1234-5678\n• Payment Reference: INV-20251013-0001-SELLER\n\nThe tax invoice has been sent to your registered email address and is also available in your seller account dashboard.\n\nThank you for trusting me with the sale of your property. If you have any questions about the settlement process, commission invoice, or need copies of any documents, please don\'t hesitate to reach out.\n\nBest regards,\nSarah Johnson',
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: 'msg-5',
    conversationId: 'conv-3',
    senderId: 'agent-1',
    messageText: 'Good news! We have received an offer on your Family Home Property. The buyer is offering the full asking price.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: true
  },
  {
    id: 'msg-6',
    conversationId: 'conv-3',
    senderId: 'agent-1',
    messageText: 'Your property status has been updated to Contract Exchanged. The buyer has signed the contract and we are proceeding to settlement.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true
  },
  {
    id: 'msg-test-settlement',
    conversationId: 'conv-current-seller',
    senderId: 'agent-1',
    messageText: '🎉 Congratulations! Your property "Test Property" has been successfully settled on ' + new Date().toLocaleDateString() + '. \n\nThis means the sale is now complete and ownership has been officially transferred to the buyer. All necessary documents have been processed and the transaction is finalized.\n\n📋 COMMISSION INVOICE DETAILS:\n• Invoice Number: INV-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-0001\n• Commission Amount: A$5,500\n• GST (10%): A$550\n• Total Amount Due: A$6,050\n• Due Date: ' + new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()+'\n\n🏦 PAYMENT INSTRUCTIONS:\n• Bank: Commonwealth Bank of Australia\n• Account Name: OnlyIf Real Estate Pty Ltd\n• BSB: 062-001\n• Account Number: 1234-5678\n• Payment Reference: INV-TEST-SELLER\n\nThank you for trusting us with the sale of your property!',
    timestamp: new Date().toISOString(),
    read: false
  }
];

// GET /api/messages/[threadId] - Get messages in a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const { threadId } = params;
    
    if (!threadId) {
      return NextResponse.json(
        { success: false, error: 'Thread ID is required' },
        { status: 400 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    
    // Forward to backend API
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
    const backendApiUrl = `${backendBase}/api/messages/${threadId}`;
    
    console.log(`[Thread API] Forwarding to backend: ${backendApiUrl}`);
    
    try {
      const backendResponse = await fetch(backendApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': authHeader || '',
          'Content-Type': 'application/json',
        }
      });
      
      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('❌ Backend conversation messages API failed:', errorText);
        
        // If backend is not available, fallback to mock data for development
        if (USE_MOCKS) {
          console.log('🔄 Backend unavailable, falling back to mock data');
          console.log(`[Thread API] Getting messages for conversation: ${threadId}`);
          
          // Filter messages for this conversation
          let conversationMessages = mockMessages
            .filter(msg => msg.conversationId === threadId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          
          console.log(`[Thread API] Found ${conversationMessages.length} messages for conversation ${threadId}`);
          
          return NextResponse.json({
            success: true,
            data: conversationMessages
          });
        }
        
        return NextResponse.json(
          { 
            success: false, 
            error: `Backend API error: ${backendResponse.status} ${backendResponse.statusText}`,
            details: errorText
          },
          { status: backendResponse.status }
        );
      }
      
      const result = await backendResponse.json();
      console.log('✅ Conversation messages received from backend');
      
      return NextResponse.json(result);
      
    } catch (fetchError) {
      console.error('❌ Failed to connect to backend for conversation messages:', fetchError);
      
      // If backend connection fails, fallback to mock data for development
      if (USE_MOCKS) {
        console.log('🔄 Backend connection failed, falling back to mock data');
        console.log(`[Thread API] Getting messages for conversation: ${threadId}`);
        
        // Filter messages for this conversation
        let conversationMessages = mockMessages
          .filter(msg => msg.conversationId === threadId)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        console.log(`[Thread API] Found ${conversationMessages.length} messages for conversation ${threadId}`);
        
        return NextResponse.json({
          success: true,
          data: conversationMessages
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to connect to backend server' },
        { status: 503 }
      );
    }
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/messages/[threadId] - Mark messages as read
export async function PUT(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const { threadId } = params;
    const body = await request.json();
    const { userId } = body;
    
    if (!threadId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Thread ID and User ID are required' },
        { status: 400 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    
    // Forward to backend API
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
    const backendApiUrl = `${backendBase}/api/messages/${threadId}/read`;
    
    console.log(`[Thread API PUT] Forwarding mark as read to backend: ${backendApiUrl}`);
    
    try {
      const backendResponse = await fetch(backendApiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': authHeader || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });
      
      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('❌ Backend mark as read failed:', errorText);
        
        // If backend is not available, fallback to mock data for development
        if (USE_MOCKS) {
          console.log('🔄 Backend unavailable, falling back to mock mark as read');
          
          // Mark messages as read for this user
          mockMessages.forEach(msg => {
            if (msg.conversationId === threadId && msg.senderId !== userId) {
              msg.read = true;
            }
          });
          
          return NextResponse.json({
            success: true,
            data: { message: 'Messages marked as read' }
          });
        }
        
        return NextResponse.json(
          { 
            success: false, 
            error: `Backend API error: ${backendResponse.status} ${backendResponse.statusText}`,
            details: errorText
          },
          { status: backendResponse.status }
        );
      }
      
      const result = await backendResponse.json();
      console.log('✅ Messages marked as read in backend');
      
      return NextResponse.json(result);
      
    } catch (fetchError) {
      console.error('❌ Failed to connect to backend for mark as read:', fetchError);
      
      // If backend connection fails, fallback to mock data for development
      if (USE_MOCKS) {
        console.log('🔄 Backend connection failed, falling back to mock mark as read');
        
        // Mark messages as read for this user
        mockMessages.forEach(msg => {
          if (msg.conversationId === threadId && msg.senderId !== userId) {
            msg.read = true;
          }
        });
        
        return NextResponse.json({
          success: true,
          data: { message: 'Messages marked as read' }
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to connect to backend server' },
        { status: 503 }
      );
    }
    
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}