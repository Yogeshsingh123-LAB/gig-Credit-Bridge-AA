import React, { useEffect, useState } from 'react';
import { ArrowLeftRight, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '../../services/api';
import { Transaction } from '../../types';

export const WorkerTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;
  const [isLoading, setIsLoading] = useState(true);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        limit,
        offset: (page - 1) * limit,
      };
      if (search) params.search = search;
      if (typeFilter) params.transaction_type = typeFilter;
      if (categoryFilter) params.category = categoryFilter;

      const data = await apiService.getTransactions(params);
      setTransactions(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [page, typeFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTransactions();
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Transactions</h1>
          <p className="text-sm text-slate-400">Verified cashflow ledger across connected platforms</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700">
          Total Records: {total}
        </span>
      </div>

      {/* Controls Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description, reference ID, or source..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:border-emerald-500 outline-none"
            />
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white">
            Search
          </button>
        </form>

        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white outline-none"
          >
            <option value="">All Types</option>
            <option value="CREDIT">CREDIT (Income)</option>
            <option value="DEBIT">DEBIT (Expense)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white outline-none"
          >
            <option value="">All Categories</option>
            <option value="GIG_INCOME">GIG_INCOME</option>
            <option value="FUEL">FUEL</option>
            <option value="FOOD">FOOD</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading transaction ledger...</div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400">No transaction records match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Source</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                      {new Date(t.transaction_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{t.source}</td>
                    <td className="px-6 py-4 text-xs text-slate-300 max-w-xs truncate">{t.description || t.reference_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        t.transaction_type === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {t.transaction_type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${
                      t.transaction_type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {t.transaction_type === 'CREDIT' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing page {page} of {totalPages}</span>
          <div className="flex space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
