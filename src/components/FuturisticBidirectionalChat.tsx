'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiRefreshCw, 
  FiMessageSquare,
  FiUser,
  FiCalendar,
  FiMail
} from 'react-icons/fi';
import Image from 'next/image';
import api from '../lib/api';
import { User, ApiResponse } from '../types';

const FuturisticBidirectionalChat = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadBidirectionalData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bidirectional?page=${currentPage}&limit=100`);
      const data: ApiResponse<User[]> = response.data;
      
      setUsers((data.users as User[]) || []);

      // Normalize pages and page values coming from API (could be number or string or missing)
      const pagesVal = (data as Record<string, unknown>)['pages'];
      const pagesNum = typeof pagesVal === 'number' ? pagesVal : (typeof pagesVal === 'string' && !isNaN(Number(pagesVal)) ? Number(pagesVal) : 1);
      setTotalPages(pagesNum);

      const pageVal = (data as Record<string, unknown>)['page'];
      const pageNum = typeof pageVal === 'number' ? pageVal : (typeof pageVal === 'string' && !isNaN(Number(pageVal)) ? Number(pageVal) : 1);
      setCurrentPage(pageNum);
    } catch (error) {
      console.error('Error loading bidirectional chat data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadBidirectionalData();
  }, [loadBidirectionalData]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      try {
        const response = await api.get(`/bidirectional/search?q=${encodeURIComponent(query)}&page=1&limit=10`);
        const data: ApiResponse<User[]> = response.data;
        setUsers(data.users || []);
      } catch (error) {
        console.error('Error searching bidirectional users:', error);
      }
    } else if (query.length === 0) {
      loadBidirectionalData();
    }
  };

  const startChat = (userId: string) => {
    // TODO: Implement chat initiation functionality
    console.log('Starting chat with user:', userId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bi-Direction Chat</h1>
          <p className="text-gray-400">Communicate directly with users</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadBidirectionalData}
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
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
          aria-label="Search users"
          title="Search users"
        />
      </div>

      {/* Users List */}
      <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="p-6 bg-white/5 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">Chat Users</h3>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-400">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <FiUser className="mx-auto text-4xl text-gray-400 opacity-50 mb-4" />
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16">
                      <Image
                        src={user.profile_pic || '/default-avatar.png'}
                        alt={user.name}
                        fill
                        className="rounded-full object-cover"
                        sizes="64px"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-lg">{user.name}</h4>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <FiMail className="text-xs" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <FiCalendar className="text-xs" />
                      <span>
                        Joined {user.registered_at ? new Date(user.registered_at).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startChat(user.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    <FiMessageSquare />
                    Start Chat
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && users.length > 0 && totalPages > 1 && (
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
    </div>
  );
};

export default FuturisticBidirectionalChat;
