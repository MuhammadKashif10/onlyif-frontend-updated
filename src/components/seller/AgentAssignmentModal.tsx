'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/reusable/Dialog';
import { Button } from '@/components/reusable';
import { Badge } from '@/components/reusable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/reusable/Avatar';
import { Star, Phone, Mail, MapPin } from 'lucide-react';
import { Agent } from '@/types/api';
import { agentsApi } from '@/api/agents';
import { apiClient } from '../../lib/api-client';

interface AgentAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  onAgentAssigned: (agent: Agent) => void;
}

export default function AgentAssignmentModal({
  isOpen,
  onClose,
  propertyId,
  onAgentAssigned
}: AgentAssignmentModalProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAgents();
    }
  }, [isOpen]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await agentsApi.getAgents();
      // Handle both paginated and direct array responses
      const agentList = response.data || response;
      setAgents(Array.isArray(agentList) ? agentList : []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAgent = async (agent: Agent) => {
    setAssigning(agent.id); // Use agent.id since API client transforms _id to id
    try {
      const response = await apiClient.post(`/properties/${propertyId}/assign-agent`, {
        agentId: agent.id // API client handles the transformation from _id to id
      });

      // apiClient.post already returns parsed JSON, no need to call .json()
      if (response.success) {
        onAgentAssigned(response.data.assignedAgent || agent);
        onClose();
      } else {
        console.error('Failed to assign agent:', response.error || response.message);
      }
    } catch (error) {
      console.error('Error assigning agent:', error);
    } finally {
      setAssigning(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign an Agent to Your Property</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {agents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No agents available at the moment.
              </div>
            ) : (
              agents.map((agent) => (
                <div key={agent.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={agent.avatar} alt={agent.name} />
                      <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{agent.name}</h3>
                          <p className="text-gray-600">{agent.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{agent.rating}</span>
                              <span className="text-sm text-gray-500">({agent.reviews} reviews)</span>
                            </div>
                            <Badge variant="secondary">{agent.experience}</Badge>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => handleAssignAgent(agent)}
                          disabled={assigning === agent.id}
                          className="ml-4"
                        >
                          {assigning === agent.id ? 'Assigning...' : 'Assign Agent'}
                        </Button>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{agent.bio}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {agent.specializations?.slice(0, 3).map((spec) => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{agent.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{agent.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{agent.office}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-green-600 font-medium">
                          {agent.propertiesSold} properties sold
                        </span>
                        <span className="text-blue-600 font-medium">
                          Avg. {agent.averageDaysOnMarket} days on market
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}