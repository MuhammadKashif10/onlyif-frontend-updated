'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Home,
  LayoutDashboard,
  Building2,
  Settings,
  Plus,
  ChevronRight,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/utils/currency';

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
  const router = useRouter();
  const { user, logout } = useAuth();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  // Invoice and payment state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'account' | 'invoices' | 'payments' | 'notifications'>('account');
  const [paymentProcessing, setPaymentProcessing] = useState<string | null>(null);
  
  // Notification state
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Fetch seller invoices
  const fetchInvoices = useCallback(async () => {
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
  // Use shared AUD currency formatter
  const formatAud = (amount: number) => formatCurrency(amount);

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30 w-full">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <img src="/images/logo.PNG" alt="Only If" className="h-18 sm:h-14 md:h-16 lg:h-24 xl:h-24 w-auto transition-transform duration-200 group-hover:scale-105" />
          </Link>
        </div>

        {/* Center: Main Site Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link href="/buy" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">Buy</Link>
          <Link href="/signin" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">Sell</Link>
          <Link href="/how-it-works" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">How it Works</Link>
          <Link href="/agents" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">Agents</Link>
        </nav>

        {/* Right: Dashboard & Sign Out */}
        <div className="flex items-center space-x-6">
          <Link 
            href="/dashboard"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Dashboard
          </Link>
          <button 
            onClick={logout}
            className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors"
          >
            Sign Out
          </button>
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex-shrink-0">
              <img 
                src="/images/user-avatar.jpg" 
                alt="User" 
                className="w-full h-full object-cover" 
                onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${user?.name || 'S'}&background=10b981&color=fff`)} 
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar - Fixed Position */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-20 bottom-0 z-20 overflow-y-auto">
          <div className="p-8 flex-1">
            <nav className="space-y-2">
              <button
                onClick={() => router.push('/dashboards/seller')}
                className="w-full flex items-center space-x-3 px-5 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              >
                <LayoutDashboard className="w-5 h-5 text-gray-400" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => router.push('/dashboards/seller?tab=listings')}
                className="w-full flex items-center space-x-3 px-5 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              >
                <Building2 className="w-5 h-5 text-gray-400" />
                <span>My Listings</span>
              </button>
              <button
                className="w-full flex items-center space-x-3 px-5 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm"
              >
                <Settings className="w-5 h-5 text-emerald-600" />
                <span>Account Settings</span>
              </button>
            </nav>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center space-x-4 p-2">
              <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Seller Name'}</p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Seller</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 ml-72 flex flex-col">
          <main className="p-10 w-full max-w-7xl mx-auto min-h-[calc(100vh-5rem)]">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Header Section */}
              <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-14 shadow-sm border-b border-orange-500/20 rounded-[2rem] mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">Seller Account</h1>
                    <p className="hidden md:block text-orange-50 max-w-3xl mx-auto font-medium">
                      Manage your account, access commission invoices, and secure payment portal.
                    </p>
                  </div>
                </div>
              </section>

              {/* Tab Navigation */}
              <div className="mb-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm relative z-10 overflow-hidden">
                  <nav className="flex flex-wrap gap-2 md:gap-0 md:space-x-4 px-4 md:px-6 py-3">
                    {[
                      { key: 'account', label: 'Account Info', icon: Receipt },
                      { key: 'notifications', label: 'Notifications', icon: Bell },
                      { key: 'invoices', label: 'Commission Invoices', icon: FileText },
                      { key: 'payments', label: 'Payment Portal', icon: CreditCard },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setSelectedTab(key as any)}
                        className={`flex items-center px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                          selectedTab === key
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                      >
                        <Icon className={`h-4 w-4 mr-2 ${selectedTab === key ? 'text-emerald-600' : 'text-gray-400'}`} />
                        {label}
                        {key === 'notifications' && unreadCount > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
                {/* Account Information Tab */}
                {selectedTab === 'account' && (
                  <div className="p-10">
                    <div className="mb-10">
                      <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-8">Account Information</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                        <div className="space-y-2">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Name</p>
                          <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-bold">
                            {user?.name || '—'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email</p>
                          <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-bold">
                            {user?.email || '—'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Role</p>
                          <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-bold">
                            {user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : '—'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">User ID</p>
                          <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-bold break-all">
                            {user?.id || '—'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Change Password Section */}
                    <div className="border-t border-gray-100 pt-10">
                      <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-4">Change Password</h2>
                      <p className="text-sm font-medium text-gray-500 mb-8">
                        For security, your existing password cannot be displayed. Use the toggles to view what you type.
                      </p>

                      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl font-bold">{error}</div>}
                      {message && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl font-bold">{message}</div>}

                      <form onSubmit={handleChangePassword} className="space-y-8 max-w-xl">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                          <div className="flex items-center gap-3">
                            <input
                              type={showCurrent ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="flex-1 px-5 py-4 bg-white border border-gray-200 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrent((v) => !v)}
                              className="px-5 py-4 border border-gray-200 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                              {showCurrent ? 'Hide' : 'Show'}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                          <div className="flex items-center gap-3">
                            <input
                              type={showNew ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="flex-1 px-5 py-4 bg-white border border-gray-200 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNew((v) => !v)}
                              className="px-5 py-4 border border-gray-200 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                              {showNew ? 'Hide' : 'Show'}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                          <div className="flex items-center gap-3">
                            <input
                              type={showConfirm ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="flex-1 px-5 py-4 bg-white border border-gray-200 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                              placeholder="Re-enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm((v) => !v)}
                              className="px-5 py-4 border border-gray-200 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                              {showConfirm ? 'Hide' : 'Show'}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSaving}
                          className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white rounded-2xl font-extrabold text-lg hover:bg-black transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                        >
                          {isSaving ? 'Saving...' : 'Update Password'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {selectedTab === 'notifications' && (
                  <div className="p-10">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Notifications</h2>
                        <p className="text-gray-500 font-medium mt-1">Messages and updates from your agent</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-red-100 text-red-600 border border-red-200">
                            {unreadCount} unread
                          </span>
                        )}
                        <button
                          onClick={fetchNotifications}
                          disabled={loadingNotifications}
                          className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                        >
                          {loadingNotifications ? 'Loading...' : 'Refresh'}
                        </button>
                      </div>
                    </div>
                    
                    {loadingNotifications ? (
                      <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                        <span className="text-gray-500 font-medium">Loading notifications...</span>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                        <Bell className="mx-auto h-16 w-16 text-gray-300 mb-6" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications yet</h3>
                        <p className="text-gray-500 font-medium max-w-sm mx-auto">Agent notifications and property updates will appear here.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
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
                              className={`border rounded-[2rem] p-8 transition-all hover:shadow-md cursor-pointer ${
                                notification.read ? 'bg-white border-gray-200' : 'bg-emerald-50 border-emerald-200'
                              }`}
                              onClick={() => {
                                if (!notification.read) {
                                  markNotificationAsRead(notification.id, notification.conversationId);
                                }
                              }}
                            >
                              <div className="flex items-start space-x-6">
                                <div className="flex-shrink-0">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                                    isSettlement ? 'bg-green-100' : 'bg-emerald-100'
                                  }`}>
                                    {isSettlement ? (
                                      <Home className="h-7 w-7 text-green-600" />
                                    ) : (
                                      <MessageSquare className="h-7 w-7 text-emerald-600" />
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                                        {notification.senderName?.[0] || 'A'}
                                      </div>
                                      <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">{notification.senderName}</span>
                                      {isSettlement && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700 border border-green-200">
                                          Settlement Complete
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{formatDate(notification.timestamp)}</span>
                                      {!notification.read && (
                                        <div className="w-3 h-3 bg-emerald-600 rounded-full shadow-sm"></div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {notification.propertyTitle && (
                                    <div className="flex items-center space-x-2 mb-4 bg-gray-50 w-fit px-4 py-1.5 rounded-full border border-gray-100">
                                      <Home className="h-3.5 w-3.5 text-gray-400" />
                                      <span className="text-xs font-bold text-gray-600">Property: {notification.propertyTitle}</span>
                                    </div>
                                  )}
                                  
                                  <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                                    <p className="text-gray-700 font-medium whitespace-pre-line leading-relaxed">
                                      {notification.messageText}
                                    </p>
                                  </div>
                                  
                                  {/* Invoice Information for Settlement Notifications */}
                                  {isSettlement && notification.messageText.includes('COMMISSION INVOICE') && (
                                    <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-[1.5rem] shadow-sm">
                                      <h4 className="text-sm font-black text-green-800 mb-4 flex items-center uppercase tracking-widest">
                                        <Receipt className="h-4 w-4 mr-2" />
                                        Commission Invoice Actions
                                      </h4>
                                      <div className="flex flex-wrap gap-3">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
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
                                          className="inline-flex items-center px-4 py-2 text-xs font-bold bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-sm"
                                        >
                                          <Download className="h-3.5 w-3.5 mr-2" />
                                          Download Invoice
                                        </button>
                                        
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Navigate to Commission Invoices tab
                                            setSelectedTab('invoices');
                                            toast.success('Navigated to invoices section');
                                          }}
                                          className="inline-flex items-center px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
                                        >
                                          <CreditCard className="h-3.5 w-3.5 mr-2" />
                                          View & Pay Invoice
                                        </button>
                                      </div>
                                      
                                      <div className="mt-4 p-4 bg-green-100/50 rounded-xl text-xs font-bold text-green-700 leading-relaxed border border-green-200/50">
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
                                      className="mt-4 text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest"
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
                      <div className="mt-10 text-center">
                        <button
                          onClick={() => {
                            // Navigate to full messages page
                            window.location.href = '/dashboards/seller/messages';
                          }}
                          className="inline-flex items-center px-8 py-3.5 border border-gray-200 rounded-2xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all"
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
                  <div className="p-10">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Commission Tax Invoices</h2>
                        <p className="text-gray-500 font-medium mt-1">Download and view your commission invoices for tax purposes</p>
                      </div>
                      <button
                        onClick={fetchInvoices}
                        disabled={loadingInvoices}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                      >
                        {loadingInvoices ? 'Loading...' : 'Refresh'}
                      </button>
                    </div>

                    {loadingInvoices ? (
                      <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                        <span className="text-gray-500 font-medium">Loading invoices...</span>
                      </div>
                    ) : invoices.length === 0 ? (
                      <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                        <FileText className="mx-auto h-16 w-16 text-gray-300 mb-6" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No invoices found</h3>
                        <p className="text-gray-500 font-medium max-w-sm mx-auto">Commission invoices will appear here after property settlements.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {invoices.map((invoice) => (
                          <div key={invoice._id} className="border border-gray-200 rounded-[2rem] p-8 hover:shadow-md transition-all group">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                  <h3 className="text-xl font-black text-gray-900 tracking-tight">{invoice.invoiceNumber}</h3>
                                  <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border ${getStatusClass(invoice.status)}`}>
                                    {invoice.status}
                                  </span>
                                  {invoice.isOverdue && (
                                    <span className="flex items-center text-red-600 text-[10px] font-black uppercase tracking-[0.2em]">
                                      <AlertTriangle className="h-4 w-4 mr-1.5" />
                                      Overdue
                                    </span>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Property</p>
                                    <p className="text-sm font-bold text-gray-900">{invoice.property?.title || '—'}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Commission</p>
                                    <p className="text-sm font-bold text-gray-900">{invoice.commissionRate}% of {formatCurrency(invoice.propertyValue)}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</p>
                                    <p className={`text-sm font-bold ${invoice.isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                      {formatDate(invoice.dueDate)}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="mt-8 flex items-center justify-between">
                                  <div className="text-3xl font-black text-gray-900 tracking-tighter">
                                    {formatAud(invoice.totalAmount)}
                                  </div>
                                  {invoice.status === 'paid' && (
                                    <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                                      <CheckCircle className="h-5 w-5 mr-2" />
                                      <span className="text-xs font-black uppercase tracking-widest">Paid in Full</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-row lg:flex-col gap-3">
                                <button
                                  onClick={() => generateAndDownloadInvoicePdf(invoice)}
                                  className="flex-1 lg:flex-none flex items-center justify-center px-6 py-3 text-sm font-bold bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </button>
                                
                                {invoice.status !== 'paid' && (
                                  <button
                                    onClick={() => handlePayInvoice(invoice._id, invoice.amountDue || invoice.totalAmount)}
                                    disabled={paymentProcessing === invoice._id}
                                    className="flex-1 lg:flex-none flex items-center justify-center px-6 py-3 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md shadow-emerald-100"
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
                  <div className="p-10">
                    <div className="mb-10">
                      <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Secure Payment Portal</h2>
                      <p className="text-gray-500 font-medium mt-1">Manage your commission payments securely</p>
                    </div>

                    {loadingInvoices ? (
                      <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                        <span className="text-gray-500 font-medium">Loading payment information...</span>
                      </div>
                    ) : (
                      <div className="space-y-10">
                        {/* Payment Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100 shadow-sm">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Total Paid</p>
                            <p className="text-3xl font-black text-emerald-700 tracking-tighter">
                              {formatAud(invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0))}
                            </p>
                          </div>
                          <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 shadow-sm">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-3">Pending Payment</p>
                            <p className="text-3xl font-black text-amber-700 tracking-tighter">
                              {formatAud(invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.amountDue || i.totalAmount), 0))}
                            </p>
                          </div>
                          <div className="bg-red-50 rounded-[2rem] p-8 border border-red-100 shadow-sm">
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-3">Overdue</p>
                            <p className="text-3xl font-black text-red-700 tracking-tighter">
                              {formatAud(invoices.filter(i => i.isOverdue).reduce((sum, i) => sum + i.totalAmount, 0))}
                            </p>
                          </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100">
                          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-8">Payment Methods</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex items-start space-x-6 hover:shadow-md transition-shadow">
                              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <CreditCard className="h-7 w-7 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">Secure Card Payment</h4>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed">
                                  Pay instantly using Visa, Mastercard, or American Express via our secure Stripe integration.
                                </p>
                              </div>
                            </div>
                            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex items-start space-x-6 hover:shadow-md transition-shadow">
                              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-7 w-7 text-emerald-600" />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">Bank Transfer</h4>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed">
                                  Use the reference provided on your invoice for direct bank transfers. (Takes 1-3 business days)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center text-center space-y-6">
                          <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-emerald-600" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Ready to Pay?</h3>
                            <p className="text-gray-500 font-medium max-w-sm mx-auto">Select any pending invoice from the 'Commission Invoices' tab to complete your payment.</p>
                          </div>
                          <button 
                            onClick={() => setSelectedTab('invoices')}
                            className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
                          >
                            View Invoices
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SellerAccount;