'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiFilter, 
  FiRefreshCw, 
  FiEye, 
  FiUserX, 
  FiTrash2,
  FiDownload,
  FiPlus,
  FiMoreVertical,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiActivity,
  FiShield,
  FiX
} from 'react-icons/fi';
import Image from 'next/image';
import api from '../lib/api';
import { User, ApiResponse } from '../types';

// Resolve and sanitize profile picture URLs for Next/Image
const resolveImageSrc = (src?: string) => {
  // handle falsy or obvious invalid values
  if (!src || src === 'null' || src === 'undefined') {
    // fallback to a small inline SVG avatar data URL to avoid missing file errors
    return `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect width='24' height='24' rx='4' fill='%23222'/><circle cx='12' cy='10' r='3' fill='%23888'/><path d='M6 20c1.333-2 3.333-3 6-3s4.667 1 6 3' stroke='%23888'/></svg>`
    )}`;
  }

  // allow data URLs directly
  if (src.startsWith('data:')) return src;

  // try absolute URL by attempting to construct one
  try {
    const test = new URL(src);
    if (test) return src;
  } catch {
    // not an absolute URL
  }

  // attempt to build one from API base or window origin
  const base = process.env.NEXT_PUBLIC_ADMIN_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  if (!base) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect width='24' height='24' rx='4' fill='%23222'/><circle cx='12' cy='10' r='3' fill='%23888'/><path d='M6 20c1.333-2 3.333-3 6-3s4.667 1 6 3' stroke='%23888'/></svg>`
    )}`;
  }

  const path = src.startsWith('/') ? src : `/${src}`;
  try {
    return new URL(path, base).toString();
  } catch {
    return `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect width='24' height='24' rx='4' fill='%23222'/><circle cx='12' cy='10' r='3' fill='%23888'/><path d='M6 20c1.333-2 3.333-3 6-3s4.667 1 6 3' stroke='%23888'/></svg>`
    )}`;
  }
};

const FuturisticUsersTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        if (!token) {
          console.warn('No admin token present; skipping users load');
          setUsers([]);
          setLoading(false);
          return;
        }

        const response = await api.get(`/users?page=${currentPage}&limit=10&search=${searchQuery}&status=${filterStatus}`);
  const data: ApiResponse<User[]> = response.data;

  setUsers(data.users || []);

  const pagesVal = (data as Record<string, unknown>)['pages'];
  const pagesNum = typeof pagesVal === 'number' ? pagesVal : (typeof pagesVal === 'string' && !isNaN(Number(pagesVal)) ? Number(pagesVal) : 1);
  setTotalPages(pagesNum);

  const pageVal = (data as Record<string, unknown>)['page'];
  const pageNum = typeof pageVal === 'number' ? pageVal : (typeof pageVal === 'string' && !isNaN(Number(pageVal)) ? Number(pageVal) : 1);
  setCurrentPage(pageNum);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentPage, filterStatus, searchQuery]);

  const loadUsers = async (page = currentPage, query = searchQuery) => {
    try {
      setLoading(true);
      const response = await api.get(`/users?page=${page}&limit=10&search=${query}&status=${filterStatus}`);
  const data: ApiResponse<User[]> = response.data;

  setUsers(data.users || []);

  const pagesVal = (data as Record<string, unknown>)['pages'];
  const pagesNum = typeof pagesVal === 'number' ? pagesVal : (typeof pagesVal === 'string' && !isNaN(Number(pagesVal)) ? Number(pagesVal) : 1);
  setTotalPages(pagesNum);

  const pageVal = (data as Record<string, unknown>)['page'];
  const pageNum = typeof pageVal === 'number' ? pageVal : (typeof pageVal === 'string' && !isNaN(Number(pageVal)) ? Number(pageVal) : 1);
  setCurrentPage(pageNum);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 2 || query.length === 0) {
      loadUsers(1, query);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map(u => u.id));
  };

  const handleBlock = async (userId: string) => {
    try {
      await api.post(`/users/${userId}/block`, { is_blocked: true });
      await loadUsers();
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/users/${userId}`);
      await loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleBulkAction = async (action: 'block' | 'delete' | 'export') => {
    if (selectedUsers.length === 0) return;

    if (action === 'export') {
      // Export selected users
      console.log('Exporting users:', selectedUsers);
      return;
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedUsers.length} user(s)?`)) return;

    try {
      await Promise.all(selectedUsers.map(userId => 
        action === 'block' 
          ? api.post(`/users/${userId}/block`, { is_blocked: true })
          : api.delete(`/users/${userId}`)
      ));
      setSelectedUsers([]);
      await loadUsers();
    } catch (error) {
      console.error(`Failed to ${action} users:`, error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">Manage and monitor all registered users</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <FiPlus />
            Add User
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => loadUsers()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name, email..."
            aria-label="Search users"
            title="Search users"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'blocked')}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm appearance-none"
            title="Filter users by status"
            aria-label="Filter users by status"
          >
            <option value="all">All Users</option>
            <option value="active">Active Users</option>
            <option value="blocked">Blocked Users</option>
          </select>
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-2">
          {selectedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <span className="text-sm text-gray-400">
                {selectedUsers.length} selected
              </span>
              <button
                onClick={() => handleBulkAction('export')}
                className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                title="Export selected"
              >
                <FiDownload />
              </button>
              <button
                onClick={() => handleBulkAction('block')}
                className="p-2 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors"
                title="Block selected"
              >
                <FiUserX />
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                title="Delete selected"
              >
                <FiTrash2 />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                    title="Select all users"
                    aria-label="Select all users"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                      <span className="ml-3 text-gray-400">Loading users...</span>
                    </div>
                  </td>
                </tr>
              )}
              
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <FiUser className="mx-auto text-4xl mb-4 opacity-50" />
                      <p>No users found</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="w-4 h-4 rounded border-gray-300 bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                      title={`Select user ${user.name}`}
                      aria-label={`Select user ${user.name}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12">
                        <Image
                          src={resolveImageSrc(user.profile_pic)}
                          alt={user.name}
                          fill
                          className="rounded-xl object-cover"
                          sizes="48px"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-300">
                        <FiMail className="text-xs" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <FiPhone className="text-xs" />
                          <span className="text-sm">{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                        user.is_blocked
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-green-500/20 text-green-300 border border-green-500/30'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${user.is_blocked ? 'bg-red-400' : 'bg-green-400'}`}></div>
                      {user.is_blocked ? 'Blocked' : 'Active'}
                    </motion.span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <FiCalendar className="text-xs" />
                      <span className="text-sm">
                        {user.registered_at ? new Date(user.registered_at).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewDetails(user)}
                        className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                        title="View details"
                      >
                        <FiEye />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleBlock(user.id)}
                        className="p-2 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors"
                        title="Block user"
                      >
                        <FiUserX />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <FiTrash2 />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-gray-500/20 text-gray-400 rounded-lg transition-colors"
                        title="More options"
                      >
                        <FiMoreVertical />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
                className="px-4 py-2 text-sm bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
              >
                Previous
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 text-sm bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
              >
                Next
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">User Details</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    title="Close modal"
                  >
                    <FiX className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Profile Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-24 h-24 mb-4">
                    <Image
                      src={resolveImageSrc(selectedUser.profile_pic)}
                      alt={selectedUser.name}
                      fill
                      className="rounded-2xl object-cover"
                      sizes="96px"
                    />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900"></div>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-1">{selectedUser.name}</h4>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${
                    selectedUser.is_blocked
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-green-500/20 text-green-300 border border-green-500/30'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${selectedUser.is_blocked ? 'bg-red-400' : 'bg-green-400'}`}></div>
                    {selectedUser.is_blocked ? 'Blocked' : 'Active'}
                  </span>
                </div>

                {/* Information Grid */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <FiMail className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Email</div>
                      <div className="text-sm font-medium text-white">{selectedUser.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <FiPhone className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Phone</div>
                      <div className="text-sm font-medium text-white">{selectedUser.phone || 'Not provided'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <FiCalendar className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Registered</div>
                      <div className="text-sm font-medium text-white">
                        {selectedUser.registered_at
                          ? new Date(selectedUser.registered_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <FiActivity className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                    <div className="text-sm font-medium text-white">{selectedUser.message_count || 0}</div>
                    <div className="text-xs text-gray-400">Messages</div>
                  </div>
                  <div className="text-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                    <FiUser className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <div className="text-sm font-medium text-white">{selectedUser.group_count || 0}</div>
                    <div className="text-xs text-gray-400">Groups</div>
                  </div>
                  <div className="text-center p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <FiShield className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                    <div className="text-sm font-medium text-white">{selectedUser.reports_count || 0}</div>
                    <div className="text-xs text-gray-400">Reports</div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-white/10 bg-white/5 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors"
                >
                  Close
                </button>
                <button
                  className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:shadow-lg transition-all duration-200"
                  onClick={() => {
                    alert('Edit user functionality will be implemented');
                  }}
                >
                  Edit User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FuturisticUsersTable;
