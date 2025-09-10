"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayoutTailwind({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
  const t = Boolean(localStorage.getItem('adminToken'));
  if (!t) router.push('/admin/login');
  }, [router]);

  const doLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Topbar onLogout={doLogout} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
