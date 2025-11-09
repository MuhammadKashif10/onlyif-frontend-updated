'use client';

import { AgentProvider } from '@/context/AgentContext';
import AgentWizard from '@/components/agent/AgentWizard';
import { Navbar, Footer } from '@/components';

export default function AgentFlowPage() {
  return (
    <AgentProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <AgentWizard />
        <Footer />
      </div>
    </AgentProvider>
  );
}