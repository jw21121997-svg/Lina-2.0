import React, { useState } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Settings,
  Brain,
  Globe,
  Sun,
  Moon,
  Laptop,
  Cloud,
  ChevronDown,
  Menu,
  ShieldCheck,
  Zap,
  Radio,
  LogOut,
  User,
  Shield,
  Check,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { VoiceAgentModal } from '../chat/VoiceAgentModal';
import { SettingsModal } from '../settings/SettingsModal';
import { LinaAssistantLogo } from '../common/LinaAssistantLogo';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    user,
    logout,
    theme,
    setTheme,
    activeModel,
    setActiveModel,
    thinkingEnabled,
    setThinkingEnabled,
    webSearchEnabled,
    setWebSearchEnabled,
    weather,
    handsFreeEnabled,
    setHandsFreeEnabled,
    isVoiceModalOpen,
    setIsVoiceModalOpen,
    isWakeWordListening,
  } = useAppStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-all">
        {/* Left Brand / Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <LinaAssistantLogo size="sm" />
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-[10px] font-bold text-violet-300">
              AGENTIC
            </span>
          </div>
        </div>

        {/* Center Toggles: Thinking Mode, Grounding, Model Dropdown */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
          {/* Model Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-all border border-slate-700/60"
            >
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span>{activeModel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isModelDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 w-52 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-40 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                {[
                  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
                  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
                  { id: 'gpt-4o', label: 'OpenAI GPT-4o' },
                  { id: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveModel(m.id as any);
                      setIsModelDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      activeModel === m.id
                        ? 'bg-violet-600/20 text-violet-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reasoning / Thinking Toggle */}
          <button
            onClick={() => setThinkingEnabled(!thinkingEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              thinkingEnabled
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Thinking</span>
          </button>

          {/* Web Search Grounding Toggle */}
          <button
            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              webSearchEnabled
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </div>

        {/* Right Actions: Weather, Hands-Free Toggle, Mic Modal, Settings */}
        <div className="flex items-center gap-2">
          {weather && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-white">{weather.tempF}°F</span>
              <span className="text-slate-400 text-[11px]">{weather.condition}</span>
            </div>
          )}

          {/* Hands-Free Wake Word ("Hey Lina") Toggle */}
          <button
            onClick={() => setHandsFreeEnabled(!handsFreeEnabled)}
            title={handsFreeEnabled ? "Hands-free 'Hey Lina' wake-word active" : "Enable hands-free wake-word listener"}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium transition-all ${
              handsFreeEnabled
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isWakeWordListening ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="hidden sm:inline font-semibold">
              {handsFreeEnabled ? (isWakeWordListening ? 'Listening "Hey Lina"' : 'Hands-Free On') : 'Hands-Free Off'}
            </span>
          </button>

          {/* Direct Voice Modal Trigger */}
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/25 transition-all hover:scale-105 active:scale-95"
          >
            <Mic className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">Voice Agent</span>
          </button>

          {/* Theme Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1"
              title={`Current Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
            >
              {theme === 'light' && <Sun className="w-4 h-4 text-amber-400" />}
              {theme === 'dark' && <Moon className="w-4 h-4 text-violet-400" />}
              {theme === 'system' && <Laptop className="w-4 h-4 text-cyan-400" />}
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {isThemeDropdownOpen && (
              <div className="absolute top-full mt-2 right-0 w-44 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Theme Options
                </div>
                {[
                  { id: 'light', label: 'Light Theme', icon: Sun, color: 'text-amber-400' },
                  { id: 'dark', label: 'Dark Theme', icon: Moon, color: 'text-violet-400' },
                  { id: 'system', label: 'System Theme', icon: Laptop, color: 'text-cyan-400' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = theme === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setTheme(item.id as 'light' | 'dark' | 'system');
                        setIsThemeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-violet-600/20 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-violet-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Settings & AI Model Configurations"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-all hover:scale-105"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 p-0.5 shrink-0 overflow-hidden shadow-sm">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-violet-300">
                    {(user?.name || 'User').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-none">{user?.name || 'User'}</span>
                <span className="text-[9px] font-semibold text-violet-400 leading-tight mt-0.5">{user?.role || 'Member'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute top-full mt-2 right-0 w-64 rounded-2xl bg-slate-900 border border-slate-800 p-3 shadow-2xl z-50 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Header */}
                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 p-0.5 shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-violet-300">
                        {(user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-md border border-violet-500/30">
                      {user?.role || 'Home Admin'}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-slate-800 my-1" />

                {/* Actions */}
                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <Settings className="w-4 h-4 text-violet-400" />
                  <span>Settings & Model Keys</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Voice & Settings Modals */}
      <VoiceAgentModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
