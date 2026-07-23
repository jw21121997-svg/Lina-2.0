import React, { useState } from 'react';
import {
  MessageSquare,
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  Calendar,
  CheckSquare,
  Award,
  Package,
  FileText,
  Utensils,
  CreditCard,
  Wrench,
  Dog,
  Gift,
  PhoneCall,
  Users,
  Plus,
  Pin,
  Trash2,
  Edit2,
  Download,
  Search,
  Sparkles,
  HardDrive,
  ChevronDown,
  ChevronRight,
  Home,
  BookOpen,
  ShieldCheck,
  Heart,
  FolderTree,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ModuleId } from '../../types';
import { LinaAssistantLogo } from '../common/LinaAssistantLogo';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

interface CategoryGroup {
  id: string;
  name: string;
  icon: any;
  items: {
    id: ModuleId;
    label: string;
    icon: any;
    badge?: number;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const {
    user,
    logout,
    activeModule,
    setActiveModule,
    conversations,
    activeConvId,
    setActiveConvId,
    createNewConversation,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    shopping,
    chores,
    pantry,
    bills,
  } = useAppStore();

  const [moduleSearch, setModuleSearch] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Category collapse states (default open)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const pendingChoresCount = chores.filter((c) => !c.isCompleted).length;
  const uncheckedShoppingCount = shopping.filter((s) => !s.isChecked).length;
  const lowPantryCount = pantry.filter((p) => p.quantity <= p.minThreshold).length;
  const upcomingBillsCount = bills.filter((b) => b.status === 'Upcoming').length;

  const handleSelectModule = (mod: ModuleId) => {
    setActiveModule(mod);
    if (onCloseMobile) onCloseMobile();
  };

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveRename = (id: string) => {
    if (editingTitle.trim()) {
      renameConversation(id, editingTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleExportMarkdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;

    let md = `# ${conv.title}\n\n*Exported from Lina AI Assistant on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
    conv.messages.forEach((m) => {
      md += `### ${m.role === 'user' ? '👤 User' : '✨ Lina AI'} (${m.timestamp})\n\n${m.content}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conv.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
  };

  // Structured Categorized Hierarchical Menu
  const categories: CategoryGroup[] = [
    {
      id: 'ai_core',
      name: 'AI Core & Intelligence',
      icon: Sparkles,
      items: [
        { id: 'chat', label: 'AI Assistant Chat', icon: MessageSquare },
        { id: 'dashboard', label: 'Daily Digest', icon: LayoutDashboard },
      ],
    },
    {
      id: 'home_daily',
      name: 'Home & Logistics',
      icon: Home,
      items: [
        { id: 'shopping', label: 'Shopping List', icon: ShoppingCart, badge: uncheckedShoppingCount },
        { id: 'pantry', label: 'Pantry & Stock', icon: Package, badge: lowPantryCount },
        { id: 'chores', label: 'Chores & Rewards', icon: Award, badge: pendingChoresCount },
        { id: 'reminders', label: 'Reminders', icon: CheckSquare },
        { id: 'calendar', label: 'Calendar Agenda', icon: Calendar },
      ],
    },
    {
      id: 'finance_admin',
      name: 'Finance & Admin',
      icon: DollarSign,
      items: [
        { id: 'budget', label: 'Budget & Expenses', icon: DollarSign },
        { id: 'bills', label: 'Bills & Subscriptions', icon: CreditCard, badge: upcomingBillsCount },
      ],
    },
    {
      id: 'knowledge_docs',
      name: 'Knowledge & Drive',
      icon: BookOpen,
      items: [
        { id: 'notes', label: 'Notes & Recipes', icon: FileText },
        { id: 'drive', label: 'Google Drive Files', icon: HardDrive },
        { id: 'meals', label: 'Meal Planner', icon: Utensils },
      ],
    },
    {
      id: 'property_care',
      name: 'Property & Pet Care',
      icon: ShieldCheck,
      items: [
        { id: 'maintenance', label: 'Home Maintenance', icon: Wrench },
        { id: 'petcare', label: 'Pet Care Manager', icon: Dog },
      ],
    },
    {
      id: 'family_social',
      name: 'Family & Social',
      icon: Heart,
      items: [
        { id: 'wishlist', label: 'Family Wishlist', icon: Gift },
        { id: 'emergency', label: 'Emergency Contacts', icon: PhoneCall },
        { id: 'familyroom', label: 'Family Chat Room', icon: Users },
      ],
    },
  ];

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(chatSearch.toLowerCase())
  );

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-2xl flex flex-col transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Sidebar Header & Brand Logo */}
      <div className="p-4 border-b border-slate-800/60 space-y-3">
        <div className="flex items-center justify-center py-1">
          <LinaAssistantLogo size="md" />
        </div>

        <button
          onClick={() => {
            createNewConversation();
            setActiveModule('chat');
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" /> New AI Conversation
        </button>
      </div>

      {/* Module Navigation Tabs Hierarchy */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Module Search Filter */}
        <div className="px-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search feature hierarchy..."
              value={moduleSearch}
              onChange={(e) => setModuleSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-200 focus:outline-none focus:border-violet-500 transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Categories Hierarchy Accordion */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <div className="flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-violet-400" />
              <span>Feature Hierarchy</span>
            </div>
            <button
              onClick={() => {
                const allCollapsed = Object.keys(collapsedCategories).length === categories.length && Object.values(collapsedCategories).every(Boolean);
                const nextState: Record<string, boolean> = {};
                categories.forEach((c) => (nextState[c.id] = !allCollapsed));
                setCollapsedCategories(nextState);
              }}
              className="text-[9px] text-violet-400 hover:underline font-normal capitalize"
            >
              Toggle All
            </button>
          </div>

          {categories.map((cat) => {
            const CatIcon = cat.icon;
            const isCollapsed = collapsedCategories[cat.id];

            // Filter items if searching
            const matchedItems = cat.items.filter(
              (item) =>
                item.label.toLowerCase().includes(moduleSearch.toLowerCase()) ||
                cat.name.toLowerCase().includes(moduleSearch.toLowerCase())
            );

            if (moduleSearch.trim() && matchedItems.length === 0) return null;

            // Total badges in category
            const totalBadges = cat.items.reduce((acc, item) => acc + (item.badge || 0), 0);

            return (
              <div key={cat.id} className="space-y-1">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed && !moduleSearch ? (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400 transition-colors" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400 transition-colors" />
                    )}
                    <CatIcon className="w-3.5 h-3.5 text-violet-400" />
                    <span className="tracking-tight">{cat.name}</span>
                  </div>

                  {totalBadges > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[9px] font-bold">
                      {totalBadges}
                    </span>
                  )}
                </button>

                {/* Category Sub-items */}
                {(!isCollapsed || moduleSearch) && (
                  <div className="pl-3 space-y-0.5 border-l border-slate-800/80 ml-4 py-0.5">
                    {matchedItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeModule === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectModule(item.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-violet-600/25 text-violet-200 border border-violet-500/40 font-bold shadow-sm'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-violet-300' : 'text-slate-500'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold text-[10px]">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Chat History Section */}
        <div className="space-y-2 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Conversations ({conversations.length})
            </span>
          </div>

          {/* Chat Search */}
          <div className="px-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search chats..."
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-200 focus:outline-none focus:border-violet-500 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1 max-h-40 overflow-y-auto px-1">
            {filteredConversations.map((conv) => {
              const isActive = activeConvId === conv.id && activeModule === 'chat';
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    setActiveModule('chat');
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-slate-800/80 text-white border border-slate-700/80 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <MessageSquare className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    {editingChatId === conv.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleSaveRename(conv.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(conv.id)}
                        autoFocus
                        className="bg-slate-950 px-1 py-0.5 rounded text-xs text-white border border-violet-500"
                      />
                    ) : (
                      <span className="truncate text-[11px]">{conv.title}</span>
                    )}
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinConversation(conv.id);
                      }}
                      className={`p-1 hover:text-violet-400 ${conv.pinned ? 'text-violet-400 opacity-100' : 'text-slate-500'}`}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleStartRename(conv.id, conv.title, e)}
                      className="p-1 text-slate-500 hover:text-slate-200"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleExportMarkdown(conv.id, e)}
                      className="p-1 text-slate-500 hover:text-cyan-400"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="p-1 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active User Profile Pill */}
      {user && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 p-0.5 shrink-0 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-violet-300">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-violet-400 font-medium truncate">{user.role || 'Home Admin'}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Sign Out"
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Footer Status */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-950/80 text-center text-[10px] text-slate-500">
        Lina AI v2.5 • Cloud SQL & Firebase Integrated
      </div>
    </aside>
  );
};
