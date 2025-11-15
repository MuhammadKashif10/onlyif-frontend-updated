import { NextRequest, NextResponse } from 'next/server';
import { USE_MOCKS } from '@/utils/mockWrapper';

// Mock conversation data with business rules enforcement
const mockConversations = [
  {
    id: 'conv-1',
    type: 'buyer_agent',
    propertyId: '1',
    propertyTitle: 'Modern Downtown Condo',
    participants: [
      { userId: 'buyer-1', name: 'John Doe', role: 'buyer', email: 'john@example.com' },
      { userId: 'agent-1', name: 'Sarah Johnson', role: 'agent', email: 'sarah@example.com' }
    ],
    lastMessage: {
      id: 'msg-2',
      senderId: 'agent-1',
      messageText: 'I\'d be happy to show you the property this weekend.',
      timestamp: '2024-01-20T11:15:00Z'
    },
    unreadCount: 1,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T11:15:00Z'
  },
  {
    id: 'conv-2',
    type: 'agent_seller',
    propertyId: '1',
    propertyTitle: 'hii hiii',
    participants: [
      { userId: 'agent-1', name: 'Sarah Johnson', role: 'agent', email: 'sarah@example.com' },
      { userId: 'seller-1', name: 'Mike Wilson', role: 'seller', email: 'mike@example.com' }
    ],
    lastMessage: {
      id: 'msg-settlement',
      senderId: 'agent-1',
      messageText: '🎉 Congratulations! Your property "hii hiii" has been successfully settled on 13 October 2025.',
      timestamp: new Date().toISOString()
    },
    unreadCount: 1,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'conv-3',
    type: 'agent_seller',
    propertyId: '2',
    propertyTitle: 'Family Home Property',
    participants: [
      { userId: 'agent-1', name: 'Sarah Johnson', role: 'agent', email: 'sarah@example.com' },
      { userId: 'seller-1', name: 'Mike Wilson', role: 'seller', email: 'mike@example.com' }
    ],
    lastMessage: {
      id: 'msg-6',
      senderId: 'agent-1',
      messageText: 'Your property status has been updated to Contract Exchanged. The buyer has signed the contract and we are proceeding to settlement.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    unreadCount: 0,
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'conv-current-seller',
    type: 'agent_seller',
    propertyId: 'test-property',
    propertyTitle: 'Test Settlement Property',
    participants: [
      { userId: 'agent-1', name: 'Sarah Johnson', role: 'agent', email: 'sarah@example.com' },
      { userId: '684c80ca3c1f5502e90bf42', name: 'Current Seller', role: 'seller', email: 'seller@test.com' }
    ],
    lastMessage: {
      id: 'msg-test-settlement',
      senderId: 'agent-1',
      messageText: '🎉 Congratulations! Your property "Test Settlement Property" has been successfully settled.',
      timestamp: new Date().toISOString()
    },
    unreadCount: 1,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    updatedAt: new Date().toISOString()
  }
];

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
  }
];

// Business rule enforcement function
function validateMessageParticipants(senderRole: string, recipientRole: string): boolean {
  // No direct buyer-seller communication allowed
  if ((senderRole === 'buyer' && recipientRole === 'seller') ||
      (senderRole === 'seller' && recipientRole === 'buyer')) {
    return false;
  }
  
  // Valid combinations: buyer-agent, agent-seller, agent-agent
  const validCombinations = [
    ['buyer', 'agent'],
    ['agent', 'buyer'],
    ['agent', 'seller'],
    ['seller', 'agent'],
    ['agent', 'agent']
  ];
  
  return validCombinations.some(([role1, role2]) => 
    (senderRole === role1 && recipientRole === role2)
  );
}

// GET /api/messages - Get conversations for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    
    // Forward to backend API
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
    const backendApiUrl = `${backendBase}/api/messages?userId=${userId}&userRole=${userRole || ''}`;
    
    console.log(`[Messages API] Forwarding to backend: ${backendApiUrl}`);
    
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
        console.error('❌ Backend messages API failed:', errorText);
        
        // If backend is not available, fallback to mock data for development
        if (USE_MOCKS) {
          console.log('🔄 Backend unavailable, falling back to mock data');
          
          // Filter conversations where user is a participant
          let userConversations = mockConversations.filter(conv => 
            conv.participants.some(p => p.userId === userId)
          );
          
          // If no conversations found and this is a seller, map to mock seller conversations
          if (userConversations.length === 0 && userRole === 'seller') {
            console.log(`[Messages API] No conversations found for user ${userId}, mapping to mock seller conversations`);
            
            // Create dynamic conversations mapped to the current user
            userConversations = mockConversations
              .filter(conv => conv.participants.some(p => p.role === 'seller'))
              .map(conv => ({
                ...conv,
                participants: conv.participants.map(p => 
                  p.role === 'seller' 
                    ? { ...p, userId, name: 'Current Seller' }
                    : p
                )
              }));
          }
          
          console.log(`[Messages API] Found ${userConversations.length} conversations for user ${userId}`);
          
          return NextResponse.json({
            success: true,
            data: userConversations
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
      console.log('✅ Messages received from backend');
      
      return NextResponse.json(result);
      
    } catch (fetchError) {
      console.error('❌ Failed to connect to backend:', fetchError);
      
      // If backend connection fails, fallback to mock data for development
      if (USE_MOCKS) {
        console.log('🔄 Backend connection failed, falling back to mock data');
        
        // Filter conversations where user is a participant
        let userConversations = mockConversations.filter(conv => 
          conv.participants.some(p => p.userId === userId)
        );
        
        // If no conversations found and this is a seller, map to mock seller conversations
        if (userConversations.length === 0 && userRole === 'seller') {
          console.log(`[Messages API] No conversations found for user ${userId}, mapping to mock seller conversations`);
          
          // Create dynamic conversations mapped to the current user
          userConversations = mockConversations
            .filter(conv => conv.participants.some(p => p.role === 'seller'))
            .map(conv => ({
              ...conv,
              participants: conv.participants.map(p => 
                p.role === 'seller' 
                  ? { ...p, userId, name: 'Current Seller' }
                  : p
              )
            }));
        }
        
        return NextResponse.json({
          success: true,
          data: userConversations
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to connect to backend server' },
        { status: 503 }
      );
    }
    
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a message or create conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, senderId, senderRole, recipientId, recipientRole, messageText, propertyId } = body;
    
    if (!senderId || !messageText) {
      return NextResponse.json(
        { success: false, error: 'Sender ID and message text are required' },
        { status: 400 }
      );
    }

    // Enforce business rules
    if (recipientRole && !validateMessageParticipants(senderRole, recipientRole)) {
      return NextResponse.json(
        { success: false, error: 'Direct communication between buyers and sellers is not allowed. Please communicate through an agent.' },
        { status: 403 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    
    // Forward to backend API
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
    const backendApiUrl = `${backendBase}/api/messages`;
    
    console.log(`[Messages API POST] Forwarding message to backend:`, backendApiUrl);
    console.log(`[Messages API POST] Message payload:`, { senderId, recipientId, messageText, propertyId });
    
    try {
      const backendResponse = await fetch(backendApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });
      
      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('❌ Backend message send failed:', errorText);
        
        // If backend is not available, fallback to mock data for development
        if (USE_MOCKS) {
          console.log('🔄 Backend unavailable, falling back to mock message creation');
          
          const newMessage = {
            id: `msg-${Date.now()}`,
            conversationId: conversationId || `conv-${Date.now()}`,
            senderId,
            messageText,
            timestamp: new Date().toISOString(),
            read: false
          };
          
          // Add to mock data
          mockMessages.push(newMessage);
          
          // Update conversation's last message
          const conversation = mockConversations.find(c => c.id === newMessage.conversationId);
          if (conversation) {
            conversation.lastMessage = {
              id: newMessage.id,
              senderId: newMessage.senderId,
              messageText: newMessage.messageText,
              timestamp: newMessage.timestamp
            };
            conversation.updatedAt = newMessage.timestamp;
          }
          
          return NextResponse.json({
            success: true,
            data: newMessage
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
      console.log('✅ Message sent successfully to backend');
      
      return NextResponse.json(result);
      
    } catch (fetchError) {
      console.error('❌ Failed to connect to backend for message sending:', fetchError);
      
      // If backend connection fails, fallback to mock data for development
      if (USE_MOCKS) {
        console.log('🔄 Backend connection failed, falling back to mock message creation');
        
        const newMessage = {
          id: `msg-${Date.now()}`,
          conversationId: conversationId || `conv-${Date.now()}`,
          senderId,
          messageText,
          timestamp: new Date().toISOString(),
          read: false
        };
        
        // Add to mock data
        mockMessages.push(newMessage);
        
        return NextResponse.json({
          success: true,
          data: newMessage
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to connect to backend server' },
        { status: 503 }
      );
    }
    
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}