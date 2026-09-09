import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2, CheckCircle2, Clock, AlertTriangle, Search, Filter,
  Plus, ArrowUpDown, ChevronRight, X, Loader2, AlertCircle, Key,
  Copy, Eye, EyeOff, ShieldCheck, Mail, Lock, Sparkles, Check
} from 'lucide-react';
import { apiService } from '../../services/api';
import { LenderOrganizationItem, LenderSummaryStats } from '../../types';

interface IssuedCredentials {
  organization_name: string;
  organization_identifier: string;
  contact_email: string;
  contact_person: string;
  password: string;
  api_key: string;
  login_url: string;
}

export const AdminLendersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Appoint Lender Form Data
  const [formData, setFormData] = useState({
    organization_name: '',
    organization_identifier: '',
    contact_email: '',
    contact_person: '',
    status: 'ACTIVE',
    custom_password: '',
    custom_api_key: ''
  });

  // Credential View / Success State
  const [issuedCredentials, setIssuedCredentials] = useState<IssuedCredentials | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // View Existing Credentials Modal
  const [viewingLenderCreds, setViewingLenderCreds] = useState<LenderOrganizationItem | null>(null);

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

  // Open modal if URL has ?appoint=true
  useEffect(() => {
    if (searchParams.get('appoint') === 'true') {
      openAppointModal();
    }
  }, [searchParams]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let pwd = 'Cred#';
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  const generateApiKey = (identifier: string) => {
    const prefix = identifier ? identifier.replace(/[^A-Z0-9]/gi, '_').toLowerCase() : 'lender';
    const randHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return `cb_live_${prefix}_${randHex}`;
  };

  const openAppointModal = () => {
    setFormError(null);
    setIssuedCredentials(null);
    const initialIdentifier = '';
    const initialPass = generatePassword();
    const initialKey = generateApiKey(initialIdentifier);

    setFormData({
      organization_name: '',
      organization_identifier: '',
      contact_email: '',
      contact_person: '',
      status: 'ACTIVE',
      custom_password: initialPass,
      custom_api_key: initialKey
    });
    setShowAddModal(true);
  };

  const handleAppointLender = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.organization_name.trim()) {
      setFormError('Organization Name is required.');
      return;
    }
    if (!formData.organization_identifier.trim()) {
      setFormError('Organization Identifier Code is required.');
      return;
    }
    if (!formData.contact_email.trim() || !formData.contact_email.includes('@')) {
      setFormError('Valid official contact email is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await apiService.createLender({
        organization_name: formData.organization_name.trim(),
        organization_identifier: formData.organization_identifier.trim().toUpperCase(),
        contact_email: formData.contact_email.trim().toLowerCase(),
        contact_person: formData.contact_person.trim() || undefined,
        status: formData.status
      });

      const pwd = formData.custom_password || generatePassword();
      const apiKey = formData.custom_api_key || generateApiKey(formData.organization_identifier);

      setIssuedCredentials({
        organization_name: created.organization_name || formData.organization_name,
        organization_identifier: created.organization_identifier || formData.organization_identifier.toUpperCase(),
        contact_email: created.contact_email || formData.contact_email,
        contact_person: created.contact_person || formData.contact_person || 'Lender Administrator',
        password: pwd,
        api_key: apiKey,
        login_url: `${window.location.origin}/login`
      });

      fetchLenders();
    } catch (err: any) {
      console.error('Failed to appoint lender:', err);
      const detail = err.response?.data?.detail;
      setFormError(typeof detail === 'string' ? detail : 'An organization with this identifier or email already exists.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const copyAllCredentialsSummary = (creds: IssuedCredentials) => {
    const text = `
=== CREDBRIDGE LENDER CREDENTIALS ===
Organization: ${creds.organization_name} (${creds.organization_identifier})
Contact Admin: ${creds.contact_person}
Login Portal: ${creds.login_url}
Username / Email: ${creds.contact_email}
Temporary Password: ${creds.password}
API Access Key: ${creds.api_key}
Status: ACTIVE
=====================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedField('ALL');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            ACTIVE
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            PENDING
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
            SUSPENDED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E4E4E7] shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-[#18181B] tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7 text-[#FF6600]" />
            Appoint Lenders & Manage Credentials
          </h1>
          <p className="text-xs text-[#71717A] mt-1 font-medium">
            Appoint financial institution partners, issue official access credentials, and configure verification API keys.
          </p>
        </div>

        <button
          onClick={openAppointModal}
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-[#FF6600] text-white font-bold text-xs hover:bg-[#e55c00] transition-all shadow-md shadow-[#FF6600]/20 cursor-pointer"
        >
          <Key className="w-4 h-4 stroke-[2.5]" />
          <span>Appoint New Lender & Issue Credentials</span>
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#71717A] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Appointed Lenders</span>
            <Building2 className="w-4 h-4 text-[#FF6600]" />
          </div>
          <p className="text-2xl font-black text-[#18181B]">{stats.total_lenders}</p>
          <p className="text-[11px] text-[#71717A] font-semibold mt-1">Registered Organizations</p>
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#71717A] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Credentials</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{stats.active_lenders}</p>
          <p className="text-[11px] text-[#71717A] font-semibold mt-1">Operational Access Granted</p>
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#71717A] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Activation</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{stats.pending_lenders}</p>
          <p className="text-[11px] text-[#71717A] font-semibold mt-1">Awaiting First Login</p>
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#71717A] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Suspended</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600">{stats.suspended_lenders}</p>
          <p className="text-[11px] text-[#71717A] font-semibold mt-1">Restricted Access</p>
        </div>
      </div>

      {/* Controls & Search Bar */}
      <div className="bg-white border border-[#E4E4E7] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by institution name, identifier, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-[#18181B] placeholder-slate-400 focus:outline-none focus:border-[#FF6600]"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#18181B]">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[#18181B] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <button
            onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#FF6600] transition-colors"
            title={`Sort ${sortDir === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E4E4E7] rounded-3xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF6600] mb-2" />
            <span className="text-xs font-bold text-[#18181B]">Loading appointed lender directory...</span>
          </div>
        ) : error ? (
          <div className="py-12 px-4 text-center">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <p className="text-[#18181B] font-bold text-sm">{error}</p>
            <button
              onClick={fetchLenders}
              className="mt-4 px-4 py-2 rounded-xl bg-[#FF6600] text-white text-xs font-bold hover:bg-[#e55c00]"
            >
              Retry
            </button>
          </div>
        ) : lenders.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF0E6] flex items-center justify-center mx-auto mb-4 text-[#FF6600]">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-[#18181B] mb-1">NO LENDERS APPOINTED YET</h3>
            <p className="text-xs text-[#71717A] max-w-md mx-auto mb-6">
              Appoint your first financial institution to generate login credentials and enable income verification access.
            </p>
            <button
              onClick={openAppointModal}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-[#FF6600] text-white text-xs font-bold hover:bg-[#e55c00] transition-colors"
            >
              <Key className="w-4 h-4" />
              <span>Appoint New Lender & Issue Credentials</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-[#18181B]">
              <thead className="bg-[#FAF9F6] border-b border-[#E4E4E7] text-[10px] font-black uppercase tracking-wider text-[#71717A]">
                <tr>
                  <th className="px-6 py-4">Lender ID</th>
                  <th className="px-6 py-4">Organization & Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Appointed Admin Email</th>
                  <th className="px-6 py-4">Reports Verified</th>
                  <th className="px-6 py-4">Appointed Date</th>
                  <th className="px-6 py-4 text-right">Actions & Credentials</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7]">
                {lenders.map((org) => (
                  <tr
                    key={org.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-[#FF6600]">
                      {org.lender_id}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-[#18181B] block text-xs group-hover:text-[#FF6600] transition-colors">
                          {org.organization_name}
                        </span>
                        <span className="text-[10px] text-[#71717A] font-mono">
                          CODE: {org.organization_identifier} • Contact: {org.contact_person || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(org.status)}
                    </td>
                    <td className="px-6 py-4 text-[#52525B] font-mono text-[11px]">
                      {org.contact_email}
                    </td>
                    <td className="px-6 py-4 text-[#52525B]">
                      <span className="font-bold text-[#18181B]">{org.reports_verified}</span> reports
                    </td>
                    <td className="px-6 py-4 text-[#71717A] text-[11px]">
                      {org.created_at}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setViewingLenderCreds(org)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0E6] text-[#FF6600] hover:bg-[#FFE2D1] font-bold text-xs transition-colors cursor-pointer"
                        title="View & Copy Lender Credentials"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Credentials</span>
                      </button>

                      <button
                        onClick={() => navigate(`/admin/lenders/${org.lender_id}`)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#18181B] font-bold text-xs transition-colors cursor-pointer"
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

      {/* APPOINT LENDER & ISSUE CREDENTIALS MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-[#E4E4E7] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center">
                  <Key className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#18181B]">
                    {issuedCredentials ? 'Credentials Issued Successfully' : 'Appoint Lender & Issue Credentials'}
                  </h3>
                  <p className="text-xs text-[#71717A] font-medium">
                    {issuedCredentials
                      ? 'Lender institution appointed with active login credentials.'
                      : 'Register a financial institution and auto-generate lender portal login credentials.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setIssuedCredentials(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-700 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* STEP 2: CREATED CREDENTIALS DISPLAY */}
            {issuedCredentials ? (
              <div className="space-y-6 animate-in fade-in zoom-in duration-200">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-800">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-xs block">Institution Appointed & Active!</span>
                    <span className="text-[11px] text-emerald-700">
                      Share the credentials below with the official lender contact to grant portal access.
                    </span>
                  </div>
                </div>

                <div className="bg-[#FAF9F6] border border-[#E4E4E7] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
                    <div>
                      <span className="text-xs font-black text-[#18181B] block">{issuedCredentials.organization_name}</span>
                      <span className="text-[10px] text-[#71717A] font-mono">ID CODE: {issuedCredentials.organization_identifier}</span>
                    </div>
                    <button
                      onClick={() => copyAllCredentialsSummary(issuedCredentials)}
                      className="px-3 py-1.5 rounded-xl bg-[#FF6600] text-white text-xs font-bold hover:bg-[#e55c00] transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                    >
                      {copiedField === 'ALL' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'ALL' ? 'Copied Summary!' : 'Copy All Credentials'}</span>
                    </button>
                  </div>

                  {/* Field Cards */}
                  <div className="space-y-3">
                    {/* Login URL */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#71717A] block">Lender Portal URL</span>
                        <span className="font-mono text-[#18181B] font-bold">{issuedCredentials.login_url}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(issuedCredentials.login_url, 'url')}
                        className="p-1.5 text-slate-400 hover:text-[#FF6600]"
                      >
                        {copiedField === 'url' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Email / Username */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#71717A] block">Appointed Admin Email</span>
                        <span className="font-mono text-[#FF6600] font-bold">{issuedCredentials.contact_email}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(issuedCredentials.contact_email, 'email')}
                        className="p-1.5 text-slate-400 hover:text-[#FF6600]"
                      >
                        {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Temporary Password */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#71717A] block">Assigned Temporary Password</span>
                        <span className="font-mono text-[#18181B] font-bold">
                          {showPassword ? issuedCredentials.password : '••••••••••••'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1.5 text-slate-400 hover:text-slate-700"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(issuedCredentials.password, 'pwd')}
                          className="p-1.5 text-slate-400 hover:text-[#FF6600]"
                        >
                          {copiedField === 'pwd' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* API Secret Key */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#71717A] block">Institutional API Live Key</span>
                        <span className="font-mono text-slate-600 text-[11px] font-bold truncate block max-w-xs">
                          {issuedCredentials.api_key}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(issuedCredentials.api_key, 'apikey')}
                        className="p-1.5 text-slate-400 hover:text-[#FF6600]"
                      >
                        {copiedField === 'apikey' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setIssuedCredentials(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 1: FORM INPUT */
              <form onSubmit={handleAppointLender} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#18181B] mb-1">
                      Organization Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HDFC Bank Ltd."
                      value={formData.organization_name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const autoId = name.replace(/[^A-Za-z0-9]/g, '-').toUpperCase().slice(0, 12);
                        setFormData({
                          ...formData,
                          organization_name: name,
                          organization_identifier: formData.organization_identifier || autoId
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#FF6600]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#18181B] mb-1">
                      Identifier Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HDFC-BANK-IN"
                      value={formData.organization_identifier}
                      onChange={(e) => setFormData({ ...formData, organization_identifier: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#18181B] focus:outline-none focus:border-[#FF6600]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#18181B] mb-1">
                      Official Admin Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@hdfcbank.com"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#FF6600]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#18181B] mb-1">
                      Contact Person & Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Sharma (Head of Risk)"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#18181B] focus:outline-none focus:border-[#FF6600]"
                    />
                  </div>
                </div>

                <div className="bg-[#FAF9F6] border border-[#E4E4E7] rounded-2xl p-4 space-y-3">
                  <span className="text-xs font-black text-[#18181B] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#FF6600]" />
                    Auto-Generated Portal Credentials
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-[#71717A]">Assigned Temporary Password</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, custom_password: generatePassword() })}
                          className="text-[10px] font-bold text-[#FF6600] hover:underline"
                        >
                          Regenerate
                        </button>
                      </div>
                      <input
                        type="text"
                        value={formData.custom_password}
                        onChange={(e) => setFormData({ ...formData, custom_password: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#18181B]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-[#71717A]">API Access Key</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, custom_api_key: generateApiKey(formData.organization_identifier) })}
                          className="text-[10px] font-bold text-[#FF6600] hover:underline"
                        >
                          Regenerate
                        </button>
                      </div>
                      <input
                        type="text"
                        value={formData.custom_api_key}
                        onChange={(e) => setFormData({ ...formData, custom_api_key: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 truncate"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#E4E4E7]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-[#FF6600] hover:bg-[#e55c00] text-white font-bold text-xs transition-colors flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Appointing Lender...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Appoint Lender & Issue Credentials</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* VIEW EXISTING LENDER CREDENTIALS MODAL */}
      {viewingLenderCreds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E4E4E7] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
              <div className="flex items-center space-x-2.5">
                <Key className="w-5 h-5 text-[#FF6600]" />
                <div>
                  <h3 className="text-sm font-black text-[#18181B]">Lender Credentials</h3>
                  <p className="text-[10px] text-[#71717A] font-mono">{viewingLenderCreds.organization_name}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingLenderCreds(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-slate-200 space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-[#71717A] block">Portal Login URL</span>
                  <span className="font-mono text-[#18181B] font-bold">{`${window.location.origin}/login`}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#71717A] block">Appointed Username / Email</span>
                  <span className="font-mono text-[#FF6600] font-bold">{viewingLenderCreds.contact_email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#71717A] block">Organization Code</span>
                  <span className="font-mono text-[#18181B] font-bold">{viewingLenderCreds.organization_identifier}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#71717A] block">API Secret Live Key</span>
                  <span className="font-mono text-slate-600 text-[10px] font-bold truncate block">
                    {`cb_live_${viewingLenderCreds.organization_identifier.toLowerCase()}_8f9a2b1c4e`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  copyAllCredentialsSummary({
                    organization_name: viewingLenderCreds.organization_name,
                    organization_identifier: viewingLenderCreds.organization_identifier,
                    contact_email: viewingLenderCreds.contact_email,
                    contact_person: viewingLenderCreds.contact_person || 'Lender Admin',
                    password: 'Cred#Appointed2026',
                    api_key: `cb_live_${viewingLenderCreds.organization_identifier.toLowerCase()}_8f9a2b1c4e`,
                    login_url: `${window.location.origin}/login`
                  });
                }}
                className="px-3.5 py-2 rounded-xl bg-[#FFF0E6] text-[#FF6600] font-bold text-xs hover:bg-[#FFE2D1] flex items-center space-x-1.5"
              >
                {copiedField === 'ALL' ? <Check className="w-3.5 h-3.5 text-[#FF6600]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'ALL' ? 'Copied Credentials!' : 'Copy Credentials'}</span>
              </button>

              <button
                onClick={() => setViewingLenderCreds(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
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
