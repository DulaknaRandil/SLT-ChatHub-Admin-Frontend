'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiEye, FiTrash2, FiSearch } from 'react-icons/fi';
import api from '../lib/api';

type MessageFilter = 'all' | 'text' | 'image' | 'video' | 'audio' | 'document';

interface Conversation {
  id: string;
  type: 'single' | 'group';
  participants?: string[];
  participant_names?: string[];
  last_message?: string;
  last_message_time?: string;
  message_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  message_type: string;
  timestamp: string;
  file_url?: string;
}

const FuturisticChatsMonitoring: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageFilter] = useState<MessageFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/conversations');
      setConversations(res.data?.conversations ?? []);
    } catch (err) {
      console.error(err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!selectedConversation) return;
    try {
      const res = await api.get(`/messages?conversation_id=${selectedConversation}&type=${messageFilter}&page=1&limit=50`);
      setMessages(res.data?.messages ?? []);
    } catch (err) {
      console.error(err);
      setMessages([]);
    }
  }, [selectedConversation, messageFilter]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedConversation) loadMessages();
  }, [selectedConversation, loadMessages]);

  const deleteMessage = async (id: string) => {
    if (!confirm('Delete message?')) return;
    try {
      await api.delete(`/messages/${id}`);
      await loadMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = conversations.filter((c) => {
    const names = c.participant_names ?? c.participants ?? [];
    if (!searchQuery.trim()) return true;
    return names.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const fmt = (s?: string) => (s ? new Date(s).toLocaleString() : '');
  const icon = (t?: string) => {
    switch (t) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      case 'document':
        return '📄';
      default:
        return '💬';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Chat Monitoring</h1>
          <p className="text-gray-400">Monitor and moderate conversations</p>
        </div>
        <motion.button onClick={loadConversations} className="px-4 py-2 bg-blue-600 rounded text-white">
          <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-full py-2 bg-white/10 rounded" />
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-6">Loading...</div>
              ) : (
                filtered.map((conv) => (
                  <div key={conv.id} className={`p-3 border-b cursor-pointer ${selectedConversation === conv.id ? 'bg-white/10' : ''}`} onClick={() => setSelectedConversation(conv.id)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white truncate">{(conv.participant_names ?? conv.participants ?? []).join(', ')}</div>
                        <div className="text-sm text-gray-400 truncate">{conv.last_message ?? ''}</div>
                      </div>
                      <div className="text-xs text-gray-400">{conv.message_count ?? 0} msgs</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="p-4 bg-white/5 rounded-lg">
            {!selectedConversation ? (
              <div className="text-center py-20 text-gray-400">Select a conversation</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20 text-gray-400">No messages</div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className="p-3 bg-white/3 rounded">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-white">{m.sender_name} <span className="text-xs text-gray-400">{fmt(m.timestamp)}</span></div>
                        <div className="text-gray-300 mt-1">{m.message_type === 'text' ? m.content : `${icon(m.message_type)} ${m.message_type} file`}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {m.file_url && (
                          <a href={m.file_url} target="_blank" rel="noopener noreferrer" title="View attachment" className="text-blue-400"><FiEye /></a>
                        )}
                        <button title="Delete message" onClick={() => deleteMessage(m.id)} className="text-red-400"><FiTrash2 /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuturisticChatsMonitoring;
