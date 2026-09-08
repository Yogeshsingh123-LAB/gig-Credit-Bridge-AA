import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, CheckCircle2, FileCheck, ArrowRight, RefreshCw, 
  Building2, Calendar, Sparkles, PlusCircle, Lock, AlertCircle,
  TrendingUp, Activity
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { IncomeReportDetail, BankAccountItem } from '../../types';

export const WorkerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [latestReport, setLatestReport] = useState<IncomeReportDetail | null>(null);
  const [reportsCount, setReportsCount] = useState<number>(0);
  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const workerProfile = user?.worker_profile;
  const workerName = workerProfile?.identity_name || user?.name || 'Ravi Kumar';
  const maskedAadhaar = workerProfile?.masked_aadhaar || 'XXXXXXXX4821';

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Load reports
      const reports = await apiService.getIncomeReports();
      if (reports && reports.length > 0) {
        setLatestReport(reports[0]);
        setReportsCount(reports.length);
      } else {
        setReportsCount(0);
      }

      // 2. Load authorized bank accounts
      try {
        const accounts = await apiService.getBankAccounts();
        setBankAccounts(accounts);
      } catch (e) {
        console.warn('Bank accounts load error:', e);
      }
    } catch (err: any) {
      console.warn('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const selectedAccountsCount = bankAccounts.filter(a => a.is_selected).length || bankAccounts.length || 2;
  const latestReportId = latestReport?.report_id || latestReport?.report_number || 'None yet';

  const formatISTDate = (isoStr?: string) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      }) + ' IST';
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Personalized Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>DigiLocker Identity ✓ Authenticated</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {workerName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Your financial verification workspace — powered by authorized financial data.
          </p>
        </div>

        <Link
          to="/worker/bank-accounts"
          className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/15 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Generate New Report</span>
        </Link>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Verified Reports (links to /worker/reports) */}
        <Link
          to="/worker/reports"
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider group-hover:text-emerald-400 transition-colors">Verified Reports</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {reportsCount} {reportsCount === 1 ? 'Report' : 'Reports'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
              <span>{reportsCount > 0 ? 'Cryptographically signed' : 'No reports issued yet'}</span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </p>
          </div>
        </Link>

        {/* 2. Latest Report (Section 28: displays authoritative IST timestamp) */}
        <div
          onClick={async () => {
            if (latestReport) {
              await apiService.downloadReportPdf(latestReport.report_id || latestReport.id);
            }
          }}
          className={`p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2 transition-all ${
            latestReport ? 'hover:border-teal-500/40 cursor-pointer group' : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider group-hover:text-teal-400 transition-colors">Latest Report</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-slate-200 truncate" title={latestReportId}>
              {latestReportId}
            </div>
            {latestReport && (
              <p className="text-[10px] text-slate-400 mt-0.5">
                Generated: {formatISTDate(latestReport.issued_at || latestReport.generated_at)}
              </p>
            )}
            <p className="text-[11px] text-teal-400 font-semibold mt-1 flex items-center space-x-1">
              {latestReport ? (
                <span>Click to download PDF ↓</span>
              ) : (
                <span className="text-slate-500">Ready to generate</span>
              )}
            </p>
          </div>
        </div>

        {/* 3. Analysis Period: 12 Months */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Analysis Period</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              12 Months
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Fixed 365-day observation window
            </p>
          </div>
        </div>

        {/* 4. Consistency Score: e.g. 82/100 */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Consistency Score</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">
              {latestReport ? `${latestReport.consistency_score || 82}/100` : 'N/A'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {latestReport ? `${latestReport.income_consistency || 'High'} consistency index` : 'Generate report to compute'}
            </p>
          </div>
        </div>
      </div>

      {/* LATEST REPORT DETAILS OR GETTING STARTED CARD */}
      {latestReport ? (
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Active Verified Evidence
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {latestReport.report_id || latestReport.report_number}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Verified Gig Income Summary (12 Months)
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={async () => {
                  await apiService.downloadReportPdf(latestReport.report_id || latestReport.id);
                }}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/15 cursor-pointer"
              >
                <span>Download PDF</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Core Income Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Verified Monthly Gig Income</span>
              <div className="text-2xl font-black text-emerald-400">
                ₹{latestReport.verified_average_monthly_gig_income?.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-slate-500">/mo</span>
              </div>
              <span className="text-[10px] text-slate-500 block">Calculated from verified bank inflows</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Total 12M Verified Gig Income</span>
              <div className="text-2xl font-black text-white">
                ₹{latestReport.total_verified_gig_income?.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-500 block">Across 12 months observation window</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Consistency Score</span>
              <div className="text-2xl font-black text-emerald-400">
                {latestReport.consistency_score || 82}/100
              </div>
              <span className="text-[10px] text-slate-500 block">{latestReport.income_consistency || 'High'} consistency • {latestReport.income_trend || 'Stable'}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Verification Confidence</span>
              <div className="text-2xl font-black text-blue-400">
                {latestReport.verification_confidence}%
              </div>
              <span className="text-[10px] text-slate-500 block">SHA-256 Tamper-Evident</span>
            </div>
          </div>

          {/* Explanatory summary & quick links */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Income verified automatically from: {latestReport.platforms_selected?.join(', ') || 'QuickRide, FoodDash, UrbanMove'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/worker/reports" className="text-slate-300 hover:text-emerald-400 font-medium underline underline-offset-2">
                View Reports ({reportsCount})
              </Link>
              <Link to="/worker/bank-accounts" className="text-slate-300 hover:text-emerald-400 font-medium underline underline-offset-2">
                Select Bank Accounts
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Ready to Generate Your Verified Report</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            Select your bank accounts to produce a 12-month cryptographically signed income report for lenders.
          </p>
          <div className="pt-2">
            <Link
              to="/worker/bank-accounts"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/15 cursor-pointer"
            >
              <span>+ Generate New Report</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Consistency Score Explanation Box & Statutory Notice (Sections 10 & 11) */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">How Consistency Score Works</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculated deterministically from 12-month earnings data:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-slate-300 block">• Monthly Volatility</span>
            <span className="text-[11px] text-slate-400">Standard deviation vs mean earnings</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-slate-300 block">• Active Earning Months</span>
            <span className="text-[11px] text-slate-400">Number of active earning months out of 12</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-slate-300 block">• Income Trend Direction</span>
            <span className="text-[11px] text-slate-400">Trajectory over 12 calendar months</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-slate-300 block">• Platform Diversification</span>
            <span className="text-[11px] text-slate-400">Inflows across authorized gig platforms</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-xs text-slate-300 font-medium">
          <span>Score range: <strong>0 to 100</strong> • Higher score indicates more predictable, consistent gig income.</span>
        </div>

        {/* Section 10 Statutory Disclaimer */}
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/25 text-amber-300/90 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-amber-300">Statutory Notice: </strong>
            Consistency Score is a statistical observation of historical earnings consistency across authorized accounts. It is not a credit score, credit rating, or credit guarantee. It does not reflect creditworthiness or guarantee loan approval.
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/worker/bank-accounts"
          className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-slate-200 font-semibold text-sm">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Bank Accounts</span>
            </div>
            <p className="text-xs text-slate-400">
              Select and manage linked bank accounts for 12-month income analysis.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/worker/reports"
          className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-slate-200 font-semibold text-sm">
              <FileCheck className="w-4 h-4 text-teal-400" />
              <span>Reports</span>
            </div>
            <p className="text-xs text-slate-400">
              Access past 12-month reports and download cryptographically signed PDFs.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
};
