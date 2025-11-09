'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import Checkbox from './Checkbox';
import Button from './Button';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  userRole: 'seller' | 'buyer';
  isLoading?: boolean;
}

const getTermsContent = (role: string) => {
  const termsContent = {
    seller: {
      title: 'Seller Terms & Conditions',
      version: 'v1.0',
      content: `
**ONLYIF SELLER TERMS & CONDITIONS (Version 1.0)**

By proceeding with your seller account registration, you acknowledge and agree to the following terms:

**1. SUCCESS FEE AGREEMENT**
• You agree to pay OnlyIf a success fee of 1.1% (inclusive of GST) of the final sale price
• This fee is ONLY payable if OnlyIf introduces a buyer who proceeds to an unconditional purchase
• No fee is payable if the property does not sell through OnlyIf's platform
• The success fee will be deducted from the settlement proceeds

**2. PLATFORM COMMITMENT**
• You agree not to bypass OnlyIf or any introduced agent in any transaction
• All negotiations and communications with buyers introduced by OnlyIf must go through the platform
• You will not directly contact or negotiate with buyers outside of the OnlyIf system
• Any attempt to circumvent the platform may result in account termination and legal action

**3. PROPERTY LISTING REQUIREMENTS**
• You warrant that you have the legal right to sell the property
• All information provided about the property must be accurate and complete
• You will promptly update any changes to property details or availability
• Professional photography and property presentation standards must be maintained

**4. MARKETING AND PROMOTION**
• OnlyIf may use property images and details for marketing purposes
• You grant OnlyIf permission to advertise your property across various channels
• Property information may be shared with qualified buyers and agents

**5. GENERAL TERMS**
• These terms are governed by Australian law
• OnlyIf reserves the right to update these terms with reasonable notice
• Account termination may occur for breach of these terms
• All disputes will be resolved through binding arbitration

**6. DATA AND PRIVACY**
• Your personal and property information will be handled according to our Privacy Policy
• We may contact you regarding your listing and platform updates
• You can opt out of marketing communications at any time

By checking "I Agree" below, you confirm that you have read, understood, and agree to be bound by these Terms & Conditions.
      `
    },
    buyer: {
      title: 'Buyer Terms & Conditions',
      version: 'v1.0',
      content: `
**ONLYIF BUYER TERMS & CONDITIONS (Version 1.0)**

By proceeding with your buyer account registration, you acknowledge and agree to the following terms:

**1. PLATFORM USAGE**
• You agree to use OnlyIf's platform in good faith for genuine property purchases
• All property inquiries and communications must be conducted through the platform
• You will provide accurate information about your buying requirements and financial capacity

**2. PROPERTY ACCESS FEES**
• The $49 unlock fee for premium property details is non-refundable
• This fee is charged once per property and provides access to detailed information
• Fees are clearly disclosed before payment and contribute to maintaining high-quality property information
• No refunds will be provided regardless of your decision to proceed with the property

**3. COMMUNICATION POLICY**
• You agree not to contact sellers directly outside of the OnlyIf platform
• All communications with sellers must go through OnlyIf's messaging system
• Direct contact attempts may result in account suspension or termination
• OnlyIf facilitates all negotiations and communications for your protection

**4. AGENT INTERACTIONS**
• You agree to work exclusively with agents introduced through OnlyIf for properties found on our platform
• All negotiations must be conducted through OnlyIf's system
• Bypassing introduced agents is prohibited and may result in legal action

**5. GENERAL TERMS**
• These terms are governed by Australian law
• OnlyIf reserves the right to update these terms with reasonable notice
• Account termination may occur for breach of these terms
• Your data will be handled according to our Privacy Policy

**6. PAYMENT AND REFUNDS**
• All payments made through the platform are final
• Property unlock fees are non-refundable under any circumstances
• Additional fees may apply for premium services as clearly disclosed

By checking "I Agree" below, you confirm that you have read, understood, and agree to be bound by these Terms & Conditions.
      `
    }
  };

  return termsContent[role as keyof typeof termsContent] || termsContent.buyer;
};

export default function TermsAndConditionsModal({
  isOpen,
  onClose,
  onAccept,
  userRole,
  isLoading = false
}: TermsAndConditionsModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const termsContent = getTermsContent(userRole);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    if (isAgreed && hasScrolledToBottom) {
      onAccept();
    }
  };

  const handleClose = () => {
    setIsAgreed(false);
    setHasScrolledToBottom(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={termsContent.title}
      size="lg"
    >
      <div className="space-y-6">
        {/* Terms Content */}
        <div 
          className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50"
          onScroll={handleScroll}
          role="region"
          aria-label="Terms and conditions content"
          tabIndex={0}
        >
          <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
            {termsContent.content}
          </div>
        </div>

        {/* Scroll Indicator */}
        {!hasScrolledToBottom && (
          <div className="text-center">
            <p className="text-sm text-orange-600 font-medium">
              Please scroll to the bottom to read all terms and conditions
            </p>
            <div className="flex justify-center mt-2">
              <svg 
                className="w-5 h-5 text-orange-500 animate-bounce" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        )}

        {/* Agreement Checkbox */}
        <div className="border-t pt-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms-agreement"
              checked={isAgreed}
              onChange={setIsAgreed}
              disabled={!hasScrolledToBottom}
              aria-describedby="terms-agreement-description"
            />
            <label 
              htmlFor="terms-agreement" 
              className={`text-sm font-medium cursor-pointer ${
                hasScrolledToBottom ? 'text-gray-900' : 'text-gray-400'
              }`}
              id="terms-agreement-description"
            >
              I have read and agree to the Terms & Conditions above
            </label>
          </div>
          
          {userRole === 'seller' && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Key Points:</strong> By agreeing, you commit to a 1.1% inc. GST success fee 
                (only if we introduce a buyer who goes unconditional) and agree not to bypass 
                our platform or agents.
              </p>
            </div>
          )}
          
          {userRole === 'buyer' && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Key Points:</strong> The $49 unlock fee is non-refundable and you agree 
                to communicate with sellers only through our platform.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!isAgreed || !hasScrolledToBottom || isLoading}
            className="flex-1"
            aria-describedby="accept-button-description"
          >
            {isLoading ? 'Processing...' : 'I Agree & Continue'}
          </Button>
        </div>
        
        <div id="accept-button-description" className="sr-only">
          Accept terms and conditions to continue with account registration
        </div>
      </div>
    </Modal>
  );
}