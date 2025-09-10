'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FiActivity,
  FiSearch, 
  FiRefreshCw, 
  FiFilter,
  FiClock,
  FiUser,
  FiShield,
  FiEye,
  FiTrash2,
  FiSettings,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiInfo
} from 'react-icons/fi';
import api from '../lib/api';

interface ActivityLog {
  id: string;
  admin_id: string;
  admin_name: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id?: string;
  target_name?: string;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  success: boolean;
}

interface ApiResponse<T> {
  data: T;
  logs?: ActivityLog[];
  page?: number;
  pages?: number;
  total?: number;
  success: boolean;
  message?: string;
}

const FuturisticActivityLog = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [refreshing, setRefreshing] = useState(false);

  const limit = 20;

  const loadActivityLog = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(page === 1);
      let endpoint = `/activity-log?page=${page}&limit=${limit}`;
      
      if (search && search.length >= 2) {
        endpoint += `&search=${encodeURIComponent(search)}`;
      }
      
      if (filterAction !== 'all') {
        endpoint += `&action=${encodeURIComponent(filterAction)}`;
      }
      
      if (filterSeverity !== 'all') {
        endpoint += `&severity=${encodeURIComponent(filterSeverity)}`;
      }
      
      if (dateRange !== 'all') {
        endpoint += `&range=${dateRange}`;
      }
      
      const response = await api.get(endpoint);
      const data: ApiResponse<ActivityLog[]> = response.data;
      
      setLogs(data.logs || []);
      setTotalPages(data.pages || 1);
      setCurrentPage(data.page || 1);
      setTotalLogs(data.total || 0);
    } catch (error) {
      console.error('Error loading activity log:', error);
    } finally {
      setLoading(false);
    }
  }, [filterAction, filterSeverity, dateRange]);

  useEffect(() => {
    loadActivityLog(currentPage, searchQuery);
  }, [currentPage, loadActivityLog, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const refreshLogs = async () => {
    setRefreshing(true);
    await loadActivityLog(currentPage, searchQuery);
    setRefreshing(false);
  };

  const exportLogs = async () => {
    try {
      const endpoint = `/activity-log/export?${new URLSearchParams({
        search: searchQuery,
        action: filterAction,
        severity: filterSeverity,
        range: dateRange
      })}`;
      
      const response = await api.get(endpoint, { responseType: 'blob' });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
      alert('Error exporting activity logs');
    }
  };

  const clearOldLogs = async () => {
    if (confirm('Are you sure you want to clear activity logs older than 30 days? This action cannot be undone.')) {
      try {
        await api.delete('/activity-log/cleanup');
        alert('Old activity logs cleared successfully!');
        await refreshLogs();
      } catch (error) {
        console.error('Error clearing logs:', error);
        alert('Error clearing activity logs');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':
        return <FiInfo className="w-4 h-4" />;
      case 'medium':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'high':
        return <FiAlertCircle className="w-4 h-4" />;
      case 'critical':
        return <FiXCircle className="w-4 h-4" />;
      default:
        return <FiActivity className="w-4 h-4" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'logout':
        return <FiUser className="w-4 h-4 text-blue-400" />;
      case 'block_user':
      case 'unblock_user':
      case 'delete_user':
        return <FiShield className="w-4 h-4 text-red-400" />;
      case 'view_user':
      case 'view_group':
        return <FiEye className="w-4 h-4 text-gray-400" />;
      case 'update_settings':
        return <FiSettings className="w-4 h-4 text-purple-400" />;
      case 'delete_message':
      case 'moderate_content':
        return <FiTrash2 className="w-4 h-4 text-orange-400" />;
      case 'create_group':
      case 'manage_users':
        return <FiUsers className="w-4 h-4 text-green-400" />;
      default:
        return <FiActivity className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Activity Log</h1>
          <p className="text-gray-400">Monitor administrative actions and system events</p>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportLogs}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            title="Export activity logs"
          >
            <FiDownload />
            Export
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearOldLogs}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            title="Clear old logs"
          >
            <FiTrash2 />
            Clear Old
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshLogs}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-70"
            title="Refresh logs"
          >
            <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <FiActivity />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Total Logs</h3>
              <p className="text-2xl font-bold text-white">{totalLogs.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
              <FiCheckCircle />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Success Rate</h3>
              <p className="text-2xl font-bold text-white">
                {logs.length > 0 ? Math.round((logs.filter(log => log.success).length / logs.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 text-red-400 rounded-xl">
              <FiAlertCircle />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Critical Events</h3>
              <p className="text-2xl font-bold text-white">
                {logs.filter(log => log.severity === 'critical').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
              <FiClock />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Last Activity</h3>
              <p className="text-sm font-medium text-white">
                {logs.length > 0 ? formatDate(logs[0].created_at) : 'No recent activity'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
            aria-label="Search activity logs"
            title="Search logs by admin, action, or description"
          />
        </div>

        <div className="relative">
          <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm appearance-none"
            title="Filter by action type"
            aria-label="Filter by action type"
          >
            <option value="all">All Actions</option>
            <option value="login">Login/Logout</option>
            <option value="user_management">User Management</option>
            <option value="content_moderation">Content Moderation</option>
            <option value="settings">Settings</option>
            <option value="system">System</option>
          </select>
        </div>

        <div className="relative">
          <FiAlertCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={filterSeverity}
            onChange={(e) => {
              setFilterSeverity(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm appearance-none"
            title="Filter by severity level"
            aria-label="Filter by severity level"
          >
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="relative">
          <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm appearance-none"
            title="Filter by date range"
            aria-label="Filter by date range"
          >
            <option value="all">All Time</option>
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        <div className="flex items-center text-sm text-gray-400">
          <span>Showing {logs.length} of {totalLogs} logs</span>
        </div>
      </div>

      {/* Activity Log Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 overflow-hidden"
      >
        <div className="p-6 bg-white/5 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-400">Loading activity logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <FiActivity className="mx-auto text-4xl text-gray-400 opacity-50 mb-4" />
              <p className="text-gray-400">
                {searchQuery ? 'No activity logs found matching your search' : 'No activity logs found'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {logs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-white/10">
                        {getActionIcon(log.action)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-white font-medium">{log.admin_name}</h4>
                            <span className="text-gray-400 text-sm">•</span>
                            <span className="text-gray-300 text-sm">{log.action.replace(/_/g, ' ').toUpperCase()}</span>
                            {log.target_name && (
                              <>
                                <span className="text-gray-400 text-sm">•</span>
                                <span className="text-gray-400 text-sm">{log.target_name}</span>
                              </>
                            )}
                          </div>
                          
                          <p className="text-gray-300 text-sm mb-3">{log.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <FiClock />
                              <span>{formatDate(log.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiUser />
                              <span>{log.admin_email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>IP: {log.ip_address}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                            {getSeverityIcon(log.severity)}
                            {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                          </span>
                          
                          <div className={`w-2 h-2 rounded-full ${log.success ? 'bg-green-400' : 'bg-red-400'}`} title={log.success ? 'Success' : 'Failed'}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && logs.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalLogs)} of {totalLogs} results
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
              >
                <FiChevronLeft />
                Previous
              </motion.button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <motion.button
                      key={pageNum}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      {pageNum}
                    </motion.button>
                  );
                })}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
              >
                Next
                <FiChevronRight />
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FuturisticActivityLog;
