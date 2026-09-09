import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, ShieldCheck, FileText, ArrowRight, Info, Link2, 
  Database, Calendar, RefreshCw, Clock, CheckCircle2, AlertTriangle, 
  FileSearch, ChevronRight, BarChart3, Shield
} from 'lucide-react';
import { apiService } from '../../services/api';

export const LenderDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getLenderDashboard();
        setStats(data);
      } catch (err) {
        console.error('Failed to load lender dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] space-y-7 text-[#18181B]">
      
      {/* TOP HERO BANNER */}
      <div className="bg-[#FFF6EE] border border-[#FDE3CF] p-6 sm:p-8 rounded-3xl shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left Content */}
        <div className="space-y-2 max-w-xl z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">
            Lender Assessment Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] font-medium leading-relaxed">
            Consent-verified financial evidence and cashflow intelligence
          </p>
        </div>

        {/* Right Section: Cursive badge + Graphic + CTA Button */}
        <div className="flex flex-col sm:flex-row items-center gap-6 z-10 w-full md:w-auto">
          
          {/* Cursive Handwriting Badge */}
          <div className="hidden lg:block text-right">
            <span className="font-['Caveat',cursive] font-bold text-[#FF6600] text-3xl block leading-tight drop-shadow-2xs">
              Better Insights.<br />More Opportunities.
            </span>
          </div>

          {/* Orange Shield Document Graphic */}
          <div className="w-14 h-14 rounded-2xl bg-[#FF6600] text-white flex items-center justify-center shadow-lg shadow-[#FF6600]/30 shrink-0 hidden sm:flex">
            <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
          </div>

          {/* Primary CTA Button */}
          <button
            onClick={() => navigate('/lender/applicants')}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl bg-[#FF6600] hover:bg-[#E65C00] text-white font-extrabold text-xs shadow-md shadow-[#FF6600]/25 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Users className="w-4 h-4" />
            <span>View Shared Applicants</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Ambient Decorative Background Light */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#FF6600]/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* INFO NOTICE BANNER */}
      <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-xs text-[#1E40AF] flex items-start space-x-3 shadow-2xs">
        <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          <strong className="font-extrabold text-[#1E3A8A]">Assessment Support Only:</strong> CredBridge provides analytical evidence support and deterministic cashflow metrics. CredBridge does NOT approve or reject loan applications or generate official bureau credit scores.
        </p>
      </div>

      {/* 3 PRIMARY KPI METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Shared Applicants */}
        <div 
          onClick={() => navigate('/lender/applicants')}
          className="bg-white p-6 rounded-3xl border border-[#E4E4E7] shadow-xs hover:border-[#FF6600]/40 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#18181B] block">Shared Applicants</span>
              <div className="text-3xl font-black text-[#18181B] mt-1 tracking-tight">
                {stats?.shared_applicants_count ?? 0}
              </div>
              <span className="text-[11px] text-[#71717A] font-semibold mt-0.5 block">Active Worker Consents</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#FFF0E6] group-hover:text-[#FF6600] text-slate-400 flex items-center justify-center transition-colors">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Card 2: Active Passports */}
        <div 
          onClick={() => navigate('/lender/applicants')}
          className="bg-white p-6 rounded-3xl border border-[#E4E4E7] shadow-xs hover:border-[#FF6600]/40 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#18181B] block">Active Passports</span>
              <div className="text-3xl font-black text-[#18181B] mt-1 tracking-tight">
                {stats?.active_passports_count ?? 0}
              </div>
              <span className="text-[11px] text-[#71717A] font-semibold mt-0.5 block">Verified Evidence Documents</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#FFF0E6] group-hover:text-[#FF6600] text-slate-400 flex items-center justify-center transition-colors">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Card 3: Average Readiness Score */}
        <div 
          onClick={() => navigate('/lender/applicants')}
          className="bg-white p-6 rounded-3xl border border-[#E4E4E7] shadow-xs hover:border-[#FF6600]/40 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#18181B] block">Average Readiness Score</span>
              <div className="text-3xl font-black text-[#18181B] mt-1 tracking-tight">
                {stats?.average_readiness_score ?? 0} <span className="text-lg font-bold text-[#71717A]">/ 100</span>
              </div>
              <span className="text-[11px] text-[#71717A] font-semibold mt-0.5 block">Across Permitted Applicants</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#FFF0E6] group-hover:text-[#FF6600] text-slate-400 flex items-center justify-center transition-colors">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

      </div>

      {/* FINANCIAL DATA STATUS & INGESTION HEALTH SECTION */}
      <div className="bg-white p-6 rounded-3xl border border-[#E4E4E7] shadow-xs space-y-5">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#18181B] tracking-tight">
                Financial Data Status & Ingestion Health
              </h3>
              <p className="text-xs text-[#71717A] font-medium">
                Account Aggregator gateway telemetry and data freshness
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-extrabold flex items-center space-x-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse"></span>
            <span>AA Gateway Healthy</span>
          </span>
        </div>

        {/* 5 Telemetry Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
          
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-[#71717A] text-[11px] font-bold">
              <Link2 className="w-3.5 h-3.5" />
              <span>Connected Accounts</span>
            </div>
            <span className="text-xl font-black text-[#18181B] block pt-1">0 / 0</span>
            <span className="text-[10px] text-[#A1A1AA] font-semibold block">No accounts linked yet</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-[#71717A] text-[11px] font-bold">
              <Database className="w-3.5 h-3.5" />
              <span>Data Freshness</span>
            </div>
            <span className="text-xl font-black text-[#15803D] block pt-1">Not Available</span>
            <span className="text-[10px] text-[#A1A1AA] font-semibold block">Awaiting data</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-[#71717A] text-[11px] font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Financial History</span>
            </div>
            <span className="text-xl font-black text-[#18181B] block pt-1">12 Months</span>
            <span className="text-[10px] text-[#A1A1AA] font-semibold block">Fixed Window</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-[#71717A] text-[11px] font-bold">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Status</span>
            </div>
            <span className="text-xl font-black text-[#18181B] block pt-1">Not Started</span>
            <span className="text-[10px] text-[#A1A1AA] font-semibold block">Event-driven</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-[#71717A] text-[11px] font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>Last Synced</span>
            </div>
            <span className="text-xl font-black text-[#18181B] block pt-1">—</span>
            <span className="text-[10px] text-[#A1A1AA] font-semibold block">No sync yet</span>
          </div>

        </div>

      </div>

      {/* VERIFICATION STATUS BREAKDOWN SECTION */}
      <div className="bg-white p-6 rounded-3xl border border-[#E4E4E7] shadow-xs space-y-5">
        
        {/* Section Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#18181B] tracking-tight">
              Verification Status Breakdown
            </h3>
            <p className="text-xs text-[#71717A] font-medium">
              Status of shared applicant documents and verification
            </p>
          </div>
        </div>

        {/* 4 Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          
          {/* Status 1: Verified */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-extrabold text-[#18181B]">
              <div className="w-6 h-6 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span>Verified</span>
            </div>
            <span className="text-3xl font-black text-[#18181B] block pt-1">
              {stats?.verification_distribution?.VERIFIED ?? 0}
            </span>
            <span className="text-[11px] text-[#71717A] font-semibold block">Fully verified documents</span>
          </div>

          {/* Status 2: Partially Verified */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-extrabold text-[#18181B]">
              <div className="w-6 h-6 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span>Partially Verified</span>
            </div>
            <span className="text-3xl font-black text-[#18181B] block pt-1">
              {stats?.verification_distribution?.PARTIALLY_VERIFIED ?? 0}
            </span>
            <span className="text-[11px] text-[#71717A] font-semibold block">Some documents pending</span>
          </div>

          {/* Status 3: Insufficient Data */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-extrabold text-[#18181B]">
              <div className="w-6 h-6 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span>Insufficient Data</span>
            </div>
            <span className="text-3xl font-black text-[#18181B] block pt-1">
              {stats?.verification_distribution?.INSUFFICIENT_DATA ?? 0}
            </span>
            <span className="text-[11px] text-[#71717A] font-semibold block">Additional data required</span>
          </div>

          {/* Status 4: Review Required */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-extrabold text-[#18181B]">
              <div className="w-6 h-6 rounded-full bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0">
                <FileSearch className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span>Review Required</span>
            </div>
            <span className="text-3xl font-black text-[#18181B] block pt-1">
              {stats?.verification_distribution?.REVIEW_REQUIRED ?? 0}
            </span>
            <span className="text-[11px] text-[#71717A] font-semibold block">Under manual review</span>
          </div>

        </div>

      </div>

    </div>
  );
};
