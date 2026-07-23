import React, { useState } from 'react';
import { CheckSquare, Plus, Check, Trash2, Clock, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../lib/api';

export const RemindersModule: React.FC = () => {
  const { reminders, refreshAllModules } = useAppStore();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.addReminder({
      title,
      dueDate,
      priority,
    });
    setTitle('');
    await refreshAllModules();
  };

  const handleToggle = async (id: string, isCompleted: boolean) => {
    await api.toggleReminder(id, isCompleted);
    await refreshAllModules();
  };

  const handleDelete = async (id: string) => {
    await api.deleteReminder(id);
    await refreshAllModules();
  };

  return (
    <div className="flex-1 h-full overflow-y-auto min-h-0 p-4 md:p-8 space-y-6 bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">Reminders & Tasks</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">One-off household tasks and recurring alerts</p>
      </div>

      <form onSubmit={handleAdd} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Reminder title e.g. Put out trash bins..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="md:col-span-2 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <select
            value={priority}
            onChange={(e: any) => setPriority(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          >
            <option value="low">Low Urgency</option>
            <option value="medium">Medium Urgency</option>
            <option value="high">High Urgency</option>
          </select>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" /> Save Reminder
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
            No active reminders set. Add household reminders above or set them via voice commands with Lina.
          </div>
        ) : (
          reminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                rem.isCompleted
                  ? 'bg-slate-950/40 border-slate-900 text-slate-500 line-through'
                  : 'bg-slate-900/60 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(rem.id, !rem.isCompleted)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                    rem.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700 hover:border-violet-500'
                  }`}
                >
                  {rem.isCompleted && <Check className="w-4 h-4" />}
                </button>
                <div>
                  <div className="font-semibold text-sm">{rem.title}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className={`px-2 py-0.2 rounded font-bold uppercase text-[10px] ${
                      rem.priority === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {rem.priority} Priority
                    </span>
                    <span>Due: {rem.dueDate}</span>
                  </div>
                </div>
              </div>

              <button onClick={() => handleDelete(rem.id)} className="p-2 text-slate-500 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
