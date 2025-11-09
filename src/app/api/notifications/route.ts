import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import BuyerNotification from '@/models/BuyerNotification';
import User from '@/models/User';

// Helper function to get user from request headers
async function getUserFromRequest(request: NextRequest) {
  try {
    // In a production app, you would decode JWT token from Authorization header
    // For now, we'll use a mock user approach but query from database
    await dbConnect();
    
    // Try to find a buyer user in the database
    const buyerUser = await User.findOne({ 
      role: 'buyer', 
      isActive: true, 
      isDeleted: false 
    }).limit(1);
    
    if (buyerUser) {
      return {
        id: buyerUser._id.toString(),
        role: buyerUser.role,
        email: buyerUser.email
      };
    }
    
    // Fallback if no buyer found
    return null;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔔 Getting real notifications from database...');
    
    // Connect to database
    await dbConnect();
    
    // Get user from request
    const user = await getUserFromRequest(request);
    
    if (!user) {
      console.log('❌ No user found, returning empty notifications');
      return NextResponse.json({
        success: true,
        data: {
          notifications: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
          unreadCount: 0
        }
      });
    }
    
    console.log('✅ Found user:', { id: user.id, role: user.role, email: user.email });
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const filter = searchParams.get('filter') || 'all';
    
    // Build query for notifications
    const query: any = { userId: user.id };
    
    // Apply status filter
    if (filter === 'unread') {
      query.status = 'unread';
    } else if (filter === 'read') {
      query.status = 'read';
    }
    
    console.log('📊 Query:', query);
    
    // Get total count for pagination
    const total = await BuyerNotification.countDocuments({ userId: user.id });
    const unreadCount = await BuyerNotification.countDocuments({ 
      userId: user.id, 
      status: 'unread' 
    });
    
    // Get notifications with pagination
    const notifications = await BuyerNotification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();
    
    console.log(`📋 Found ${notifications.length} notifications (${unreadCount} unread)`);
    
    // Transform notifications to match frontend expectations
    const transformedNotifications = notifications.map(notification => ({
      _id: notification._id.toString(),
      id: notification._id.toString(),
      userId: notification.userId.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      status: notification.status,
      data: notification.data,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      // Add legacy read field for compatibility
      read: notification.status === 'read'
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        notifications: transformedNotifications,
        pagination: {
          page,
          limit,
          total: await BuyerNotification.countDocuments(query),
          pages: Math.ceil((await BuyerNotification.countDocuments(query)) / limit)
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('❌ Error fetching notifications from database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications from database' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating new notification in database...');
    
    await dbConnect();
    
    const body = await request.json();
    const { type, title, message, data, targetUserId, priority } = body;
    
    // Validate required fields
    if (!type || !title || !message || !targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, title, message, targetUserId' },
        { status: 400 }
      );
    }
    
    // Create new notification in database
    const newNotification = new BuyerNotification({
      userId: targetUserId,
      type,
      title,
      message,
      priority: priority || 'medium',
      status: 'unread',
      data: data || {},
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedNotification = await newNotification.save();
    console.log('✅ Notification created with ID:', savedNotification._id);
    
    // Transform response
    const responseNotification = {
      _id: savedNotification._id.toString(),
      id: savedNotification._id.toString(),
      userId: savedNotification.userId.toString(),
      type: savedNotification.type,
      title: savedNotification.title,
      message: savedNotification.message,
      priority: savedNotification.priority,
      status: savedNotification.status,
      data: savedNotification.data,
      createdAt: savedNotification.createdAt,
      updatedAt: savedNotification.updatedAt,
      read: savedNotification.status === 'read'
    };
    
    return NextResponse.json({
      success: true,
      data: responseNotification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating notification in database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification in database' },
      { status: 500 }
    );
  }
}
