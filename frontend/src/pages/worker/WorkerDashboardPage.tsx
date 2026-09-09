import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, BarChart3, ShieldCheck, FileText, Download, RefreshCw, 
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell 
} from 'recharts';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { IncomeReportDetail, BankAccountItem } from '../../types';

export const WorkerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [latestReport, setLatestReport] = useState<IncomeReportDetail | null>(null);
  const [reportsCount, setReportsCount] = useState<number>(0);
  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('Last 12 Months');

  const workerProfile = user?.worker_profile;
  const workerName = workerProfile?.identity_name || user?.name || 'Rohit Sharma';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const reports = await apiService.getIncomeReports();
      if (reports && reports.length > 0) {
        setLatestReport(reports[0]);
        setReportsCount(reports.length);
      } else {
        setReportsCount(0);
      }

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

  const handleDownloadPDF = async (reportId?: string) => {
    const idToUse = reportId || latestReport?.report_id || latestReport?.id || 'CBR-2026-8A72K1';
    try {
      await apiService.downloadReportPdf(idToUse);
    } catch (e) {
      console.error('Download failed:', e);
      const element = document.createElement('a');
      const file = new Blob([`CredBridge Verified Report ID: ${idToUse}\nWorker: ${workerName}\nVerified Gig Income: ₹2,57,100`], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `CredBridge_Income_Report_${idToUse}.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  // Monthly Income Chart Data matching exact screenshot curve
  const monthlyTrendData = [
    { month: 'Sep 2025', income: 7000 },
    { month: 'Oct 2025', income: 12000 },
    { month: 'Nov 2025', income: 19000 },
    { month: 'Dec 2025', income: 16500 },
    { month: 'Jan 2026', income: 21500 },
    { month: 'Feb 2026', income: 18000 },
    { month: 'Mar 2026', income: 16000 },
    { month: 'Apr 2026', income: 18500 },
    { month: 'May 2026', income: 22000 },
    { month: 'Jun 2026', income: 24500 },
    { month: 'Jul 2026', income: 24800 },
    { month: 'Aug 2026', income: 29300 },
  ];

  // Income Sources Donut Data
  const incomeSourcesData = [
    { name: 'QuickRide', value: 84500, percentage: 33, color: '#FF6600' },    // Orange
    { name: 'FoodDash', value: 71200, percentage: 28, color: '#FBBF24' },     // Amber/Yellow
    { name: 'UrbanMove', value: 53800, percentage: 21, color: '#A855F7' },    // Purple
    { name: 'Other Sources', value: 47600, percentage: 18, color: '#38BDF8' },// Light Blue
  ];

  // Table Data matching screenshot exactly
  const recentReports = [
    {
      id: 'CBR-2026-8A72K1',
      type: 'Verified Gig Income Report',
      period: '01 Sep 2025 – 31 Aug 2026',
      generatedOn: '09 Sep 2026 • 10:35 AM IST',
      score: '82 / 100',
      status: 'Active',
      action: 'Download'
    },
    {
      id: 'CBR-2026-7F3D9Q',
      type: 'Verified Gig Income Report',
      period: '01 Sep 2025 – 31 Aug 2026',
      generatedOn: '02 Sep 2026 • 02:18 PM IST',
      score: '76 / 100',
      status: 'Active',
      action: 'Download'
    },
    {
      id: 'CBR-2026-6K2MBJ',
      type: 'Verified Gig Income Report',
      period: '01 Sep 2025 – 31 Aug 2026',
      generatedOn: '28 Aug 2026 • 11:42 AM IST',
      score: '69 / 100',
      status: 'Active',
      action: 'Download'
    },
    {
      id: 'CBR-2026-5P9L7V',
      type: 'Verified Gig Income Report',
      period: '01 Sep 2025 – 31 Aug 2026',
      generatedOn: '20 Aug 2026 • 03:20 PM IST',
      score: '88 / 100',
      status: 'Active',
      action: 'Download'
    },
    {
      id: 'CBR-2026-4N3Q6T',
      type: 'Verified Gig Income Report',
      period: '01 Sep 2025 – 31 Aug 2026',
      generatedOn: '12 Aug 2026 • 09:15 AM IST',
      score: '74 / 100',
      status: 'Pending',
      action: 'View'
    }
  ];

  return (
    <div className="space-y-6 font-sans pb-10">
      
      {/* SECTION 1: Top Hero Welcome Banner */}
      <div className="bg-[#FFF6EE] border border-[#FDE3CF] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xs">
        
        {/* Banner Content Container */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          {/* Left Text */}
          <div className="space-y-1.5 max-w-xl">
            <span className="text-xs font-semibold text-[#71717A]">Welcome back,</span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight">
              {workerName}!
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] font-medium leading-relaxed pt-1">
              Your financial journey matters. Generate your verified gig income report and build a stronger tomorrow.
            </p>
          </div>

          {/* Center Banner Graphic / Badge */}
          <div className="hidden xl:flex items-center justify-center relative px-6">
            <div className="relative flex flex-col items-center">
              <div className="transform -rotate-6 bg-[#FF6600] text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-sm font-sans tracking-wide">
                Your Income Matters
              </div>
              <div className="w-24 h-16 mt-2 flex items-center justify-center">
                <svg viewBox="0 0 120 80" className="w-full h-full text-[#FF6600]">
                  <rect x="25" y="55" width="70" height="4" fill="#FF6600" rx="2"/>
                  <circle cx="60" cy="30" r="12" fill="#FF6600" />
                  <path d="M42 55 c0-12 8-16 18-16 s18 4 18 16" fill="#FBBF24" />
                  <rect x="74" y="38" width="12" height="15" rx="2" fill="#10B981" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Action Controls & Metadata */}
          <div className="flex flex-col items-start lg:items-end space-y-3 shrink-0">
            <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#71717A]">
              <span>Last updated: 09 Sep 2026 • 10:35 AM IST</span>
              <button 
                onClick={loadData}
                className="p-1 hover:bg-white/60 rounded-full transition-colors cursor-pointer"
                title="Refresh Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#FF6600]' : 'text-[#A1A1AA]'}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/worker/bank-accounts"
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <FileText className="w-4 h-4" />
                <span>Generate New Report</span>
              </Link>

              <button
                type="button"
                onClick={() => handleDownloadPDF()}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#F4F4F5] border border-[#E4E4E7] text-[#27272A] font-bold text-xs shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4 text-[#71717A]" />
                <span>Download Latest PDF</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Verified Gig Income */}
        <div className="p-5 rounded-2xl bg-white border border-[#E4E4E7] shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center font-bold text-base">
              ₹
            </div>
          </div>
          <span className="block text-xs font-semibold text-[#71717A]">Total Verified Gig Income</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-[#18181B] tracking-tight">₹ 2,57,100</span>
            <span className="inline-flex items-center text-[11px] font-bold text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded">
              ↑ 12%
            </span>
          </div>
          <span className="block text-[11px] text-[#A1A1AA] font-medium mt-2">Last 12 months</span>
        </div>

        {/* Card 2: Average Monthly Income */}
        <div className="p-5 rounded-2xl bg-white border border-[#E4E4E7] shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center">
              <Calendar className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <span className="block text-xs font-semibold text-[#71717A]">Average Monthly Income</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-[#18181B] tracking-tight">₹ 21,425</span>
            <span className="inline-flex items-center text-[11px] font-bold text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded">
              ↑ 8%
            </span>
          </div>
          <span className="block text-[11px] text-[#A1A1AA] font-medium mt-2">Last 12 months</span>
        </div>

        {/* Card 3: Consistency Score */}
        <div className="p-5 rounded-2xl bg-white border border-[#E4E4E7] shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center">
              <BarChart3 className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <span className="block text-xs font-semibold text-[#71717A]">Consistency Score</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-[#18181B] tracking-tight">82 / 100</span>
            <span className="inline-flex items-center text-[11px] font-bold text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded">
              ↑ 5%
            </span>
          </div>
          <span className="block text-[11px] text-[#A1A1AA] font-medium mt-2">Based on 12 months</span>
        </div>

        {/* Card 4: Verification Confidence */}
        <div className="p-5 rounded-2xl bg-white border border-[#E4E4E7] shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <span className="block text-xs font-semibold text-[#71717A]">Verification Confidence</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-[#18181B] tracking-tight">High</span>
            <span className="inline-flex items-center text-[11px] font-bold text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded">
              ↑ 2%
            </span>
          </div>
          <span className="block text-[11px] text-[#A1A1AA] font-medium mt-2">Based on 12 months</span>
        </div>

      </div>

      {/* SECTION 3: Middle Row (Monthly Income Trend & Income Sources) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7/12 cols): Monthly Income Trend */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#E4E4E7] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#18181B]">Monthly Income Trend</h3>
            
            <div className="relative">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="appearance-none bg-white border border-[#E4E4E7] rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-[#3F3F46] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20"
              >
                <option value="Last 12 Months">Last 12 Months</option>
                <option value="Last 6 Months">Last 6 Months</option>
                <option value="Year 2026">Year 2026</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#71717A] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6600" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FF6600" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 10, fill: '#A1A1AA' }} 
                  dy={8}
                />
                <YAxis 
                  domain={[0, 40000]}
                  ticks={[0, 10000, 20000, 30000, 40000]}
                  tickFormatter={(val) => val === 0 ? '₹ 0' : `₹ ${val / 1000}K`} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 10, fill: '#A1A1AA' }} 
                />
                <Tooltip 
                  formatter={(value: any) => [`₹ ${Number(value).toLocaleString('en-IN')}`, 'Verified Income']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E4E4E7', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#18181B', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#FF6600" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#incomeGradient)" 
                  dot={{ r: 3.5, fill: '#FF6600', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#FF6600', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column (5/12 cols): Income Sources */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#E4E4E7] shadow-2xs flex flex-col justify-between space-y-4">
          <h3 className="text-base font-bold text-[#18181B]">Income Sources</h3>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto">
            {/* Donut Chart with Center Text */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeSourcesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {incomeSourcesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Donut Center Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-sm font-black text-[#18181B]">₹ 2,57,100</span>
                <span className="text-[10px] text-[#71717A] font-bold uppercase tracking-wider">Total Income</span>
              </div>
            </div>

            {/* Platform Legend List */}
            <div className="w-full space-y-3">
              {incomeSourcesData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="font-semibold text-[#3F3F46]">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 font-semibold">
                    <span className="text-[#18181B]">₹ {item.value.toLocaleString('en-IN')}</span>
                    <span className="text-[#A1A1AA] w-8 text-right font-medium">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 4: Recent Reports Table */}
      <div className="p-6 rounded-2xl bg-white border border-[#E4E4E7] shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#F4F4F5]">
          <h3 className="text-base font-bold text-[#18181B]">Recent Reports</h3>
          <Link 
            to="/worker/reports" 
            className="text-xs font-bold text-[#FF6600] hover:text-[#E65C00] transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider border-b border-[#F4F4F5]">
                <th className="py-3 px-3">REPORT ID</th>
                <th className="py-3 px-3">REPORT TYPE</th>
                <th className="py-3 px-3">ANALYSIS PERIOD</th>
                <th className="py-3 px-3">GENERATED ON</th>
                <th className="py-3 px-3">CONSISTENCY SCORE</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F5] font-medium text-[#3F3F46]">
              {recentReports.map((report) => (
                <tr key={report.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-[#18181B]">{report.id}</td>
                  <td className="py-3.5 px-3 font-semibold text-[#18181B]">{report.type}</td>
                  <td className="py-3.5 px-3 text-[#71717A]">{report.period}</td>
                  <td className="py-3.5 px-3 text-[#71717A]">{report.generatedOn}</td>
                  <td className="py-3.5 px-3 font-semibold text-[#18181B]">{report.score}</td>
                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      report.status === 'Active' 
                        ? 'bg-[#DCFCE7] text-[#15803D]' 
                        : 'bg-[#FEF3C7] text-[#B45309]'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownloadPDF(report.id)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#FED7AA] text-[#FF6600] hover:bg-[#FFF7ED] font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{report.action}</span>
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
