'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminApi } from '@/api/admin';
import { toast } from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;

  role: 'buyer' | 'seller' | 'agent' | 'admin';
  status: 'active' | 'suspended';

  lastLogin?: string;

  createdAt?: string;
  joinedDate?: string;
  created_at?: string;

  isActive?: boolean;
  isSuspended?: boolean;
}

interface UserStats {
  totalUsers: number;
  totalBuyers: number;
  totalSellers: number;
  totalSuspended: number;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    totalBuyers: 0,
    totalSellers: 0,
    totalSuspended: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Load data
  useEffect(() => {
    loadUsers();
    loadUserStats();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers();
      const usersData = response.data || [];

      const normalizedUsers = usersData.map((user: any) => ({
        ...user,
        _id: user._id || user.id || "",
        status:
          user.status ||
          (user.isSuspended ? "suspended" : "active")
      }));

      setUsers(normalizedUsers);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await adminApi.getUserStats();
      setUserStats(response.data);
    } catch {}
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || u.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    if (!userId) {
      toast.error("Invalid user ID");
      return;
    }

    const newStatus = currentStatus === "active" ? "suspended" : "active";

    if (currentUser?.id === userId && newStatus === "suspended") {
      return toast.error("You cannot suspend yourself");
    }

    try {
      await adminApi.updateUserStatus(userId, newStatus);

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, status: newStatus } : u
        )
      );

      toast.success(`User ${newStatus === "suspended" ? "suspended" : "activated"} successfully`);
      loadUserStats();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;

    try {
      await adminApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      loadUserStats();
      toast.success("User deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const getStatusColor = (s: string) =>
    s === "active"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";

  const getRoleColor = (r: string) => {
    switch (r) {
      case "admin": return "bg-purple-100 text-purple-800";
      case "agent": return "bg-blue-100 text-blue-800";
      case "seller": return "bg-orange-100 text-orange-800";
      case "buyer": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout>
      <div className="bg-red-50 border border-red-200 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      {/* your full JSX remains same — unchanged */}
      ...
    </AdminLayout>
  );
}

const formatJoinedDate = (u: User): string => {
  const raw = u.createdAt || u.joinedDate || u.created_at;
  if (!raw) return "Unknown";

  const d = new Date(raw);
  return isNaN(d.getTime()) ? "Unknown" : d.toLocaleDateString();
};
