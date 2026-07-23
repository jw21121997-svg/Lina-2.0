import React, { useState } from 'react';
import { Wrench, Plus, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../lib/api';

export const MaintenanceModule: React.FC = () => {
  const { maintenance, refreshAllModules } = useAppStore();
  const [taskName, setTaskName] = useState('');
  const [location, setLocation] = useState('Home');
  const [nextDue, setNextDue] = useState(new Date().toISOString().split('T')[0]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    await api.addMaintenanceTask({
      taskName,
      location,
      lastDone: new Date().toISOString().split('T')[0],
      nextDue,
      frequencyMonths: 6,
      status: 'Good',
    });
    setTaskName('');
    await refreshAllModules();
  };

  const handleComplete = async (id: string) => {
    await api.completeMaintenanceTask(id);
    await refreshAllModules();
  };

  return (
    <div className="flex-1 h-full overflow-y-auto min-h-0 p-4 md:p-8 space-y-6 bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <Wrench className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">Home Maintenance & Upkeep</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">HVAC filter changes, smoke detector testing, plumbing, and roof maintenance</p>
      </div>

      <form onSubmit={handleAdd} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Upkeep task e.g. Replace furnace filters..."
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="md:col-span-2 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <input
            type="text"
            placeholder="Location e.g. Basement..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-amber-600/30"
          >
            <Plus className="w-4 h-4" /> Add Maintenance Log
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {maintenance.map((m) => {
          const isOverdue = m.status === 'Overdue';
          const isDueSoon = m.status === 'Due Soon';
          return (
            <div
              key={m.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                isOverdue
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : isDueSoon
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-white">{m.taskName}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      isOverdue
                        ? 'bg-rose-500/20 text-rose-300'
                        : isDueSoon
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400">Location: {m.location}</div>
                <div className="text-xs text-slate-400 mt-1">
                  Last Done: {m.lastDone} • Next Due: <span className="text-white font-semibold">{m.nextDue}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Every {m.frequencyMonths} Months</span>
                <button
                  onClick={() => handleComplete(m.id)}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-violet-600/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done Today
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
