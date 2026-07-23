import React, { useState } from 'react';
import { CreditCard, Plus, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../lib/api';

export const BillsModule: React.FC = () => {
  const { bills, refreshAllModules } = useAppStore();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<'Utilities' | 'Subscriptions' | 'Housing' | 'Insurance' | 'Loans' | 'Other'>('Utilities');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    await api.addBill({
      title,
      amount: Number(amount),
      dueDate,
      category,
      status: 'Upcoming',
      autoPay: true,
      frequency: 'Monthly',
      provider: 'Provider',
    });
    setTitle('');
    setAmount('');
    await refreshAllModules();
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Paid' ? 'Upcoming' : 'Paid';
    await api.updateBillStatus(id, nextStatus);
    await refreshAllModules();
  };

  const totalMonthlyCost = bills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Bills & Recurring Subscriptions</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Due date trackers, auto-pay indicators, and recurring billing logs</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-right">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Estimated Monthly Recurring</div>
          <div className="text-xl font-black text-indigo-400">${totalMonthlyCost.toFixed(2)}</div>
        </div>
      </div>

      <form onSubmit={handleAdd} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Bill / Service name e.g. High-Speed Fiber..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" /> Add Bill
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {bills.map((bill) => (
          <div
            key={bill.id}
            className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-all"
          >
            <div>
              <div className="font-bold text-base text-white">{bill.title}</div>
              <div className="text-slate-400 text-xs mt-1">
                {bill.category} • Due: {bill.dueDate} • {bill.frequency} • {bill.autoPay ? 'Auto-Pay Active' : 'Manual Payment'}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-base font-extrabold text-white">${bill.amount.toFixed(2)}</span>
              <button
                onClick={() => handleToggleStatus(bill.id, bill.status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  bill.status === 'Paid'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {bill.status}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
