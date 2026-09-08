import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sliders, HelpCircle, ArrowLeft, RefreshCw, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { apiService } from '../../services/api';
import { SimulationResult } from '../../types';

export const LenderSimulatorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [incomeChangePct, setIncomeChangePct] = useState<number>(15);
  const [expenseChangePct, setExpenseChangePct] = useState<number>(-5);
  const [additionalIncome, setAdditionalIncome] = useState<number>(0);
  const [additionalSource, setAdditionalSource] = useState<string>('');
  const [improvedMonths, setImprovedMonths] = useState<number>(0);

  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runSimulation = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await apiService.runLenderSimulator({
        worker_id: id,
        income_change_pct: Number(incomeChangePct),
        expense_change_pct: Number(expenseChangePct),
        additional_monthly_income: Number(additionalIncome),
        additional_income_source: additionalSource || null,
        improved_consistency_months: Number(improvedMonths)
      });
      setSimResult(res);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Simulation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [id]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link to={`/lender/applicant/${id}`} className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-white">What-If Cashflow Simulator</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">Stress-test applicant cashflow under hypothetical scenario variations</p>
        </div>

        <button
          onClick={runSimulation}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-600/20 flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Re-Run Scenario</span>
        </button>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start space-x-3">
        <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          <strong className="text-amber-300 uppercase">Simulation Disclaimer:</strong> All values produced by the What-If Simulator are hypothetical mathematical projections for analytical modeling only. They do NOT constitute earnings predictions or lending approval/rejection decisions and do NOT modify actual user database records.
        </p>
      </div>

      {/* Controls & Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-teal-400" />
            <span>Scenario Parameters</span>
          </h3>

          {/* Income Change Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <label className="text-slate-300">Income Change (%)</label>
              <span className="text-emerald-400 font-bold">{incomeChangePct > 0 ? `+${incomeChangePct}` : incomeChangePct}%</span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={incomeChangePct}
              onChange={(e) => setIncomeChangePct(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Expense Change Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <label className="text-slate-300">Expense Change (%)</label>
              <span className="text-rose-400 font-bold">{expenseChangePct > 0 ? `+${expenseChangePct}` : expenseChangePct}%</span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={expenseChangePct}
              onChange={(e) => setExpenseChangePct(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Additional Monthly Income */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">Additional Flat Income (₹/mo)</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={additionalIncome}
              onChange={(e) => setAdditionalIncome(Number(e.target.value))}
              placeholder="e.g. 5000"
              className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-teal-500 outline-none"
            />
          </div>

          {/* Additional Platform */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">New Platform Addition</label>
            <input
              type="text"
              value={additionalSource}
              onChange={(e) => setAdditionalSource(e.target.value)}
              placeholder="e.g. Zepto / Blinkit"
              className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-teal-500 outline-none"
            />
          </div>

          {/* Improved History Months */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">Simulated Extra Months History</label>
            <select
              value={improvedMonths}
              onChange={(e) => setImprovedMonths(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-teal-500 outline-none"
            >
              <option value={0}>0 Additional Months</option>
              <option value={2}>+2 Consistent Months</option>
              <option value={4}>+4 Consistent Months</option>
            </select>
          </div>

          <button
            onClick={runSimulation}
            className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-sm shadow-md shadow-teal-600/20"
          >
            Apply Scenario Inputs
          </button>
        </div>

        {/* Results Column */}
        {simResult && (
          <div className="lg:col-span-2 space-y-6">
            {/* Main Score Delta Card */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="text-center sm:text-left">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Original Readiness Score</span>
                <div className="text-3xl font-extrabold text-white mt-1">{simResult.original_readiness_score} / 100</div>
              </div>

              <div className="text-center">
                <span className="text-xs uppercase font-bold text-teal-400 tracking-wider">Simulated Readiness Score</span>
                <div className="text-4xl font-black text-emerald-400 mt-1">{simResult.simulated_readiness_score} / 100</div>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {simResult.simulated_score_band} BAND
                </span>
              </div>

              <div className="text-center sm:text-right">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Score Delta</span>
                <div className={`text-2xl font-black mt-1 ${simResult.score_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {simResult.score_delta >= 0 ? `+${simResult.score_delta}` : simResult.score_delta} pts
                </div>
              </div>
            </div>

            {/* Financial Numbers Comparison Table */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Projected Cashflow Comparison</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Monthly Income</span>
                  <div className="text-lg font-bold text-white mt-1">₹{simResult.simulated_monthly_income.toLocaleString('en-IN')}</div>
                  <span className={`text-xs mt-1 block font-semibold ${simResult.income_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simResult.income_delta >= 0 ? '+' : ''}₹{simResult.income_delta.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Monthly Expenses</span>
                  <div className="text-lg font-bold text-white mt-1">₹{simResult.simulated_monthly_expenses.toLocaleString('en-IN')}</div>
                  <span className={`text-xs mt-1 block font-semibold ${simResult.expense_delta <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simResult.expense_delta >= 0 ? '+' : ''}₹{simResult.expense_delta.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Simulated Net Buffer</span>
                  <div className="text-lg font-bold text-emerald-400 mt-1">₹{simResult.simulated_net_monthly_income.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Net Monthly Savings</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
