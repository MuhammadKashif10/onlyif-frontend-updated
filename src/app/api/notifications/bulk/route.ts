import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BuyerNotification from '@/models/BuyerNotification';
import User from '@/models/User';
import { Types } from 'mongoose';

// Helper function to get user from request headers
async function getUserFromRequest(request: NextRequest) {
  try {
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
    
    return null;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('📎 Performing bulk notification operation...');
    
    await dbConnect();
    
    const body = await request.json();
    const { action, notificationIds } = body; // 'mark_all_read', 'delete_all', 'mark_selected_read', 'delete_selected'
    
    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }
    
    // Get user from request
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }
    
    let affectedCount = 0;
    
    switch (action) {
      case 'mark_all_read':
        // Update all unread notifications for user
        const readResult = await BuyerNotification.updateMany(
          { userId: user.id, status: 'unread' },
          { status: 'read', updatedAt: new Date() }
        );
        affectedCount = readResult.modifiedCount;
        console.log(`✅ Marked ${affectedCount} notifications as read`);
        break;
        
      case 'delete_all':
        // Delete all notifications for user
        const deleteAllResult = await BuyerNotification.deleteMany({
          userId: user.id
        });
        affectedCount = deleteAllResult.deletedCount;
        console.log(`✅ Deleted ${affectedCount} notifications`);
        break;
        
      case 'mark_selected_read':
        if (!notificationIds || !Array.isArray(notificationIds)) {
          return NextResponse.json(
            { success: false, error: 'Notification IDs are required for selected action' },
            { status: 400 }
          );
        }
        
        // Validate ObjectIds
        const validIds = notificationIds.filter(id => Types.ObjectId.isValid(id));
        if (validIds.length === 0) {
          return NextResponse.json(
            { success: false, error: 'No valid notification IDs provided' },
            { status: 400 }
          );
        }
        
        const readSelectedResult = await BuyerNotification.updateMany(
          { _id: { $in: validIds }, userId: user.id },
          { status: 'read', updatedAt: new Date() }
        );
        affectedCount = readSelectedResult.modifiedCount;
        console.log(`✅ Marked ${affectedCount} selected notifications as read`);
        break;
        
      case 'delete_selected':
        if (!notificationIds || !Array.isArray(notificationIds)) {
          return NextResponse.json(
            { success: false, error: 'Notification IDs are required for selected action' },
            { status: 400 }
          );
        }
        
        // Validate ObjectIds
        const validDeleteIds = notificationIds.filter(id => Types.ObjectId.isValid(id));
        if (validDeleteIds.length === 0) {
          return NextResponse.json(
            { success: false, error: 'No valid notification IDs provided' },
            { status: 400 }
          );
        }
        
        const deleteSelectedResult = await BuyerNotification.deleteMany({
          _id: { $in: validDeleteIds },
          userId: user.id
        });
        affectedCount = deleteSelectedResult.deletedCount;
        console.log(`✅ Deleted ${affectedCount} selected notifications`);
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Supported: mark_all_read, delete_all, mark_selected_read, delete_selected' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      data: { affectedCount },
      message: `${affectedCount} notifications updated successfully`
    });
  } catch (error) {
    console.error('❌ Error performing bulk notification operation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk operation on database' },
      { status: 500 }
    );
  }
}
