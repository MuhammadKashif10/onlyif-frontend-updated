'use client';

import { Navbar, Footer } from '@/components';
import EnhancedNotificationPanel from '@/components/reusable/EnhancedNotificationPanel';

export default function BuyerNotifications() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">
            Stay updated with property matches, status updates, and important information.
          </p>
        </div>
        
        <EnhancedNotificationPanel userType="buyer" />
      </main>
      
      <Footer />
    </div>
  );
}