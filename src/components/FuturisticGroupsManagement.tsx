'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiRefreshCw, 
  FiUsers,
  FiEye,
  FiTrash2,
  FiSearch,
  FiCalendar,
  FiUser,
  FiX
} from 'react-icons/fi';
import Image from 'next/image';
import api from '../lib/api';

// Safely resolve image src values. Returns fallback if src is missing or invalid.
const resolveImageSrc = (src?: unknown) => {
  if (!src || typeof src !== 'string') return '/default-avatar.png';
  // allow relative paths
  if (src.startsWith('/')) return src;

  try {
    new URL(src);
    return src;
  } catch {
    return '/default-avatar.png';
  }
};

interface Group {
  id: string;
  name: string;
  description: string;
  admin_id: string;
  admin_name: string;
  member_count: number;
  created_at: string;
  group_pic?: string;
  members?: GroupMember[];
}

interface GroupMember {
  id: string;
  name: string;
  email: string;
  joined_at: string;
  profile_pic?: string;
}

interface ApiResponse<T> {
  groups?: T;
  pages?: number;
  page?: number;
  total?: number;
}

const FuturisticGroupsManagement = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/groups?page=${currentPage}&limit=10`);
      const data: ApiResponse<Group[]> = response.data;

      setGroups(data.groups || []);
      setTotalPages(data.pages || 1);
      setCurrentPage(data.page || 1);
    } catch {
      console.error('Error loading groups:');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const viewGroupDetails = async (groupId: string) => {
    try {
      const response = await api.get(`/groups/${groupId}`);
      setSelectedGroup(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error loading group details:', error);
    }
  };

  const deleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;

    try {
      await api.delete(`/groups/${groupId}`);
      loadGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // TODO: Implement search functionality
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredGroups = groups.filter(group =>
    searchQuery === '' ||
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.admin_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Group Management</h1>
          <p className="text-gray-400">Manage and monitor all groups</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadGroups}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search groups..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
          aria-label="Search groups"
          title="Search groups"
        />
      </div>

      {/* Groups Table */}
      <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                      <span className="ml-3 text-gray-400">Loading groups...</span>
                    </div>
                  </td>
                </tr>
              )}
              
              {!loading && filteredGroups.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <FiUsers className="mx-auto text-4xl mb-4 opacity-50" />
                      <p>No groups found</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filteredGroups.map((group, index) => (
                <motion.tr
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12">
                        <Image
                          src={resolveImageSrc(group.group_pic)}
                          alt={group.name}
                          fill
                          className="rounded-xl object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div>
                        <p className="text-white font-medium">{group.name}</p>
                        <p className="text-gray-400 text-sm truncate max-w-xs">
                          {group.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-300">
                      <p className="font-medium">{group.admin_name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <FiUsers className="text-sm" />
                      <span>{group.member_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <FiCalendar className="text-xs" />
                      <span className="text-sm">
                        {formatDate(group.created_at)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => viewGroupDetails(group.id)}
                        className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                        title="View details"
                      >
                        <FiEye />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteGroup(group.id)}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        title="Delete group"
                      >
                        <FiTrash2 />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredGroups.length > 0 && (
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

      {/* Group Details Modal */}
      <AnimatePresence>
        {showModal && selectedGroup && (
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
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Group Details</h3>
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
                {/* Group Info */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative w-20 h-20">
                    <Image
                      src={resolveImageSrc(selectedGroup.group_pic)}
                      alt={selectedGroup.name}
                      fill
                      className="rounded-2xl object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-2">{selectedGroup.name}</h4>
                    <p className="text-gray-400 mb-2">{selectedGroup.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>👥 {selectedGroup.member_count} members</span>
                      <span>📅 Created {formatDate(selectedGroup.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Admin Info */}
                <div className="bg-white/5 rounded-xl p-4 mb-6">
                  <h5 className="text-lg font-semibold text-white mb-2">Group Admin</h5>
                  <div className="flex items-center gap-3">
                    <FiUser className="text-blue-400" />
                    <span className="text-gray-300">{selectedGroup.admin_name}</span>
                  </div>
                </div>

                {/* Members List */}
                {selectedGroup.members && selectedGroup.members.length > 0 && (
                  <div>
                    <h5 className="text-lg font-semibold text-white mb-4">Members ({selectedGroup.members.length})</h5>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedGroup.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div className="relative w-10 h-10">
                            <Image
                              src={resolveImageSrc(member.profile_pic)}
                              alt={member.name}
                              fill
                              className="rounded-full object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{member.name}</p>
                            <p className="text-gray-400 text-sm">{member.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-xs">
                              Joined {formatDate(member.joined_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 bg-white/5 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => deleteGroup(selectedGroup.id)}
                  className="px-4 py-2 text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Delete Group
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FuturisticGroupsManagement;
