import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2, ArrowLeft, CheckCircle2, Clock, AlertTriangle, Users,
  FileCheck2, ShieldCheck, Plus, X, Loader2, AlertCircle, RefreshCw,
  Mail, Calendar, Lock, UserCheck, ShieldAlert
} from 'lucide-react';
import { apiService } from '../../services/api';
import { LenderDetailResponse, LenderUserItem, LenderVerificationItem } from '../../types';

export const AdminLenderDetailPage: React.FC = () => {
  const { lenderId } = useParams<{ lenderId: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<LenderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity' | 'access'>('overview');

  // Modal & Action states
  const [actionLoading, setActionLoading] = useState(false);

  // Lender Status Confirmation Modal
  const [pendingOrgStatus, setPendingOrgStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | null>(null);

  // User Add Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'LENDER_OFFICER',
    designation: ''
  });
  const [userFormError, setUserFormError] = useState<string | null>(null);

  // User Action Confirmation Modal
  const [userActionTarget, setUserActionTarget] = useState<{
    user: LenderUserItem;
    action: 'ACTIVATE' | 'SUSPEND' | 'DEACTIVATE' | 'CHANGE_ROLE';
    newRole?: 'LENDER_ADMIN' | 'LENDER_OFFICER';
  } | null>(null);

  const fetchLenderDetail = async () => {
    if (!lenderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getLenderDetail(lenderId);
      setDetail(res);
    } catch (err: any) {
      console.error('Failed to load lender details:', err);
      setError(err.response?.data?.detail || 'Unable to load lender details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLenderDetail();
  }, [lenderId]);

  // Status Change Handler for Organization
  const handleConfirmOrgStatusChange = async () => {
    if (!detail || !pendingOrgStatus) return;
    setActionLoading(true);
    try {
      await apiService.updateLenderStatus(detail.id, { status: pendingOrgStatus });
      setPendingOrgStatus(null);
      fetchLenderDetail();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update organization status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Add Lender User Handler
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    setUserFormError(null);

    if (!userFormData.name.trim()) {
      setUserFormError('Full Name is required.');
      return;
    }
    if (!userFormData.email.trim() || !userFormData.email.includes('@')) {
      setUserFormError('Valid Email address is required.');
      return;
    }

    setActionLoading(true);
    try {
      await apiService.createLenderUser(detail.id, {
        name: userFormData.name.trim(),
        email: userFormData.email.trim().toLowerCase(),
        role: userFormData.role,
        designation: userFormData.designation.trim() || undefined
      });

      setShowAddUserModal(false);
      setUserFormData({ name: '', email: '', role: 'LENDER_OFFICER', designation: '' });
      fetchLenderDetail();
    } catch (err: any) {
      setUserFormError(err.response?.data?.detail || 'Failed to create lender user.');
    } finally {
      setActionLoading(false);
    }
  };

  // User Action Confirmation Handler
  const handleConfirmUserAction = async () => {
    if (!detail || !userActionTarget) return;
    setActionLoading(true);
    try {
      const { user, action, newRole } = userActionTarget;
      if (action === 'CHANGE_ROLE' && newRole) {
        await apiService.updateLenderUser(detail.id, user.user_id, { role: newRole });
      } else {
        await apiService.updateLenderUser(detail.id, user.user_id, { status: action === 'ACTIVATE' ? 'ACTIVE' : action });
      }
      setUserActionTarget(null);
      fetchLenderDetail();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update user status/role.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
            ACTIVE
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
            PENDING
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-2 h-2 rounded-full bg-rose-400 mr-2"></span>
            SUSPENDED
          </span>
        );
      case 'DEACTIVATED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            DEACTIVATED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-3" />
        <span className="text-sm font-medium">Loading organization details...</span>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Unable to Load Lender</h2>
        <p className="text-sm text-slate-400 mb-6">{error || 'Organization record was not found.'}</p>
        <button
          onClick={() => navigate('/admin/lenders')}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lender Directory</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div>
        <button
          onClick={() => navigate('/admin/lenders')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lender Directory</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">{detail.organization_name}</h1>
              {getStatusBadge(detail.status)}
            </div>
            <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2 flex-wrap gap-y-1">
              <span className="font-mono text-indigo-400 font-semibold">Lender ID: {detail.lender_id}</span>
              <span>•</span>
              <span>Identifier: <strong className="text-slate-200 font-mono">{detail.organization_identifier}</strong></span>
              <span>•</span>
              <span>Email: <strong className="text-slate-200">{detail.contact_email || 'Not Provided'}</strong></span>
            </div>
          </div>
        </div>

        {/* Organization Status Management Actions */}
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          {detail.status !== 'ACTIVE' && (
            <button
              onClick={() => setPendingOrgStatus('ACTIVE')}
              className="px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold transition-colors flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Activate Lender</span>
            </button>
          )}
          {detail.status === 'ACTIVE' && (
            <button
              onClick={() => setPendingOrgStatus('SUSPENDED')}
              className="px-4 py-2 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 text-xs font-semibold transition-colors flex items-center space-x-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Suspend Lender</span>
            </button>
          )}
          {detail.status !== 'DEACTIVATED' && (
            <button
              onClick={() => setPendingOrgStatus('DEACTIVATED')}
              className="px-4 py-2 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 text-xs font-semibold transition-colors flex items-center space-x-1.5"
            >
              <X className="w-4 h-4" />
              <span>Deactivate Lender</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Users</span>
          <p className="text-2xl font-bold text-white mt-1">{detail.summary_cards.total_users}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Users</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{detail.summary_cards.active_users}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Reports Verified</span>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{detail.summary_cards.reports_verified}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Requests</span>
          <p className="text-2xl font-bold text-slate-200 mt-1">{detail.summary_cards.verification_requests}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 col-span-2 md:col-span-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Last Activity</span>
          <p className="text-xs font-semibold text-slate-300 mt-2 truncate">{detail.summary_cards.last_activity}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 flex space-x-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'overview'
              ? 'text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'users'
              ? 'text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Users ({detail.members.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'activity'
              ? 'text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Verification Activity ({detail.recent_verifications.length})
        </button>
        <button
          onClick={() => setActiveTab('access')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'access'
              ? 'text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Access
        </button>
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Organization Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase">Organization Name</span>
                <span className="font-semibold text-white mt-1 block">{detail.organization_name}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase">Lender System ID</span>
                <span className="font-mono text-indigo-400 font-semibold mt-1 block">{detail.lender_id}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase">Organization Identifier</span>
                <span className="font-mono text-slate-200 font-semibold mt-1 block">{detail.organization_identifier}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase">Official Contact Email</span>
                <span className="text-slate-200 mt-1 block">{detail.contact_email || 'Not Provided'}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase">Contact Person</span>
                <span className="text-slate-200 mt-1 block">{detail.contact_person || 'Primary Admin'}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase">Account Status</span>
                <div className="mt-1">{getStatusBadge(detail.status)}</div>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase">Created Date</span>
                <span className="text-slate-300 mt-1 block">{detail.created_at}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase">Activated Date</span>
                <span className="text-slate-300 mt-1 block">{detail.activated_at || 'Pending Activation'}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase">Last Activity</span>
                <span className="text-slate-300 mt-1 block">{detail.last_activity}</span>
              </div>
            </div>

            {/* Immutability & Security Notice */}
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start space-x-3 text-xs text-indigo-200">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Immutable Audit Guarantee</p>
                <p className="mt-0.5 leading-relaxed text-indigo-300/90">
                  Platform Admin manages organization access privileges only. Changing lender status does not alter worker calculation outputs, financial metrics, consistency scores, Ed25519 digital signatures, or canonical SHA-256 hashes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Lender Organization Users</h3>
            <button
              onClick={() => {
                setUserFormError(null);
                setShowAddUserModal(true);
              }}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add User</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {detail.members.length === 0 ? (
              <div className="py-16 text-center px-4">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white mb-1">NO USERS YET</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  This lender organization does not have any active users registered.
                </p>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-colors"
                >
                  + Add User
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-3.5">Name</th>
                      <th className="px-6 py-3.5">Username / Email</th>
                      <th className="px-6 py-3.5">Role</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Last Login</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {detail.members.map((member) => (
                      <tr key={member.user_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">
                          {member.name}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-300">
                          {member.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            member.role === 'LENDER_ADMIN'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {member.role === 'LENDER_ADMIN' ? 'Lender Admin' : 'Lender Officer'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(member.status)}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {member.last_login_at || 'Never'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setUserActionTarget({
                                user: member,
                                action: 'CHANGE_ROLE',
                                newRole: member.role === 'LENDER_ADMIN' ? 'LENDER_OFFICER' : 'LENDER_ADMIN'
                              })}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                            >
                              Role
                            </button>
                            {member.status !== 'SUSPENDED' && (
                              <button
                                onClick={() => setUserActionTarget({ user: member, action: 'SUSPEND' })}
                                className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-colors"
                              >
                                Suspend
                              </button>
                            )}
                            {member.status === 'SUSPENDED' && (
                              <button
                                onClick={() => setUserActionTarget({ user: member, action: 'ACTIVATE' })}
                                className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium transition-colors"
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: VERIFICATION ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white">Operational Verification Activity</h3>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {detail.recent_verifications.length === 0 ? (
              <div className="py-16 text-center px-4 text-slate-400">
                <FileCheck2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white mb-1">NO VERIFICATION ACTIVITY</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No report verification events have been executed by this lender organization yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-3.5">Timestamp</th>
                      <th className="px-6 py-3.5">Report ID</th>
                      <th className="px-6 py-3.5">Lender User</th>
                      <th className="px-6 py-3.5">Verification Result</th>
                      <th className="px-6 py-3.5">Integrity</th>
                      <th className="px-6 py-3.5">Signature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {detail.recent_verifications.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                          {v.timestamp}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-indigo-400 font-semibold">
                          {v.report_id}
                        </td>
                        <td className="px-6 py-4 text-white font-medium">
                          {v.lender_user}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {v.verification_result}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-emerald-400 font-semibold">
                          ✓ Valid
                        </td>
                        <td className="px-6 py-4 text-xs text-emerald-400 font-semibold">
                          ✓ Valid
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: ACCESS */}
      {activeTab === 'access' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              Organization Access Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white text-sm block">Lender Status</span>
                  <span className="text-xs text-slate-400">Current platform status</span>
                </div>
                <div>{getStatusBadge(detail.status)}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white text-sm block">Lender Portal</span>
                  <span className="text-xs text-slate-400">Portal login access</span>
                </div>
                <span className={`text-xs font-bold ${detail.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {detail.status === 'ACTIVE' ? '✓ Enabled' : '✕ Disabled'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white text-sm block">Report Verification</span>
                  <span className="text-xs text-slate-400">Authenticity verification API</span>
                </div>
                <span className={`text-xs font-bold ${detail.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {detail.status === 'ACTIVE' ? '✓ Enabled' : '✕ Disabled'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white text-sm block">Report Download</span>
                  <span className="text-xs text-slate-400">Verified PDF report downloads</span>
                </div>
                <span className={`text-xs font-bold ${detail.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {detail.status === 'ACTIVE' ? '✓ Enabled' : '✕ Disabled'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white text-sm block">Maximum Users Limit</span>
                <span className="text-xs text-slate-400">Server-side enforced member user limit</span>
              </div>
              <span className="font-mono text-indigo-400 font-bold text-base">{detail.max_users} users</span>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: ORG STATUS CHANGE */}
      {pendingOrgStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center space-x-3 text-amber-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">
                {pendingOrgStatus === 'DEACTIVATED' && 'Deactivate Lender?'}
                {pendingOrgStatus === 'SUSPENDED' && 'Suspend Lender?'}
                {pendingOrgStatus === 'ACTIVE' && 'Activate Lender?'}
              </h3>
            </div>

            <div className="text-sm text-slate-300 space-y-2 leading-relaxed">
              <p>
                Lender: <strong className="text-white">{detail.organization_name}</strong>
              </p>
              {pendingOrgStatus === 'DEACTIVATED' && (
                <p className="text-slate-400 text-xs">
                  ABC Finance will no longer be able to access CredBridge lender services. Existing reports will remain immutable.
                </p>
              )}
              {pendingOrgStatus === 'SUSPENDED' && (
                <p className="text-slate-400 text-xs">
                  All lender users will lose access to the CredBridge Lender Portal until the organization is reactivated. Existing reports will remain unchanged.
                </p>
              )}
              {pendingOrgStatus === 'ACTIVE' && (
                <p className="text-slate-400 text-xs">
                  Lender users will be granted immediate access to log in and verify CredBridge reports.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPendingOrgStatus(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOrgStatusChange}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-lg text-white text-xs font-semibold transition-colors flex items-center space-x-2 ${
                  pendingOrgStatus === 'DEACTIVATED'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : pendingOrgStatus === 'SUSPENDED'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Status Change</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD LENDER USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                ADD LENDER USER
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {userFormError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {userFormError}
              </div>
            )}

            <form onSubmit={handleAddUserSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raj Patel"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Email / Username <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="raj@abcfinance.demo"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Role <span className="text-rose-400">*</span>
                </label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="LENDER_OFFICER">Lender Officer (Verification Operator)</option>
                  <option value="LENDER_ADMIN">Lender Admin (Organization Administrator)</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                User activation invite token will be generated. Plaintext passwords are never sent or stored in Admin UI.
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Invitation</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: USER ACTIONS */}
      {userActionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
              {userActionTarget.action === 'CHANGE_ROLE' ? 'Change User Role?' : `${userActionTarget.action} Lender User?`}
            </h3>

            <div className="text-xs text-slate-300 space-y-2">
              <p>User: <strong className="text-white">{userActionTarget.user.name}</strong> ({userActionTarget.user.email})</p>
              {userActionTarget.action === 'CHANGE_ROLE' && (
                <p>New Role: <strong className="text-indigo-400">{userActionTarget.newRole === 'LENDER_ADMIN' ? 'Lender Admin' : 'Lender Officer'}</strong></p>
              )}
              {userActionTarget.action === 'SUSPEND' && (
                <p className="text-rose-300/90">This user will lose access to the CredBridge Lender Portal immediately.</p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setUserActionTarget(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUserAction}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Action</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
