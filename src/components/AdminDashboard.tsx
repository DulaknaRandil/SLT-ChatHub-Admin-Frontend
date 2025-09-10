"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import UsageChart from './charts/UsageChart';
import MediaChart from './charts/MediaChart';

type DashboardStats = {
  total_users?: number;
  active_users?: number;
  total_groups?: number;
  total_messages?: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let mounted = true;
    api
      .get('/dashboard/stats')
      .then((res) => {
        if (mounted) setStats(res.data);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-slate-500">Total Users</div>
          <div className="text-2xl font-bold">{stats?.total_users ?? '—'}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-slate-500">Active Users</div>
          <div className="text-2xl font-bold">{stats?.active_users ?? '—'}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-slate-500">Total Groups</div>
          <div className="text-2xl font-bold">{stats?.total_groups ?? '—'}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-slate-500">Total Messages</div>
          <div className="text-2xl font-bold">{stats?.total_messages ?? '—'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-4">
          <div className="mb-3 font-semibold">Media Sharing Percentage</div>
          <MediaChart />
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="mb-3 font-semibold">Message Counter</div>
          <UsageChart />
        </div>
      </div>
    </div>
  );
}
