'use client';

import { useState } from 'react';
import { useBuyerContext } from '@/context/BuyerContext';
import { Button } from '@/components/reusable/Button';
import { formatCurrency } from '@/utils/currency';
import { PRICING } from '@/utils/constants';

export default function PaymentPhase() {
  // Fix: Only destructure properties that exist in BuyerContext
  const { buyerData, prevPhase } = useBuyerContext();

  // Local state management for errors and loading
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // PCI-safe payment: no card data is ever collected or sent to our servers.
  // We create a Stripe Checkout Session on the backend and redirect the user to
  // Stripe's hosted checkout page. Payment is confirmed only by the Stripe webhook.
  const handlePayment = async () => {
    setIsProcessing(true);
    setErrors({ payment: '' });

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setErrors({ payment: 'Please sign in to continue.' });
      setIsProcessing(false);
      return;
    }

    // Every buyer unlock payment must be tied to a specific property.
    // (BrowsePhase stores the selection as `selectedProperty.id`; fall back to
    // `_id` to stay consistent with the rest of the codebase.)
    const propertyId = buyerData?.selectedProperty?._id || buyerData?.selectedProperty?.id;
    if (!propertyId) {
      setErrors({ payment: 'No property selected for payment' });
      setIsProcessing(false);
      return;
    }

    // Resolve the backend origin and normalize it: drop any trailing slash and a
    // trailing "/api" so we never produce a doubled "/api/api" path. The backend
    // mounts payment routes at /api/payment (server.js), which we append below.
    const backendBase = (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
      ''
    )
      .replace(/\/$/, '')
      .replace(/\/api$/, '');

    if (!backendBase) {
      setErrors({ payment: 'Payment service is not configured.' });
      setIsProcessing(false);
      return;
    }

    try {
      const res = await fetch(`${backendBase}/api/payment/checkout/${propertyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      let data: { url?: string; message?: string } = {};
      try {
        data = await res.json();
      } catch {
        /* non-JSON */
      }

      if (data.url) {
        // Redirect to Stripe-hosted checkout. The browser leaves this page.
        window.location.href = data.url;
        return;
      }

      throw new Error(data.message || 'Unable to start checkout. Please try again.');
    } catch (error) {
      setErrors({
        payment: error instanceof Error ? error.message : 'Payment processing failed. Please try again.',
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock Property Details</h2>
        <p className="text-gray-600">Pay {formatCurrency(PRICING.UNLOCK_FEE)} to access full property information and contact details</p>
      </div>

      {/* Selected Property Summary */}
      {buyerData.selectedProperty && (
        <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Property Selected:</h3>
          <p className="text-gray-700">{buyerData.selectedProperty.title}</p>
          <p className="text-gray-600 text-sm">{buyerData.selectedProperty.address}</p>
          <p className="text-lg font-semibold text-green-600 mt-2">
            {formatCurrency(buyerData.selectedProperty.price)}
          </p>
        </div>
      )}

      {/* Payment */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(PRICING.UNLOCK_FEE)}</div>
        </div>

        {errors.payment && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {errors.payment}
          </div>
        )}

        <p className="text-gray-600 text-sm">
          You'll be redirected to our secure payment provider (Stripe) to complete your
          {' '}{formatCurrency(PRICING.UNLOCK_FEE)} payment. We never see or store your card details.
        </p>

        <div className="flex space-x-4 mt-8">
          <Button
            onClick={prevPhase}
            variant="outline"
            size="full"
            disabled={isProcessing}
          >
            Back to Browse
          </Button>

          <Button
            onClick={handlePayment}
            loading={isProcessing}
            size="full"
          >
            Pay {formatCurrency(PRICING.UNLOCK_FEE)}
          </Button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>🔒 Payments are processed securely by Stripe. Your card details never touch our servers.</p>
      </div>
    </div>
  );
}
