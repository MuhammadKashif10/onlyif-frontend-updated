'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, UserX, Clock, Phone, Mail, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AgentRequest {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  agentStatus: 'pending' | 'approved' | 'rejected';
}

export default function AgentRequests() {
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      
      const response = await fetch(`${apiBase}/admin/agent-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch agent requests');
      
      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching agent requests:', error);
      toast.error('Failed to load agent requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    
    // Polling every 30 seconds as requested
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      
      const response = await fetch(`${apiBase}/admin/agent-status/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error(`Failed to ${status} agent`);
      
      const data = await response.json();
      if (data.success) {
        toast.success(`Agent request ${status} successfully`);
        // Remove from list or update status
        setRequests(prev => prev.filter(req => req._id !== userId));
      }
    } catch (error) {
      console.error(`Error ${status} agent:`, error);
      toast.error(`Failed to ${status} agent request`);
    }
  };

  if (loading && requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Requests</CardTitle>
          <CardDescription>Loading pending requests...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-blue-600" />
          Agent Requests
        </CardTitle>
        <CardDescription>
          Review and approve new real estate agent registration requests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <User className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No pending agent requests at the moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Agent Info</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Requested Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900">{request.name}</div>
                      <div className="text-xs text-gray-500">ID: {request._id || (request as any).id}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-3 w-3" /> {request.email}
                        </div>
                        {request.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-3 w-3" /> {request.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleStatusUpdate(request._id || (request as any).id, 'rejected')}
                        >
                          <UserX className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleStatusUpdate(request._id || (request as any).id, 'approved')}
                        >
                          <UserCheck className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
