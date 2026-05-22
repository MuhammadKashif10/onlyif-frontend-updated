'use client';

import { AgentProvider } from '@/context/AgentContext';
import AgentWizard from '@/components/agent/AgentWizard';
import { Footer, Navbar } from '@/components';
import { useAuth } from '@/context/AuthContext';

export default function AgentFlowPage() {
  const { user } = useAuth();
  const agentName = user?.name || 'Agent';
  const agentAvatar = (user as any)?.profileImage || (user as any)?.avatar || '';

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
