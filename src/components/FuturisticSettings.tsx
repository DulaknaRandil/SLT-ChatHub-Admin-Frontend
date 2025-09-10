'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FiServer,
  FiMail,
  FiShield,
  FiDatabase,
  FiGlobe,
  FiBell,
  FiSave,
  FiRefreshCw,
  FiToggleLeft,
  FiToggleRight
} from 'react-icons/fi';
import api from '../lib/api';

interface SystemSettings {
  server: {
    maintenance_mode: boolean;
    api_rate_limit: number;
    max_file_size: number;
    allowed_file_types: string[];
    session_timeout: number;
  };
  email: {
    smtp_host: string;
    smtp_port: number;
    smtp_user: string;
    smtp_password: string;
    use_tls: boolean;
    from_email: string;
    admin_notifications: boolean;
  };
  security: {
    password_min_length: number;
    password_require_special: boolean;
    password_require_numbers: boolean;
    password_require_uppercase: boolean;
    failed_login_attempts: number;
    account_lockout_duration: number;
    two_factor_required: boolean;
  };
  database: {
    backup_frequency: string;
    backup_retention_days: number;
    auto_cleanup: boolean;
    cleanup_interval_days: number;
  };
  chat: {
    max_message_length: number;
    max_group_size: number;
    file_sharing_enabled: boolean;
    message_encryption: boolean;
    auto_delete_messages_days: number;
  };
  notifications: {
    push_notifications: boolean;
    email_notifications: boolean;
    sms_notifications: boolean;
    notification_frequency: string;
  };
}

const FuturisticSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [changedSections, setChangedSections] = useState<Set<string>>(new Set());

  const loadSettings = useCallback(async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data || getDefaultSettings());
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const getDefaultSettings = (): SystemSettings => ({
    server: {
      maintenance_mode: false,
      api_rate_limit: 1000,
      max_file_size: 50,
      allowed_file_types: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
      session_timeout: 3600
    },
    email: {
      smtp_host: '',
      smtp_port: 587,
      smtp_user: '',
      smtp_password: '',
      use_tls: true,
      from_email: '',
      admin_notifications: true
    },
    security: {
      password_min_length: 8,
      password_require_special: true,
      password_require_numbers: true,
      password_require_uppercase: true,
      failed_login_attempts: 5,
      account_lockout_duration: 30,
      two_factor_required: false
    },
    database: {
      backup_frequency: 'daily',
      backup_retention_days: 30,
      auto_cleanup: true,
      cleanup_interval_days: 7
    },
    chat: {
      max_message_length: 5000,
      max_group_size: 100,
      file_sharing_enabled: true,
      message_encryption: true,
      auto_delete_messages_days: 0
    },
    notifications: {
      push_notifications: true,
      email_notifications: true,
      sms_notifications: false,
      notification_frequency: 'immediate'
    }
  });

  const updateSetting = (section: keyof SystemSettings, key: string, value: unknown) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    });
    
    setChangedSections(prev => new Set(prev).add(section));
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await api.put('/settings', settings);
      setChangedSections(new Set());
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const testEmailSettings = async () => {
    setTestingEmail(true);
    try {
      await api.post('/settings/test-email');
      alert('Test email sent successfully!');
    } catch (error) {
      console.error('Error testing email:', error);
      alert('Error sending test email');
    } finally {
      setTestingEmail(false);
    }
  };

  const resetToDefaults = async () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings(getDefaultSettings());
      setChangedSections(new Set(['server', 'email', 'security', 'database', 'chat', 'notifications']));
    }
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

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Error loading settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
          <p className="text-gray-400">Configure system preferences and security settings</p>
        </div>
        
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <FiRefreshCw />
            Reset Defaults
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveSettings}
            disabled={saving || changedSections.size === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
              changedSections.size > 0
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <FiSave />
            )}
            Save Changes
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Server Settings */}
        <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiServer className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Server Settings</h2>
            {changedSections.has('server') && (
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Maintenance Mode</label>
                <p className="text-sm text-gray-400">Enable to restrict access during updates</p>
              </div>
              <button
                onClick={() => updateSetting('server', 'maintenance_mode', !settings.server.maintenance_mode)}
                className="p-1"
                title={`${settings.server.maintenance_mode ? 'Disable' : 'Enable'} maintenance mode`}
              >
                {settings.server.maintenance_mode ? (
                  <FiToggleRight className="w-8 h-8 text-green-400" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">API Rate Limit (requests/hour)</label>
              <input
                type="number"
                value={settings.server.api_rate_limit}
                onChange={(e) => updateSetting('server', 'api_rate_limit', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1000"
                title="Maximum API requests per hour"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Max File Size (MB)</label>
              <input
                type="number"
                value={settings.server.max_file_size}
                onChange={(e) => updateSetting('server', 'max_file_size', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="50"
                title="Maximum file upload size in MB"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Session Timeout (seconds)</label>
              <input
                type="number"
                value={settings.server.session_timeout}
                onChange={(e) => updateSetting('server', 'session_timeout', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="3600"
                title="Session timeout in seconds"
              />
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiMail className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Email Settings</h2>
            {changedSections.has('email') && (
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">SMTP Host</label>
              <input
                type="text"
                value={settings.email.smtp_host}
                onChange={(e) => updateSetting('email', 'smtp_host', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="smtp.gmail.com"
                title="SMTP server hostname"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">SMTP Port</label>
              <input
                type="number"
                value={settings.email.smtp_port}
                onChange={(e) => updateSetting('email', 'smtp_port', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="587"
                title="SMTP server port"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">SMTP Username</label>
              <input
                type="text"
                value={settings.email.smtp_user}
                onChange={(e) => updateSetting('email', 'smtp_user', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="username@gmail.com"
                title="SMTP authentication username"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">From Email</label>
              <input
                type="email"
                value={settings.email.from_email}
                onChange={(e) => updateSetting('email', 'from_email', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="noreply@yourapp.com"
                title="Email address for outgoing messages"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Use TLS</label>
                <p className="text-sm text-gray-400">Enable secure email transmission</p>
              </div>
              <button
                onClick={() => updateSetting('email', 'use_tls', !settings.email.use_tls)}
                className="p-1"
                title={`${settings.email.use_tls ? 'Disable' : 'Enable'} TLS encryption`}
              >
                {settings.email.use_tls ? (
                  <FiToggleRight className="w-8 h-8 text-green-400" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            <button
              onClick={testEmailSettings}
              disabled={testingEmail}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              title="Send test email"
            >
              {testingEmail ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <FiMail />
              )}
              Test Email Settings
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiShield className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Security Settings</h2>
            {changedSections.has('security') && (
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Password Min Length</label>
              <input
                type="number"
                value={settings.security.password_min_length}
                onChange={(e) => updateSetting('security', 'password_min_length', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                min="6"
                max="32"
                placeholder="8"
                title="Minimum password length"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Require Special Characters</label>
                <p className="text-sm text-gray-400">Password must contain special characters</p>
              </div>
              <button
                onClick={() => updateSetting('security', 'password_require_special', !settings.security.password_require_special)}
                className="p-1"
                title={`${settings.security.password_require_special ? 'Disable' : 'Enable'} special character requirement`}
              >
                {settings.security.password_require_special ? (
                  <FiToggleRight className="w-8 h-8 text-green-400" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Require Numbers</label>
                <p className="text-sm text-gray-400">Password must contain numbers</p>
              </div>
              <button
                onClick={() => updateSetting('security', 'password_require_numbers', !settings.security.password_require_numbers)}
                className="p-1"
                title={`${settings.security.password_require_numbers ? 'Disable' : 'Enable'} number requirement`}
              >
                {settings.security.password_require_numbers ? (
                  <FiToggleRight className="w-8 h-8 text-green-400" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Failed Login Attempts</label>
              <input
                type="number"
                value={settings.security.failed_login_attempts}
                onChange={(e) => updateSetting('security', 'failed_login_attempts', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                min="3"
                max="10"
                placeholder="5"
                title="Maximum failed login attempts before lockout"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Account Lockout Duration (minutes)</label>
              <input
                type="number"
                value={settings.security.account_lockout_duration}
                onChange={(e) => updateSetting('security', 'account_lockout_duration', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                min="5"
                placeholder="30"
                title="Account lockout duration in minutes"
              />
            </div>
          </div>
        </div>

        {/* Database Settings */}
        <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiDatabase className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Database Settings</h2>
            {changedSections.has('database') && (
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Backup Frequency</label>
              <select
                value={settings.database.backup_frequency}
                onChange={(e) => updateSetting('database', 'backup_frequency', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                title="Database backup frequency"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Backup Retention (days)</label>
              <input
                type="number"
                value={settings.database.backup_retention_days}
                onChange={(e) => updateSetting('database', 'backup_retention_days', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1"
                placeholder="30"
                title="Number of days to retain backups"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Auto Cleanup</label>
                <p className="text-sm text-gray-400">Automatically clean old data</p>
              </div>
              <button
                onClick={() => updateSetting('database', 'auto_cleanup', !settings.database.auto_cleanup)}
                className="p-1"
                title={`${settings.database.auto_cleanup ? 'Disable' : 'Enable'} auto cleanup`}
              >
                {settings.database.auto_cleanup ? (
                  <FiToggleRight className="w-8 h-8 text-green-400" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Cleanup Interval (days)</label>
              <input
                type="number"
                value={settings.database.cleanup_interval_days}
                onChange={(e) => updateSetting('database', 'cleanup_interval_days', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1"
                placeholder="7"
                title="Database cleanup interval in days"
              />
            </div>
          </div>
        </div>

        {/* Chat Settings */}
        <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiGlobe className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Chat Settings</h2>
            {changedSections.has('chat') && (
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Max Message Length</label>
              <input
                type="number"
                value={settings.chat.max_message_length}
                onChange={(e) => updateSetting('chat', 'max_message_length', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                min="100"
                max="10000"
                placeholder="5000"
                title="Maximum message length in characters"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Max Group Size</label>
              <input
                type="number"
                value={settings.chat.max_group_size}
                onChange={(e) => updateSetting('chat', 'max_group_size', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                min="2"
                max="1000"
                placeholder="100"
                title="Maximum number of members in a group"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">File Sharing</label>
                <p className="text-sm text-gray-400">Allow file sharing in chats</p>
              </div>
              <button
                onClick={() => updateSetting('chat', 'file_sharing_enabled', !settings.chat.file_sharing_enabled)}
                className="p-1"
                title={`${settings.chat.file_sharing_enabled ? 'Disable' : 'Enable'} file sharing`}
              >
                {settings.chat.file_sharing_enabled ? (
                  <FiToggleRight className="w-8 h-8 text-green-400" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Message Encryption</label>
                <p className="text-sm text-gray-400">Encrypt messages for security</p>
              </div>
              <button
                onClick={() => updateSetting('chat', 'message_encryption', !settings.chat.message_encryption)}
                className="p-1"
                title={`${settings.chat.message_encryption ? 'Disable' : 'Enable'} message encryption`}
              >
                {settings.chat.message_encryption ? (
                  <FiToggleRight className="w-8 h-8 text-green-400" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiBell className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
            {changedSections.has('notifications') && (
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Push Notifications</label>
                <p className="text-sm text-gray-400">Send push notifications to users</p>
              </div>
              <button
                onClick={() => updateSetting('notifications', 'push_notifications', !settings.notifications.push_notifications)}
                className="p-1"
                title={`${settings.notifications.push_notifications ? 'Disable' : 'Enable'} push notifications`}
              >
                {settings.notifications.push_notifications ? (
                  <FiToggleRight className="w-8 h-8 text-green-400" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Email Notifications</label>
                <p className="text-sm text-gray-400">Send email notifications</p>
              </div>
              <button
                onClick={() => updateSetting('notifications', 'email_notifications', !settings.notifications.email_notifications)}
                className="p-1"
                title={`${settings.notifications.email_notifications ? 'Disable' : 'Enable'} email notifications`}
              >
                {settings.notifications.email_notifications ? (
                  <FiToggleRight className="w-8 h-8 text-green-400" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">SMS Notifications</label>
                <p className="text-sm text-gray-400">Send SMS notifications</p>
              </div>
              <button
                onClick={() => updateSetting('notifications', 'sms_notifications', !settings.notifications.sms_notifications)}
                className="p-1"
                title={`${settings.notifications.sms_notifications ? 'Disable' : 'Enable'} SMS notifications`}
              >
                {settings.notifications.sms_notifications ? (
                  <FiToggleRight className="w-8 h-8 text-green-400" />
                ) : (
                  <FiToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Notification Frequency</label>
              <select
                value={settings.notifications.notification_frequency}
                onChange={(e) => updateSetting('notifications', 'notification_frequency', e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                title="Notification delivery frequency"
              >
                <option value="immediate">Immediate</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Summary</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Save Status */}
      {changedSections.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg backdrop-blur-xl border border-white/20"
        >
          <p className="text-sm font-medium">
            {changedSections.size} section{changedSections.size !== 1 ? 's' : ''} modified
          </p>
          <p className="text-xs opacity-80">Click &quot;Save Changes&quot; to apply</p>
        </motion.div>
      )}
    </div>
  );
};

export default FuturisticSettings;
