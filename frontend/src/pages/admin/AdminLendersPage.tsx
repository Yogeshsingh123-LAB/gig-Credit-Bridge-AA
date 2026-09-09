import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, CheckCircle2, Clock, AlertTriangle, Search, Filter,
  Plus, ArrowUpDown, ChevronRight, X, Loader2, AlertCircle
} from 'lucide-react';
import { apiService } from '../../services/api';
import { LenderOrganizationItem, LenderSummaryStats } from '../../types';

export const AdminLendersPage: React.FC = () => {
  const navigate = useNavigate();
  const [lenders, setLenders] = useState<LenderOrganizationItem[]>([]);
  const [stats, setStats] = useState<LenderSummaryStats>({
    total_lenders: 0,
    active_lenders: 0,
    pending_lenders: 0,
    suspended_lenders: 0,
    deactivated_lenders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    organization_name: '',
    organization_identifier: '',
    contact_email: '',
    contact_person: '',
    status: 'PENDING'
  });

  const fetchLenders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getLenders({
        search,
        status: statusFilter,
        sort_by: sortBy,
        sort_dir: sortDir
      });
      setLenders(res.items || []);
      if (res.summary) {
        setStats(res.summary);
      }
    } catch (err: any) {
      console.error('Failed to load lenders:', err);
      setError(err.response?.data?.detail || 'Unable to load lender information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLenders();
  }, [search, statusFilter, sortBy, sortDir]);

  const handleCreateLender = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Form Validation
    if (!formData.organization_name.trim()) {
      setFormError('Organization Name is required.');
      return;
    }
    if (!formData.organization_identifier.trim()) {
      setFormError('Organization Identifier is required.');
      return;
    }
    if (!formData.contact_email.trim() || !formData.contact_email.includes('@')) {
      setFormError('Valid official contact email is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.createLender({
        organization_name: formData.organization_name.trim(),
        organization_identifier: formData.organization_identifier.trim().toUpperCase(),
        contact_email: formData.contact_email.trim().toLowerCase(),
        contact_person: formData.contact_person.trim() || undefined,
        status: formData.status
      });

      setShowAddModal(false);
      setFormData({
        organization_name: '',
        organization_identifier: '',
        contact_email: '',
        contact_person: '',
        status: 'PENDING'
      });
      fetchLenders();
    } catch (err: any) {
      console.error('Failed to create lender:', err);
      const detail = err.response?.data?.detail;
      setFormError(typeof detail === 'string' ? detail : 'A lender with this organization identifier already exists.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            ACTIVE
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
            PENDING
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5"></span>
            SUSPENDED
          </span>
        );
      case 'DEACTIVATED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            DEACTIVATED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7 text-indigo-400" />
            Lender Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage financial institutions, lender access permissions, and user accounts.
          </p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Lender</span>
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Lenders</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.total_lenders}</p>
          <p className="text-[11px] text-slate-400 mt-1">Registered Organizations</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{stats.active_lenders}</p>
          <p className="text-[11px] text-slate-400 mt-1">Operational Access</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{stats.pending_lenders}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting Activation</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Suspended</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400">{stats.suspended_lenders}</p>
          <p className="text-[11px] text-slate-400 mt-1">Temporarily Restricted</p>
        </div>
      </div>

      {/* Controls & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search lenders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter & Sort */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-300">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-sm"
            >
              <option value="ALL" className="bg-slate-900">All Statuses</option>
              <option value="ACTIVE" className="bg-slate-900">Active</option>
              <option value="PENDING" className="bg-slate-900">Pending</option>
              <option value="SUSPENDED" className="bg-slate-900">Suspended</option>
              <option value="DEACTIVATED" className="bg-slate-900">Deactivated</option>
            </select>
          </div>

          <button
            onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={`Sort ${sortDir === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
            <span className="text-sm font-medium">Loading lender directory...</span>
          </div>
        ) : error ? (
          <div className="py-12 px-4 text-center">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <p className="text-slate-200 font-semibold text-base">{error}</p>
            <p className="text-sm text-slate-400 mt-1 mb-4">Please verify your connection and try again.</p>
            <button
              onClick={fetchLenders}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : lenders.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">NO LENDERS YET</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              {search || statusFilter !== 'ALL'
                ? 'No lender organizations matched your search criteria.'
                : 'Create your first lender organization to enable lender access to CredBridge report verification.'}
            </p>
            <button
              onClick={() => {
                setFormError(null);
                setShowAddModal(true);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Lender</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Lender ID</th>
                  <th className="px-6 py-3.5">Organization</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Users</th>
                  <th className="px-6 py-3.5">Reports Verified</th>
                  <th className="px-6 py-3.5">Created Date</th>
                  <th className="px-6 py-3.5">Last Activity</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {lenders.map((org) => (
                  <tr
                    key={org.id}
                    onClick={() => navigate(`/admin/lenders/${org.lender_id}`)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-mono text-indigo-400 font-semibold">
                      {org.lender_id}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {org.organization_name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          ID: {org.organization_identifier} • {org.contact_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(org.status)}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <span className="font-medium text-white">{org.user_count}</span> users
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <span className="font-medium text-white">{org.reports_verified}</span> reports
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {org.created_at}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {org.last_activity}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/lenders/${org.lender_id}`);
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-semibold transition-colors"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE LENDER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  CREATE LENDER
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Register a financial institution organization on CredBridge.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-start space-x-2.5 text-rose-300 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateLender} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Organization Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Finance Pvt. Ltd."
                  value={formData.organization_name}
                  onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Organization Identifier <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC-FINANCE-IN"
                  value={formData.organization_identifier}
                  onChange={(e) => setFormData({ ...formData, organization_identifier: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                />
                <p className="text-[11px] text-slate-500 mt-1">Unique institutional code (e.g. CIN, LEI, or RBI License Reg No).</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Official Contact Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@abcfinance.demo"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Initial Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="PENDING">Pending (Recommended for new organizations)</option>
                  <option value="ACTIVE">Active (Immediate verification access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating lender...</span>
                    </>
                  ) : (
                    <span>Create Lender</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
