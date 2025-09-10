"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const items = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin' },
  { id: 'users', label: 'User Management', href: '/admin/users' },
  { id: 'chats', label: 'Chat Monitoring', href: '/admin/chats' },
  { id: 'groups', label: 'Group Management', href: '/admin/groups' },
  { id: 'profile', label: 'Profile', href: '/admin/profile' },
  { id: 'settings', label: 'Settings', href: '/admin/settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-sky-700 to-indigo-800 text-white min-h-screen fixed">
      <div className="p-6 font-bold text-lg uppercase">Chat Hub Admin</div>
      <nav className="mt-6">
        {items.map((it) => (
          <motion.div whileHover={{ x: 6 }} key={it.id}>
            <Link href={it.href} className="block px-6 py-3 text-sm hover:bg-white/10">
              {it.label}
            </Link>
          </motion.div>
        ))}
      </nav>
    </aside>
  );
}
