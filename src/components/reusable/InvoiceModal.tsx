import React, { useEffect, useState } from 'react';

interface InvoiceModalProps {
  invoiceId: string;
  onClose: () => void;
}

interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  totalAmount: number;
  commissionAmount?: number;
  tax?: { gst?: { amount?: number } };
  dueDate: string;
  property?: { title?: string; address?: any; price?: number };
  agent?: { name?: string };
  seller?: { name?: string };
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoiceId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${backendUrl}/api/invoices/${invoiceId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error('Failed to load invoice');
        }
        const data = await res.json();
        setInvoice(data.data || data.invoice);
      } catch (e: any) {
        setError(e?.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    if (invoiceId) fetchInvoice();
  }, [invoiceId]);

  const handlePay = async () => {
    try {
      if (!invoice) return;
      setPaying(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/payment/initialize`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, amount: invoice.totalAmount })
      });
      const data = await res.json();
      if (data?.success && data?.data?.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else {
        setError(data?.message || 'Unable to start payment');
      }
    } catch (e: any) {
      setError(e?.message || 'Unable to start payment');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Invoice Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {loading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-600">{error}</div>
        ) : invoice ? (
          <div>
            <div className="mb-3 text-sm text-gray-600">Invoice No: {invoice.invoiceNumber}</div>
            <div className="mb-3">
              <div className="text-sm text-gray-600">Property</div>
              <div className="font-medium">{invoice.property?.title || 'Property'}</div>
            </div>
            <div className="mb-3">
              <div className="text-sm text-gray-600">Amount Due</div>
              <div className="text-2xl font-bold">A${(invoice.totalAmount || 0).toLocaleString('en-AU')}</div>
            </div>
            <div className="mb-4 text-sm text-gray-600">Due: {new Date(invoice.dueDate).toLocaleDateString('en-AU')}</div>

            <div className="flex gap-2">
              <button onClick={handlePay} disabled={paying} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                {paying ? 'Processing...' : 'Pay Now'}
              </button>
              <button onClick={onClose} className="border px-4 py-2 rounded">Close</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default InvoiceModal;