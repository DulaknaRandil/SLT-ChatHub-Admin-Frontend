"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import GroupDetailsModal from '@/components/GroupDetailsModal';
import { Group } from '@/types';

export default function GroupsTable() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selected, setSelected] = useState<Group | null>(null);

  const load = async () => {
    try {
      const res = await api.get('/groups?page=1&limit=10');
      if (res?.data?.groups) setGroups(res.data.groups);
    } catch {
      // ignore
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="mb-3 font-semibold">All Groups</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="px-3 py-2">Group Name</th>
              <th className="px-3 py-2">Members</th>
              <th className="px-3 py-2">Messages</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(g => (
              <tr key={g.id} className="border-t">
                <td className="px-3 py-2">{g.name}</td>
                <td className="px-3 py-2">{g.member_count}</td>
                <td className="px-3 py-2">{g.message_count}</td>
                <td className="px-3 py-2">
                  <button className="text-indigo-600 hover:underline" onClick={() => setSelected(g)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <GroupDetailsModal group={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
