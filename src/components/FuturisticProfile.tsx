'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiActivity,
  FiShield,
  FiEdit,
  FiKey,
  FiUserPlus,
  FiX
} from 'react-icons/fi';
import Image from 'next/image';
import api from '../lib/api';

// Helper to safely resolve image srcs for Next/Image.
const resolveImageSrc = (src?: string) => {
  if (!src) return '/default-avatar.png';
  try {
    // If it's an absolute URL, ensure it's a valid URL object
    if (/^https?:\/\//i.test(src)) {
      // This will throw if invalid
      new URL(src);
      return src;
    }

    // Otherwise, assume it's a relative path safe for Next Image
    return src.startsWith('/') ? src : `/${src}`;
  } catch {
    return '/default-avatar.png';
  }
};

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  profile_pic?: string;
  created_at: string;
  last_login?: string;
  status: string;
  two_factor_enabled: boolean;
  password_changed_at?: string;
  activity_count: number;
  bio?: string;
}

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

const FuturisticProfile = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  // Edit profile form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Add admin form state
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    phone: '',
    bio: ''
  });

  useEffect(() => {
    loadProfile();
    loadActivityLog();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/profile');
      setProfile(response.data);
      
      // Populate edit form
      setEditForm({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        bio: response.data.bio || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLog = async () => {
    try {
      const response = await api.get('/activity-log');
      setActivityLog(response.data?.activities || []);
    } catch (error) {
      console.error('Error loading activity log:', error);
    }
  };

  const updateProfile = async () => {
    try {
      await api.put('/profile', editForm);
      await loadProfile();
      setShowEditModal(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      await api.post('/change-password', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });
      
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
    }
  };

  const addAdmin = async () => {
    if (adminForm.password !== adminForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await api.post('/admins', {
        name: adminForm.name,
        email: adminForm.email,
        password: adminForm.password,
        role: adminForm.role,
        phone: adminForm.phone,
        bio: adminForm.bio
      });
      
      setAdminForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'admin',
        phone: '',
        bio: ''
      });
      setShowAddAdminModal(false);
      alert('Admin added successfully!');
    } catch (error) {
      console.error('Error adding admin:', error);
      alert('Error adding admin');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Error loading profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Profile</h1>
          <p className="text-gray-400">Manage your account and system administrators</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddAdminModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
        >
          <FiUserPlus />
          Add Admin
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
            <div className="text-center mb-6">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <Image
                  src={resolveImageSrc(profile.profile_pic)}
                  alt={profile.name}
                  fill
                  className="rounded-2xl object-cover"
                  sizes="96px"
                />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{profile.name}</h3>
              <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${
                profile.status === 'active'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                <div className={`w-2 h-2 rounded-full ${profile.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                {profile.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <FiMail className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Email</div>
                  <div className="text-sm font-medium text-white">{profile.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <FiPhone className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Phone</div>
                  <div className="text-sm font-medium text-white">{profile.phone || 'Not provided'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <FiUser className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Role</div>
                  <div className="text-sm font-medium text-white capitalize">{profile.role}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <FiCalendar className="w-5 h-5 text-orange-400" />
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Joined</div>
                  <div className="text-sm font-medium text-white">{formatDate(profile.created_at)}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEditModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <FiEdit />
                Edit Profile
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <FiKey />
                Change Password
              </motion.button>
            </div>
          </div>
        </div>

        {/* Details & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Security & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Security Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Two-Factor Auth</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    profile.two_factor_enabled 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {profile.two_factor_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Last Login</span>
                  <span className="text-white text-sm">{formatDate(profile.last_login)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Password Changed</span>
                  <span className="text-white text-sm">{formatDate(profile.password_changed_at)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Activity Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FiActivity className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-xs text-gray-400">Total Actions</div>
                    <div className="text-lg font-bold text-white">{profile.activity_count}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiShield className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-xs text-gray-400">Account Status</div>
                    <div className="text-lg font-bold text-white capitalize">{profile.status}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Bio</h4>
              <p className="text-gray-300">{profile.bio}</p>
            </div>
          )}

          {/* Activity Log */}
          <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Recent Activity</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {activityLog.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No recent activity</p>
              ) : (
                activityLog.map((activity, index) => (
                  <div
                    key={activity.id || `activity-${index}`}
                    className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{activity.action}</p>
                      <p className="text-gray-400 text-sm">{activity.details}</p>
                      <p className="text-gray-500 text-xs">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Edit Profile</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    title="Close modal"
                  >
                    <FiX className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    title="Name"
                    placeholder="Full name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    title="Email"
                    placeholder="name@example.com"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    title="Phone"
                    placeholder="(optional)"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    title="Bio"
                    placeholder="Short bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateProfile}
                  className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Change Password</h3>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    title="Close modal"
                  >
                    <FiX className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                  <input
                    type="password"
                    title="Current Password"
                    placeholder="Current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <input
                    type="password"
                    title="New Password"
                    placeholder="New password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    title="Confirm Password"
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={changePassword}
                  className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Change Password
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {showAddAdminModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddAdminModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Add New Admin</h3>
                  <button
                    onClick={() => setShowAddAdminModal(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    title="Close modal"
                  >
                    <FiX className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    title="Admin Name"
                    placeholder="Full name"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({...adminForm, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    title="Admin Email"
                    placeholder="name@example.com"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    title="Password"
                    placeholder="Minimum 8 characters"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    title="Confirm Password"
                    placeholder="Confirm password"
                    value={adminForm.confirmPassword}
                    onChange={(e) => setAdminForm({...adminForm, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <select
                    title="Role"
                    value={adminForm.role}
                    onChange={(e) => setAdminForm({...adminForm, role: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    title="Phone"
                    placeholder="(optional)"
                    value={adminForm.phone}
                    onChange={(e) => setAdminForm({...adminForm, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio (Optional)</label>
                  <textarea
                    title="Bio"
                    placeholder="Short bio (optional)"
                    value={adminForm.bio}
                    onChange={(e) => setAdminForm({...adminForm, bio: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => setShowAddAdminModal(false)}
                  className="flex-1 px-4 py-2 text-gray-300 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addAdmin}
                  className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Add Admin
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FuturisticProfile;
