import React, { useState } from 'react';
import { Dog, Plus, Phone, Calendar, HeartHandshake } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../lib/api';

export const PetCareModule: React.FC = () => {
  const { pets, refreshAllModules } = useAppStore();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'Dog' | 'Cat' | 'Bird' | 'Fish' | 'Other'>('Dog');
  const [breed, setBreed] = useState('');
  const [feedingSchedule, setFeedingSchedule] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.addPet({
      name,
      species,
      breed,
      feedingSchedule: feedingSchedule || 'Morning and Evening',
      vetName: 'Sunny Valley Pet Hospital',
      vetPhone: '(555) 234-5678',
      medications: [],
    });
    setName('');
    setBreed('');
    setFeedingSchedule('');
    await refreshAllModules();
  };

  return (
    <div className="flex-1 h-full overflow-y-auto min-h-0 p-4 md:p-8 space-y-6 bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <Dog className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">Pet Care Manager</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Pet profiles, feeding routines, vet contact details, and medications</p>
      </div>

      <form onSubmit={handleAdd} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Pet name e.g. Buddy..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <select
            value={species}
            onChange={(e: any) => setSpecies(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          >
            <option value="Dog">Dog 🐕</option>
            <option value="Cat">Cat 🐈</option>
            <option value="Bird">Bird 🦜</option>
            <option value="Fish">Fish 🐠</option>
          </select>
          <input
            type="text"
            placeholder="Feeding Schedule e.g. 7:30 AM & 6:00 PM..."
            value={feedingSchedule}
            onChange={(e) => setFeedingSchedule(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-amber-600/30"
          >
            <Plus className="w-4 h-4" /> Add Pet
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pets.map((p) => (
          <div key={p.id} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-4xl p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  {p.species === 'Dog' ? '🐕' : p.species === 'Cat' ? '🐈' : '🐾'}
                </div>
                <div>
                  <div className="font-extrabold text-lg text-white">{p.name}</div>
                  <div className="text-xs text-amber-400">{p.breed} • {p.age}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
              <div>
                <span className="font-bold text-slate-400">Feeding Schedule:</span>
                <div className="text-slate-200">{p.feedingSchedule}</div>
              </div>
              <div>
                <span className="font-bold text-slate-400">Veterinarian:</span>
                <div className="text-slate-200 flex items-center gap-2">
                  <span>{p.vetName}</span>
                  <a href={`tel:${p.vetPhone}`} className="text-cyan-400 underline font-semibold">{p.vetPhone}</a>
                </div>
              </div>
              {p.medications && p.medications.length > 0 && (
                <div>
                  <span className="font-bold text-slate-400">Medications & Preventative:</span>
                  <div className="text-amber-300 font-medium">{p.medications.join(', ')}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
