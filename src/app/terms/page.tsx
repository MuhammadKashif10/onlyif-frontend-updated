'use client';

import React from 'react';
import { Button } from '@/components/reusable';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Only If – Terms and Conditions</h1>
            <p className="mt-2 text-lg text-gray-600">Only If Property Platform</p>
            <p className="text-sm text-gray-500">Effective Date: August 2025</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">
                These Terms and Conditions govern your use of the Only If property platform (referred to as "Only If," "we," "us," or "our"). By registering as a user, you agree to abide by the following terms applicable to your role on the platform.
              </p>
            </div>
          </section>

          {/* General Platform Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. General Platform Terms (All Users)</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1.1 Use of the Platform</h3>
                <p className="text-gray-700 leading-relaxed">
                  You must be at least 18 years old and provide accurate, up-to-date information during registration. You agree not to use the platform for any unlawful, fraudulent, or misleading purposes.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1.2 Privacy</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your data is handled in accordance with our Privacy Policy. You consent to communication from us regarding your account, property activity, and relevant platform updates.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1.3 Platform Integrity</h3>
                <p className="text-gray-700 leading-relaxed">
                  Only If is a marketplace that facilitates property connections, price transparency, and agent support. Users agree not to circumvent the platform in a way that avoids the applicable fees or disrupts our intended model.
                </p>
              </div>
            </div>
          </section>

          {/* Seller Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Seller Terms</h2>
            <div className="bg-blue-50 rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2.1 Listing Your Property</h3>
                <p className="text-gray-700 leading-relaxed">
                  By submitting a property, you confirm that you are the legal owner or have legal authority to represent the owner. You agree to accurately represent the property, including its price, condition, and relevant details.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2.2 Only If Price</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may list your property at a price of your choosing ("Only If Price"), with no obligation to sell unless an acceptable offer is received.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2.3 Success Fee</h3>
                <p className="text-gray-700 leading-relaxed">
                  If a buyer introduced via the platform proceeds with an unconditional purchase of your property, a 1.1% (including GST) success fee is payable to Only If. This applies whether the buyer was introduced via direct platform access or via an Only If Agent Partner.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2.4 Listing Visibility & Upgrades</h3>
                <p className="text-gray-700 leading-relaxed">
                  Sellers may choose to keep listings private or public. Optional upgrades such as professional photography, floorplans, and video tours are available for additional fees, whilst Only If takes no responsibility for third party partners.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2.5 Engagement With Only If Agent</h3>
                <p className="text-gray-700 leading-relaxed">
                  If you request agent assistance, an Only If Agent Partner may be assigned to assist with pricing, marketing, inspections, and negotiation.
                </p>
              </div>
            </div>
          </section>

          {/* Buyer Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Buyer Terms</h2>
            <div className="bg-green-50 rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3.1 Property Unlock</h3>
                <p className="text-gray-700 leading-relaxed">
                  Buyers may browse publicly visible listings with limited information. To access full property details, a $49 (AUD) non-refundable payment is required per property.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3.2 Communication & Conduct</h3>
                <p className="text-gray-700 leading-relaxed">
                  Buyers agree not to attempt direct contact with sellers outside of the platform or bypass the platform once access has been unlocked.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3.3 Offer Process</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may express interest directly via the platform. All negotiations are handled by the assigned Only If Agent Partner. Only If is not a party to the sales contract between buyer and seller.
                </p>
              </div>
            </div>
          </section>

          {/* Agent Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Agent Terms</h2>
            <div className="bg-purple-50 rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4.1 Engagement Model</h3>
                <p className="text-gray-700 leading-relaxed">
                  Agents engaged by Only If operate under a fixed commission-sharing arrangement: 50% of the 1.1% (incl. GST) success fee is paid to the assigned agent upon successful, unconditional sale.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4.2 Code of Conduct</h3>
                <p className="text-gray-700 leading-relaxed">
                  Agents agree to: only work with platform-assigned clients, not poach for off-platform deals, and represent the brand professionally.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4.3 Assignment & Availability</h3>
                <p className="text-gray-700 leading-relaxed">
                  Agents may receive assignments for buyer, seller, or both and are expected to respond in a timely and professional manner.
                </p>
              </div>
            </div>
          </section>

          {/* Disputes, Liability & Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Disputes, Liability & Modifications</h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">5.1 Disputes</h3>
                <p className="text-gray-700 leading-relaxed">
                  Only If is not responsible for disputes between buyers, sellers, and agents but may assist in mediation.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">5.2 Liability Limitation</h3>
                <p className="text-gray-700 leading-relaxed">
                  Only If provides tools and introductions only. We are not liable for failure to sell/buy, inaccurate listings, or third-party payment delays.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">5.3 Amendments</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may update these terms periodically. Continued use constitutes acceptance of new terms.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">5.4 Breach of Terms</h3>
                <div className="text-gray-700 leading-relaxed">
                  <p className="mb-3">
                    If any user (Seller, Buyer, or Agent Partner) is found to have breached these Terms and Conditions — including, but not limited to, bypassing the platform, providing false information, or misusing the platform for off-platform deals — Only If reserves the right to:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Immediately suspend or terminate the user's account</li>
                    <li>Withhold or cancel any pending payments or commissions</li>
                    <li>Pursue recovery of unpaid fees, if applicable</li>
                    <li>Take legal action where necessary, including for breach of contract or damages</li>
                    <li>Notify relevant parties involved in the transaction</li>
                  </ul>
                  <p className="mt-3">
                    We reserve the right to determine what constitutes a breach and to take appropriate action to protect the integrity of the platform and its users.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
            <div className="bg-blue-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                If you have questions about these terms, contact us at:
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Email:</strong> support@onlyif.com.au</p>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
            <Link href="/contact" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Contact Support
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="primary" size="lg" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}