// Top-level module (imports)
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/reusable/EnhancedCard';
import { Button } from '@/components/reusable/Button';
import Badge from '@/components/reusable/Badge';
import { Avatar } from '@/components/reusable/Avatar';
import { MessageCircle } from 'lucide-react' // removed Star
import { Agent, Conversation, Message } from '@/types/api';
import { getSafeImageUrl } from '@/utils/imageUtils';
import Modal from '@/components/reusable/Modal';
import ChatInterface from '@/components/reusable/ChatInterface';

interface AssignedAgentCardProps {
  agent: Agent;
  assignedAt: string;
  propertyId: string;
}

export default function AssignedAgentCard({ agent, assignedAt, propertyId }: AssignedAgentCardProps) {
  const [openChat, setOpenChat] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('You');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loadingConv, setLoadingConv] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.id) setCurrentUserId(String(u.id));
        if (u?.name) setCurrentUserName(String(u.name));
      }
    } catch {}
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  // Safeguard missing fields from backend
  const specializations = Array.isArray(agent?.specializations) ? agent.specializations : [];
  const safeName = agent?.name || 'Agent';
  // Prefer uploaded profile image; support various shapes and fall back to avatar
  const avatarCandidate = (agent as any)?.profileImage?.url
    ?? (agent as any)?.profileImage
    ?? (agent as any)?.avatar
    ?? (agent as any)?.image?.url
    ?? (agent as any)?.image;
  const safeAvatar = avatarCandidate ? getSafeImageUrl(String(avatarCandidate), 'profile') : '';

  // Load or create a real conversation thread when opening chat
  useEffect(() => {
    const run = async () => {
      if (!openChat || !currentUserId || !agent?.id) {
        console.log('❌ Skipping ensureThread - missing data:', { openChat, currentUserId, agentId: agent?.id });
        return;
      }
      
      console.log('🔍 Attempting to ensure thread:', { 
        agentId: agent.id, 
        propertyId, 
        currentUserId 
      });
      
      try {
        setLoadingConv(true);
        const { ensureThread } = await import('@/api/messages');
        const conv = await ensureThread(String(agent.id), propertyId);
        console.log('✅ Thread ensured successfully:', conv);
        setConversation(conv);
      } catch (error) {
        console.error('❌ Failed to ensure thread:', error);
        // Show error to user
        alert('Failed to load conversation. Please try again.');
      } finally {
        setLoadingConv(false);
      }
    };
    run();
  }, [openChat, currentUserId, agent?.id, propertyId]);


  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          Agent Assigned
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <Avatar
            src={safeAvatar}
            alt={safeName}
            fallback={safeName.split(' ').map(n => n[0]).join('')}
            className="h-16 w-16"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{safeName}</h3>
                <p className="text-gray-600">{agent.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {/* Removed star icon and rating */}
                  <Badge variant="secondary">{agent.experience}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenChat(true)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Contact
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-2">{agent.bio}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {specializations.slice(0, 3).map((spec) => (
                <Badge key={spec} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>

            <div className="mt-3 text-sm text-gray-500">
              Assigned on {formatDate(assignedAt)}
            </div>

            {/* Chat Modal */}
            <Modal isOpen={openChat} onClose={() => setOpenChat(false)} title={`Chat with ${safeName}`} size="lg">
              <div className="h-[70vh] max-h-[80vh]">
                {conversation && !loadingConv ? (
                  <ChatInterface
                    conversation={conversation}
                    currentUserId={currentUserId}
                    currentUserRole="seller"
                    className="h-full"
                    mockMode={false}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-600">Preparing chat…</div>
                )}
              </div>
            </Modal>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}
