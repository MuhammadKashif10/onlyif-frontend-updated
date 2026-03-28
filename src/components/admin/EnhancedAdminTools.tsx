'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal, Alert, Badge, Toggle, InputField, SearchBar } from '@/components/reusable';
import { adminApi } from '@/api/admin';
import { useUI } from '@/context/UIContext';
import { AdminUser, AdminListing, FlaggedContent, PaymentRecord, Assignment, TermsLog } from '@/types/api';

interface EnhancedAdminToolsProps {
  activeTab: string;
  userRole: string;
}

const EnhancedAdminTools: React.FC<EnhancedAdminToolsProps> = ({ activeTab, userRole }) => {
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; data: any } | null>(null);
  const { addNotification } = useUI();

  // Enhanced User Management
  const renderUserManagement = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [filters, setFilters] = useState({ role: '', status: '', search: '' });

    const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete', reason?: string) => {
      try {
        setLoading(true);
        let result;
        
        switch (action) {
          case 'suspend':
            result = await adminApi.suspendUser(userId, { reason });
            break;
          case 'activate':
            result = await adminApi.activateUser(userId);
            break;
          case 'delete':
            result = await adminApi.deleteUser(userId, { reason });
            break;
        }
        
        if (result.success) {
          addNotification({ type: 'success', message: result.message });
          // Reload users
        }
      } catch (error) {
        addNotification({ type: 'error', message: 'Action failed. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        {/* Enhanced Filters */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SearchBar
              value={filters.search}
              onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
              placeholder="Search users..."
            />
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Roles</option>
              <option value="buyer">Buyers</option>
              <option value="seller">Sellers</option>
              <option value="agent">Agents</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setShowBulkActions(!showBulkActions)}
              disabled={selectedItems.length === 0}
            >
              Bulk Actions ({selectedItems.length})
            </Button>
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && selectedItems.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedItems.length} users selected
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setConfirmAction({ type: 'bulk_suspend', data: selectedItems });
                    setShowConfirmModal(true);
                  }}
                >
                  Suspend Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setConfirmAction({ type: 'bulk_activate', data: selectedItems });
                    setShowConfirmModal(true);
                  }}
                >
                  Activate Selected
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced User Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(users.map(u => u.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className={selectedItems.includes(user.id) ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(prev => [...prev, user.id]);
                          } else {
                            setSelectedItems(prev => prev.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.avatar || '/images/default-avatar.jpg'}
                            alt={user.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={user.role === 'admin' ? 'primary' : user.role === 'agent' ? 'info' : 'secondary'}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={user.status === 'active' ? 'success' : user.status === 'suspended' ? 'danger' : 'warning'}
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.lastActive).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {user.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setConfirmAction({ type: 'suspend_user', data: { userId: user.id, userName: user.name } });
                              setShowConfirmModal(true);
                            }}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'activate')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Activate
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setConfirmAction({ type: 'delete_user', data: { userId: user.id, userName: user.name } });
                            setShowConfirmModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Flagged Content Management
  const renderFlaggedContent = () => {
    const [flags, setFlags] = useState<FlaggedContent[]>([]);
    const [filters, setFilters] = useState({ type: '', status: '', severity: '' });

    const handleFlagAction = async (flagId: string, action: 'approve' | 'reject' | 'escalate', notes?: string) => {
      try {
        setLoading(true);
        const result = await adminApi.handleFlag(flagId, { action, notes });
        
        if (result.success) {
          addNotification({ type: 'success', message: result.message });
          // Reload flags
        }
      } catch (error) {
        addNotification({ type: 'error', message: 'Action failed. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        {/* Flag Filters */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Types</option>
              {Object.values(FLAG_TYPES).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Status</option>
              {Object.values(FLAG_STATUS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Flagged Content Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flags.map((flag) => (
                  <tr key={flag.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{flag.contentPreview}</div>
                      <div className="text-xs text-gray-500">{flag.reason}</div>
                    </td>
                    // Line 354 - Fix flag type badge
                    <Badge variant="default">{flag.type}</Badge>
                    
                    // Line 358 - Fix flag severity badge (this one has mixed variants)
                    <Badge
                      variant={flag.severity === 'critical' ? 'error' : flag.severity === 'high' ? 'warning' : 'info'}
                    >
                      {flag.severity}
                    </Badge>
                    
                    // Line 580 - Fix user role badge
                    <Badge variant="default">{log.userRole}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {flag.reporterName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={flag.status === 'resolved' ? 'success' : flag.status === 'pending' ? 'warning' : 'info'}
                      >
                        {flag.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFlagAction(flag.id, 'approve')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFlagAction(flag.id, 'reject')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFlagAction(flag.id, 'escalate')}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Escalate
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Assignment Override Management
  const renderAssignmentOverride = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);

    const handleAssignmentOverride = async (assignmentId: string, newAgentId: string, reason: string) => {
      try {
        setLoading(true);
        const result = await adminApi.overrideAssignment(assignmentId, { newAgentId, reason });
        
        if (result.success) {
          addNotification({ type: 'success', message: 'Assignment overridden successfully' });
          // Reload assignments
        }
      } catch (error) {
        addNotification({ type: 'error', message: 'Override failed. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Assignment Override</h3>
            <p className="text-sm text-gray-600">Manually reassign properties to different agents</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{assignment.propertyAddress}</div>
                      <div className="text-xs text-gray-500">ID: {assignment.propertyId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{assignment.agentName}</div>
                      <div className="text-xs text-gray-500">{assignment.agentEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{assignment.sellerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={assignment.status === 'active' ? 'success' : 'warning'}
                      >
                        {assignment.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setConfirmAction({ type: 'override_assignment', data: assignment });
                          setShowConfirmModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Override
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Terms & Conditions Logs
  const renderTermsLogs = () => {
    const [termsLogs, setTermsLogs] = useState<TermsLog[]>([]);
    const [filters, setFilters] = useState({ version: '', role: '', dateFrom: '', dateTo: '' });

    return (
      <div className="space-y-6">
        {/* Terms Logs Filters */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.version}
              onChange={(e) => setFilters(prev => ({ ...prev, version: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Versions</option>
              <option value="1.0">Version 1.0</option>
              <option value="1.1">Version 1.1</option>
              <option value="2.0">Version 2.0</option>
            </select>
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Roles</option>
              <option value="buyer">Buyers</option>
              <option value="seller">Sellers</option>
              <option value="agent">Agents</option>
            </select>
            <InputField
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              placeholder="From Date"
            />
            <InputField
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              placeholder="To Date"
            />
          </div>
        </div>

        {/* Terms Logs Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accepted Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {termsLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                      <div className="text-xs text-gray-500">{log.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary">{log.userRole}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.termsVersion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.acceptedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Confirmation Modal
  const ConfirmationModal = () => {
    const [reason, setReason] = useState('');
    const [newAgentId, setNewAgentId] = useState('');

    const handleConfirm = async () => {
      if (!confirmAction) return;

      try {
        setLoading(true);
        
        switch (confirmAction.type) {
          case 'suspend_user':
            await handleUserAction(confirmAction.data.userId, 'suspend', reason);
            break;
          case 'delete_user':
            await handleUserAction(confirmAction.data.userId, 'delete', reason);
            break;
          case 'override_assignment':
            await handleAssignmentOverride(confirmAction.data.id, newAgentId, reason);
            break;
          // Add more cases as needed
        }
        
        setShowConfirmModal(false);
        setConfirmAction(null);
        setReason('');
        setNewAgentId('');
      } catch (error) {
        // Error handling is done in individual functions
      } finally {
        setLoading(false);
      }
    };

    return (
      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
          setReason('');
          setNewAgentId('');
        }}
        title="Confirm Action"
        size="md"
      >
        <div className="space-y-4">
          {confirmAction?.type === 'suspend_user' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to suspend <strong>{confirmAction.data.userName}</strong>?
              </p>
              <InputField
                label="Reason for suspension"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason..."
                required
              />
            </div>
          )}
          
          {confirmAction?.type === 'delete_user' && (
            <div>
              <Alert
                type="warning"
                message="This action cannot be undone. The user and all associated data will be permanently deleted."
              />
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete <strong>{confirmAction.data.userName}</strong>?
              </p>
              <InputField
                label="Reason for deletion"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason..."
                required
              />
            </div>
          )}
          
          {confirmAction?.type === 'override_assignment' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Override assignment for <strong>{confirmAction.data.propertyAddress}</strong>?
              </p>
              <InputField
                label="New Agent ID"
                value={newAgentId}
                onChange={(e) => setNewAgentId(e.target.value)}
                placeholder="Enter new agent ID..."
                required
              />
              <InputField
                label="Reason for override"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason..."
                required
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmModal(false);
                setConfirmAction(null);
                setReason('');
                setNewAgentId('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={loading || !reason || (confirmAction?.type === 'override_assignment' && !newAgentId)}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  // Render based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return renderUserManagement();
      case 'flags':
        return renderFlaggedContent();
      case 'assignments':
        return renderAssignmentOverride();
      case 'terms':
        return renderTermsLogs();
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="space-y-6">
      {renderTabContent()}
      <ConfirmationModal />
    </div>
  );
};

export default EnhancedAdminTools;