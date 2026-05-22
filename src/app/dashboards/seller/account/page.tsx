'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components';
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
  Home,
  LayoutDashboard,
  Building2,
  Settings,
  Store,
  BarChart3
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

const safeTextValue = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
};

const SellerAccount = () => {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const user = authUser
    ? {
        ...authUser,
        id: safeTextValue(authUser.id),
        name: safeTextValue(authUser.name),
        email: safeTextValue(authUser.email),
        role: typeof authUser.role === 'string' ? authUser.role : null
      }
    : null;
  const hasSellerAccess = !!user?.roles?.includes('seller');

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

  const fetchJsonSafely = async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(text || `Unexpected non-JSON response (${response.status})`);
    }
    return response.json();
  };

  const toSafeText = (value: unknown, fallback = '—') => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return fallback;
  };

  const toSafeMessage = (value: unknown, fallback = 'Something went wrong') => {
    if (typeof value === 'string') return value;
    if (value instanceof Error) return value.message || fallback;
    if (value && typeof value === 'object') {
      const messageValue = (value as { message?: unknown; error?: unknown }).message || (value as { error?: unknown }).error;
      if (typeof messageValue === 'string') return messageValue;
      try {
        const serialized = JSON.stringify(value);
        return serialized && serialized !== '{}' ? serialized : fallback;
      } catch {
        return fallback;
      }
    }
    return fallback;
  };

  const toSafeNumber = (value: unknown, fallback = 0) => {
    const numericValue = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numericValue) ? numericValue : fallback;
  };

  const toSafeDateText = (value: unknown) => {
    const rawValue = toSafeText(value, '');
    const date = rawValue ? new Date(rawValue) : null;
    if (!date || Number.isNaN(date.getTime())) return '—';

    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: unknown, fallback = 'S') => {
    const safeName = toSafeText(name, '').trim();
    if (!safeName) return fallback;
    return safeName
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || fallback;
  };

  const normalizeInvoice = (invoice: any): Invoice => ({
    _id: toSafeText(invoice?._id || invoice?.id, `invoice-${Math.random().toString(36).slice(2)}`),
    invoiceNumber: toSafeText(invoice?.invoiceNumber, 'Invoice'),
    property: {
      _id: toSafeText(invoice?.property?._id || invoice?.property?.id, ''),
      title: toSafeText(invoice?.property?.title, '—'),
      address: toSafeText(invoice?.property?.address, '')
    },
    invoiceDate: toSafeText(invoice?.invoiceDate, ''),
    dueDate: toSafeText(invoice?.dueDate, ''),
    settlementDate: toSafeText(invoice?.settlementDate, ''),
    propertyValue: toSafeNumber(invoice?.propertyValue),
    commissionRate: toSafeNumber(invoice?.commissionRate),
    commissionAmount: toSafeNumber(invoice?.commissionAmount),
    totalAmount: toSafeNumber(invoice?.totalAmount),
    amountPaid: toSafeNumber(invoice?.amountPaid),
    amountDue: toSafeNumber(invoice?.amountDue),
    status: ['draft', 'pending', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'].includes(toSafeText(invoice?.status, ''))
      ? toSafeText(invoice?.status) as Invoice['status']
      : 'pending',
    isOverdue: Boolean(invoice?.isOverdue),
    payments: Array.isArray(invoice?.payments)
      ? invoice.payments.map((payment: any) => ({
          amount: toSafeNumber(payment?.amount),
          paymentDate: toSafeText(payment?.paymentDate, ''),
          paymentMethod: toSafeText(payment?.paymentMethod, ''),
          transactionId: toSafeText(payment?.transactionId, ''),
          reference: toSafeText(payment?.reference, '')
        }))
      : [],
    transactionId: toSafeText(invoice?.transactionId, ''),
    stripeAccountId: toSafeText(invoice?.stripeAccountId, ''),
    stripeAccountEmail: toSafeText(invoice?.stripeAccountEmail, '')
  });

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
        const errorData = await fetchJsonSafely(response).catch(() => null);
        throw new Error(errorData?.message || `Failed to fetch invoices: ${response.status} ${response.statusText}`);
      }
      
      const data = await fetchJsonSafely(response);
      
      console.log('📋 Backend invoices response:', data);
      
      if (data.success && Array.isArray(data.data)) {
        setInvoices(data.data.map(normalizeInvoice));
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
    
    console.log('Fetching notifications for seller user:', user.id, toSafeText(user.name, 'Seller'));
    
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
      
      let data = await fetchJsonSafely(response);
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
                const conversationApiUrl = `${backendBase}/api/messages/${conversation.id}`;
                console.log('🔗 Fetching conversation messages from backend:', conversationApiUrl);
                
                const messagesResponse = await fetch(conversationApiUrl, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (messagesResponse.ok) {
                  const messagesData = await fetchJsonSafely(messagesResponse);
                  if (messagesData.success && messagesData.data) {
                    // Add agent messages as notifications (exclude seller's own messages)
                    messagesData.data
                      .filter((msg: any) => msg.senderId !== user.id && msg.senderId !== seller?.userId && msg.senderId === agent.userId)
                      .forEach((msg: any) => {
                        const messageText = toSafeText(msg.messageText, '');
                        const notificationMessage: NotificationMessage = {
                          ...msg,
                          id: toSafeText(msg.id || msg._id, `${conversation.id || 'notification'}-${allMessages.length}`),
                          conversationId: toSafeText(conversation.id || conversation._id, ''),
                          senderName: toSafeText(agent.name, 'Agent'),
                          senderRole: 'agent',
                          messageText,
                          timestamp: toSafeText(msg.timestamp || msg.createdAt, new Date().toISOString()),
                          read: Boolean(msg.read),
                          propertyId: toSafeText(conversation.propertyId, ''),
                          propertyTitle: toSafeText(conversation.propertyTitle, ''),
                          type: messageText.includes('settled') ? 'settlement' : 'general',
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

  if (!hasSellerAccess) {
    return null;
  }

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
      setMessage(typeof res?.message === 'string' ? res.message : 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(typeof err?.message === 'string' ? err.message : 'Failed to change password.');
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

  const sidebarButtonClass = (isActive: boolean) =>
    `w-full flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ease-out hover:shadow-sm ${
      isActive
        ? 'bg-black text-white shadow-lg shadow-black/10'
        : 'text-gray-600 hover:bg-white hover:text-gray-950'
    }`;

  const sidebarIconClass = (isActive: boolean) =>
    `h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`;

  return (
    <div className="min-h-screen bg-[#f5f6fb] flex flex-col">
      <Navbar />

      <div className="flex w-full flex-1 bg-[#f5f6fb] lg:pl-[280px]">
        <aside id="dashboard-sidebar" className="fixed left-0 top-20 bottom-0 z-30 hidden w-[280px] shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white px-5 py-4 lg:flex">
          <div className="flex-1">
            <nav className="space-y-2 pt-3">
              <button
                onClick={() => router.push('/dashboards/seller')}
                className={sidebarButtonClass(false)}
              >
                <LayoutDashboard className={sidebarIconClass(false)} />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => router.push('/dashboards/seller/listings')}
                className={sidebarButtonClass(false)}
              >
                <Home className={sidebarIconClass(false)} />
                <span>Listings</span>
              </button>
              <button
                onClick={() => router.push('/dashboards/seller/marketplace')}
                className={sidebarButtonClass(false)}
              >
                <Store className={sidebarIconClass(false)} />
                <span>Marketplace</span>
              </button>
              <button
                onClick={() => router.push('/dashboards/seller/analytics')}
                className={sidebarButtonClass(false)}
              >
                <BarChart3 className={sidebarIconClass(false)} />
                <span>Analytics</span>
              </button>
              <button
                className={sidebarButtonClass(true)}
              >
                <Settings className={sidebarIconClass(true)} />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          <div className="border-t border-gray-200 pt-5">
            <button
              onClick={() => router.push('/dashboards/seller/add-property')}
              className="mb-5 w-full cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition-all duration-200 ease-out hover:bg-emerald-700 hover:shadow-xl"
            >
              List Property
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-sm">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-950">{toSafeText(user?.name, 'Seller Name')}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">Premium Account</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 grid grid-cols-2 gap-3 lg:hidden">
            <button onClick={() => router.push('/dashboards/seller')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Dashboard</button>
            <button onClick={() => router.push('/dashboards/seller/listings')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Listings</button>
            <button onClick={() => router.push('/dashboards/seller/marketplace')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Marketplace</button>
            <button onClick={() => router.push('/dashboards/seller/analytics')} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Analytics</button>
            <button className="rounded-xl bg-black px-4 py-3 text-sm font-bold text-white shadow-sm">Settings</button>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <section className="mb-8">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">Seller Account Center</p>
                <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">Settings</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600 sm:text-base">
                  Manage your account, security, notifications, commission invoices, and secure payment portal.
                </p>
              </section>

              {/* Tab Navigation */}
              <div className="mb-6">
                <div className="relative z-10 overflow-hidden rounded-[24px] border border-gray-200/80 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.05)] backdrop-blur">
                  <nav className="flex flex-wrap gap-2 px-3 py-3 md:px-4">
                    {[
                      { key: 'account', label: 'Account Info', icon: Receipt },
                      { key: 'notifications', label: 'Notifications', icon: Bell },
                      { key: 'invoices', label: 'Commission Invoices', icon: FileText },
                      { key: 'payments', label: 'Payment Portal', icon: CreditCard },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setSelectedTab(key as any)}
                        className={`flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                          selectedTab === key
                            ? 'bg-black text-white shadow-lg shadow-black/10'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className={`h-4 w-4 mr-2 ${selectedTab === key ? 'text-white' : 'text-gray-400'}`} />
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
              <div className="overflow-hidden rounded-[24px] border border-gray-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
                {/* Account Information Tab */}
                {selectedTab === 'account' && (
                  <div className="p-6 sm:p-8 lg:p-10">
                    <div className="mb-10">
                      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-2xl font-black tracking-tight text-gray-950">Profile & Privacy</h2>
                          <p className="mt-2 text-sm leading-6 text-gray-500">Manage your public identity and contact visibility.</p>
                        </div>
                        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                          Verified Seller
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Name</p>
                          <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-5 py-4 font-bold text-gray-900">
                            {user?.name || '—'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email</p>
                          <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-5 py-4 font-bold text-gray-900">
                            {user?.email || '—'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Role</p>
                          <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-5 py-4 font-bold text-gray-900">
                            {typeof user?.role === 'string' ? user.role[0].toUpperCase() + user.role.slice(1) : '—'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">User ID</p>
                          <div className="break-all rounded-xl border border-blue-100 bg-blue-50/70 px-5 py-4 font-bold text-gray-900">
                            {user?.id || '—'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Change Password Section */}
                    <div className="border-t border-gray-100 pt-10">
                      <h2 className="text-2xl font-black tracking-tight text-gray-950">Security & Access</h2>
                      <p className="text-sm font-medium text-gray-500 mb-8">
                        For security, your existing password cannot be displayed. Use the toggles to view what you type.
                      </p>

                      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl font-bold">{toSafeMessage(error)}</div>}
                      {message && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl font-bold">{toSafeMessage(message, 'Saved successfully.')}</div>}

                      <form onSubmit={handleChangePassword} className="space-y-8 max-w-xl">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                          <div className="flex items-center gap-3">
                            <input
                              type={showCurrent ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="flex-1 rounded-xl border border-blue-100 bg-blue-50/70 px-5 py-4 font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrent((v) => !v)}
                              className="rounded-xl border border-gray-300 px-5 py-4 text-sm font-bold transition-colors hover:bg-gray-50"
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
                              className="flex-1 rounded-xl border border-blue-100 bg-blue-50/70 px-5 py-4 font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNew((v) => !v)}
                              className="rounded-xl border border-gray-300 px-5 py-4 text-sm font-bold transition-colors hover:bg-gray-50"
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
                              className="flex-1 rounded-xl border border-blue-100 bg-blue-50/70 px-5 py-4 font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              placeholder="Re-enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm((v) => !v)}
                              className="rounded-xl border border-gray-300 px-5 py-4 text-sm font-bold transition-colors hover:bg-gray-50"
                            >
                              {showConfirm ? 'Hide' : 'Show'}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSaving}
                          className="w-full rounded-xl bg-black px-10 py-4 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-gray-900 active:scale-[0.98] disabled:opacity-50 sm:w-auto"
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
                          const senderName = toSafeText(notification.senderName, 'Agent');
                          const propertyTitle = toSafeText(notification.propertyTitle, '');
                          const messageText = toSafeText(notification.messageText, '');
                          const timestamp = toSafeText(notification.timestamp, new Date().toISOString());
                          const notificationId = toSafeText(notification.id, `${notification.conversationId || 'notification'}-${senderName}`);
                          const conversationId = toSafeText(notification.conversationId, '');
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
                              key={notificationId}
                              className={`border rounded-[2rem] p-8 transition-all hover:shadow-md cursor-pointer ${
                                notification.read ? 'bg-white border-gray-200' : 'bg-emerald-50 border-emerald-200'
                              }`}
                              onClick={() => {
                                if (!notification.read) {
                                  markNotificationAsRead(notificationId, conversationId);
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
                                        {senderName[0] || 'A'}
                                      </div>
                                      <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">{senderName}</span>
                                      {isSettlement && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700 border border-green-200">
                                          Settlement Complete
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{formatDate(timestamp)}</span>
                                      {!notification.read && (
                                        <div className="w-3 h-3 bg-emerald-600 rounded-full shadow-sm"></div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {propertyTitle && (
                                    <div className="flex items-center space-x-2 mb-4 bg-gray-50 w-fit px-4 py-1.5 rounded-full border border-gray-100">
                                      <Home className="h-3.5 w-3.5 text-gray-400" />
                                      <span className="text-xs font-bold text-gray-600">Property: {propertyTitle}</span>
                                    </div>
                                  )}
                                  
                                  <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                                    <p className="text-gray-700 font-medium whitespace-pre-line leading-relaxed">
                                      {messageText}
                                    </p>
                                  </div>
                                  
                                  {/* Invoice Information for Settlement Notifications */}
                                  {isSettlement && messageText.includes('COMMISSION INVOICE') && (
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
                                            const invoiceMatch = messageText.match(/Invoice Number: (INV-\d+-\d+)/);
                                            const invoiceNumber = invoiceMatch?.[1] || 'latest';
                                            const downloadUrl = `/api/invoices/inv_${Date.now()}/pdf`;
                                            
                                            // Download PDF with a meaningful filename including the property title when available
                                            const link = document.createElement('a');
                                            link.href = downloadUrl;
                                            const propPart = toSafeFilePart(propertyTitle || invoiceNumber);
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
                                        markNotificationAsRead(notificationId, conversationId);
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
  );
};

export default SellerAccount;
