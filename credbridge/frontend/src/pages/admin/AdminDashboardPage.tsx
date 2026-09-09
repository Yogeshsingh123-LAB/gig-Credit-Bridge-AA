import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, FileText, Building2, ShieldCheck, AlertTriangle, 
  TrendingUp, Activity, CheckCircle2, ArrowRight, ChevronRight, 
  Clock, Shield, Zap, Sparkles, UserCheck, ChevronDown, Settings, Key
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { apiService } from '../../services/api';

const USER_GROWTH_DATA = [
  { month: 'Jan 2026', users: 240 },
  { month: 'Feb 2026', users: 580 },
  { month: 'Mar 2026', users: 760 },
  { month: 'Apr 2026', users: 820 },
  { month: 'May 2026', users: 890 },
  { month: 'Jun 2026', users: 1050 },
  { month: 'Jul 2026', users: 1080 },
  { month: 'Aug 2026', users: 1220 },
  { month: 'Sep 2026', users: 1420 },
];

const PLATFORM_REPORTS_DATA = [
  { name: 'Swiggy', value: 2441, percentage: '28%', color: '#FC8019' },
  { name: 'Zomato', value: 1965, percentage: '23%', color: '#CB202D' },
  { name: 'Uber', value: 1572, percentage: '18%', color: '#000000' },
  { name: 'Ola', value: 873, percentage: '10%', color: '#FACC15' },
  { name: 'Amazon', value: 655, percentage: '8%', color: '#334155' },
  { name: 'Flipkart', value: 524, percentage: '6%', color: '#2563EB' },
  { name: 'Others', value: 699, percentage: '7%', color: '#94A3B8' },
];

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getAdminDashboard();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadMetrics();
  }, []);

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] space-y-7 text-[#18181B]">
      
      {/* TOP HERO BANNER */}
      <div className="bg-[#FFF6EE] border border-[#FDE3CF] p-6 sm:p-8 rounded-3xl shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left Content */}
        <div className="space-y-2 max-w-xl z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">
            Welcome back, Admin!
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] font-medium leading-relaxed">
            Here's what's happening with CredBridge today.
          </p>
        </div>

        {/* Right Section: Cursive text + Graphic + Date & Status */}
        <div className="flex flex-col sm:flex-row items-center gap-6 z-10 w-full md:w-auto">
          
          {/* Cursive Handwriting Badge */}
          <div className="hidden lg:block text-right">
            <span className="font-['Caveat',cursive] font-bold text-[#FF6600] text-3xl block leading-tight drop-shadow-2xs">
              Trusted Income.<br />Stronger Opportunities.
            </span>
          </div>

          {/* Time & System Status Badge */}
          <div className="space-y-2 text-right shrink-0">
            <div className="text-[11px] font-bold text-[#71717A]">
              Tuesday, 09 Sep 2026 <br />
              <span className="text-[#18181B]">10:35 AM IST</span>
            </div>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-[11px] font-extrabold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
              <span>All Systems Operational</span>
            </span>
          </div>

        </div>

        {/* Ambient Glow */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#FF6600]/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 5 PRIMARY METRIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Users */}
        <div className="bg-white p-5 rounded-3xl border border-[#E4E4E7] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-extrabold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full flex items-center gap-0.5">
              ↑ 12%
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#71717A] block uppercase tracking-wider">Total Users</span>
          <div className="text-2xl font-black text-[#18181B] tracking-tight">
            {metrics?.total_users ? metrics.total_users.toLocaleString() : '12,482'}
          </div>
          <span className="text-[10px] text-[#A1A1AA] font-semibold block">+1,332 this month</span>
        </div>

        {/* Card 2: Reports Generated */}
        <div className="bg-white p-5 rounded-3xl border border-[#E4E4E7] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-extrabold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full flex items-center gap-0.5">
              ↑ 18%
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#71717A] block uppercase tracking-wider">Reports Generated</span>
          <div className="text-2xl font-black text-[#18181B] tracking-tight">
            {metrics?.passports_generated ? metrics.passports_generated.toLocaleString() : '8,729'}
          </div>
          <span className="text-[10px] text-[#A1A1AA] font-semibold block">+1,340 this month</span>
        </div>

        {/* Card 3: Active Lenders */}
        <div className="bg-white p-5 rounded-3xl border border-[#E4E4E7] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center">
              <Building2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-extrabold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full flex items-center gap-0.5">
              ↑ 7%
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#71717A] block uppercase tracking-wider">Active Lenders</span>
          <div className="text-2xl font-black text-[#18181B] tracking-tight">
            {metrics?.lenders_count || 86}
          </div>
          <span className="text-[10px] text-[#A1A1AA] font-semibold block">+6 this month</span>
        </div>

        {/* Card 4: Verified Reports */}
        <div className="bg-white p-5 rounded-3xl border border-[#E4E4E7] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-extrabold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full flex items-center gap-0.5">
              ↑ 19%
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#71717A] block uppercase tracking-wider">Verified Reports</span>
          <div className="text-2xl font-black text-[#18181B] tracking-tight">
            8,412
          </div>
          <span className="text-[10px] text-[#A1A1AA] font-semibold block">96.4% of total</span>
        </div>

        {/* Card 5: Flagged for Review */}
        <div className="bg-white p-5 rounded-3xl border border-[#E4E4E7] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-extrabold text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded-full flex items-center gap-0.5">
              ↓ 4%
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#71717A] block uppercase tracking-wider">Flagged for Review</span>
          <div className="text-2xl font-black text-[#18181B] tracking-tight">
            317
          </div>
          <span className="text-[10px] text-[#A1A1AA] font-semibold block">3.6% of total</span>
        </div>

      </div>

      {/* MIDDLE ROW: CHARTS & SYSTEM HEALTH (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COL 1: User Growth Line/Area Chart (5/12 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#E4E4E7] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center">
                <Users className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#18181B]">User Growth</h3>
                <p className="text-xs text-[#71717A] font-medium">New users joining via DigiLocker</p>
              </div>
            </div>

            <select className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-[#18181B] focus:outline-none cursor-pointer">
              <option>Last 12 Months</option>
              <option>Last 6 Months</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={USER_GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6600" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6600" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#71717A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#71717A' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181B', borderRadius: '12px', color: '#FFF', fontSize: '11px', border: 'none' }} 
                />
                <Area type="monotone" dataKey="users" stroke="#FF6600" strokeWidth={3} fillOpacity={1} fill="url(#userGrowthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COL 2: Reports by Platform Donut Chart (4/12 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#E4E4E7] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center">
                <Shield className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-extrabold text-[#18181B]">Reports by Platform</h3>
            </div>
            <select className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-[#18181B] focus:outline-none cursor-pointer">
              <option>Last 12 Months</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <div className="w-44 h-44 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PLATFORM_REPORTS_DATA}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {PLATFORM_REPORTS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-base font-black text-[#18181B]">8,729</span>
                <span className="text-[9px] text-[#71717A] font-extrabold uppercase">Total Reports</span>
              </div>
            </div>

            <div className="space-y-1.5 w-full text-xs font-medium">
              {PLATFORM_REPORTS_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-700">{item.name}</span>
                  </div>
                  <div className="space-x-2">
                    <span className="font-bold text-[#18181B]">{item.value.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{item.percentage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COL 3: System Health Checklist (3/12 cols) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-[#E4E4E7] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center">
                <Activity className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-extrabold text-[#18181B]">System Health</h3>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { name: 'API Services', status: 'Operational' },
                { name: 'Database', status: 'Operational' },
                { name: 'DigiLocker Integration', status: 'Operational' },
                { name: 'PDF Generation', status: 'Operational' },
                { name: 'File Storage', status: 'Operational' },
                { name: 'Background Jobs', status: 'Operational' },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] stroke-[2.5]" />
                    <span className="font-bold text-slate-800">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFF6EE] border border-[#FDE3CF] text-center space-y-0.5">
            <span className="text-2xl font-black text-[#FF6600] block">99.9%</span>
            <span className="text-[10px] text-[#71717A] font-semibold block">System Uptime (Last 30 Days)</span>
          </div>
        </div>

      </div>

      {/* BOTTOM ROW: TABLES & QUICK ACTIONS (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COL 1: Recent Activity Table (5/12 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#E4E4E7] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center">
                <FileText className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-extrabold text-[#18181B]">Recent Activity</h3>
            </div>
            <button 
              onClick={() => navigate('/admin/audit-logs')}
              className="text-xs font-bold text-[#FF6600] hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[#71717A] text-[10px] font-extrabold uppercase">
                  <th className="py-2.5 px-2">Time</th>
                  <th className="py-2.5 px-2">Activity</th>
                  <th className="py-2.5 px-2">Details</th>
                  <th className="py-2.5 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {[
                  { time: '10:32 AM', activity: 'Report Generated', details: 'User ID: DL-2456-7890-1234', status: 'Success' },
                  { time: '10:28 AM', activity: 'New User Onboarded', details: 'DigiLocker ID: DL-9988-7766-5544', status: 'Success' },
                  { time: '10:15 AM', activity: 'Lender Access Granted', details: 'Lender: ABC Finance Ltd.', status: 'Success' },
                  { time: '09:54 AM', activity: 'Report Flagged', details: 'User ID: DL-6677-8899-0011', status: 'Review' },
                  { time: '09:41 AM', activity: 'Report Verified', details: 'Report ID: CBR-2026-8A72K1', status: 'Success' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-2 text-[11px] text-slate-500 font-bold">{row.time}</td>
                    <td className="py-3 px-2 font-bold">{row.activity}</td>
                    <td className="py-3 px-2 text-[11px] text-slate-500 font-mono">{row.details}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        row.status === 'Success'
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : 'bg-[#FEF3C7] text-[#D97706]'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* COL 2: Top Lenders Table (4/12 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#E4E4E7] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center">
                <Building2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-extrabold text-[#18181B]">Top Lenders by Report Access</h3>
            </div>
            <button 
              onClick={() => navigate('/admin/lenders')}
              className="text-xs font-bold text-[#FF6600] hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[#71717A] text-[10px] font-extrabold uppercase">
                  <th className="py-2.5 px-2 w-8 text-center">#</th>
                  <th className="py-2.5 px-2">Lender Name</th>
                  <th className="py-2.5 px-2 text-right">Reports Accessed</th>
                  <th className="py-2.5 px-2 text-right">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {[
                  { rank: 1, name: 'HDFC Bank', reports: '2,341', growth: '↑ 24%' },
                  { rank: 2, name: 'ICICI Bank', reports: '1,982', growth: '↑ 18%' },
                  { rank: 3, name: 'Axis Bank', reports: '1,120', growth: '↑ 16%' },
                  { rank: 4, name: 'SBI', reports: '890', growth: '↑ 12%' },
                  { rank: 5, name: 'Kotak Mahindra Bank', reports: '765', growth: '↑ 11%' },
                ].map((lender) => (
                  <tr key={lender.rank} className="hover:bg-slate-50">
                    <td className="py-3 px-2 text-center text-slate-400 font-bold">{lender.rank}</td>
                    <td className="py-3 px-2 font-bold text-slate-900">{lender.name}</td>
                    <td className="py-3 px-2 text-right font-bold">{lender.reports}</td>
                    <td className="py-3 px-2 text-right font-extrabold text-[#15803D]">{lender.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* COL 3: Quick Actions (3/12 cols) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-[#E4E4E7] shadow-xs space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center">
              <Zap className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-extrabold text-[#18181B]">Quick Actions</h3>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Appoint New Lender', icon: Key, path: '/admin/lenders?appoint=true' },
              { label: 'Manage Lenders & Credentials', icon: Building2, path: '/admin/lenders' },
              { label: 'Manage User Accounts', icon: Users, path: '/admin/users' },
              { label: 'View Audit Logs', icon: Clock, path: '/admin/audit-logs' },
              { label: 'System Settings', icon: Settings, path: '/admin/settings' },
            ].map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 hover:border-[#FF6600]/40 hover:bg-[#FFF0E6]/30 text-xs font-bold text-[#18181B] transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <ActionIcon className="w-4 h-4 text-slate-500 group-hover:text-[#FF6600]" />
                    <span>{action.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF6600] transition-colors" />
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
