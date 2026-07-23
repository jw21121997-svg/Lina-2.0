import React, { useState } from 'react';
import { DollarSign, Plus, ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../lib/api';

export const BudgetModule: React.FC = () => {
  const { budget, refreshAllModules, sendMessage, setActiveModule } = useAppStore();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('Groceries');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const totalIncome = budget.filter((b) => b.type === 'income').reduce((sum, b) => sum + b.amount, 0);
  const totalExpense = budget.filter((b) => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    await api.addBudgetEntry({
      type,
      category,
      amount: Number(amount),
      description,
      paidBy: 'Sarah',
    });
    setAmount('');
    setDescription('');
    await refreshAllModules();
  };

  const handleDelete = async (id: string) => {
    await api.deleteBudgetEntry(id);
    await refreshAllModules();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)]">
      {/* Title & Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Household Budget & Expenses</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Real-time expense logs, income tracking, and monthly AI analysis</p>
        </div>

        <button
          onClick={() => {
            sendMessage('Analyze our household expenses this month and give me 3 budget optimization tips');
            setActiveModule('chat');
          }}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Sparkles className="w-4 h-4" /> AI Expense Insights
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold mb-1">Total Monthly Income</div>
            <div className="text-2xl font-extrabold text-emerald-400">${totalIncome.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold mb-1">Total Expenses</div>
            <div className="text-2xl font-extrabold text-rose-400">${totalExpense.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold mb-1">Net Balance</div>
            <div className={`text-2xl font-extrabold ${netBalance >= 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
              ${netBalance.toFixed(2)}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Log Transaction Form */}
      <form onSubmit={handleAdd} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Log Household Transaction</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select
            value={type}
            onChange={(e: any) => setType(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <input
            type="text"
            placeholder="Category e.g. Groceries..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />

          <input
            type="number"
            step="0.01"
            placeholder="Amount $"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />

          <input
            type="text"
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />

          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30"
          >
            <Plus className="w-4 h-4" /> Save Entry
          </button>
        </div>
      </form>

      {/* Recent Ledger */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300">Transaction History</h3>
        <div className="space-y-2">
          {budget.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${b.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {b.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-bold text-white">{b.description || b.category}</div>
                  <div className="text-[11px] text-slate-400">
                    {b.category} • {b.date} • Paid by {b.paidBy}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-sm font-bold ${b.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {b.type === 'income' ? '+' : '-'}${b.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-1 text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
