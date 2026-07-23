import React, { useState } from 'react';
import { Calendar, Plus, Clock, MapPin, Users, Trash2, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../lib/api';

export const CalendarModule: React.FC = () => {
  const { calendar, refreshAllModules, sendMessage, setActiveModule } = useAppStore();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('12:00');
  const [location, setLocation] = useState('Home');
  const [category, setCategory] = useState<'family' | 'school' | 'medical' | 'work' | 'social' | 'maintenance'>('family');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.addCalendarEvent({
      title,
      date,
      time,
      location,
      category,
      attendees: ['Family'],
    });
    setTitle('');
    await refreshAllModules();
  };

  const handleDelete = async (id: string) => {
    await api.deleteCalendarEvent(id);
    await refreshAllModules();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)]">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Family Calendar & Agenda</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Appointments, practice schedules, doctor visits, and birthdays</p>
        </div>

        <button
          onClick={() => {
            sendMessage('Show my family agenda for this week and highlight any schedule conflicts');
            setActiveModule('chat');
          }}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-violet-600/20"
        >
          <Sparkles className="w-4 h-4" /> AI Agenda Sync
        </button>
      </div>

      {/* Add Event Form */}
      <form onSubmit={handleAdd} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Add Family Event</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Event Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="md:col-span-2 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-violet-600/30"
          >
            <Plus className="w-4 h-4" /> Schedule Event
          </button>
        </div>
      </form>

      {/* Events List */}
      <div className="space-y-3">
        {calendar.map((ev) => (
          <div
            key={ev.id}
            className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white">{ev.title}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 uppercase font-extrabold text-[10px]">
                  {ev.category}
                </span>
              </div>
              <div className="flex items-center gap-4 text-slate-400 text-xs">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {ev.date} {ev.time ? `@ ${ev.time}` : ''}</span>
                {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ev.location}</span>}
              </div>
            </div>

            <button
              onClick={() => handleDelete(ev.id)}
              className="p-2 text-slate-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
