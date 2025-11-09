'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminApi } from '@/api/admin';
import { getSafeImageUrl } from '@/utils/imageUtils';

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  joinedDate: string;
  totalListings: number;
  totalSales: number;
  rating: number;
  profileImage?: string;
  bankAccountNumber?: string; // added
}

interface CreateAgentData {
  name: string;
  email: string;
  password: string;
  phone: string;
  experience: string;
  location: string;
  description: string;
  bankAccountNumber: string; // added
}

export default function AgentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Add Agent Modal State
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [createAgentData, setCreateAgentData] = useState<CreateAgentData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    experience: '',
    location: '',
    description: '',
    bankAccountNumber: '' // added
  });
  const [createAgentErrors, setCreateAgentErrors] = useState<Partial<CreateAgentData>>({});
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
      return;
    }
    if (user && user.role === 'admin') {
      loadAgents();
    }
  }, [user, loading, router]);

  useEffect(() => {
    filterAgents();
  }, [agents, searchTerm, statusFilter]);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getAgents();
      setAgents(response.data || []);
    } catch (error) {
      console.error('Error loading agents:', error);
      showToast('Error loading agents', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAgents = () => {
    let filtered = agents;
    
    if (searchTerm) {
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(agent => agent.status === statusFilter);
    }
    
    setFilteredAgents(filtered);
  };

  const handleStatusChange = async (agentId: string, newStatus: string) => {
    try {
      // Map frontend status to backend status
      const backendStatus = newStatus === 'active' ? 'approved' : newStatus;
      await adminApi.updateAgentStatus(agentId, backendStatus);
      
      // Update local state
      setAgents(agents.map(agent => 
        agent.id === agentId ? { ...agent, status: newStatus as Agent['status'] } : agent
      ));
      showToast('Agent status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating agent status:', error);
      showToast('Error updating agent status', 'error');
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      try {
        await adminApi.deleteAgent(agentId);
        setAgents(agents.filter(agent => agent.id !== agentId));
        showToast('Agent deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting agent:', error);
        showToast('Error deleting agent', 'error');
      }
    }
  };

  // Add Agent Functions
  const validateCreateAgentForm = (): boolean => {
    const errors: Partial<CreateAgentData> = {};
    
    if (!createAgentData.name.trim()) {
      errors.name = 'Agent name is required';
    }
    
    if (!createAgentData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createAgentData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!createAgentData.password) {
      errors.password = 'Password is required';
    } else if (createAgentData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
    if (!createAgentData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(createAgentData.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Bank account validation: required and numeric only
    if (!createAgentData.bankAccountNumber || !createAgentData.bankAccountNumber.trim()) {
      errors.bankAccountNumber = 'Bank account number is required';
    } else if (!/^\d+$/.test(createAgentData.bankAccountNumber.trim())) {
      errors.bankAccountNumber = 'Bank account number must contain digits only';
    }
    
    // Experience and location are optional, so no validation needed
    
    setCreateAgentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetCreateAgentForm = () => {
    setCreateAgentData({ name: '', email: '', password: '', phone: '', experience: '', location: '', description: '', bankAccountNumber: '' });
    setCreateAgentErrors({});
    setProfileImageFile(null);
    setProfileImagePreview(null);
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCreateAgentForm()) {
      return;
    }
    
    setIsCreatingAgent(true);
    
    try {
      const form = new FormData();
      form.append('name', createAgentData.name);
      form.append('email', createAgentData.email);
      form.append('password', createAgentData.password);
      form.append('phone', createAgentData.phone);
      form.append('bankAccountNumber', createAgentData.bankAccountNumber); // added
      if (createAgentData.experience) form.append('experience', createAgentData.experience);
      if (createAgentData.location) form.append('location', createAgentData.location);
      if (createAgentData.description) form.append('description', createAgentData.description);
      if (profileImageFile) form.append('profileImage', profileImageFile);
      
      const response = await adminApi.createAgent(form);
      
      // Add the new agent to the list
      const newAgent: Agent = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone || createAgentData.phone,
        licenseNumber: '',
        status: 'approved',
        joinedDate: new Date().toISOString(),
        totalListings: 0,
        totalSales: 0,
        rating: 0,
        profileImage: response.data.profileImage || undefined,
        bankAccountNumber: response.data.bankAccountNumber || createAgentData.bankAccountNumber // added
      };
      
      setAgents([newAgent, ...agents]);
      
      // Reset form and close modal
      resetCreateAgentForm();
      setShowAddAgentModal(false);
      
      showToast('Agent created successfully', 'success');
    } catch (error: any) {
      console.error('Error creating agent:', error);
      const errorMessage = error.response?.data?.message || 'Error creating agent';
      showToast(errorMessage, 'error');
    } finally {
      setIsCreatingAgent(false);
    }
  };

  // Simple toast notification function
  const showToast = (message: string, type: 'success' | 'error') => {
    // You can replace this with your preferred toast library
    if (type === 'success') {
      alert(`✅ ${message}`);
    } else {
      alert(`❌ ${message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'suspended': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
          <button
            onClick={() => setShowAddAgentModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Agent
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Agents</h3>
            <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending Approval</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {agents.filter(a => a.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Approved</h3>
            <p className="text-2xl font-bold text-green-600">
              {agents.filter(a => a.status === 'approved').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Suspended</h3>
            <p className="text-2xl font-bold text-red-600">
              {agents.filter(a => a.status === 'suspended').length}
            </p>
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bank Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No agents found
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={getSafeImageUrl(agent.profileImage || '/images/default-avatar.png', 'agent')}
                              alt={agent.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                            <div className="text-sm text-gray-500">Joined {agent.joinedDate}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{agent.email}</div>
                        <div className="text-sm text-gray-500">{agent.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agent.licenseNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agent.bankAccountNumber || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>Listings: {agent.totalListings}</div>
                        <div>Sales: {agent.totalSales}</div>
                        <div>Rating: {agent.rating}/5</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* Suspend/Active toggle */}
                          {agent.status === 'suspended' ? (
                            <button
                              onClick={() => handleStatusChange(agent.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(agent.id, 'suspended')}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              Suspend
                            </button>
                          )}
                          
                          {/* View button */}
                          <button
                            onClick={() => {
                              setSelectedAgent(agent);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          
                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agent Details Modal */}
        {showModal && selectedAgent && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Agent Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{selectedAgent.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedAgent.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{selectedAgent.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">License Number</label>
                    <p className="text-sm text-gray-900">{selectedAgent.licenseNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bank Account Number</label>
                    <p className="text-sm text-gray-900">{selectedAgent.bankAccountNumber || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAgent.status)}`}>
                      {selectedAgent.status}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Agent Modal */}
        {showAddAgentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50 flex items-start justify-center py-10 md:py-16">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add New Agent</h2>
                <button
                  onClick={() => {
                    setShowAddAgentModal(false);
                    resetCreateAgentForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateAgent} className="space-y-4">
                <div>
                  <label htmlFor="agentName" className="block text-sm font-medium text-gray-700 mb-1">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    id="agentName"
                    value={createAgentData.name}
                    onChange={(e) => setCreateAgentData({ ...createAgentData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      createAgentErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter agent's full name"
                  />
                  {createAgentErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{createAgentErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="agentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Agent Email *
                  </label>
                  <input
                    type="email"
                    id="agentEmail"
                    value={createAgentData.email}
                    onChange={(e) => setCreateAgentData({ ...createAgentData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      createAgentErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter agent's email address"
                  />
                  {createAgentErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{createAgentErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="agentPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="agentPhone"
                    value={createAgentData.phone}
                    onChange={(e) => setCreateAgentData({ ...createAgentData, phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      createAgentErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter agent's phone number"
                  />
                  {createAgentErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{createAgentErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="agentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Agent Password *
                  </label>
                  <input
                    type="password"
                    id="agentPassword"
                    value={createAgentData.password}
                    onChange={(e) => setCreateAgentData({ ...createAgentData, password: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      createAgentErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter a secure password (min 8 characters)"
                  />
                  {createAgentErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{createAgentErrors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="agentExperience" className="block text-sm font-medium text-gray-700 mb-1">
                    Experience
                  </label>
                  <input
                    type="text"
                    id="agentExperience"
                    value={createAgentData.experience}
                    onChange={(e) => setCreateAgentData({ ...createAgentData, experience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 5 years"
                  />
                </div>

                <div>
                  <label htmlFor="agentLocation" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="agentLocation"
                    value={createAgentData.location}
                    onChange={(e) => setCreateAgentData({ ...createAgentData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Perth"
                  />
                </div>

                <div>
                  <label htmlFor="agentDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="agentDescription"
                    value={createAgentData.description}
                    onChange={(e) => setCreateAgentData({ ...createAgentData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write a short bio or details about the agent"
                    rows={4}
                    maxLength={1000}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {createAgentData.description.length}/1000 characters
                  </div>
                </div>

                <div>
                  <label htmlFor="agentProfileImage" className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    id="agentProfileImage"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setProfileImageFile(file || null);
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setProfileImagePreview(reader.result as string);
                        reader.readAsDataURL(file);
                      } else {
                        setProfileImagePreview(null);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {profileImagePreview && (
                    <div className="mt-2">
                      <img src={profileImagePreview} alt="Preview" className="h-16 w-16 rounded-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="agentBankAccountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Account Number *
                  </label>
                  <input
                    type="text"
                    id="agentBankAccountNumber"
                    inputMode="numeric"
                    pattern="\d*"
                    value={createAgentData.bankAccountNumber}
                    onChange={(e) => setCreateAgentData({ ...createAgentData, bankAccountNumber: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      createAgentErrors.bankAccountNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter bank account number (digits only)"
                  />
                  {createAgentErrors.bankAccountNumber && (
                    <p className="text-red-500 text-sm mt-1">{createAgentErrors.bankAccountNumber}</p>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAgentModal(false);
                      resetCreateAgentForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isCreatingAgent}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingAgent}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCreatingAgent ? 'Creating...' : 'Create Agent'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}