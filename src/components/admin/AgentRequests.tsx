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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6 sm:p-10 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/30">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-green-600" />
            Pending Agent Requests
          </h3>
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5 sm:mt-1">Review and approve new real estate agent registration requests.</p>
        </div>
        <div className="self-start sm:self-center px-3 py-1 bg-green-100 text-green-700 text-[10px] sm:text-xs font-bold rounded-full whitespace-nowrap">
          {requests.length} Pending
        </div>
      </div>
      <div className="overflow-x-auto">
        {requests.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4 sm:px-6">
            <div className="w-12 h-12 sm:w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-gray-100">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300" />
            </div>
            <p className="text-gray-900 font-bold text-sm sm:text-base">No pending agent requests</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 font-medium">No pending agent requests at the moment.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent Info</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Requested Date</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">{request.name}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">ID: {request._id || (request as any).id}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col gap-1 sm:gap-1.5">
                      <div className="flex items-center gap-2 text-gray-600 font-medium text-xs">
                        <Mail className="h-3.5 w-3.5 opacity-40" /> {request.email}
                      </div>
                      {request.phone && (
                        <div className="flex items-center gap-2 text-gray-600 font-medium text-xs">
                          <Phone className="h-3.5 w-3.5 opacity-40" /> {request.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px] sm:text-xs">
                      <Clock className="h-3.5 w-3.5 opacity-40" />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                    <div className="flex justify-end gap-2 sm:gap-3">
                      <button 
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all active:scale-95 whitespace-nowrap"
                        onClick={() => handleStatusUpdate(request._id || (request as any).id, 'rejected')}
                      >
                        Reject
                      </button>
                      <button 
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm shadow-green-100 transition-all active:scale-95 whitespace-nowrap"
                        onClick={() => handleStatusUpdate(request._id || (request as any).id, 'approved')}
                      >
                        Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
