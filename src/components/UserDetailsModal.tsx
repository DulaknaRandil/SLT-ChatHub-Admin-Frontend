'use client';

import { User } from '@/types';
import { motion } from 'framer-motion';
import { FiX, FiMail, FiPhone, FiCalendar, FiUser, FiMessageSquare, FiUsers, FiShield } from 'react-icons/fi';
import Image from 'next/image';

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">User Details</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Close modal"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24 mb-4">
              <Image
                src={user.profile_pic || '/default-avatar.png'}
                alt={user.name}
                fill
                className="rounded-full object-cover"
                onError={() => {
                  // Handle image error if needed
                }}
              />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-1">{user.name}</h4>
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
              user.is_blocked 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {user.is_blocked ? 'Blocked' : 'Active'}
            </span>
          </div>

          {/* Information Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiMail className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Email</div>
                <div className="text-sm font-medium text-gray-800">{user.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiPhone className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Phone</div>
                <div className="text-sm font-medium text-gray-800">{user.phone || 'Not provided'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiCalendar className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Registered</div>
                <div className="text-sm font-medium text-gray-800">
                  {user.registered_at
                    ? new Date(user.registered_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Unknown'}
                </div>
              </div>
            </div>

            {user.bio && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <FiUser className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Bio</div>
                  <div className="text-sm text-gray-800">{user.bio}</div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <FiMessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <div className="text-sm font-medium text-gray-800">{user.message_count || 0}</div>
              <div className="text-xs text-gray-500">Messages</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <FiUsers className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <div className="text-sm font-medium text-gray-800">{user.group_count || 0}</div>
              <div className="text-xs text-gray-500">Groups</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <FiShield className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <div className="text-sm font-medium text-gray-800">{user.reports_count || 0}</div>
              <div className="text-xs text-gray-500">Reports</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              // TODO: Implement edit user functionality
              alert('Edit user functionality will be implemented');
            }}
          >
            Edit User
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserDetailsModal;
