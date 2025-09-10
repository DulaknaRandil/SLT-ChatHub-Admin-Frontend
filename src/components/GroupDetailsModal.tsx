"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Group } from '@/types';

type GroupDetails = Group & { admin_name?: string };

export default function GroupDetailsModal({ group, onClose }: { group: Group | null; onClose: () => void }) {
  const [details, setDetails] = useState<GroupDetails | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!group) return;
    api.get(`/groups/${group.id}`).then((res) => {
      if (mounted) setDetails(res.data);
    }).catch(() => {});
    return () => { mounted = false; };
  }, [group]);

  if (!group) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl bg-white rounded shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Group Details</h3>
          <button onClick={onClose} aria-label="close">✕</button>
        </div>

        {details ? (
          <div>
            <div className="mb-2"><strong>Name:</strong> {details.name}</div>
            <div className="mb-2"><strong>Admin:</strong> {details.admin_name}</div>
            <div className="mb-2"><strong>Members:</strong> {details.member_count}</div>
            <div className="mt-4">
              <div className="font-semibold mb-2">Members</div>
              <div className="max-h-48 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500"><th className="px-2 py-1">Name</th><th className="px-2 py-1">Email</th></tr>
                  </thead>
                  <tbody>
                        {details.members && details.members.map((m) => (
                          <tr key={m.id}><td className="px-2 py-1">{m.name}</td><td className="px-2 py-1">{m.email}</td></tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}
