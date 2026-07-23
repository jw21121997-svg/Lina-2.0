import React, { useState } from 'react';
import { Gift, Plus, ExternalLink, Check } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../lib/api';

export const WishlistModule: React.FC = () => {
  const { wishlist, refreshAllModules } = useAppStore();
  const [title, setTitle] = useState('');
  const [forPerson, setForPerson] = useState('Liam');
  const [price, setPrice] = useState('');
  const [occasion, setOccasion] = useState('Birthday');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.addWishlistItem({
      title,
      forPerson,
      price: Number(price) || 0,
      priority: 'High',
      occasion,
    });
    setTitle('');
    setPrice('');
    await refreshAllModules();
  };

  const handleClaimToggle = async (id: string) => {
    await api.toggleClaimWishlist(id, 'Secret Santa');
    await refreshAllModules();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)]">
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-rose-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">Family Wishlist & Gift Ideas</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Birthdays, holidays, secret gift claims, and price tracking</p>
      </div>

      <form onSubmit={handleAdd} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Gift idea title e.g. Headphones..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <select
            value={forPerson}
            onChange={(e) => setForPerson(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          >
            <option value="Liam">Liam</option>
            <option value="Emma">Emma</option>
            <option value="Sarah">Sarah</option>
            <option value="David">David</option>
          </select>
          <input
            type="number"
            placeholder="Est. Price $"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-600/30"
          >
            <Plus className="w-4 h-4" /> Save Wishlist Item
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {wishlist.map((w) => (
          <div
            key={w.id}
            className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
              w.isClaimed ? 'bg-slate-950/40 border-slate-900 text-slate-500' : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-rose-300 font-bold text-[10px]">
                  For {w.forPerson}
                </span>
                <span className="text-xs font-black text-white">${w.price}</span>
              </div>
              <div className="font-bold text-base text-white">{w.title}</div>
              <div className="text-xs text-slate-400 mt-1">{w.occasion}</div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {w.isClaimed ? `Claimed by ${w.claimedBy || 'Someone'}` : 'Unclaimed'}
              </span>
              <button
                onClick={() => handleClaimToggle(w.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  w.isClaimed
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20'
                }`}
              >
                {w.isClaimed ? 'Mark Unclaimed' : 'Mark Claimed 🎁'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
