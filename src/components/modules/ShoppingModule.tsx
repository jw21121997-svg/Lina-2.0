import React, { useState } from 'react';
import { ShoppingCart, Plus, Check, Trash2, Tag, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../lib/api';

export const ShoppingModule: React.FC = () => {
  const { user, shopping, refreshAllModules, sendMessage, setActiveModule } = useAppStore();
  const [newItemName, setNewItemName] = useState('');
  const [newCategory, setNewCategory] = useState('Produce');
  const [newQuantity, setNewQuantity] = useState(1);
  const [selectedCatFilter, setSelectedCatFilter] = useState('All');

  const categories = ['All', 'Produce', 'Dairy', 'Bakery', 'Household', 'Pantry', 'Meat', 'General'];

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    await api.addShoppingItem({
      name: newItemName.trim(),
      category: newCategory,
      quantity: Number(newQuantity) || 1,
      addedBy: user?.name || 'User',
    });
    setNewItemName('');
    await refreshAllModules();
  };

  const handleToggle = async (id: string, isChecked: boolean) => {
    await api.toggleShoppingItem(id, isChecked);
    await refreshAllModules();
  };

  const handleDelete = async (id: string) => {
    await api.deleteShoppingItem(id);
    await refreshAllModules();
  };

  const filteredItems = selectedCatFilter === 'All'
    ? shopping
    : shopping.filter((i) => i.category.toLowerCase() === selectedCatFilter.toLowerCase());

  return (
    <div className="flex-1 h-full overflow-y-auto min-h-0 p-4 md:p-8 space-y-6 bg-slate-950 text-slate-100">
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Family Shopping List</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Organized by category with instant check-off and AI sync</p>
        </div>

        <button
          onClick={() => {
            sendMessage('Show my current shopping list and suggest missing staple groceries based on our pantry');
            setActiveModule('chat');
          }}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-violet-600/20"
        >
          <Sparkles className="w-4 h-4" /> AI Grocery Suggestions
        </button>
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAddItem} className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Item name e.g., Organic Bananas..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="md:col-span-2 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          >
            {categories.filter((c) => c !== 'All').map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-violet-600/30"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </form>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCatFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              selectedCatFilter === cat
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
            No items in your shopping list yet. Add groceries using the form above or ask Lina AI in chat!
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                item.isChecked
                  ? 'bg-slate-950/40 border-slate-900 text-slate-500 line-through'
                  : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(item.id, !item.isChecked)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                    item.isChecked
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-700 hover:border-violet-500'
                  }`}
                >
                  {item.isChecked && <Check className="w-4 h-4" />}
                </button>
                <div>
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="px-2 py-0.2 rounded bg-slate-800 text-violet-300 font-bold">{item.category}</span>
                    <span>Qty: {item.quantity} {item.unit || ''}</span>
                    <span>• Added by {item.addedBy}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
