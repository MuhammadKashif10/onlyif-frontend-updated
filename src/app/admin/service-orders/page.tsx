'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatCurrency } from '@/utils/currency';

interface ServiceOrder {
  id: string;
  orderNumber: string;
  serviceName: string;
  serviceId: string;
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  fulfillmentStatus: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  customerName?: string;
  customerEmail?: string;
  user?: { id?: string; name?: string; email?: string } | null;
  createdAt: string;
}

const FULFILLMENT_OPTIONS = ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled'];

const backendBase = () =>
  (process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
    '').replace(/\/$/, '');

const paymentBadge: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-200 text-gray-700',
};

const fulfillmentBadge: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminServiceOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const base = backendBase();
    if (!token || !base) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (paymentFilter !== 'all') params.set('paymentStatus', paymentFilter);
      if (fulfillmentFilter !== 'all') params.set('fulfillmentStatus', fulfillmentFilter);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${base}/api/service-orders/admin/all${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data?.data || []);
    } catch (e) {
      console.error('Error loading service orders:', e);
    } finally {
      setIsLoading(false);
    }
  }, [paymentFilter, fulfillmentFilter]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
      return;
    }
    if (user && user.role === 'admin') {
      loadOrders();
    }
  }, [user, loading, router, loadOrders]);

  const updateFulfillment = async (order: ServiceOrder, fulfillmentStatus: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const base = backendBase();
    if (!token || !base) return;
    try {
      setUpdatingId(order.id);
      const res = await fetch(`${base}/api/service-orders/admin/${order.id}/fulfillment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fulfillmentStatus }),
      });
      const data = await res.json();
      if (data?.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, fulfillmentStatus: fulfillmentStatus as ServiceOrder['fulfillmentStatus'] } : o))
        );
      } else {
        alert(data?.message || 'Failed to update status');
      }
    } catch {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteOrder = async (order: ServiceOrder) => {
    if (!window.confirm(`Delete order ${order.orderNumber}? This action cannot be undone.`)) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const base = backendBase();
    if (!token || !base) return;
    try {
      setDeletingId(order.id);
      const res = await fetch(`${base}/api/service-orders/admin/${order.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.success) {
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
      } else {
        alert(data?.message || 'Failed to delete order');
      }
    } catch {
      alert('Failed to delete order');
    } finally {
      setDeletingId(null);
    }
  };

  const downloadReceipt = async (order: ServiceOrder) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const base = backendBase();
    if (!token || !base) return;
    try {
      const res = await fetch(`${base}/api/service-orders/${order.id}/receipt.pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = `Receipt_${order.orderNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error('Receipt download error:', e);
    }
  };

  const paidRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="heading-font text-xl md:text-2xl text-gray-900 mb-6">Service Orders</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Paid Revenue</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(paidRevenue)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Awaiting Fulfillment</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter((o) => o.paymentStatus === 'paid' && o.fulfillmentStatus === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter((o) => o.fulfillmentStatus === 'completed').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Fulfillment Status</option>
              {FULFILLMENT_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Order', 'Customer', 'Service', 'Amount', 'Payment', 'Fulfillment', 'Date', 'Receipt', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto" />
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                      No service orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{o.orderNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{o.user?.name || o.customerName || '—'}</div>
                        <div className="text-xs text-gray-500">{o.user?.email || o.customerEmail || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{o.serviceName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(o.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentBadge[o.paymentStatus] || 'bg-gray-100 text-gray-700'}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={o.fulfillmentStatus}
                          disabled={updatingId === o.id || o.paymentStatus !== 'paid'}
                          onChange={(e) => updateFulfillment(o, e.target.value)}
                          className={`text-xs font-semibold rounded-full border-0 px-2 py-1 focus:ring-2 focus:ring-green-500 disabled:opacity-60 ${fulfillmentBadge[o.fulfillmentStatus] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {FULFILLMENT_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(o.createdAt).toLocaleDateString('en-AU')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {o.paymentStatus === 'paid' ? (
                          <button
                            onClick={() => downloadReceipt(o)}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                          >
                            Download
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => deleteOrder(o)}
                          disabled={deletingId === o.id}
                          title="Delete order"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-md hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingId === o.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
