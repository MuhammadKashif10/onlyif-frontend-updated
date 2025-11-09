'use client';

import { useState, useEffect } from 'react';
import { Navbar, Footer } from '@/components';
import Sidebar from '@/components/main/Sidebar';
import AddonCard from '@/components/reusable/AddonCard';
import Modal from '@/components/reusable/Modal';
import Button from '@/components/reusable/Button';
import InputField from '@/components/reusable/InputField';
import { loadStripe } from '@stripe/stripe-js';
import { addonsApi, Addon } from '@/api/addons';

interface Addon {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  features: string[];
  isActive?: boolean;
}

interface PaymentFormData {
  cardholderName: string;
  cardNumber: string;
  expirationDate: string;
  cvv: string;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function AddonsPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    cardholderName: '',
    cardNumber: '',
    expirationDate: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAddons, setActiveAddons] = useState<string[]>([]);

  // Fetch addons on component mount
  useEffect(() => {
    const fetchAddons = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedAddons = await addonsApi.getAddons();
        setAddons(fetchedAddons);
      } catch (err) {
        console.error('Error fetching addons:', err);
        setError('Failed to load add-ons. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddons();
  }, []);

  const handleAddonToggle = (addonId: string) => {
    if (activeAddons.includes(addonId)) {
      return; // Don't allow deselecting active add-ons
    }
    
    setSelectedAddons(prev => 
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const calculateTotal = () => {
    return selectedAddons.reduce((total, addonId) => {
      const addon = addons.find(a => a.id === addonId);
      return total + (addon?.price || 0);
    }, 0);
  };

  const markAddonsAsActive = async (addonIds: string[]) => {
    try {
      // Use the purchaseAddon API for each selected addon
      const purchasePromises = addonIds.map(addonId => 
        addonsApi.purchaseAddon(addonId, 'default-property-id')
      );
      
      await Promise.all(purchasePromises);
      setActiveAddons(prev => [...prev, ...addonIds]);
    } catch (error) {
      console.error('Failed to mark add-ons as active:', error);
      throw error;
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // For demo purposes, simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark add-ons as active using the API
      await markAddonsAsActive(selectedAddons);
      
      alert('Payment successful! Your add-ons are now active.');
      
      // Reset form
      setSelectedAddons([]);
      setPaymentData({
        cardholderName: '',
        cardNumber: '',
        expirationDate: '',
        cvv: ''
      });
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const retryFetch = () => {
    const fetchAddons = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedAddons = await addonsApi.getAddons();
        setAddons(fetchedAddons);
      } catch (err) {
        console.error('Error fetching addons:', err);
        setError('Failed to load add-ons. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddons();
  };

  const termsContent = `
    TERMS AND CONDITIONS
    
    1. ACCEPTANCE OF TERMS
    By using our add-on services, you agree to be bound by these Terms and Conditions.
    
    2. SERVICE DESCRIPTION
    Our add-on services are designed to enhance your property listing visibility and marketing reach.
    
    3. PAYMENT TERMS
    - All payments are due immediately upon service selection
    - Prices are subject to change with 30 days notice
    - Refunds are available within 7 days of purchase for unused services
    
    4. SERVICE DELIVERY
    - Premium listings activate within 24 hours
    - Professional photography scheduled within 48 hours
    - Virtual tours completed within 5 business days
    - Social media campaigns launch within 72 hours
    
    5. CANCELLATION POLICY
    Services can be cancelled before activation for a full refund. Once services are active, partial refunds may apply based on usage.
    
    6. LIMITATION OF LIABILITY
    OnlyIf is not liable for any indirect, incidental, or consequential damages arising from the use of our services.
    
    7. PRIVACY POLICY
    We respect your privacy and handle your data according to our Privacy Policy.
    
    8. MODIFICATIONS
    We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.
    
    9. GOVERNING LAW
    These terms are governed by the laws of the jurisdiction in which OnlyIf operates.
    
    10. CONTACT INFORMATION
    For questions about these terms, contact us at legal@onlyif.com
    
    Last updated: March 2024
  `;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar userType="seller" />
        
        <main className="flex-1 ml-64 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketing Add-ons & Payment</h1>
              <p className="text-gray-600">Enhance your property listing with our premium marketing services</p>
            </header>
            
            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading add-ons...</span>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={retryFetch} variant="primary">
                  Try Again
                </Button>
              </div>
            )}
            
            {/* Main Content */}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Add-ons Grid */}
                <div className="xl:col-span-2">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Available Add-ons</h2>
                    <p className="text-gray-600">Select the services that best fit your property marketing needs</p>
                  </div>
                  
                  {addons.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No add-ons available at the moment.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addons.map((addon) => {
                        const isActive = activeAddons.includes(addon.id);
                        const isSelected = selectedAddons.includes(addon.id);
                        
                        return (
                          <div key={addon.id} className="relative">
                            <AddonCard
                              title={addon.title}
                              description={addon.title} // Using title as description since API doesn't have description
                              price={addon.price}
                              image={addon.image}
                              features={addon.features}
                              isSelected={isSelected}
                              onSelect={() => handleAddonToggle(addon.id)}
                              className={isActive ? 'opacity-75' : ''}
                            />
                            {isActive && (
                              <div className="absolute top-2 left-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ✓ Active
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {/* Payment Section */}
                <div className="xl:col-span-1">
                  <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>
                    
                    {/* Selected Items */}
                    <div className="mb-6">
                      {selectedAddons.length === 0 ? (
                        <p className="text-gray-500 text-sm">No add-ons selected</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedAddons.map(addonId => {
                            const addon = addons.find(a => a.id === addonId);
                            return addon ? (
                              <div key={addonId} className="flex justify-between text-sm">
                                <span className="text-gray-700">{addon.title}</span>
                                <span className="font-medium">${addon.price.toFixed(2)}</span>
                              </div>
                            ) : null;
                          })}
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between font-semibold">
                              <span>Total:</span>
                              <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Payment Form */}
                    {selectedAddons.length > 0 && (
                      <form onSubmit={handlePaymentSubmit} className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Information</h3>
                        
                        <InputField
                          label="Cardholder Name"
                          placeholder="John Doe"
                          value={paymentData.cardholderName}
                          onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                          required
                          id="cardholder-name"
                          name="cardholderName"
                        />
                        
                        <InputField
                          label="Card Number"
                          placeholder="1234 5678 9012 3456"
                          value={paymentData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          required
                          id="card-number"
                          name="cardNumber"
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                          <InputField
                            label="Expiration Date"
                            placeholder="MM/YY"
                            value={paymentData.expirationDate}
                            onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                            required
                            id="expiration-date"
                            name="expirationDate"
                          />
                          
                          <InputField
                            label="CVV"
                            placeholder="123"
                            value={paymentData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value)}
                            required
                            id="cvv"
                            name="cvv"
                          />
                        </div>
                        
                        <div className="pt-4">
                          <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={isProcessing}
                            className="w-full"
                          >
                            {isProcessing ? 'Processing...' : `Pay Now - $${calculateTotal().toFixed(2)}`}
                          </Button>
                        </div>
                        
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                            aria-label="View terms and conditions"
                          >
                            View Terms & Conditions
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Terms & Conditions Modal */}
      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms & Conditions"
        size="lg"
      >
        <div className="max-h-96 overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
              {termsContent}
            </pre>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => setShowTermsModal(false)}
            variant="primary"
          >
            Close
          </Button>
        </div>
      </Modal>
      
      <Footer />
    </div>
  );
}