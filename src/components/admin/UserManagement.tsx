'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/api/admin';
import { AdminUser } from '@/types/api';
import { Button, Loader, Alert, SearchBar, Pagination, Modal } from '@/components/reusable';
import { ADMIN_ROLES, USER_TYPES } from '@/utils/constants';

interface UserManagementProps {
  userRole?: string;
}

export default function UserManagement({ userRole }: UserManagementProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionType, setActionType] = useState<'suspend' | 'delete' | null>(null);

  useEffect(() => {
    loadUsers();
  }, [searchQuery, selectedRole, sortBy, currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers({
        role: selectedRole,
        q: searchQuery,
        sort: sortBy,
        page: currentPage,
        limit: 100,
      });
      if (response.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (user: AdminUser, action: 'suspend' | 'delete') => {
    setSelectedUser(user);
    setActionType(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      if (actionType === 'suspend') {
        await adminApi.suspendUser(selectedUser.id, !selectedUser.active);
      } else {
        await adminApi.deleteUser(selectedUser.id);
      }
      setShowModal(false);
      setSelectedUser(null);
      setActionType(null);
      loadUsers();
    } catch (err) {
      setError(`Failed to ${actionType} user`);
    }
  };

  const getStatusBadge = (user: AdminUser) => {
    if (!user.active) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Suspended</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      buyer: 'bg-blue-100 text-blue-800',
      seller: 'bg-green-100 text-green-800',
      agent: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
      </div>

      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search users by name, email, or ID..."
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All Roles</option>
          <option value="buyer">Buyers</option>
          <option value="seller">Sellers</option>
          <option value="agent">Agents</option>
          {userRole === ADMIN_ROLES.SUPER_ADMIN && (
            <option value="admin">Admins</option>
          )}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="createdAt">Date Created</option>
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="lastLogin">Last Login</option>
        </select>
      </div>

      {/* Users Table */}
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
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user, 'suspend')}
                          className={user.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                        >
                          {user.active ? 'Suspend' : 'Activate'}
                        </Button>
                        {userRole === ADMIN_ROLES.SUPER_ADMIN && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user, 'delete')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
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

      {/* Confirmation Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`${actionType === 'suspend' ? (selectedUser?.active ? 'Suspend' : 'Activate') : 'Delete'} User`}
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to {actionType === 'suspend' ? (selectedUser?.active ? 'suspend' : 'activate') : 'delete'} {selectedUser?.name}?
            {actionType === 'delete' && ' This action cannot be undone.'}
          </p>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'delete' ? 'danger' : 'primary'}
              onClick={confirmAction}
            >
              {actionType === 'suspend' ? (selectedUser?.active ? 'Suspend' : 'Activate') : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}