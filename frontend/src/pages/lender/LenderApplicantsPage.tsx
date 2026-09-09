import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, ShieldCheck, Download, Search, ChevronDown, Eye, 
  Clock, XCircle, CheckCircle2, Filter, ArrowUpRight
} from 'lucide-react';
import { apiService } from '../../services/api';

interface SharedApplicantItem {
  id: string;
  worker_id: string;
  name: string;
  avatar_initials: string;
  avatar_bg: string;
  shared_date: string;
  digilocker_id: string;
  work_type: string;
  platforms: { name: string; bg: string; text: string; logo: string }[];
  extra_platforms_count?: number;
  report_date: string;
  report_time: string;
  consistency_score: number;
  status: 'Active' | 'Pending' | 'Revoked';
}

const DEMO_APPLICANTS: SharedApplicantItem[] = [
  {
    id: '1',
    worker_id: 'worker-101',
    name: 'Aarav Sharma',
    avatar_initials: 'AS',
    avatar_bg: 'bg-[#FFF0E6] text-[#FF6600] border-[#FF6600]/30',
    shared_date: 'Shared on 09 Sep 2026',
    digilocker_id: 'DL-2456-7890-1234',
    work_type: 'Delivery Partner',
    platforms: [
      { name: 'Swiggy', bg: 'bg-[#FC8019]', text: 'text-white', logo: 'S' },
      { name: 'Zomato', bg: 'bg-[#CB202D]', text: 'text-white', logo: 'Z' },
      { name: 'Uber', bg: 'bg-[#000000]', text: 'text-white', logo: 'U' }
    ],
    extra_platforms_count: 2,
    report_date: '09 Sep 2026',
    report_time: '10:35 AM',
    consistency_score: 82,
    status: 'Active'
  },
  {
    id: '2',
    worker_id: 'worker-102',
    name: 'Pooja Khan',
    avatar_initials: 'PK',
    avatar_bg: 'bg-purple-100 text-purple-700 border-purple-300',
    shared_date: 'Shared on 08 Sep 2026',
    digilocker_id: 'DL-1122-3344-5566',
    work_type: 'Rideshare Partner',
    platforms: [
      { name: 'Uber', bg: 'bg-[#000000]', text: 'text-white', logo: 'U' },
      { name: 'Ola', bg: 'bg-[#EAB308]', text: 'text-black', logo: 'O' }
    ],
    extra_platforms_count: 1,
    report_date: '08 Sep 2026',
    report_time: '02:18 PM',
    consistency_score: 76,
    status: 'Active'
  },
  {
    id: '3',
    worker_id: 'worker-103',
    name: 'Rahul Mehta',
    avatar_initials: 'RM',
    avatar_bg: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    shared_date: 'Shared on 05 Sep 2026',
    digilocker_id: 'DL-9988-7766-5544',
    work_type: 'Food Delivery',
    platforms: [
      { name: 'Swiggy', bg: 'bg-[#FC8019]', text: 'text-white', logo: 'S' },
      { name: 'Zomato', bg: 'bg-[#CB202D]', text: 'text-white', logo: 'Z' }
    ],
    report_date: '05 Sep 2026',
    report_time: '11:42 AM',
    consistency_score: 69,
    status: 'Active'
  },
  {
    id: '4',
    worker_id: 'worker-104',
    name: 'Sneha Patil',
    avatar_initials: 'SP',
    avatar_bg: 'bg-amber-100 text-amber-800 border-amber-300',
    shared_date: 'Shared on 02 Sep 2026',
    digilocker_id: 'DL-6677-8899-0011',
    work_type: 'E-commerce Partner',
    platforms: [
      { name: 'Amazon', bg: 'bg-[#000000]', text: 'text-amber-400', logo: 'a' },
      { name: 'Flipkart', bg: 'bg-[#2874F0]', text: 'text-white', logo: 'f' }
    ],
    extra_platforms_count: 1,
    report_date: '02 Sep 2026',
    report_time: '03:20 PM',
    consistency_score: 88,
    status: 'Active'
  },
  {
    id: '5',
    worker_id: 'worker-105',
    name: 'Vikram Singh',
    avatar_initials: 'VK',
    avatar_bg: 'bg-rose-100 text-rose-700 border-rose-300',
    shared_date: 'Shared on 28 Aug 2026',
    digilocker_id: 'DL-3344-5566-7788',
    work_type: 'Delivery Partner',
    platforms: [
      { name: 'Zomato', bg: 'bg-[#CB202D]', text: 'text-white', logo: 'Z' },
      { name: 'Swiggy', bg: 'bg-[#FC8019]', text: 'text-white', logo: 'S' }
    ],
    extra_platforms_count: 1,
    report_date: '28 Aug 2026',
    report_time: '09:15 AM',
    consistency_score: 74,
    status: 'Pending'
  },
  {
    id: '6',
    worker_id: 'worker-106',
    name: 'Neha Tiwari',
    avatar_initials: 'NT',
    avatar_bg: 'bg-slate-200 text-slate-800 border-slate-300',
    shared_date: 'Shared on 20 Aug 2026',
    digilocker_id: 'DL-2233-4455-6677',
    work_type: 'Rideshare Partner',
    platforms: [
      { name: 'Uber', bg: 'bg-[#000000]', text: 'text-white', logo: 'U' }
    ],
    extra_platforms_count: 2,
    report_date: '20 Aug 2026',
    report_time: '01:50 PM',
    consistency_score: 91,
    status: 'Active'
  },
  {
    id: '7',
    worker_id: 'worker-107',
    name: 'Deepak Kumar',
    avatar_initials: 'DK',
    avatar_bg: 'bg-blue-100 text-blue-700 border-blue-300',
    shared_date: 'Shared on 12 Aug 2026',
    digilocker_id: 'DL-5566-7788-9900',
    work_type: 'Freelance / Other',
    platforms: [
      { name: 'Upwork', bg: 'bg-[#14A800]', text: 'text-white', logo: 'up' },
      { name: 'Fiverr', bg: 'bg-[#1DBF73]', text: 'text-white', logo: 'fi' }
    ],
    extra_platforms_count: 1,
    report_date: '12 Aug 2026',
    report_time: '04:12 PM',
    consistency_score: 64,
    status: 'Revoked'
  }
];

export const LenderApplicantsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [periodFilter, setPeriodFilter] = useState('All');
  const [workTypeFilter, setWorkTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredApplicants = DEMO_APPLICANTS.filter((app) => {
    const matchesSearch = searchQuery === '' || 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.digilocker_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesWorkType = workTypeFilter === 'All' || app.work_type.toLowerCase().includes(workTypeFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesWorkType;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPeriodFilter('All');
    setWorkTypeFilter('All');
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Applicant Name,DigiLocker ID,Work Type,Report Date,Consistency Score,Status"]
      .concat(filteredApplicants.map(a => `${a.name},${a.digilocker_id},${a.work_type},${a.report_date},${a.consistency_score},${a.status}`))
      .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Shared_Applicants_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ITEMS_PER_PAGE = 7;
  const totalPages = Math.max(1, Math.ceil(filteredApplicants.length / ITEMS_PER_PAGE));
  const startIndex = filteredApplicants.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredApplicants.length);
  const paginatedApplicants = filteredApplicants.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset to page 1 if filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, periodFilter, workTypeFilter]);

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] space-y-7 text-[#18181B]">
      
      {/* TOP HERO BANNER */}
      <div className="bg-[#FFF6EE] border border-[#FDE3CF] p-6 sm:p-8 rounded-3xl shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left Header */}
        <div className="space-y-2 max-w-xl z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">
            Shared Applicants
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] font-medium leading-relaxed">
            View and manage workers who have shared their verified income reports with your organization.
          </p>
        </div>

        {/* Right Section: Cursive badge + Graphic */}
        <div className="flex items-center space-x-6 z-10">
          <div className="text-right hidden sm:block">
            <span className="font-['Caveat',cursive] font-bold text-[#FF6600] text-3xl block leading-tight drop-shadow-2xs">
              Verified Workers.<br />Better Decisions.
            </span>
          </div>
          
          <div className="w-14 h-14 rounded-2xl bg-[#FF6600] text-white flex items-center justify-center shadow-lg shadow-[#FF6600]/30 shrink-0">
            <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#FF6600]/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 4 PRIMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-3xl border border-[#E4E4E7] shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#71717A] block uppercase tracking-wider">Total Shared Applicants</span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-black text-[#18181B]">{DEMO_APPLICANTS.length}</span>
              <span className="text-[10px] font-extrabold text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded-full">↑ 12%</span>
            </div>
            <span className="text-[10px] text-[#A1A1AA] font-semibold block mt-0.5">All time</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-3xl border border-[#E4E4E7] shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#71717A] block uppercase tracking-wider">Active Reports</span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-black text-[#18181B]">
                {DEMO_APPLICANTS.filter(a => a.status === 'Active').length}
              </span>
              <span className="text-[10px] font-extrabold text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded-full">↑ 9%</span>
            </div>
            <span className="text-[10px] text-[#A1A1AA] font-semibold block mt-0.5">Valid and accessible</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-3xl border border-[#E4E4E7] shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#71717A] block uppercase tracking-wider">Pending Review</span>
            <div className="text-2xl font-black text-[#18181B] mt-0.5">
              {DEMO_APPLICANTS.filter(a => a.status === 'Pending').length}
            </div>
            <span className="text-[10px] text-[#A1A1AA] font-semibold block mt-0.5">Requires attention</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-3xl border border-[#E4E4E7] shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#71717A] block uppercase tracking-wider">Revoked / Expired</span>
            <div className="text-2xl font-black text-[#18181B] mt-0.5">
              {DEMO_APPLICANTS.filter(a => a.status === 'Revoked').length}
            </div>
            <span className="text-[10px] text-[#A1A1AA] font-semibold block mt-0.5">No longer accessible</span>
          </div>
        </div>

      </div>

      {/* CONTROLS BAR: SEARCH, FILTERS & EXPORT */}
      <div className="bg-white p-4 rounded-3xl border border-[#E4E4E7] shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Left Search Input */}
        <div className="relative w-full lg:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID or reference number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#18181B] placeholder-slate-400 focus:outline-none focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          
          {/* Status Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-bold text-[#71717A]">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-[#18181B] focus:outline-none focus:border-[#FF6600] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Revoked">Revoked</option>
            </select>
          </div>

          {/* Analysis Period Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-bold text-[#71717A]">Analysis Period</span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-[#18181B] focus:outline-none focus:border-[#FF6600] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="3 Months">3 Months</option>
              <option value="6 Months">6 Months</option>
              <option value="12 Months">12 Months</option>
            </select>
          </div>

          {/* Industry / Platform Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-bold text-[#71717A]">Industry / Platform</span>
            <select
              value={workTypeFilter}
              onChange={(e) => setWorkTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-[#18181B] focus:outline-none focus:border-[#FF6600] cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Delivery">Delivery Partner</option>
              <option value="Rideshare">Rideshare Partner</option>
              <option value="Food">Food Delivery</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Freelance">Freelance / Other</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="text-xs font-extrabold text-[#2563EB] hover:underline transition-all cursor-pointer px-2"
          >
            Clear Filters
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-[#FF6600] text-[#FF6600] hover:bg-[#FFF0E6] text-xs font-extrabold transition-all shadow-2xs cursor-pointer active:scale-95 ml-auto sm:ml-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

        </div>

      </div>

      {/* APPLICANTS TABLE */}
      <div className="bg-white rounded-3xl border border-[#E4E4E7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#71717A] uppercase text-[10px] font-extrabold tracking-wider">
                <th className="py-4 px-4 w-12 text-center">#</th>
                <th className="py-4 px-4">Applicant</th>
                <th className="py-4 px-4">DigiLocker ID</th>
                <th className="py-4 px-4">Primary Work Type</th>
                <th className="py-4 px-4">Platforms Identified</th>
                <th className="py-4 px-4">Report Date</th>
                <th className="py-4 px-4">Consistency Score</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-center">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedApplicants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-medium">
                    No applicants found matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedApplicants.map((applicant, index) => (
                  <tr key={applicant.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Row # */}
                    <td className="py-4 px-4 text-center text-slate-400 font-bold">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>

                    {/* Applicant Details */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-full ${applicant.avatar_bg} border font-black text-xs flex items-center justify-center shrink-0`}>
                          {applicant.avatar_initials}
                        </div>
                        <div>
                          <span className="font-extrabold text-[#18181B] block">{applicant.name}</span>
                          <span className="text-[10px] text-[#71717A] font-semibold block">{applicant.shared_date}</span>
                        </div>
                      </div>
                    </td>

                    {/* DigiLocker ID */}
                    <td className="py-4 px-4 font-mono font-bold text-[#18181B]">
                      {applicant.digilocker_id}
                    </td>

                    {/* Primary Work Type */}
                    <td className="py-4 px-4 font-semibold text-[#52525B]">
                      {applicant.work_type}
                    </td>

                    {/* Platforms Identified */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1.5">
                        {applicant.platforms.map((p, pIdx) => (
                          <div
                            key={pIdx}
                            title={p.name}
                            className={`w-6 h-6 rounded-md ${p.bg} ${p.text} flex items-center justify-center font-black text-[10px] shrink-0 shadow-2xs`}
                          >
                            {p.logo}
                          </div>
                        ))}
                        {applicant.extra_platforms_count && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            +{applicant.extra_platforms_count}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Report Date */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-[#18181B] block">{applicant.report_date}</span>
                      <span className="text-[10px] text-[#71717A] block">{applicant.report_time}</span>
                    </td>

                    {/* Consistency Score */}
                    <td className="py-4 px-4">
                      <span className="inline-block font-black text-xs px-2.5 py-1 rounded-lg bg-[#DCFCE7] text-[#15803D] border border-emerald-200">
                        {applicant.consistency_score} / 100
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-4">
                      {applicant.status === 'Active' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-[10px] font-extrabold">
                          <span className="text-[8px]">◆</span>
                          <span>Active</span>
                        </span>
                      )}
                      {applicant.status === 'Pending' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#D97706] text-[10px] font-extrabold">
                          <span className="text-[8px]">◆</span>
                          <span>Pending</span>
                        </span>
                      )}
                      {applicant.status === 'Revoked' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] text-[10px] font-extrabold">
                          <span className="text-[8px]">◆</span>
                          <span>Revoked</span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => navigate(`/lender/applicant/${applicant.worker_id}`)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-[#FF6600] text-[#FF6600] hover:bg-[#FFF0E6] font-extrabold text-[11px] transition-all cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

        {/* DYNAMIC PAGINATION FOOTER */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#71717A]">
          <span>
            Showing {startIndex}–{endIndex} of {filteredApplicants.length} applicants
          </span>

          {/* Render Page Buttons ONLY if totalPages > 1 */}
          {totalPages > 1 ? (
            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors text-slate-600 font-bold cursor-pointer"
              >
                ‹
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-[#FF6600] text-white shadow-2xs'
                      : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors text-slate-600 font-bold cursor-pointer"
              >
                ›
              </button>
            </div>
          ) : (
            <div className="text-[11px] font-bold text-slate-400">
              Page 1 of 1
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
