// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/hooks/useAuth';
// import AdminLayout from '@/components/admin/AdminLayout';
// import { adminApi } from '@/api/admin';
// import { toast } from 'react-hot-toast';

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   phone?: string;

//   role: 'buyer' | 'seller' | 'agent' | 'admin';
//   status: 'active' | 'suspended';

//   lastLogin?: string;

//   createdAt?: string;
//   joinedDate?: string;
//   created_at?: string;

//   isActive?: boolean;
//   isSuspended?: boolean;
// }

// interface UserStats {
//   totalUsers: number;
//   totalBuyers: number;
//   totalSellers: number;
//   totalSuspended: number;
// }

// export default function UsersPage() {
//   const { user: currentUser } = useAuth();
//   const router = useRouter();

//   const [users, setUsers] = useState<User[]>([]);
//   console.log("🚀 ~ UsersPage ~ users:", users)
//   const [userStats, setUserStats] = useState<UserStats>({
//     totalUsers: 0,
//     totalBuyers: 0,
//     totalSellers: 0,
//     totalSuspended: 0
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [searchTerm, setSearchTerm] = useState('');
//   const [roleFilter, setRoleFilter] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');

//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [showModal, setShowModal] = useState(false);

//   // Load data
//   useEffect(() => {
//     loadUsers();
//     loadUserStats();
//   }, []);

//   const loadUsers = async () => {
//     try {
//       setLoading(true);
//       const response = await adminApi.getUsers();
//       const usersData = response.data || [];

//       const normalizedUsers = usersData.map((user: any) => ({
//         ...user,
//         _id: user._id || user.id || "",
//         status:
//           user.status ||
//           (user.isSuspended ? "suspended" : "active")
//       }));

//       setUsers(normalizedUsers);
//       setError(null);
//     } catch (err: any) {
//       setError(err.message || "Failed to load users");
//       toast.error("Failed to load users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadUserStats = async () => {
//     try {
//       const response = await adminApi.getUserStats();
//       setUserStats(response.data);
//     } catch {}
//   };

//   const filteredUsers = users.filter((u) => {
//     const matchSearch =
//       u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       u.email.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchRole = !roleFilter || u.role === roleFilter;
//     const matchStatus = !statusFilter || u.status === statusFilter;

//     return matchSearch && matchRole && matchStatus;
//   });

//   const handleStatusToggle = async (userId: string, currentStatus: string) => {
//     if (!userId) {
//       toast.error("Invalid user ID");
//       return;
//     }

//     const newStatus = currentStatus === "active" ? "suspended" : "active";

//     if (currentUser?.id === userId && newStatus === "suspended") {
//       return toast.error("You cannot suspend yourself");
//     }

//     try {
//       await adminApi.updateUserStatus(userId, newStatus);

//       setUsers((prev) =>
//         prev.map((u) =>
//           u._id === userId ? { ...u, status: newStatus } : u
//         )
//       );

//       toast.success(`User ${newStatus === "suspended" ? "suspended" : "activated"} successfully`);
//       loadUserStats();
//     } catch (err: any) {
//       toast.error(err.message || "Failed to update status");
//     }
//   };

//   const handleDelete = async (userId: string) => {
//     if (!confirm("Delete this user? This cannot be undone.")) return;

//     try {
//       await adminApi.deleteUser(userId);
//       setUsers((prev) => prev.filter((u) => u._id !== userId));
//       loadUserStats();
//       toast.success("User deleted");
//     } catch (err: any) {
//       toast.error(err.message || "Failed to delete user");
//     }
//   };

//   const getStatusColor = (s: string) =>
//     s === "active"
//       ? "bg-green-100 text-green-800"
//       : "bg-yellow-100 text-yellow-800";

//   const getRoleColor = (r: string) => {
//     switch (r) {
//       case "admin": return "bg-purple-100 text-purple-800";
//       case "agent": return "bg-blue-100 text-blue-800";
//       case "seller": return "bg-orange-100 text-orange-800";
//       case "buyer": return "bg-green-100 text-green-800";
//       default: return "bg-gray-100 text-gray-800";
//     }
//   };

//   if (loading) return (
//     <AdminLayout>
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//       </div>
//     </AdminLayout>
//   );

//   if (error) return (
//     <AdminLayout>
//       <div className="bg-red-50 border border-red-200 p-4 rounded-md">
//         <p className="text-red-700">{error}</p>
//       </div>
//     </AdminLayout>
//   );

//   return (
//     <AdminLayout>
//       {/* your full JSX remains same — unchanged */}
//       ...
//     </AdminLayout>
//   );
// }

// const formatJoinedDate = (u: User): string => {
//   const raw = u.createdAt || u.joinedDate || u.created_at;
//   if (!raw) return "Unknown";

//   const d = new Date(raw);
//   return isNaN(d.getTime()) ? "Unknown" : d.toLocaleDateString();
// };
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminApi } from '@/api/admin';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'buyer' | 'seller';
  status: 'active' | 'suspended' | 'banned';
  joinedDate: string;
  lastActive: string;
  totalTransactions: number;
  profileImage?: string;
}

export default function UsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
      return;
    }
    if (user && user.role === 'admin') {
      loadUsers();
    }
  }, [user, loading, router]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(filtered);
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await adminApi.updateUserStatus(userId, newStatus);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus as User['status'] } : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminApi.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-yellow-600 bg-yellow-100';
      case 'banned': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'buyer': return 'text-blue-600 bg-blue-100';
      case 'seller': return 'text-purple-600 bg-purple-100';
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="buyer">Buyers</option>
              <option value="seller">Sellers</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Buyers</h3>
            <p className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'buyer').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Sellers</h3>
            <p className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'seller').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Suspended</h3>
            <p className="text-2xl font-bold text-red-600">
              {users.filter(u => u.status === 'suspended' || u.status === 'banned').length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.profileImage || '/images/default-avatar.png'}
                              alt={user.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">Joined {user.joinedDate}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>Last active: {user.lastActive}</div>
                        <div>Transactions: {user.totalTransactions}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {user.status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(user.id, 'suspended')}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              Suspend
                            </button>
                          )}
                          {user.status === 'suspended' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(user.id, 'active')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Reactivate
                              </button>
                              <button
                                onClick={() => handleStatusChange(user.id, 'banned')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Ban
                              </button>
                            </>
                          )}
                          {user.status === 'banned' && (
                            <button
                              onClick={() => handleStatusChange(user.id, 'active')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Unban
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
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

        {/* User Details Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Transactions</label>
                    <p className="text-sm text-gray-900">{selectedUser.totalTransactions}</p>
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
      </div>
    </AdminLayout>
  );
}