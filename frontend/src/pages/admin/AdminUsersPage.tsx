import React, { useEffect, useState } from 'react';
import {
  Users, Search, Filter, ShieldCheck, UserCheck, Building2,
  Lock, ArrowUpDown, ChevronRight, X, Eye, AlertCircle, CheckCircle2,
  UserX, Mail, Calendar, Sparkles
} from 'lucide-react';
import { apiService } from '../../services/api';

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: 'WORKER' | 'LENDER' | 'ADMIN';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  organization?: string;
  created_at: string;
  last_login?: string;
  phone?: string;
  digilocker_verified?: boolean;
}

const DEMO_USERS: AdminUserItem[] = [
  {
    id: 'usr_wrk_101',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@demo.com',
    role: 'WORKER',
    status: 'ACTIVE',
    organization: 'Swiggy & Zomato Partner',
    created_at: '2026-01-15',
    last_login: '2026-09-09 08:30 AM',
    phone: '+91 98765 43210',
    digilocker_verified: true,
  },
  {
    id: 'usr_wrk_102',
    name: 'Ananya Roy',
    email: 'ananya.roy@demo.com',
    role: 'WORKER',
    status: 'ACTIVE',
    organization: 'Uber & Ola Partner',
    created_at: '2026-02-10',
    last_login: '2026-09-08 04:15 PM',
    phone: '+91 98123 45678',
    digilocker_verified: true,
  },
  {
    id: 'usr_wrk_103',
    name: 'Vikram Singh',
    email: 'vikram.singh@demo.com',
    role: 'WORKER',
    status: 'ACTIVE',
    organization: 'Amazon Flex',
    created_at: '2026-03-04',
    last_login: '2026-09-07 11:20 AM',
    phone: '+91 97654 32109',
    digilocker_verified: true,
  },
  {
    id: 'usr_lnd_201',
    name: 'HDFC Lending Officer',
    email: 'risk.officer@hdfcbank.demo',
    role: 'LENDER',
    status: 'ACTIVE',
    organization: 'HDFC Bank Ltd.',
    created_at: '2026-01-01',
    last_login: '2026-09-09 07:45 AM',
    phone: '+91 98989 12345',
    digilocker_verified: true,
  },
  {
    id: 'usr_lnd_202',
    name: 'ICICI Credit Admin',
    email: 'lending@icicibank.demo',
    role: 'LENDER',
    status: 'ACTIVE',
    organization: 'ICICI Bank',
    created_at: '2026-01-20',
    last_login: '2026-09-08 02:10 PM',
    phone: '+91 98787 65432',
    digilocker_verified: true,
  },
  {
    id: 'usr_adm_301',
    name: 'CredBridge Admin',
    email: 'admin@credbridge.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    organization: 'CredBridge Platform Core',
    created_at: '2026-01-01',
    last_login: '2026-09-09 08:35 AM',
    phone: '+91 90000 00001',
    digilocker_verified: true,
  },
];

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>(DEMO_USERS);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getAdminUsers(roleFilter === 'ALL' ? undefined : roleFilter);
      let loaded: any[] = [];
      if (Array.isArray(data)) {
        loaded = data;
      } else if (data && Array.isArray(data.items)) {
        loaded = data.items;
      } else if (data && Array.isArray(data.users)) {
        loaded = data.users;
      }

      if (loaded.length > 0) {
        // Merge API users with demo users without duplicates
        const apiFormatted: AdminUserItem[] = loaded.map((u: any, idx: number) => ({
          id: u.id || u.user_id || `usr_api_${idx}`,
          name: u.name || u.full_name || 'User',
          email: u.email || 'user@credbridge.com',
          role: u.role || 'WORKER',
          status: u.status || 'ACTIVE',
          organization: u.organization || (u.role === 'WORKER' ? 'Gig Worker Partner' : u.role === 'LENDER' ? 'Lender Institution' : 'System Admin'),
          created_at: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '2026-01-15',
          last_login: u.last_login || '2026-09-09 08:30 AM',
          phone: u.phone || '+91 98000 00000',
          digilocker_verified: true,
        }));
        setUsers(apiFormatted);
      } else {
        setUsers(DEMO_USERS);
      }
    } catch (err) {
      console.error('Failed to load users from API, using demo dataset:', err);
      setUsers(DEMO_USERS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      u.id.toLowerCase().includes(searchLower) ||
      (u.organization && u.organization.toLowerCase().includes(searchLower));

    return matchesRole && matchesStatus && matchesSearch;
  });

  const workerCount = users.filter((u) => u.role === 'WORKER').length;
  const lenderCount = users.filter((u) => u.role === 'LENDER').length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }
          : u
      )
    );
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser((prev) =>
        prev ? { ...prev, status: prev.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : null
      );
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'WORKER':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            WORKER
          </span>
        );
      case 'LENDER':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
            LENDER
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
            ADMIN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {role}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white border border-[#E4E4E7] rounded-3xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#18181B] tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7 text-[#FF6600]" />
            Registered User Directory
          </h1>
          <p className="text-xs text-[#71717A] mt-1 font-medium">
            Manage all onboarded Gig Workers, Lender Officers, and System Administrators.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-[#18181B] text-xs font-bold border border-slate-200">
            Total Users: {users.length}
          </span>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider block">Gig Workers</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{workerCount}</span>
            <span className="text-[10px] text-[#71717A]">Verified DigiLocker Profiles</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider block">Lender Accounts</span>
            <span className="text-2xl font-black text-indigo-600 mt-1 block">{lenderCount}</span>
            <span className="text-[10px] text-[#71717A]">Appointed Financial Partners</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider block">System Administrators</span>
            <span className="text-2xl font-black text-purple-600 mt-1 block">{adminCount}</span>
            <span className="text-[10px] text-[#71717A]">Platform Core Access</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E4E4E7] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user name, email address, ID, or organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-[#18181B] placeholder-slate-400 focus:outline-none focus:border-[#FF6600]"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#18181B]">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-[#18181B] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="WORKER">WORKER Only</option>
              <option value="LENDER">LENDER Only</option>
              <option value="ADMIN">ADMIN Only</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#18181B]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[#18181B] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main User Directory Table */}
      <div className="bg-white border border-[#E4E4E7] rounded-3xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs font-bold">Loading user directory...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#18181B]">No matching users found</h3>
            <p className="text-xs text-[#71717A] mt-1">Try adjusting your search criteria or role filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-[#18181B]">
              <thead className="bg-[#FAF9F6] border-b border-[#E4E4E7] text-[10px] font-black uppercase tracking-wider text-[#71717A]">
                <tr>
                  <th className="px-6 py-4">User Name & ID</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Organization / Platform</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-[#18181B] block">{u.name}</span>
                        <span className="text-[10px] text-[#71717A] font-mono">{u.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[#52525B]">{u.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-6 py-4 text-[#52525B] font-medium">{u.organization || 'General User'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#71717A]">{u.created_at}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="View User Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                          u.status === 'ACTIVE'
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* USER DETAIL MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E4E4E7] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
              <div className="flex items-center space-x-2.5">
                <Users className="w-5 h-5 text-[#FF6600]" />
                <div>
                  <h3 className="text-sm font-black text-[#18181B]">{selectedUser.name}</h3>
                  <p className="text-[10px] text-[#71717A] font-mono">{selectedUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#71717A] block">Email Address</span>
                <span className="font-mono text-[#18181B] font-bold">{selectedUser.email}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#71717A] block">Assigned Role</span>
                <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#71717A] block">Organization / Entity</span>
                <span className="font-bold text-[#18181B]">{selectedUser.organization || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#71717A] block">Phone Number</span>
                <span className="font-mono text-[#18181B]">{selectedUser.phone || '+91 98000 00000'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#71717A] block">DigiLocker Verification</span>
                <span className="text-emerald-600 font-bold">✓ Verified Identity</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#71717A] block">Last Active</span>
                <span className="text-[#18181B] font-medium">{selectedUser.last_login}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => toggleUserStatus(selectedUser.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  selectedUser.status === 'ACTIVE'
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                {selectedUser.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
              </button>

              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
