import React, { useState } from 'react';
import { PhoneCall, Plus, ShieldAlert, Phone, MapPin } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../lib/api';

export const EmergencyModule: React.FC = () => {
  const { emergency, refreshAllModules } = useAppStore();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    await api.addEmergencyContact({
      name,
      role: role || 'Contact',
      phone,
      category: 'Services',
    });
    setName('');
    setRole('');
    setPhone('');
    await refreshAllModules();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)]">
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-6 h-6 text-rose-500" />
          <h1 className="text-2xl font-black text-white tracking-tight">Emergency Contacts & Medical Info</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">One-tap emergency dials, insurance policy numbers, and pediatric details</p>
      </div>

      <form onSubmit={handleAdd} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Contact name e.g. Dr. Lawson..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <input
            type="text"
            placeholder="Role e.g. Pediatrician..."
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <input
            type="tel"
            placeholder="Phone number e.g. (555) 000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-600/30"
          >
            <Plus className="w-4 h-4" /> Save Contact
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {emergency.map((c) => (
          <div key={c.id} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white">{c.name}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-rose-300 font-bold text-[10px]">
                  {c.category}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">{c.role}</div>
              {c.policyNumber && <div className="text-[11px] text-amber-400 font-mono mt-1">Policy: {c.policyNumber}</div>}
              {c.notes && <div className="text-[11px] text-slate-400 mt-1">{c.notes}</div>}
            </div>

            <a
              href={`tel:${c.phone}`}
              className="p-3.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 font-bold text-xs flex items-center gap-2 border border-rose-500/30 transition-all shrink-0"
            >
              <Phone className="w-4 h-4" /> Call
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
