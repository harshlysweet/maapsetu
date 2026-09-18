"use client";

import { useState } from "react";
import { UserCreateForm } from "@/components/forms";
import { formatDate } from "@/lib/utils";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  organisation: string | null;
  district: string;
  state: string;
  createdAt: Date;
};

export function UserManagement({ users: initialUsers }: { users: User[] }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [users, setUsers] = useState(initialUsers);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl">User Management</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          {showCreateForm ? "Cancel" : "Add New User"}
        </button>
      </div>

      {showCreateForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-display text-xl mb-4">Create New User</h2>
          <UserCreateForm />
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[var(--muted)] border-b">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Role</th>
              <th className="p-3">Organisation</th>
              <th className="p-3">District</th>
              <th className="p-3">State</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-3 font-semibold">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.phone}</td>
                <td className="p-3">
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-[var(--navy)] text-white">
                    {user.role}
                  </span>
                </td>
                <td className="p-3">{user.organisation || "—"}</td>
                <td className="p-3">{user.district}</td>
                <td className="p-3">{user.state}</td>
                <td className="p-3">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
