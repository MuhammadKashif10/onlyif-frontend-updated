import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BuyerNotification from '@/models/BuyerNotification';
import { Types } from 'mongoose';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('📝 Updating notification in database:', params.id);
    
    await dbConnect();
    
    const { id } = params;
    const body = await request.json();
    const { action } = body; // 'mark_read', 'mark_unread'
    
    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }
    
    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid notification ID' },
        { status: 400 }
      );
    }
    
    // Determine new status based on action
    let newStatus: string;
    switch (action) {
      case 'mark_read':
        newStatus = 'read';
        break;
      case 'mark_unread':
        newStatus = 'unread';
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use mark_read or mark_unread' },
          { status: 400 }
        );
    }
    
    // Update notification in database
    const updatedNotification = await BuyerNotification.findByIdAndUpdate(
      id,
      { 
        status: newStatus,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedNotification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Notification updated:', updatedNotification._id);
    
    // Transform response
    const responseNotification = {
      _id: updatedNotification._id.toString(),
      id: updatedNotification._id.toString(),
      userId: updatedNotification.userId.toString(),
      type: updatedNotification.type,
      title: updatedNotification.title,
      message: updatedNotification.message,
      priority: updatedNotification.priority,
      status: updatedNotification.status,
      data: updatedNotification.data,
      createdAt: updatedNotification.createdAt,
      updatedAt: updatedNotification.updatedAt,
      read: updatedNotification.status === 'read'
    };
    
    return NextResponse.json({
      success: true,
      data: responseNotification,
      message: `Notification ${action.replace('_', ' ')} successfully`
    });
  } catch (error) {
    console.error('❌ Error updating notification in database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification in database' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🗑️ Deleting notification from database:', params.id);
    
    await dbConnect();
    
    const { id } = params;
    
    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid notification ID' },
        { status: 400 }
      );
    }
    
    // Delete notification from database
    const deletedNotification = await BuyerNotification.findByIdAndDelete(id);
    
    if (!deletedNotification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Notification deleted:', deletedNotification._id);
    
    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting notification from database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification from database' },
      { status: 500 }
    );
  }
}
