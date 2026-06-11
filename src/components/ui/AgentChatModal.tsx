'use client';

import { useEffect } from 'react';
import OneToOneChat from '@/components/ui/ContactAgentModal';

interface AgentChatModalAgent {
  id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
}

interface AgentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentChatModalAgent;
  propertyTitle: string;
}

/**
 * Real modal wrapper around the OneToOneChat body.
 *
 * OneToOneChat (the default export of ContactAgentModal.tsx) only renders the
 * chat surface and accepts { agent, propertyTitle }. This wrapper supplies the
 * modal chrome (overlay, header, close button) and proper open/close behavior
 * so the chat is not rendered inline permanently.
 */
export default function AgentChatModal({ isOpen, onClose, agent, propertyTitle }: AgentChatModalProps) {
  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl w-full max-w-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Chat with {agent?.name || 'Agent'}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="text-gray-500 hover:text-gray-800 text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <div className="p-4">
          <OneToOneChat agent={agent} propertyTitle={propertyTitle} />
        </div>
      </div>
    </div>
  );
}
