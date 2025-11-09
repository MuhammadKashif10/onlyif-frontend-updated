'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/api/admin';
import { FlaggedContent } from '@/types/api';
import { Button, Loader, Alert, Pagination, Modal, TextArea } from '@/components/reusable';
import { FLAG_TYPES, FLAG_STATUS } from '@/utils/constants';

interface FlaggedContentManagementProps {
  userRole?: string;
}

export default function FlaggedContentManagement({ userRole }: FlaggedContentManagementProps) {
  const [flags, setFlags] = useState<FlaggedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FlaggedContent | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'dismiss' | 'remove' | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadFlags();
  }, [selectedType, selectedStatus, currentPage]);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getFlags({
        type: selectedType,
        status: selectedStatus,
        page: currentPage,
        limit: 10,
      });
      if (response.success) {
        setFlags(response.data.flags);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      setError('Failed to load flagged content');
    } finally {
      setLoading(false);
    }
  };

  const handleFlagAction = (flag: FlaggedContent, action: 'approve' | 'dismiss' | 'remove') => {
    setSelectedFlag(flag);
    setActionType(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedFlag || !actionType) return;

    try {
      await adminApi.handleFlag(selectedFlag.id, actionType, reason);
      setShowModal(false);
      setSelectedFlag(null);
      setActionType(null);
      setReason('');
      loadFlags();
    } catch (err) {
      setError(`Failed to ${actionType} flag`);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800',
      removed: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      inappropriate: 'bg-red-100 text-red-800',
      spam: 'bg-orange-100 text-orange-800',
      fraud: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Flagged Content Management</h2>
      </div>

      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All Types</option>
          <option value="inappropriate">Inappropriate</option>
          <option value="spam">Spam</option>
          <option value="fraud">Fraud</option>
          <option value="other">Other</option>
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="dismissed">Dismissed</option>
          <option value="removed">Removed</option>
        </select>
      </div>

      {/* Flags Table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader size="large" />
        </div>
      ) : (
        <>
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
                    Reporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                      <div className="text-sm font-medium text-gray-900">{flag.contentTitle}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{flag.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(flag.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{flag.reporterName}</div>
                      <div className="text-sm text-gray-500">{flag.reporterEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(flag.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(flag.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {flag.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFlagAction(flag, 'approve')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFlagAction(flag, 'remove')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFlagAction(flag, 'dismiss')}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`${actionType?.charAt(0).toUpperCase()}${actionType?.slice(1)} Flag`}
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to {actionType} this flag for "{selectedFlag?.contentTitle}"?
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (optional)
            </label>
            <TextArea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason for this action..."
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'remove' ? 'danger' : 'primary'}
              onClick={confirmAction}
            >
              {actionType?.charAt(0).toUpperCase()}{actionType?.slice(1)}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}