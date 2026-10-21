import React from "react";
import { UserRole } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";

export const UsersRolesView: React.FC = () => {
  const { users, currentUser, switchUserRole } = useApp();

  const roleDefinitions: {
    role: UserRole;
    title: string;
    description: string;
    accessScope: string[];
    restrictions: string[];
    tone: "green" | "lime" | "yellow" | "blue" | "purple" | "gray";
  }[] = [
    {
      role: "admin",
      title: "Admin User",
      description: "Full system administration, inventory management, user accounts & roles, logistics dispatches, rental reservations, pricing, and global audit logs.",
      accessScope: ["Full System Configuration & Management", "Manage User Accounts & Permissions", "Inventory Catalog & Stock Control", "Logistics, Rentals & Invoicing", "Global Audit Trail & Reports"],
      restrictions: ["High-impact administrative actions remain permanently auditable"],
      tone: "green",
    },
    {
      role: "user",
      title: "User",
      description: "Standard event client and operations user. Browse event equipment catalog, place rental reservations, track orders and dispatches, and manage project items.",
      accessScope: ["Browse Event Equipment & Materials", "Reserve Rental Items & Add to Cart", "View Orders, Status & Dispatches", "Self-Service Checkout & Bookings"],
      restrictions: ["Restricted from user account management and system-level configuration"],
      tone: "blue",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            ACCESS CONTROL & SECURITY ARCHITECTURE
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display mt-1">
            User Accounts, Roles & Permissions
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Role-based access control (RBAC) enforced at the system core. Test any persona via the interactive role switcher.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs">
          <span className="text-emerald-800 font-medium">Currently viewing as:</span>
          <strong className="text-emerald-950 font-bold uppercase tracking-wider">
            {currentUser.role.replace("_", " ")} ({currentUser.name})
          </strong>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
          Configured System Roles & Permissions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roleDefinitions.map((def) => {
            const isCurrent = currentUser.role === def.role;

            return (
              <div
                key={def.role}
                className={`bg-white rounded-2xl border p-5 shadow-2xs flex flex-col justify-between transition-all ${
                  isCurrent ? "border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/10" : "border-gray-200"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{def.title}</h3>
                      <span className="text-[10px] text-gray-400 font-mono">role: {def.role}</span>
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        Active Role
                      </span>
                    ) : (
                      <button
                        onClick={() => switchUserRole(def.role)}
                        className="text-[10px] font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200 transition-colors"
                      >
                        Switch Role →
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mt-3">{def.description}</p>

                  {/* Authorized Scope */}
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Authorized Permissions:
                    </span>
                    {def.accessScope.map((scope, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-700">
                        <Icon name="check" size={13} className="text-emerald-600 shrink-0" />
                        <span>{scope}</span>
                      </div>
                    ))}
                  </div>

                  {/* Protected Restrictions */}
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                      Security Safeguards:
                    </span>
                    {def.restrictions.map((res, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        <span>{res}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Team members: {users.filter((u) => u.role === def.role).length}</span>
                  {!isCurrent && (
                    <button
                      onClick={() => switchUserRole(def.role)}
                      className="font-bold text-emerald-800 hover:text-emerald-950 underline"
                    >
                      Test this persona
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team User Accounts Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Active Team User Accounts ({users.length})
          </h2>
          <span className="text-xs text-gray-500">Managed via Admin Console</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Email Address</th>
                <th className="py-3 px-3">Branch Location</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Switch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-emerald-900 text-white font-bold flex items-center justify-center text-xs">
                      {u.avatar}
                    </span>
                    <div>
                      <strong className="text-xs font-bold text-gray-900 block">{u.name}</strong>
                      <span className="text-[10px] text-gray-400 font-mono">ID: {u.id}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <Badge tone="green" size="sm">
                      {u.role.replace("_", " ").toUpperCase()}
                    </Badge>
                  </td>

                  <td className="py-3 px-3 text-gray-600 font-medium">{u.email}</td>

                  <td className="py-3 px-3 font-semibold text-gray-800">{u.branch}</td>

                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => switchUserRole(u.role)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                        currentUser.id === u.id
                          ? "bg-emerald-950 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {currentUser.id === u.id ? "Current User" : "Assume User"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersRolesView;
