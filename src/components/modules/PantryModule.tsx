import React, { useState } from 'react';
import { Package, Plus, Minus, RefreshCw, AlertTriangle, Trash2, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../lib/api';

export const PantryModule: React.FC = () => {
  const { pantry, refreshAllModules, sendMessage, setActiveModule } = useAppStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Dairy');
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState<'Pantry' | 'Fridge' | 'Freezer' | 'Cabinet'>('Pantry');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.addPantryItem({
      name,
      category,
      quantity: Number(quantity) || 1,
      minThreshold: 1,
      location,
    });
    setName('');
    await refreshAllModules();
  };

  const handleUpdateQty = async (id: string, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    await api.updatePantryQty(id, newQty);
    await refreshAllModules();
  };

  const handleSyncToShopping = async () => {
    const res = await api.syncPantryToShopping();
    alert(`Pantry Sync Complete! Added ${res.addedCount} low-stock items to your shopping list.`);
    await refreshAllModules();
  };

  return (
    <div className="flex-1 h-full overflow-y-auto min-h-0 p-4 md:p-8 space-y-6 bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Pantry & Fridge Inventory</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Track stock levels, location, and auto-sync missing staples to shopping list</p>
        </div>

        <button
          onClick={handleSyncToShopping}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <RefreshCw className="w-4 h-4" /> Sync Low Stock to Shopping
        </button>
      </div>

      {/* Add Pantry Form */}
      <form onSubmit={handleAdd} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Item name e.g. Jasmine Rice..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="md:col-span-2 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <select
            value={location}
            onChange={(e: any) => setLocation(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          >
            <option value="Pantry">Pantry</option>
            <option value="Fridge">Fridge</option>
            <option value="Freezer">Freezer</option>
            <option value="Cabinet">Cabinet</option>
          </select>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30"
          >
            <Plus className="w-4 h-4" /> Add Stock
          </button>
        </div>
      </form>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pantry.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
            No pantry items registered yet. Use the form above to record fridge, freezer, or pantry stock.
          </div>
        ) : (
          pantry.map((item) => {
            const isLow = item.quantity <= item.minThreshold;
            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  isLow ? 'bg-amber-950/20 border-amber-500/40' : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-violet-300 font-bold text-[10px] uppercase">
                      {item.location}
                    </span>
                    {isLow && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-base text-white">{item.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{item.category} • Min: {item.minThreshold} {item.unit}</div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4">
                  <div className="text-sm font-extrabold text-slate-200">
                    Quantity: <span className={isLow ? 'text-amber-400 font-black' : 'text-white'}>{item.quantity}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateQty(item.id, item.quantity, -1)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateQty(item.id, item.quantity, 1)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => api.deletePantryItem(item.id).then(refreshAllModules)}
                      className="p-1.5 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
