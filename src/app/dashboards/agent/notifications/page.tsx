'use client';

import { Footer, Navbar } from '@/components';
import { useAuth } from '@/context/AuthContext';
import EnhancedNotificationPanel from '@/components/reusable/EnhancedNotificationPanel';

export default function AgentNotifications() {
  const { user } = useAuth();
  const agentName = user?.name || 'Agent';
  const agentAvatar = (user as any)?.profileImage || (user as any)?.avatar || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">
            Manage property assignments, inspection bookings, and client communications.
          </p>
        </div>
        
        <EnhancedNotificationPanel userType="agent" />
      </main>
      
      <Footer />
    </div>
  );
}
