import React, { useState } from 'react';
import { Award, Plus, Check, Gift, Sparkles, UserCheck, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../lib/api';

export const ChoresModule: React.FC = () => {
  const { chores, familyMembers, refreshAllModules } = useAppStore();
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('Liam');
  const [points, setPoints] = useState(20);
  const [rewardsList, setRewardsList] = useState<any[]>([]);

  // Fetch rewards on load
  React.useEffect(() => {
    api.getRewards().then(setRewardsList).catch(console.error);
  }, []);

  const handleAddChore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.addChore({
      title,
      assignedTo,
      points: Number(points) || 15,
      category: 'cleaning',
    });
    setTitle('');
    await refreshAllModules();
  };

  const handleToggleChore = async (id: string, isCompleted: boolean) => {
    await api.toggleChore(id, isCompleted);
    if (isCompleted) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
    await refreshAllModules();
  };

  const handleRedeemReward = async (rewardId: string, memberName: string) => {
    try {
      const res = await api.redeemReward(rewardId, memberName);
      if (res.success) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
        await refreshAllModules();
      }
    } catch (err: any) {
      alert(err.message || 'Points insufficient for reward redemption');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">Chores & Kid Rewards Matrix</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Assign family duties, earn reward points, and redeem prizes</p>
      </div>

      {/* Points Ledger Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {familyMembers.map((member) => (
          <div
            key={member.id}
            className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{member.avatar}</div>
              <div>
                <div className="font-bold text-sm text-white">{member.name}</div>
                <div className="text-xs text-amber-400 font-extrabold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" /> {member.pointsBalance} PTS
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Chore Form */}
      <form onSubmit={handleAddChore} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white">Assign New Chore</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Chore title e.g., Walk Buddy for 30 mins..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          >
            {familyMembers.map((m) => (
              <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Points e.g., 20"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-amber-600/30"
          >
            <Plus className="w-4 h-4" /> Assign Chore
          </button>
        </div>
      </form>

      {/* Active Chores List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300">Family Chore Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {chores.map((chore) => (
            <div
              key={chore.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                chore.isCompleted
                  ? 'bg-slate-950/40 border-slate-900 text-slate-500 line-through'
                  : 'bg-slate-900/60 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleChore(chore.id, !chore.isCompleted)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                    chore.isCompleted ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-700 hover:border-amber-500'
                  }`}
                >
                  {chore.isCompleted && <Check className="w-4 h-4" />}
                </button>
                <div>
                  <div className="font-bold text-sm">{chore.title}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="text-amber-400 font-extrabold">+{chore.points} PTS</span>
                    <span>• Assigned to {chore.assignedTo}</span>
                  </div>
                </div>
              </div>

              {chore.isCompleted && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  Completed 🎉
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reward Catalog Section */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" /> Reward Catalog
          </h3>
          <span className="text-xs text-slate-400">Redeem points for real perks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rewardsList.map((rw) => (
            <div
              key={rw.id}
              className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="text-3xl mb-2">{rw.icon}</div>
                <div className="font-bold text-sm text-white">{rw.title}</div>
                <p className="text-xs text-slate-400 mt-1">{rw.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="text-xs font-black text-amber-400">{rw.pointsCost} Points</div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleRedeemReward(rw.id, 'Liam')}
                    className="flex-1 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-[11px] font-bold transition-all"
                  >
                    Redeem (Liam)
                  </button>
                  <button
                    onClick={() => handleRedeemReward(rw.id, 'Emma')}
                    className="flex-1 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-[11px] font-bold transition-all"
                  >
                    Redeem (Emma)
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
