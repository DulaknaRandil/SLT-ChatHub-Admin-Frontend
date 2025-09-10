"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function LoginForm({ onLogin }: { onLogin?: () => void }) {
  const [email, setEmail] = useState('admin@chathub.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/login', { email, password });
      if (res?.data?.token) {
        localStorage.setItem('adminToken', res.data.token);
        onLogin?.();
        router.push('/admin');
      } else {
        alert('Login failed');
      }
    } catch {
      alert('Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form className="w-full max-w-md bg-white p-6 rounded-lg shadow" onSubmit={submit}>
        <h3 className="text-lg font-semibold mb-4">Admin Login</h3>
        <label className="block text-sm">Email</label>
        <input aria-label="email" placeholder="admin@chathub.com" className="w-full border rounded p-2 mb-3" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="block text-sm">Password</label>
        <input aria-label="password" placeholder="Password" type="password" className="w-full border rounded p-2 mb-4" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full bg-sky-600 text-white p-2 rounded" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </div>
  );
}
