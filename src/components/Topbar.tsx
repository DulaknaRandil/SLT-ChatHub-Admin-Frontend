"use client";
import React from 'react';
import { FiBell, FiSearch } from 'react-icons/fi';
import Image from 'next/image';

export default function Topbar({ onLogout }: { onLogout?: () => void }) {
  return (
    <header className="flex items-center justify-between bg-white px-6 py-3 border-b sticky top-0 z-20 ml-64">
      <div className="flex items-center gap-4">
        <div className="relative flex items-center gap-2">
          <FiSearch />
          <input placeholder="Search..." className="ml-2 outline-none" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button aria-label="notifications" className="p-2 rounded-md hover:bg-slate-100">
          <FiBell />
        </button>
        <div className="flex items-center gap-3">
          <Image src="/favicon.ico" alt="avatar" width={32} height={32} className="rounded-full" />
          <div className="text-sm">Admin</div>
        </div>
        <button onClick={() => onLogout?.()} className="ml-4 text-sm px-3 py-1 border rounded text-slate-600 hover:bg-slate-100">Logout</button>
      </div>
    </header>
  );
}
