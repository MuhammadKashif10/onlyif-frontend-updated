import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

interface PaymentCompletedEvent {
  paymentRecordId: string;
  invoiceNumber: string;
  amount: number;
  propertyTitle: string;
  sellerName: string;
  completedAt: string;
}

/**
 * Custom hook for real-time payment status updates in Admin Dashboard
 * Listens for Stripe webhook events and auto-refreshes payment data
 */
export const usePaymentUpdates = (enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Initialize Socket.IO connection
    const raw = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '';
    const base = raw.replace(/\/api$/, '');
    const socket = io(base, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;

    // Listen for payment completion events
    socket.on('payment_completed', (data: PaymentCompletedEvent) => {
      console.log('📡 Payment completion received:', data);
      
      try {
        // Invalidate and refetch payment-related queries
        queryClient.invalidateQueries({ queryKey: ['admin-payment-stats'] });
        queryClient.invalidateQueries({ queryKey: ['admin-pending-payments'] });
        
        // Show success notification (optional)
        if (typeof window !== 'undefined') {
          // You can integrate with your notification system here
          console.log(`✅ Payment completed: ${data.sellerName} paid A$${data.amount.toLocaleString('en-AU')} for ${data.propertyTitle}`);
        }
      } catch (error) {
        console.error('Error handling payment completion:', error);
      }
    });

    // Listen for connection events
    socket.on('connect', () => {
      console.log('🔌 Connected to payment updates socket');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from payment updates socket');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [enabled, queryClient]);

  return {
    isConnected: socketRef.current?.connected || false,
    socket: socketRef.current
  };
};

/**
 * Hook specifically for admin dashboard payment monitoring
 */
export const useAdminPaymentMonitoring = () => {
  return usePaymentUpdates(true);
};