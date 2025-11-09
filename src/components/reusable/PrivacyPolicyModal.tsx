'use client';

import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy Policy"
      size="lg"
    >
      <div className="max-h-96 overflow-y-auto">
        <div className="prose prose-sm max-w-none text-gray-700">
          <h3 className="text-lg font-semibold mb-3">Information We Collect</h3>
          <p className="mb-4">
            We collect information you provide directly to us, such as when you create an account, 
            list a property, or contact us for support.
          </p>
          
          <h3 className="text-lg font-semibold mb-3">How We Use Your Information</h3>
          <p className="mb-4">
            We use the information we collect to provide, maintain, and improve our services, 
            process transactions, and communicate with you.
          </p>
          
          <h3 className="text-lg font-semibold mb-3">Information Sharing</h3>
          <p className="mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except as described in this policy.
          </p>
          
          <h3 className="text-lg font-semibold mb-3">Data Security</h3>
          <p className="mb-4">
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction.
          </p>
          
          <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at 
            privacy@onlyif.com or call (555) 123-4567.
          </p>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} variant="primary">
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default PrivacyPolicyModal;