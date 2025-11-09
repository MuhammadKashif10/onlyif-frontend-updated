'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
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
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';

// Helper to style status badge
const getStatusClass = (status: string) => {
  switch (status) {
    case 'paid':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'pending':
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

interface Invoice {
  _id: string;
  invoiceNumber: string;
  property: {
    _id: string;
    title: string;
    address: string;
    price: number;
  };
  agent: {
    _id: string;
    name: string;
    email: string;
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
  status: 'draft' | 'pending' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  isOverdue: boolean;
  payments?: Array<{
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    transactionId?: string;
    reference?: string;
  }>;
  category: 'settlement_commission' | 'platform_commission' | 'buyer_payment' | 'other';
}

const BuyerPayments = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  // Invoice state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'completed'>('pending');
  const [paymentProcessing, setPaymentProcessing] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);

  // Authentication check
  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    if (user.role !== 'buyer') {
      router.push('/signin');
      return;
    }
  }, [user, router]);

  // Fetch buyer invoices
  const fetchInvoices = React.useCallback(async () => {
    if (!user?.id) return;
    
    setLoadingInvoices(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const invoicesApiUrl = `${backendUrl}/api/invoices/buyer/${user.id}`;
      
      console.log('🔗 Fetching buyer invoices from backend:', invoicesApiUrl);
      
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
  
  // Load invoices on component mount and tab change
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Socket.IO connection for real-time updates
  useEffect(() => {
    if (user?.id) {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const newSocket = io(backendUrl);
      
      newSocket.emit('join-buyer-room', user.id);
      
      // Listen for invoice updates
      newSocket.on('invoice-update', (updateData) => {
        console.log('📧 Received invoice update:', updateData);
        
        setInvoices(prevInvoices => {
          const updatedInvoices = prevInvoices.map(invoice => {
            if (invoice._id === updateData.invoiceId) {
              return {
                ...invoice,
                status: updateData.status,
                amountPaid: updateData.amountPaid,
                amountDue: updateData.amountDue
              };
            }
            return invoice;
          });
          
          // Show toast notification for status changes
          if (updateData.status === 'paid') {
            toast.success(`Invoice ${updateData.invoiceNumber} has been paid!`);
          } else if (updateData.updateType === 'payment_received') {
            toast.success(`Payment received for invoice ${updateData.invoiceNumber}`);
          }
          
          return updatedInvoices;
        });
      });
      
      setSocket(newSocket);
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [user?.id]);

  // Initialize payment for an invoice
  const handlePayNow = async (invoiceId: string, amount: number) => {
    setPaymentProcessing(invoiceId);
    
    try {
      const initUrl = '/api/payments/initialize';
      const resp = await fetch(initUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ invoiceId, amount, type: 'buyer_payment' })
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
  
  // Generate and download invoice receipt PDF (client-side)
  const generateAndDownloadInvoiceReceipt = async (invoice: Invoice) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Header
      doc.setFontSize(18);
      doc.text('OnlyIf - Payment Receipt', 14, 18);
      doc.setFontSize(11);
      doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 28);

      // Details
      const amount = formatCurrency(invoice.totalAmount);
      const dateStr = formatDate(invoice.invoiceDate || new Date().toISOString());
      const accountNumber = process.env.NEXT_PUBLIC_ACCOUNT_NUMBER || '—';
      doc.text(`Property: ${invoice.property?.title || 'N/A'}`, 14, 44);
      doc.text(`Amount: ${amount}`, 14, 50);
      doc.text(`Date: ${dateStr}`, 14, 56);
      doc.text(`Account Number: ${accountNumber}`, 14, 62);

      // Footer
      doc.setFontSize(9);
      doc.text('Thank you for using OnlyIf. This receipt was generated automatically.', 14, 286);

      const propPart = toSafeFilePart(invoice.property?.title || invoice.invoiceNumber || 'Invoice');
      doc.save(`Payment_Receipt_${propPart}.pdf`);
      toast.success('Payment receipt downloaded');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate payment receipt PDF');
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
  
  // Create a filesystem-safe fragment for filenames
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
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter invoices based on selected tab
  const getFilteredInvoices = () => {
    switch (selectedTab) {
      case 'pending':
        return invoices.filter(i => i.status === 'pending' || i.status === 'sent' || i.status === 'viewed');
      case 'completed':
        return invoices.filter(i => i.status === 'paid');
      default:
        return invoices;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-14 shadow-sm border-b border-green-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Buyer Payments</h1>
              <p className="hidden md:block text-gray-900 max-w-3xl mx-auto">
                Manage your payments, view receipts, and track payment history.
              </p>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white rounded-lg shadow-sm relative z-10">
            <nav className="flex flex-wrap gap-2 md:gap-0 md:space-x-8 px-4 md:px-8 py-3 md:py-4">
              {[
                { key: 'pending', label: 'Pending Payments', icon: Clock },
                { key: 'completed', label: 'Completed Payments', icon: CheckCircle },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedTab(key as any)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedTab === key
                      ? 'bg-green-100 text-green-800 ring-1 ring-green-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Pending Payments Tab */}
            {selectedTab === 'pending' && (
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Pending Payments</h2>
                    <p className="text-gray-600 mt-1">Invoices that require your attention</p>
                  </div>
                  <button
                    onClick={fetchInvoices}
                    disabled={loadingInvoices}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loadingInvoices ? 'Loading...' : 'Refresh'}
                  </button>
                </div>

                {loadingInvoices ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-gray-600">Loading invoices...</span>
                  </div>
                ) : getFilteredInvoices().length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending invoices</h3>
                    <p className="text-gray-500">All your invoices are up to date.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getFilteredInvoices().map((invoice) => (
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
                                <p className="font-medium">Agent:</p>
                                <p>{invoice.agent?.name || '—'}</p>
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
                                {formatCurrency(invoice.amountDue || invoice.totalAmount)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-6 flex flex-col space-y-2">
                            <button
                              onClick={() => generateAndDownloadInvoiceReceipt(invoice)}
                              className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Completed Payments Tab */}
            {selectedTab === 'completed' && (
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Completed Payments</h2>
                    <p className="text-gray-600 mt-1">Successfully paid invoices</p>
                  </div>
                  <button
                    onClick={fetchInvoices}
                    disabled={loadingInvoices}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loadingInvoices ? 'Loading...' : 'Refresh'}
                  </button>
                </div>

                {loadingInvoices ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-gray-600">Loading invoices...</span>
                  </div>
                ) : getFilteredInvoices().length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No completed payments</h3>
                    <p className="text-gray-500">Completed payments will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getFilteredInvoices().map((invoice) => (
                      <div key={invoice._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusClass(invoice.status)}`}>
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <p className="font-medium">Property:</p>
                                <p>{invoice.property?.title || '—'}</p>
                              </div>
                              <div>
                                <p className="font-medium">Agent:</p>
                                <p>{invoice.agent?.name || '—'}</p>
                              </div>
                              <div>
                                <p className="font-medium">Payment Date:</p>
                                <p>{formatDate(invoice.invoiceDate)}</p>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex items-center justify-between">
                              <div className="text-2xl font-bold text-gray-900">
                                {formatCurrency(invoice.amountPaid || invoice.totalAmount)}
                              </div>
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="h-5 w-5 mr-1" />
                                <span className="text-sm font-medium">Payment Complete</span>
                                <button
                                  onClick={() => generateAndDownloadInvoiceReceipt(invoice)}
                                  className="ml-3 inline-flex items-center px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Download Receipt
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-6 flex flex-col space-y-2">
                            <button
                              onClick={() => generateAndDownloadInvoiceReceipt(invoice)}
                              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Receipt
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </section>
      </div>
    </div>
  );
};

export default BuyerPayments;