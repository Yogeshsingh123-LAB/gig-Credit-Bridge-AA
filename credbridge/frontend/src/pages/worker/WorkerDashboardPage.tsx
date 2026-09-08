import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, DollarSign, Award, CheckCircle2, 
  Layers, ArrowRight, ShieldCheck, RefreshCw, AlertTriangle 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { apiService } from '../../services/api';
import { FinancialAnalyticsSummary, FinancialReadinessScore, IncomeVerification } from '../../types';

export const WorkerDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<FinancialAnalyticsSummary | null>(null);
  const [score, setScore] = useState<FinancialReadinessScore | null>(null);
  const [verification, setVerification] = useState<IncomeVerification | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sumData = await apiService.getFinancialSummary();
      setSummary(sumData);

      try {
        const scData = await apiService.getLatestScore();
        setScore(scData);
      } catch (err) {
        // Ignored if unscored
      }

      try {
        const verData = await apiService.getLatestVerification();
        setVerification(verData);
      } catch (err) {
        // Ignored if unverified
      }
    } catch (err: any) {
      setError('No financial transactions found. Connect platforms and generate demo data to view live analytics.');
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

  if (error || !summary || summary.income.total_income === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Financial Data Available</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Connect your gig platforms (Uber, Swiggy, Zomato, etc.) or click "Generate Demo Data" to load realistic synthetic transactions.
        </p>
        <div className="mt-6">
          <Link
            to="/worker/platforms"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-600/20"
          >
            <Layers className="w-4 h-4" />
            <span>Manage Platforms & Generate Demo Data</span>
          </Link>
        </div>
      </div>
    );
  }

  const chartData = summary.monthly_analysis.map((m) => ({
    month: m.month,
    Income: m.income,
    Expenses: m.expenses,
    Net: m.net_income
  }));

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Readiness Dashboard</h1>
          <p className="text-sm text-slate-400">Consolidated analytics and verified income evidence</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/worker/verification"
            className="px-4 py-2 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-semibold text-xs flex items-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verification: {verification?.verification_status || 'NOT RUN'}</span>
          </Link>
          <Link
            to="/worker/score"
            className="px-4 py-2 rounded-lg bg-teal-600/20 border border-teal-500/40 text-teal-300 font-semibold text-xs flex items-center space-x-1.5"
          >
            <Award className="w-4 h-4" />
            <span>Score: {score ? `${score.overall_score}/100` : 'UNSCORED'}</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Income</span>
          <div className="text-2xl font-extrabold text-white mt-1">₹{summary.income.total_income.toLocaleString('en-IN')}</div>
          <span className="text-xs text-emerald-400 flex items-center mt-2">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            Across {summary.income.income_months} Months
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Average</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">₹{summary.income.average_monthly_income.toLocaleString('en-IN')}</div>
          <span className="text-xs text-slate-400 mt-2 block">
            Median: ₹{summary.income.median_monthly_income.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Expenses</span>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">₹{summary.expenses.total_expenses.toLocaleString('en-IN')}</div>
          <span className="text-xs text-rose-400 flex items-center mt-2">
            <TrendingDown className="w-3.5 h-3.5 mr-1" />
            Avg ₹{summary.expenses.average_monthly_expenses.toLocaleString('en-IN')}/mo
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Data Quality</span>
          <div className="text-2xl font-extrabold text-teal-300 mt-1">{summary.data_quality.quality_score}/100</div>
          <span className="text-xs text-slate-400 mt-2 block">
            {summary.data_quality.valid_transactions} Verified Transactions
          </span>
        </div>
      </div>

      {/* Monthly Chart & Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Monthly Earnings vs Expenses</h3>
            <span className="text-xs text-slate-400">Chronological Cashflow</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Breakdown */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Platform Contributions</h3>
            <div className="space-y-4">
              {summary.source_analysis.map((src) => (
                <div key={src.source} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200">{src.source}</span>
                    <span className="text-emerald-400">₹{src.total_income.toLocaleString('en-IN')} ({src.percentage_of_income.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${src.percentage_of_income}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 mt-6">
            <Link
              to="/worker/passport"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <span>Generate Credit Passport</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
