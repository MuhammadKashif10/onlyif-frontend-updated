'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components';
import Sidebar from '@/components/main/Sidebar';

interface Offer {
  id: string;
  propertyTitle: string;
  propertyAddress: string;
  buyerName: string;
  offerAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  submittedDate: string;
  expiryDate: string;
}

const SellerOffers = () => {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call - replace with actual API integration
    const fetchOffers = async () => {
      try {
        setIsLoading(true);
        // Mock data for now
        const mockOffers: Offer[] = [
          {
            id: '1',
            propertyTitle: 'Modern Family Home',
            propertyAddress: '123 Oak Street, Springfield',
            buyerName: 'John Smith',
            offerAmount: 450000,
            status: 'pending',
            submittedDate: '2024-01-15',
            expiryDate: '2024-01-22'
          },
          {
            id: '2',
            propertyTitle: 'Downtown Condo',
            propertyAddress: '456 Main Ave, Downtown',
            buyerName: 'Sarah Johnson',
            offerAmount: 320000,
            status: 'accepted',
            submittedDate: '2024-01-10',
            expiryDate: '2024-01-17'
          }
        ];
        
        setTimeout(() => {
          setOffers(mockOffers);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load offers');
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'countered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOfferAction = (offerId: string, action: 'accept' | 'reject' | 'counter') => {
    // Handle offer actions - integrate with API
    console.log(`${action} offer ${offerId}`);
  };

  return (
    <div className="pt-4 sm:pt-6 md:pt-8">
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
        <Sidebar userType="seller" userId="1" />
        
        <main className="flex-1 ml-64">
          <div className="pt-16 sm:pt-20 md:pt-24">
            {/* Orange Header Section */}
            <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Offers Management
                  </h1>
                  <p className="text-xl text-orange-100 max-w-3xl mx-auto">
                    Review and manage offers on your properties.
                  </p>
                </div>
              </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading offers...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : offers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Offers Yet</h3>
                  <p className="text-gray-600 mb-6">You haven't received any offers on your properties yet.</p>
                  <button 
                    onClick={() => router.push('/dashboards/seller/listings')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View My Listings
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Recent Offers</h2>
                    <div className="flex space-x-2">
                      <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    {offers.map((offer) => (
                      <div key={offer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {offer.propertyTitle}
                            </h3>
                            <p className="text-gray-600 text-sm">{offer.propertyAddress}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div>
                            <p className="text-sm text-gray-500">Buyer</p>
                            <p className="font-medium">{offer.buyerName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Offer Amount</p>
                            <p className="font-medium text-green-600">${offer.offerAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Expires</p>
                            <p className="font-medium">{new Date(offer.expiryDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {offer.status === 'pending' && (
                          <div className="flex space-x-3">
                            <button 
                              onClick={() => handleOfferAction(offer.id, 'accept')}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleOfferAction(offer.id, 'counter')}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Counter
                            </button>
                            <button 
                              onClick={() => handleOfferAction(offer.id, 'reject')}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SellerOffers;