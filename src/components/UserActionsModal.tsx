"use client";
import React from 'react';

type User = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  user?: User;
  onBlock: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function UserActionsModal({ open, onClose, user, onBlock, onDelete }: Props) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">User Actions</h3>
          <button onClick={onClose} aria-label="close" className="text-slate-500">✕</button>
        </div>

        <div className="mb-4">
          <div className="text-sm text-slate-600">{user.name}</div>
          <div className="text-xs text-slate-500">{user.email}</div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button className="w-full bg-blue-600 text-white p-2 rounded" onClick={() => { onClose(); /* view handled elsewhere */ }}>View Profile</button>
          <button className="w-full bg-amber-500 text-white p-2 rounded" onClick={async () => { await onBlock(user.id); onClose(); }}>Block User</button>
          <button className="w-full bg-red-600 text-white p-2 rounded" onClick={async () => { if (confirm('Delete user?')) { await onDelete(user.id); onClose(); } }}>Delete User</button>
        </div>

      </div>
    </div>
  );
}
