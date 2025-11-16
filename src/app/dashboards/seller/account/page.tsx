'use client';
import React from 'react';

// Helper to style status badge
const getStatusClass = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'pending':
    case 'sent':
    case 'viewed':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};
import { Navbar } from '@/components';
import Sidebar from '@/components/main/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { 
  CreditCard, 
  Receipt, 
  Download, 
  Eye, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText,
  ExternalLink,
  Bell,
  MessageSquare,
  User,
  Home
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface InvoicePayment {
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId?: string;
  reference?: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  property: {
    _id: string;
    title: string;
    address: string;
  };
  invoiceDate: string;
  dueDate: string;
  settlementDate: string;
  propertyValue: number;
  commissionRate: number;
  commissionAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: 'draft' | 'pending' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  isOverdue: boolean;
  payments?: InvoicePayment[];
  // Optional fields for payment details
  transactionId?: string;
  stripeAccountId?: string;
  stripeAccountEmail?: string;
}

interface PaymentPortalData {
  invoiceId: string;
  amount: number;
  paymentUrl: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  messageText: string;
  timestamp: string;
  read: boolean;
  propertyId?: string;
  propertyTitle?: string;
}

interface NotificationMessage extends Message {
  type: 'settlement' | 'status_update' | 'general';
  isNotification: boolean;
}

const SellerAccount = () => {
  const { user } = useAuth();

  // Password change state
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  
  // Invoice and payment state
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState<'account' | 'invoices' | 'payments' | 'notifications'>('account');
  const [paymentProcessing, setPaymentProcessing] = React.useState<string | null>(null);
  
  // Notification state
  const [notifications, setNotifications] = React.useState<NotificationMessage[]>([]);
  const [loadingNotifications, setLoadingNotifications] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  // Fetch seller invoices
  const fetchInvoices = React.useCallback(async () => {
    if (!user?.id) return;
    
    setLoadingInvoices(true);
    try {
      const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
      const invoicesApiUrl = `${backendBase}/api/invoices/seller/${user.id}`;
      
      console.log('🔗 Fetching invoices from backend:', invoicesApiUrl);
      
      const response = await fetch(invoicesApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log('📋 Backend invoices response:', data);
      
      if (data.success && data.data) {
        setInvoices(data.data);
      } else {
        console.log('⚠️ No invoices found or API error:', data);
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoadingInvoices(false);
    }
  }, [user?.id]);
  
  // Auto-refresh after Stripe success redirect
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const invoiceId = params.get('invoice');
    const sessionId = params.get('session_id');
    if (payment === 'success') {
      (async () => {
        try {
          if (sessionId) {
            const resp = await fetch('/api/payments/confirm', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ sessionId })
            });
            const data = await resp.json();
            if (data?.success) {
              toast.success('Payment confirmed. Invoice updated.');
            }
          }
        } catch {}
        // Refresh invoices a couple of times to catch webhook/confirm update
        fetchInvoices();
        const t1 = setTimeout(fetchInvoices, 1500);
        const t2 = setTimeout(fetchInvoices, 3500);
        return () => { clearTimeout(t1); clearTimeout(t2); };
      })();
    }
  }, [fetchInvoices]);
  
  // Fetch seller notifications
  const fetchNotifications = React.useCallback(async () => {
    if (!user?.id) return;
    
    console.log('Fetching notifications for seller user:', user.id, user.name);
    
    setLoadingNotifications(true);
    try {
      // Use backend API for fetching seller notifications/messages
      const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
      const messagesApiUrl = `${backendBase}/api/messages?userId=${user.id}&userRole=seller`;
      
      console.log('🔗 Fetching seller messages from backend:', messagesApiUrl);
      
      let response = await fetch(messagesApiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      let data = await response.json();
      console.log('📬 Backend messages response:', data);
      
      if (response.ok) {
        if (data.success && data.data) {
          // Extract messages from conversations and filter for agent messages
          const allMessages: NotificationMessage[] = [];
          
          // Get messages from each conversation
          for (const conversation of data.data) {
            if (conversation.participants && conversation.lastMessage) {
              const agent = conversation.participants.find((p: any) => p.role === 'agent');
              const seller = conversation.participants.find((p: any) => p.role === 'seller');
              
              // Check if this is an agent message (not sent by the seller)
              if (agent && conversation.lastMessage.senderId !== user.id && conversation.lastMessage.senderId !== seller?.userId) {
                // Fetch detailed messages for this conversation from backend
                const conversationApiUrl = `${backendUrl}/api/messages/${conversation.id}`;
                console.log('🔗 Fetching conversation messages from backend:', conversationApiUrl);
                
                const messagesResponse = await fetch(conversationApiUrl, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (messagesResponse.ok) {
                  const messagesData = await messagesResponse.json();
                  if (messagesData.success && messagesData.data) {
                    // Add agent messages as notifications (exclude seller's own messages)
                    messagesData.data
                      .filter((msg: any) => msg.senderId !== user.id && msg.senderId !== seller?.userId && msg.senderId === agent.userId)
                      .forEach((msg: any) => {
                        const notificationMessage: NotificationMessage = {
                          ...msg,
                          senderName: agent.name || 'Agent',
                          senderRole: 'agent',
                          propertyId: conversation.propertyId,
                          propertyTitle: conversation.propertyTitle,
                          type: msg.messageText.includes('🎉') && msg.messageText.includes('settled') ? 'settlement' : 'general',
                          isNotification: true
                        };
                        allMessages.push(notificationMessage);
                      });
                  }
                }
              }
            }
          }
          
          // Sort by timestamp (newest first)
          allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          setNotifications(allMessages);
          setUnreadCount(allMessages.filter(msg => !msg.read).length);
          
          console.log('Notifications loaded:', allMessages.length, 'messages');
        }
      } else {
        console.error('Failed to fetch notifications:', data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoadingNotifications(false);
    }
  }, [user?.id]);
  
  // Mark notification as read
  const markNotificationAsRead = async (messageId: string, conversationId: string) => {
    try {
      const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
      const markReadUrl = `${backendBase}/api/messages/${conversationId}/read`;
      
      console.log('🔗 Marking message as read in backend:', markReadUrl);
      
      const response = await fetch(markReadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user?.id, messageId: messageId })
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === messageId 
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Initialize payment for an invoice
  const handlePayInvoice = async (invoiceId: string, amount: number) => {
    setPaymentProcessing(invoiceId);
    
    try {
      const initUrl = '/api/payments/initialize';
      const resp = await fetch(initUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ invoiceId, amount, type: 'commission_payment' })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || 'Failed to initialize payment');

      const paymentUrl = data?.data?.paymentUrl || data?.paymentUrl;
      if (paymentUrl) {
        window.open(paymentUrl, '_blank', 'noopener,noreferrer');
        toast.success('Redirecting to secure payment portal...');
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to initialize payment. Please try again.');
    } finally {
      setPaymentProcessing(null);
    }
  };
  
  // Generate and download invoice PDF (client-side)
  const generateAndDownloadInvoicePdf = async (invoice: Invoice) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Derive a single authoritative transaction ID (prefer Stripe payment_intent)
      const latestPayment = Array.isArray(invoice.payments) && invoice.payments.length > 0 
        ? invoice.payments[invoice.payments.length - 1] 
        : undefined;
      const txnId = invoice.transactionId || latestPayment?.transactionId || invoice._id;

      // Header
      doc.setFontSize(18);
      doc.text('OnlyIf - Commission Tax Invoice', 14, 18);
      doc.setFontSize(11);
      doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 28);
      doc.text(`Transaction ID: ${txnId}`, 14, 34);

      // Details
      const amount = formatCurrency(invoice.totalAmount);
      const dateStr = formatDate(invoice.invoiceDate || invoice.settlementDate || new Date().toISOString());
      doc.text(`Property: ${invoice.property?.title || 'N/A'}`, 14, 44);
      doc.text(`Amount: ${amount}`, 14, 50);
      doc.text(`Date: ${dateStr}`, 14, 56);
      doc.text(`Status: ${invoice.status.toUpperCase()}`, 14, 62);

      // Stripe details (optional)
      const stripeLine1 = `Stripe Account: ${invoice.stripeAccountId || 'N/A'}`;
      const stripeLine2 = invoice.stripeAccountEmail ? `Stripe Email: ${invoice.stripeAccountEmail}` : '';
      doc.text(stripeLine1, 14, 72);
      if (stripeLine2) doc.text(stripeLine2, 14, 78);

      // Footer
      doc.setFontSize(9);
      doc.text('Thank you for using OnlyIf. This invoice was generated automatically.', 14, 286);

      const propPart = toSafeFilePart(invoice.property?.title || invoice.invoiceNumber || 'Invoice');
      doc.save(`Invoice_${propPart}.pdf`);
      toast.success('Invoice downloaded');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate invoice PDF');
    }
  };
  
  // Load invoices and notifications on component mount and tab change
  React.useEffect(() => {
    if (selectedTab === 'invoices' || selectedTab === 'payments') {
      fetchInvoices();
    } else if (selectedTab === 'notifications') {
      fetchNotifications();
    }
  }, [selectedTab, fetchInvoices, fetchNotifications]);
  
  // Load initial notification count
  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    try {
      setIsSaving(true);
      const { default: request } = await import('@/utils/api');
      const res = await request<{ message: string }>('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setMessage(res.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err?.message || 'Failed to change password.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper functions for UI
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Create a filesystem-safe fragment for filenames (keeps A-Z, a-z, 0-9, _ and -)
  const toSafeFilePart = (value: string) => {
    return (value || '')
      .normalize('NFKD')
      .replace(/[\\/:*?"<>|]+/g, '') // remove illegal filename chars
      .replace(/\s+/g, '_') // spaces to underscores
      .replace(/[^A-Za-z0-9_\-]+/g, '') // strip other punctuation
      .replace(/^_+|_+$/g, '') // trim leading/trailing underscores
      .slice(0, 80) || 'Document';
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': case 'sent': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
<Navbar 
logo="/images/logo.PNG"
        logoText=""
        navigationItems={[
          { label: 'Dashboard', href: '/dashboards/seller', isActive: false },
          { label: 'Listings', href: '/dashboards/seller/listings', isActive: false },
        ]}
        ctaText="Account"
        ctaHref="/dashboards/seller/account"
      />
      
      <div className="flex">
        <Sidebar userType="seller" />
        
        <main className="flex-1 ml-64">
          <div className="pt-16 sm:pt-20 md:pt-24">
            {/* Header Section */}
            <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-14 shadow-sm border-b border-orange-500/20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">Seller Account</h1>
                  <p className="hidden md:block text-gray-900 max-w-3xl mx-auto">
                    Manage your account, access commission invoices, and secure payment portal.
                  </p>
                </div>
              </div>
            </section>

            {/* Tab Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
              <div className="bg-white rounded-lg shadow-sm relative z-10">
                <nav className="flex flex-wrap gap-2 md:gap-0 md:space-x-8 px-4 md:px-8 py-3 md:py-4">
                  {[
                    { key: 'account', label: 'Account Info', icon: Receipt },
                    { key: 'notifications', label: 'Notifications', icon: Bell },
                    { key: 'invoices', label: 'Commission Invoices', icon: FileText },
                    { key: 'payments', label: 'Payment Portal', icon: CreditCard },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTab(key as any)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        selectedTab === key
                          ? 'bg-orange-100 text-orange-800 ring-1 ring-orange-200'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {label}
                      {key === 'notifications' && unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <div className="bg-white rounded-lg shadow-sm">
                {/* Account Information Tab */}
                {selectedTab === 'account' && (
                  <div className="p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="text-base font-medium text-gray-900">{user?.name || '—'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-base font-medium text-gray-900">{user?.email || '—'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Role</p>
                          <p className="text-base font-medium text-gray-900">{user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : '—'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">User ID</p>
                          <p className="text-base font-medium text-gray-900 break-all">{user?.id || '—'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Change Password Section */}
                    <div className="border-t pt-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
                      <p className="text-sm text-gray-500 mb-4">
                        For security, your existing password cannot be displayed. Use the toggles to view what you type.
                      </p>

                      {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">{error}</div>}
                      {message && <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md">{message}</div>}

                      <form onSubmit={handleChangePassword} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Current Password</label>
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              type={showCurrent ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrent((v) => !v)}
                              className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
                            >
                              {showCurrent ? 'Hide' : 'Show'}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">New Password</label>
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              type={showNew ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNew((v) => !v)}
                              className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
                            >
                              {showNew ? 'Hide' : 'Show'}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              type={showConfirm ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Re-enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm((v) => !v)}
                              className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
                            >
                              {showConfirm ? 'Hide' : 'Show'}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors"
                        >
                          {isSaving ? 'Saving...' : 'Update Password'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {selectedTab === 'notifications' && (
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                        <p className="text-gray-600 mt-1">Messages and updates from your agent</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {unreadCount} unread
                          </span>
                        )}
                        <button
                          onClick={fetchNotifications}
                          disabled={loadingNotifications}
                          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                        >
                          {loadingNotifications ? 'Loading...' : 'Refresh'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Debug Info - remove in production */}
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-xs text-gray-600 space-y-1">
                        <div><strong>Debug Info:</strong></div>
                        <div>User ID: {user?.id}</div>
                        <div>User Name: {user?.name}</div>
                        <div>User Role: {user?.role}</div>
                        <div>Notifications Count: {notifications.length}</div>
                        <div>Unread Count: {unreadCount}</div>
                        <div>Loading: {loadingNotifications ? 'Yes' : 'No'}</div>
                      </div>
                    </div>

                    {loadingNotifications ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        <span className="ml-2 text-gray-600">Loading notifications...</span>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-12">
                        <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                        <p className="text-gray-500">Agent notifications and property updates will appear here.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {notifications.map((notification) => {
                          const isSettlement = notification.type === 'settlement';
                          const formatDate = (dateString: string) => {
                            return new Date(dateString).toLocaleDateString('en-AU', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                          };

                          return (
                            <div
                              key={notification.id}
                              className={`border rounded-lg p-6 transition-all hover:shadow-md ${
                                notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                              }`}
                              onClick={() => {
                                if (!notification.read) {
                                  markNotificationAsRead(notification.id, notification.conversationId);
                                }
                              }}
                            >
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    isSettlement ? 'bg-green-100' : 'bg-blue-100'
                                  }`}>
                                    {isSettlement ? (
                                      <Home className="h-5 w-5 text-green-600" />
                                    ) : (
                                      <MessageSquare className="h-5 w-5 text-blue-600" />
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <User className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm font-medium text-gray-900">{notification.senderName}</span>
                                      {isSettlement && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          Settlement Complete
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm text-gray-500">{formatDate(notification.timestamp)}</span>
                                      {!notification.read && (
                                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {notification.propertyTitle && (
                                    <div className="flex items-center space-x-1 mb-3">
                                      <Home className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm text-gray-600">Property: {notification.propertyTitle}</span>
                                    </div>
                                  )}
                                  
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                      {notification.messageText}
                                    </p>
                                  </div>
                                  
                                  {/* Invoice Information for Settlement Notifications */}
                                  {isSettlement && notification.messageText.includes('COMMISSION INVOICE') && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                      <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                                        <Receipt className="h-4 w-4 mr-2" />
                                        Commission Invoice Actions
                                      </h4>
                                      <div className="space-y-2">
                                        <button
                                          onClick={() => {
                                            // Extract invoice number from message (basic parsing)
                                            const invoiceMatch = notification.messageText.match(/Invoice Number: (INV-\d+-\d+)/);
                                            const invoiceNumber = invoiceMatch?.[1] || 'latest';
                                            const downloadUrl = `/api/invoices/inv_${Date.now()}/pdf`;
                                            
                                            // Download PDF with a meaningful filename including the property title when available
                                            const link = document.createElement('a');
                                            link.href = downloadUrl;
                                            const propPart = toSafeFilePart(notification.propertyTitle || invoiceNumber);
                                            link.download = `Invoice_${propPart}.pdf`;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            
                                            toast.success('Invoice download started');
                                          }}
                                          className="inline-flex items-center px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mr-2"
                                        >
                                          <Download className="h-3 w-3 mr-1" />
                                          Download Invoice
                                        </button>
                                        
                                        <button
                                          onClick={() => {
                                            // Navigate to Commission Invoices tab
                                            setSelectedTab('invoices');
                                            toast.success('Navigated to invoices section');
                                          }}
                                          className="inline-flex items-center px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                          <CreditCard className="h-3 w-3 mr-1" />
                                          View & Pay Invoice
                                        </button>
                                      </div>
                                      
                                      <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-700">
                                        <strong>Payment Due:</strong> Commission payment is due within 30 days of invoice date. 
                                        Use the payment reference provided when making bank transfer.
                                      </div>
                                    </div>
                                  )}
                                  
                                  {!notification.read && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markNotificationAsRead(notification.id, notification.conversationId);
                                      }}
                                      className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                      Mark as read
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {notifications.length > 0 && (
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => {
                            // Navigate to full messages page
                            window.location.href = '/dashboards/seller/messages';
                          }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View All Messages
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Commission Invoices Tab */}
                {selectedTab === 'invoices' && (
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Commission Tax Invoices</h2>
                        <p className="text-gray-600 mt-1">Download and view your commission invoices for tax purposes</p>
                      </div>
                      <button
                        onClick={fetchInvoices}
                        disabled={loadingInvoices}
                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                      >
                        {loadingInvoices ? 'Loading...' : 'Refresh'}
                      </button>
                    </div>

                    {loadingInvoices ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        <span className="ml-2 text-gray-600">Loading invoices...</span>
                      </div>
                    ) : invoices.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                        <p className="text-gray-500">Commission invoices will appear here after property settlements.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {invoices.map((invoice) => (
                          <div key={invoice._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
<span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusClass(invoice.status)}`}>
                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                  </span>
                                  {invoice.isOverdue && (
                                    <span className="flex items-center text-red-600 text-sm">
                                      <AlertTriangle className="h-4 w-4 mr-1" />
                                      Overdue
                                    </span>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                  <div>
                                    <p className="font-medium">Property:</p>
                                    <p>{invoice.property?.title || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Commission:</p>
                                    <p>{invoice.commissionRate}% of {formatCurrency(invoice.propertyValue)}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Due Date:</p>
                                    <p className={invoice.isOverdue ? 'text-red-600 font-medium' : ''}>
                                      {formatDate(invoice.dueDate)}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(invoice.totalAmount)}
                                  </div>
                                  {invoice.status === 'paid' && (
                                    <div className="flex items-center text-green-600">
                                      <CheckCircle className="h-5 w-5 mr-1" />
                                      <span className="text-sm font-medium">Paid in Full</span>
                                      <button
                                        onClick={() => generateAndDownloadInvoicePdf(invoice)}
                                        className="ml-3 inline-flex items-center px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                      >
                                        <Download className="h-3 w-3 mr-1" />
                                        Download Invoice
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="ml-6 flex flex-col space-y-2">
                                <button
                                  onClick={() => generateAndDownloadInvoicePdf(invoice)}
                                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </button>
                                
                                {invoice.status !== 'paid' && (
                                  <button
                                    onClick={() => handlePayInvoice(invoice._id, invoice.amountDue || invoice.totalAmount)}
                                    disabled={paymentProcessing === invoice._id}
                                    className="flex items-center px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors"
                                  >
                                    {paymentProcessing === invoice._id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    ) : (
                                      <CreditCard className="h-4 w-4 mr-2" />
                                    )}
                                    Pay Now
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Portal Tab */}
                {selectedTab === 'payments' && (
                  <div className="p-8">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Secure Payment Portal</h2>
                      <p className="text-gray-600 mt-1">Manage your commission payments securely</p>
                    </div>

                    {loadingInvoices ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        <span className="ml-2 text-gray-600">Loading payment information...</span>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Payment Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <div className="flex items-center">
                              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                              <div>
                                <p className="text-sm font-medium text-green-800">Total Paid</p>
                                <p className="text-2xl font-bold text-green-900">
                                  {formatCurrency(invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0))}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <div className="flex items-center">
                              <DollarSign className="h-8 w-8 text-yellow-600 mr-3" />
                              <div>
                                <p className="text-sm font-medium text-yellow-800">Amount Due</p>
                                <p className="text-2xl font-bold text-yellow-900">
                                  {formatCurrency(invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.amountDue || i.totalAmount), 0))}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SellerAccount;