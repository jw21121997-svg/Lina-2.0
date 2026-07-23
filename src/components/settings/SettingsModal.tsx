import React, { useState } from 'react';
import { X, Key, Brain, Users, Sparkles, Plus, Trash2, ShieldCheck, Sun, Moon, Laptop, Globe, Cpu, Server, User, LogOut, Save } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../lib/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    updateUserProfile,
    logout,
    theme,
    setTheme,
    activeModel,
    setActiveModel,
    activePersonaId,
    setActivePersonaId,
    apiKeyOverride,
    setApiKeyOverride,
    geminiApiKey,
    setGeminiApiKey,
    openaiApiKey,
    setOpenaiApiKey,
    claudeApiKey,
    setClaudeApiKey,
    deepseekApiKey,
    setDeepseekApiKey,
    openrouterApiKey,
    setOpenrouterApiKey,
    customApiEndpoint,
    setCustomApiEndpoint,
    customApiKey,
    setCustomApiKey,
    memories,
    personas,
    refreshAllModules,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'models' | 'keys' | 'personas' | 'memories'>('profile');
  const [editName, setEditName] = useState(user?.name || '');
  const [editRole, setEditRole] = useState(user?.role || 'Home Admin');
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  const [newMemoryCategory, setNewMemoryCategory] = useState<'preference' | 'family' | 'home' | 'health' | 'schedule'>('family');
  const [newMemoryFact, setNewMemoryFact] = useState<string>('');

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim()) {
      updateUserProfile({ name: editName.trim(), role: editRole });
      setProfileSavedMsg('Profile updated successfully!');
      setTimeout(() => setProfileSavedMsg(''), 3000);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryFact.trim()) return;
    await api.addMemory({ category: newMemoryCategory, fact: newMemoryFact });
    setNewMemoryFact('');
    await refreshAllModules();
  };

  const handleDeleteMemory = async (id: string) => {
    await api.deleteMemory(id);
    await refreshAllModules();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Lina AI Settings & Model API Keys</h2>
              <p className="text-xs text-slate-400">Configure Google Gemini, OpenAI, Claude, DeepSeek & custom keys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" /> User Profile
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'models'
                ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Models
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'keys'
                ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" /> API Keys Config
          </button>
          <button
            onClick={() => setActiveTab('personas')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'personas'
                ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Personas
          </button>
          <button
            onClick={() => setActiveTab('memories')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'memories'
                ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" /> AI Memories ({memories.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 p-0.5 shrink-0 overflow-hidden shadow-lg">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-violet-300">
                      {(user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-extrabold text-white">{user?.name || 'Logged-In User'}</h3>
                  <p className="text-xs text-slate-400">{user?.email || 'user@lina.ai'}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold text-violet-300 bg-violet-500/20 px-2.5 py-0.5 rounded-full border border-violet-500/30">
                      {user?.role || 'Home Admin'}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Auth Provider: {user?.provider || 'Email'}
                    </span>
                  </div>
                </div>
              </div>

              {profileSavedMsg && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{profileSavedMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 p-5 rounded-2xl bg-slate-950/40 border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Edit Profile Details</h4>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Household Role / Position</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Home Admin">Home Admin / Organizer</option>
                    <option value="Parent">Parent / Partner</option>
                    <option value="Family Member">Family Member</option>
                    <option value="Tech Lead">Household Tech Lead</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-violet-600/20"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      logout();
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-2 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Log Out
                  </button>
                </div>
              </form>

              {/* Theme & Appearance Preference */}
              <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" /> Interface Theme Mode
                </h4>
                <p className="text-xs text-slate-400">
                  Select your preferred visual appearance for the Lina AI Assistant interface:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {[
                    { id: 'light', label: 'Light Theme', desc: 'Clean, crisp high-contrast layout', icon: Sun, color: 'text-amber-400' },
                    { id: 'dark', label: 'Dark Theme', desc: 'Eye-friendly slate & twilight canvas', icon: Moon, color: 'text-violet-400' },
                    { id: 'system', label: 'System Default', desc: 'Matches your OS dark/light setting', icon: Laptop, color: 'text-cyan-400' },
                  ].map((tItem) => {
                    const TIcon = tItem.icon;
                    const isSelected = theme === tItem.id;
                    return (
                      <button
                        key={tItem.id}
                        type="button"
                        onClick={() => setTheme(tItem.id as 'light' | 'dark' | 'system')}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-violet-500 bg-violet-600/15 text-white shadow-lg shadow-violet-500/10'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <TIcon className={`w-5 h-5 ${tItem.color}`} />
                          {isSelected && (
                            <span className="text-[10px] bg-violet-500 text-white px-2 py-0.5 rounded-full font-bold">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-xs text-slate-100">{tItem.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{tItem.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vercel Deployment & Google Auth Authorization Guide */}
              <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" /> Vercel & Firebase Google Auth Guide
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When deployed on Vercel or custom domains (e.g., <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded">your-app.vercel.app</code>), Firebase Auth blocks Google Popup logins until your domain is authorized in Firebase.
                </p>
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="font-bold text-violet-300">How to authorize Vercel for Google Sign-In:</div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                    <li>Go to your <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">Firebase Console</a>.</li>
                    <li>Select project: <code className="text-amber-300 bg-slate-950 px-1 rounded">lina-assistant-c6b75</code></li>
                    <li>Navigate to <strong>Authentication</strong> &rarr; <strong>Settings</strong> &rarr; <strong>Authorized Domains</strong>.</li>
                    <li>Click <strong>Add Domain</strong> and enter your Vercel domain (e.g. <code className="text-emerald-300 bg-slate-950 px-1 rounded">*.vercel.app</code> or <code className="text-emerald-300 bg-slate-950 px-1 rounded">your-app-name.vercel.app</code>).</li>
                  </ol>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                    💡 <em>Tip: Our app automatically detects Vercel deployments and provides a seamless email prompt fallback so you are never locked out!</em>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Select Active AI Engine</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google AI', desc: 'Default fast multimodal AI with automated tool calls' },
                  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google AI', desc: 'Complex household reasoning & logic execution' },
                  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google AI', desc: 'Lightweight efficient Gemini engine' },
                  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', desc: 'Flagship OpenAI multimodal intelligence' },
                  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', desc: 'Fast, lightweight OpenAI model' },
                  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', desc: 'Articulate & deeply analytical assistant' },
                  { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek AI', desc: 'Advanced open-weights reasoning model' },
                  { id: 'grok-3', name: 'Grok 3', provider: 'xAI', desc: 'Real-time knowledge and fast responses' },
                  { id: 'openrouter-auto', name: 'OpenRouter Auto', provider: 'OpenRouter', desc: 'Unified API routing to 100+ AI models' },
                  { id: 'custom-llm', name: 'Custom LLM / Ollama', provider: 'Self-Hosted', desc: 'Local Ollama, LM Studio or private proxy' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveModel(item.id as any)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      activeModel === item.id
                        ? 'border-violet-500 bg-violet-500/10 text-white shadow-lg shadow-violet-500/10'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">{item.provider}</span>
                      {activeModel === item.id && (
                        <span className="text-[10px] bg-violet-500 text-white px-2 py-0.5 rounded-full font-semibold">Active</span>
                      )}
                    </div>
                    <div className="font-semibold text-sm text-slate-200">{item.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-violet-950/30 border border-violet-800/50 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <p className="font-bold text-violet-200">Flexible API Keys & Multi-Model Engine</p>
                  <p className="mt-0.5 text-slate-400">
                    Enter your custom API keys below for Google Gemini, OpenAI, Anthropic Claude, DeepSeek, or OpenRouter. If an API key is blank, Lina AI automatically falls back to the server built-in engine!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Google Gemini Key */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-400" /> Google Gemini API Key
                    </label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-violet-400 hover:underline"
                    >
                      Get Key ↗
                    </a>
                  </div>
                  <input
                    type="password"
                    placeholder="AIzaSy... (Google AI Studio)"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-mono focus:border-violet-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">For Gemini 2.5 Flash, Gemini 2.5 Pro & 1.5 Flash</p>
                </div>

                {/* OpenAI Key */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-400" /> OpenAI API Key
                    </label>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-400 hover:underline"
                    >
                      Get Key ↗
                    </a>
                  </div>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">For GPT-4o, GPT-4o Mini & o3-mini</p>
                </div>

                {/* Anthropic Claude Key */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-400" /> Anthropic Claude Key
                    </label>
                    <a
                      href="https://console.anthropic.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Get Key ↗
                    </a>
                  </div>
                  <input
                    type="password"
                    placeholder="sk-ant-..."
                    value={claudeApiKey}
                    onChange={(e) => setClaudeApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-mono focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">For Claude 3.5 Sonnet</p>
                </div>

                {/* DeepSeek Key */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-cyan-400" /> DeepSeek API Key
                    </label>
                    <a
                      href="https://platform.deepseek.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-cyan-400 hover:underline"
                    >
                      Get Key ↗
                    </a>
                  </div>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={deepseekApiKey}
                    onChange={(e) => setDeepseekApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">For DeepSeek R1 & V3 models</p>
                </div>

                {/* OpenRouter Key */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Server className="w-4 h-4 text-purple-400" /> OpenRouter API Key
                    </label>
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-purple-400 hover:underline"
                    >
                      Get Key ↗
                    </a>
                  </div>
                  <input
                    type="password"
                    placeholder="sk-or-..."
                    value={openrouterApiKey}
                    onChange={(e) => setOpenrouterApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-mono focus:border-purple-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">Access 100+ open/closed LLM models via single API</p>
                </div>

                {/* Custom / Ollama Endpoint */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Server className="w-4 h-4 text-rose-400" /> Custom LLM / Ollama Base URL
                  </label>
                  <input
                    type="text"
                    placeholder="http://localhost:11434/v1 or https://custom-proxy/v1"
                    value={customApiEndpoint}
                    onChange={(e) => setCustomApiEndpoint(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-mono focus:border-rose-500 focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Optional Custom API Key..."
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-mono focus:border-rose-500 focus:outline-none mt-1"
                  />
                </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300">Interface Theme</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'dark', label: 'Dark Mode', icon: Moon },
                    { id: 'light', label: 'Light Mode', icon: Sun },
                    { id: 'system', label: 'System', icon: Laptop },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id as any)}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                          theme === t.id
                            ? 'border-violet-500 bg-violet-500/10 text-white'
                            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" /> {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'personas' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Choose Household AI Persona</h3>
              <div className="space-y-3">
                {personas.map((persona) => (
                  <div
                    key={persona.id}
                    onClick={() => setActivePersonaId(persona.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                      activePersonaId === persona.id
                        ? 'border-violet-500 bg-violet-500/10 text-white shadow-lg shadow-violet-500/10'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-3xl p-2 rounded-2xl bg-slate-800 border border-slate-700">{persona.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-slate-100">{persona.name}</div>
                        <span className="text-xs text-violet-400 font-medium">{persona.role}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{persona.systemPrompt}</p>
                      <div className="text-[11px] text-slate-500 mt-2 italic">Tone: {persona.tone}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'memories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-300">Household Facts & AI Memory</h3>
                <span className="text-xs text-slate-400">Injected automatically into system prompts</span>
              </div>

              {/* Add Memory Form */}
              <form onSubmit={handleAddMemory} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <select
                    value={newMemoryCategory}
                    onChange={(e: any) => setNewMemoryCategory(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    <option value="family">Family</option>
                    <option value="home">Home</option>
                    <option value="preference">Preference</option>
                    <option value="health">Health & Allergy</option>
                    <option value="schedule">Schedule</option>
                  </select>
                  <input
                    type="text"
                    placeholder="e.g., Liam is allergic to peanuts..."
                    value={newMemoryFact}
                    onChange={(e) => setNewMemoryFact(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-violet-600/20"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </form>

              {/* Memory List */}
              <div className="space-y-2">
                {memories.map((mem) => (
                  <div
                    key={mem.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 uppercase font-bold text-[10px]">
                        {mem.category}
                      </span>
                      <span>{mem.fact}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteMemory(mem.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
