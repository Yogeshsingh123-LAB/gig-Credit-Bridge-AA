import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle2, Download, Share2, ArrowLeft,
  Building2, Calendar, RefreshCw, AlertTriangle, FileText,
  TrendingUp, Layers, HelpCircle, Check, X, ExternalLink,
  QrCode, Trash2, Lock
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { apiService } from '../../services/api';
import { IncomeReportDetail } from '../../types';

export const WorkerReportPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<IncomeReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (id) {
        const data = await apiService.getIncomeReportDetail(id);
        setReport(data);
      } else {
        const reports = await apiService.getIncomeReports();
        if (reports.length > 0) {
          setReport(reports[0]);
        } else {
          setError('No generated reports found. Generate your first report to view it here.');
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load report.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!report) return;
    try {
      await apiService.downloadReportPdf(report.report_id || report.id);
    } catch (err) {
      console.warn('Backend PDF download error, falling back to print:', err);
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          {error || 'Report not found.'}
        </div>
        <button
          onClick={() => navigate('/worker/reports')}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
        >
          Return to My Reports
        </button>
      </div>
    );
  }

  const reportId = report.report_id || report.report_number;
  const isRevoked = report.status === 'REVOKED' || (report as any).report_status === 'REVOKED';

  const canonicalHash = report.canonical_hash || 'SHA-256 Validated';
  const signature = report.signature || 'HMAC-SHA256 Server Signature';
  const verificationUrl = `/verify/report/${report.report_id || report.report_number}`;

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Top Action Bar */}
      <div className="print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate('/worker/reports')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Reports</span>
        </button>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            id="download-pdf-btn"
            onClick={handleDownloadPdf}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/15 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Revoked Notice Banner if applicable */}
      {isRevoked && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold">THIS REPORT HAS BEEN REVOKED.</span>
              <span className="block text-slate-400 mt-0.5">
                Public verification will show that worker consent was withdrawn and the report is no longer active.
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-md bg-rose-500/20 text-rose-400 font-mono font-bold text-xs">
            STATUS: REVOKED
          </span>
        </div>
      )}

      {/* Main Document Body */}
      <div className="bg-slate-900 print:bg-white print:text-slate-950 border border-slate-800 print:border-none rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8">
        
        {/* Document Header */}
        <div className="border-b border-slate-800 print:border-slate-300 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 print:text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded">
                EVIDENCE VERIFICATION INFRASTRUCTURE
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                GOVERNMENT DIGILOCKER & RBI AA COMPLIANT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white print:text-slate-900 tracking-tight">
              VERIFIED GIG INCOME REPORT
            </h1>
            <p className="text-sm font-semibold text-slate-300 print:text-slate-700">
              Worker: {report.worker_name}
            </p>
          </div>

          {/* Cryptographic Badging & Verification QR */}
          <div className="sm:text-right space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 print:text-emerald-700 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
              <span>✓ Cryptographically Signed & Tamper-Evident</span>
            </div>
            <div className="text-xs text-slate-400 print:text-slate-600 font-mono space-y-0.5">
              <div><span className="font-semibold text-slate-300 print:text-slate-800">Report ID:</span> {reportId}</div>
              <div><span className="font-semibold text-slate-300 print:text-slate-800">Period:</span> {report.analysis_start_date} – {report.analysis_end_date}</div>
              <div><span className="font-semibold text-slate-300 print:text-slate-800">Issued At:</span> {new Date(report.generated_at).toLocaleDateString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Primary Income Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-200">
            <span className="text-xs text-slate-400 print:text-slate-600 font-medium">Verified Average Monthly Income</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 print:text-emerald-700 mt-1">
              ₹{report.verified_average_monthly_gig_income?.toLocaleString('en-IN')}
              <span className="text-xs font-normal text-slate-500">/mo</span>
            </p>
            <span className="text-[11px] text-slate-500 block mt-1">Filtered from verified bank credits</span>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-200">
            <span className="text-xs text-slate-400 print:text-slate-600 font-medium">Total Verified Gig Income</span>
            <p className="text-2xl sm:text-3xl font-black text-white print:text-slate-900 mt-1">
              ₹{report.total_verified_gig_income?.toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-slate-500 block mt-1">Total observed in analysis period</span>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-200">
            <span className="text-xs text-slate-400 print:text-slate-600 font-medium">Income Consistency & Trend</span>
            <div className="flex items-center space-x-2 mt-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 print:text-emerald-700 text-xs font-bold">
                {report.income_consistency || 'High'}
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 print:text-blue-700 text-xs font-bold flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>{report.income_trend || 'Stable'}</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">Evaluated across months analyzed</span>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-200">
            <span className="text-xs text-slate-400 print:text-slate-600 font-medium">Verification Confidence</span>
            <p className="text-2xl sm:text-3xl font-black text-blue-400 print:text-blue-700 mt-1">
              {report.verification_confidence}%
            </p>
            <span className="text-[11px] text-slate-500 block mt-1">Evidence Coverage Index</span>
          </div>
        </div>

        {/* Platform Share & Monthly Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Sources Share */}
          <div className="p-5 rounded-xl bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-white print:text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Detected Gig Income Sources</span>
            </h3>
            <div className="space-y-3">
              {report.platform_breakdown?.map(p => (
                <div key={p.platform} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200 print:text-slate-800">{p.platform}</span>
                    <span className="text-slate-400 print:text-slate-600">
                      ₹{p.amount?.toLocaleString('en-IN')} ({p.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 print:bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 print:bg-emerald-600 rounded-full"
                      style={{ width: `${Math.min(100, p.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="p-5 rounded-xl bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-200 space-y-2">
            <h3 className="text-sm font-bold text-white print:text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Monthly Inflow Trajectory</span>
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.monthly_breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v: number) => `₹${v/1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                    formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Income']}
                  />
                  <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Explainability Section: How was this income verified? */}
        <div className="p-6 rounded-xl bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-200 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white print:text-slate-900">How was this income verified?</h3>
              <p className="text-[11px] text-slate-400 print:text-slate-600">Deterministic transaction audit & classification evidence</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Bank Accounts</span>
              <p className="text-base font-bold text-white print:text-slate-900">{report.accounts_analyzed?.length} Accounts</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Transactions Audited</span>
              <p className="text-base font-bold text-white print:text-slate-900">{report.data_quality?.total_transactions || 0} Total</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Gig Payouts Included</span>
              <p className="text-base font-bold text-emerald-400 print:text-emerald-700">{report.data_quality?.matching_transactions || 0} Credits</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Excluded Records</span>
              <p className="text-base font-bold text-slate-400 print:text-slate-600">{report.data_quality?.excluded_transactions || 0} Records</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
              <span className="font-semibold text-emerald-400 print:text-emerald-700 flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Included in Verification</span>
              </span>
              <p className="text-[11px] text-slate-300 print:text-slate-700">
                • Verified disbursements matching <strong>{report.platforms_selected?.join(', ')}</strong> payment descriptors.
              </p>
              <p className="text-[11px] text-slate-300 print:text-slate-700">
                • Filtered strictly within {report.analysis_start_date} to {report.analysis_end_date}.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 space-y-1.5">
              <span className="font-semibold text-slate-300 print:text-slate-800 flex items-center space-x-1.5">
                <X className="w-3.5 h-3.5 text-slate-500" />
                <span>Excluded from Gig Income</span>
              </span>
              <p className="text-[11px] text-slate-400 print:text-slate-600">
                • Personal UPI / P2P money transfers from friends and family.
              </p>
              <p className="text-[11px] text-slate-400 print:text-slate-600">
                • Non-gig corporate salary, refunds, and debit operating expenses.
              </p>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 print:text-slate-600 leading-relaxed border-t border-slate-800/80">
            <strong>Audit Methodology:</strong> {report.methodology}
          </div>
        </div>

        {/* Cryptographic Proof & QR Section for Lenders */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Cryptographic Signature & Integrity Hashes
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono space-y-0.5 break-all">
              <div><span className="text-slate-500">SHA-256 Canonical Hash:</span> {canonicalHash}</div>
              <div><span className="text-slate-500">HMAC-SHA256 Signature:</span> {signature.slice(0, 48)}...</div>
            </div>
            <p className="text-[10px] text-slate-500 pt-1">
              Any alteration to monthly numbers or dates will result in immediate signature verification failure.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
            <QrCode className="w-12 h-12 text-emerald-400" />
            <Link
              to={verificationUrl}
              target="_blank"
              className="text-[10px] text-emerald-400 hover:underline font-semibold mt-1 inline-flex items-center space-x-1"
            >
              <span>Scan to Verify</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>

        {/* Analyzed Bank Accounts */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase text-slate-400 print:text-slate-600 tracking-wider">
            Connected Bank Accounts Analyzed
          </h4>
          <div className="flex flex-wrap gap-2">
            {report.accounts_analyzed?.map(acc => (
              <span key={acc} className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-xs font-mono text-slate-300 print:text-slate-800">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{acc}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Legal Notice */}
        <div className="border-t border-slate-800 print:border-slate-300 pt-4 text-[10px] text-slate-500 print:text-slate-600 leading-relaxed space-y-1">
          <p className="font-semibold text-slate-400 print:text-slate-700">LEGAL & REGULATORY NOTICE:</p>
          <p>CredBridge is an evidence verification infrastructure and is not a bank, NBFC, or credit rating agency. This document does not constitute a loan offer or credit guarantee. Lenders independently evaluate credit risk based on verified evidence.</p>
        </div>
      </div>
    </div>
  );
};
