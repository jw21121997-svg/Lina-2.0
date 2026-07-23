import React, { useState } from 'react';
import { Utensils, Sparkles, BookOpen, Clock, Heart, Plus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../lib/api';

export const MealPlannerModule: React.FC = () => {
  const { meals, recipes, refreshAllModules, sendMessage, setActiveModule } = useAppStore();
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [dinnerInput, setDinnerInput] = useState('');

  const handleUpdateDinner = async (dayId: string) => {
    if (!dinnerInput.trim()) return;
    await api.updateMealPlanDay(dayId, { dinner: dinnerInput.trim() });
    setEditingDayId(null);
    setDinnerInput('');
    await refreshAllModules();
  };

  const handleGenerateShoppingFromMeals = async () => {
    sendMessage('Read our weekly meal plan and automatically add all missing dinner ingredients to our shopping list');
    setActiveModule('chat');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)]">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Utensils className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Weekly Meal Planner & Recipes</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Plan dinners for the week, organize recipes, and auto-generate grocery lists</p>
        </div>

        <button
          onClick={handleGenerateShoppingFromMeals}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-600/20"
        >
          <Sparkles className="w-4 h-4" /> Add Ingredients to Shopping
        </button>
      </div>

      {/* Mon-Sun Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {meals.map((m) => (
          <div
            key={m.id}
            className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-cyan-400">{m.day}</span>
                <span className="text-[10px] text-slate-500">{m.date}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Breakfast</span>
                  <div className="text-slate-200">{m.breakfast || '—'}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Lunch</span>
                  <div className="text-slate-200">{m.lunch || '—'}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400">Dinner</span>
                  {editingDayId === m.id ? (
                    <div className="flex gap-1 mt-1">
                      <input
                        type="text"
                        value={dinnerInput}
                        onChange={(e) => setDinnerInput(e.target.value)}
                        placeholder="Dinner menu..."
                        className="flex-1 px-2 py-1 rounded bg-slate-950 border border-cyan-500 text-xs text-white"
                      />
                      <button
                        onClick={() => handleUpdateDinner(m.id)}
                        className="px-2 py-1 bg-cyan-600 text-white text-[10px] font-bold rounded"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setEditingDayId(m.id);
                        setDinnerInput(m.dinner);
                      }}
                      className="font-bold text-white cursor-pointer hover:text-cyan-300 transition-colors"
                    >
                      {m.dinner || 'Click to add dinner...'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Bookmarks Section */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" /> Saved Family Recipes
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((rc) => (
            <div key={rc.id} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-base text-white">{rc.title}</div>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3">
                <span><Clock className="w-3.5 h-3.5 inline mr-1" /> {rc.prepTime}</span>
                <span>Category: {rc.category}</span>
                <span>Servings: {rc.servings}</span>
              </div>
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-500">Ingredients</span>
                <div className="flex flex-wrap gap-1">
                  {rc.ingredients.map((ing, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 text-[10px]">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
