import React from 'react';
import {
  Sparkles,
  ShoppingCart,
  Award,
  Calendar,
  CreditCard,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { LinaAssistantLogo } from '../common/LinaAssistantLogo';

export const DashboardModule: React.FC = () => {
  const {
    user,
    digest,
    weather,
    shopping,
    chores,
    pantry,
    bills,
    calendar,
    setActiveModule,
    sendMessage,
  } = useAppStore();

  const pendingChores = chores.filter((c) => !c.isCompleted);
  const uncheckedShopping = shopping.filter((s) => !s.isChecked);
  const lowPantry = pantry.filter((p) => p.quantity <= p.minThreshold);
  const upcomingBills = bills.filter((b) => b.status === 'Upcoming');

  const greetingName = user?.name ? user.name.split(' ')[0] : 'Alex';

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)]">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-violet-950/80 via-indigo-950/60 to-slate-900 border border-violet-500/30 p-6 md:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <LinaAssistantLogo size="md" />
              {user?.role && (
                <span className="text-[10px] font-bold text-violet-300 bg-violet-500/20 px-2.5 py-0.5 rounded-full border border-violet-500/30">
                  {user.role}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {greetingName}! 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {digest?.aiAdvice || `Lina AI is keeping your home schedule, chores, meals, and finances synchronized smoothly today.`}
            </p>
          </div>

          {/* Weather Widget */}
          {weather && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-md flex items-center gap-4 min-w-[200px]">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Cloud className="w-8 h-8" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{weather.tempF}°F</div>
                <div className="text-xs text-slate-300 font-semibold">{weather.location}</div>
                <div className="text-[10px] text-slate-400">{weather.condition} • High {weather.highF}°</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveModule('shopping')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-violet-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 group-hover:text-violet-400 transition-colors flex items-center gap-1 font-semibold">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{uncheckedShopping.length}</div>
          <div className="text-xs text-slate-400 font-medium">Items to Buy</div>
        </div>

        <div
          onClick={() => setActiveModule('chores')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 group-hover:text-amber-400 transition-colors flex items-center gap-1 font-semibold">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{pendingChores.length}</div>
          <div className="text-xs text-slate-400 font-medium">Pending Chores</div>
        </div>

        <div
          onClick={() => setActiveModule('pantry')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 group-hover:text-emerald-400 transition-colors flex items-center gap-1 font-semibold">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{lowPantry.length}</div>
          <div className="text-xs text-slate-400 font-medium">Low Stock Pantry Items</div>
        </div>

        <div
          onClick={() => setActiveModule('bills')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-400 group-hover:text-cyan-400 transition-colors flex items-center gap-1 font-semibold">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{upcomingBills.length}</div>
          <div className="text-xs text-slate-400 font-medium">Upcoming Bills</div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Calendar Agenda */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" /> Family Schedule & Events
            </h3>
            <button
              onClick={() => setActiveModule('calendar')}
              className="text-xs text-violet-400 font-semibold hover:underline"
            >
              Open Agenda
            </button>
          </div>

          <div className="space-y-3">
            {calendar.slice(0, 4).map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-100">{ev.title}</div>
                  <div className="text-slate-400 text-[11px]">
                    {ev.date} {ev.time ? `@ ${ev.time}` : ''} • {ev.location}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 font-semibold uppercase text-[10px]">
                  {ev.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock & Alerts Action Box */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Low Stock & Urgent Items
            </h3>
            <button
              onClick={() => {
                sendMessage('Check pantry stock and add missing items to shopping list');
                setActiveModule('chat');
              }}
              className="px-3 py-1 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 transition-colors"
            >
              Ask AI to Restock
            </button>
          </div>

          <div className="space-y-3">
            {lowPantry.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-100">{item.name}</div>
                  <div className="text-amber-400 text-[11px]">
                    Qty: {item.quantity} {item.unit} (Threshold: {item.minThreshold})
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[10px]">
                  Low Stock
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
