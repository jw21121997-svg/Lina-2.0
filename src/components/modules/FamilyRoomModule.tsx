import React, { useState } from 'react';
import { Users, Send, Sparkles, Bot } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../lib/api';

export const FamilyRoomModule: React.FC = () => {
  const { familyChat, familyMembers, refreshAllModules } = useAppStore();
  const [activeMember, setActiveMember] = useState(familyMembers[0] || { name: 'Sarah', avatar: '👩‍💼' });
  const [inputText, setInputText] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    await api.sendFamilyChatMessage(text, activeMember.name, activeMember.avatar);
    await refreshAllModules();

    // Refresh after 1 second for Lina's AI auto-response!
    setTimeout(() => {
      refreshAllModules();
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="p-4 md:p-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-400" />
            <h1 className="text-xl font-bold text-white">Family Room Chat</h1>
          </div>
          <p className="text-xs text-slate-400">Mention <span className="text-violet-400 font-bold">@Lina</span> to bring the AI assistant into the conversation!</p>
        </div>

        {/* Sender Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <span className="text-[11px] text-slate-400 px-2 font-semibold hidden sm:inline">Sending as:</span>
          {familyMembers.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMember(m)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                activeMember.name === m.name
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{m.avatar}</span>
              <span className="hidden md:inline">{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 md:p-6 space-y-4 overscroll-contain">
        {familyChat.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-2xl ${
              msg.isAiResponse ? 'mx-auto' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0">
              {msg.senderAvatar || '👤'}
            </div>
            <div
              className={`p-4 rounded-3xl text-xs space-y-1 ${
                msg.isAiResponse
                  ? 'bg-violet-950/60 border border-violet-500/40 text-violet-200'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-4 font-bold">
                <span className={msg.isAiResponse ? 'text-violet-300 flex items-center gap-1' : 'text-slate-300'}>
                  {msg.senderName} {msg.isAiResponse && <Sparkles className="w-3 h-3 text-violet-400" />}
                </span>
                <span className="text-[10px] text-slate-500 font-normal">{msg.timestamp}</span>
              </div>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="text"
            placeholder={`Type a family message... (e.g. "@Lina add popcorn to shopping list")`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 transition-all shadow-md shadow-violet-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
