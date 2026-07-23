import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import {
  ModuleId,
  AIModelId,
  ChatConversation,
  ChatMessage,
  Persona,
  AIMemory,
  FamilyMember,
  ShoppingItem,
  BudgetEntry,
  CalendarEvent,
  ReminderItem,
  ChoreItem,
  PantryItem,
  NoteItem,
  MealPlanDay,
  BillItem,
  MaintenanceTask,
  PetProfile,
  WishlistItem,
  EmergencyContact,
  FamilyChatMessage,
  DailyDigest,
  UserProfile,
} from '../types';
import { api, streamChatResponse } from '../lib/api';
import { loginWithGoogle as firebaseLoginWithGoogle, logout as firebaseLogout, initAuthListener } from '../lib/firebase';

interface AppState {
  // Auth & User Profile State
  user: UserProfile | null;
  isLoggedIn: boolean;
  setUser: (user: UserProfile | null) => void;
  login: (email: string, name?: string, provider?: 'email' | 'google' | 'guest', role?: string, avatar?: string) => void;
  signup: (name: string, email: string, role?: string) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  activeModule: ModuleId;
  setActiveModule: (mod: ModuleId) => void;

  theme: 'dark' | 'light' | 'system';
  setTheme: (t: 'dark' | 'light' | 'system') => void;

  activeModel: AIModelId;
  setActiveModel: (m: AIModelId) => void;

  thinkingEnabled: boolean;
  setThinkingEnabled: (val: boolean) => void;

  webSearchEnabled: boolean;
  setWebSearchEnabled: (val: boolean) => void;

  activePersonaId: string;
  setActivePersonaId: (id: string) => void;

  apiKeyOverride: string;
  setApiKeyOverride: (key: string) => void;

  // Multi-model API keys
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
  claudeApiKey: string;
  setClaudeApiKey: (key: string) => void;
  deepseekApiKey: string;
  setDeepseekApiKey: (key: string) => void;
  openrouterApiKey: string;
  setOpenrouterApiKey: (key: string) => void;
  customApiEndpoint: string;
  setCustomApiEndpoint: (url: string) => void;
  customApiKey: string;
  setCustomApiKey: (key: string) => void;

  // Hands-Free Wake Word & Voice Agent State
  handsFreeEnabled: boolean;
  setHandsFreeEnabled: (v: boolean) => void;
  isVoiceModalOpen: boolean;
  setIsVoiceModalOpen: (v: boolean) => void;
  initialVoiceQuery: string;
  setInitialVoiceQuery: (q: string) => void;
  isWakeWordListening: boolean;
  setIsWakeWordListening: (v: boolean) => void;

  // Conversations & Chat
  conversations: ChatConversation[];
  activeConvId: string | null;
  setActiveConvId: (id: string) => void;
  createNewConversation: () => string;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, newTitle: string) => void;
  togglePinConversation: (id: string) => void;
  sendMessage: (content: string, attachments?: { name: string; url: string; mimeType: string; data?: string }[]) => Promise<void>;
  isStreaming: boolean;

  // Module Data
  digest: DailyDigest | null;
  weather: any;
  familyMembers: FamilyMember[];
  memories: AIMemory[];
  personas: Persona[];
  shopping: ShoppingItem[];
  budget: BudgetEntry[];
  calendar: CalendarEvent[];
  reminders: ReminderItem[];
  chores: ChoreItem[];
  pantry: PantryItem[];
  notes: NoteItem[];
  meals: MealPlanDay[];
  bills: BillItem[];
  maintenance: MaintenanceTask[];
  pets: PetProfile[];
  wishlist: WishlistItem[];
  emergency: EmergencyContact[];
  familyChat: FamilyChatMessage[];

  // Refetch Helpers
  refreshAllModules: () => Promise<void>;
}

const initialConversation: ChatConversation = {
  id: 'conv_1',
  title: 'Welcome to Lina AI Assistant',
  pinned: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messages: [
    {
      id: 'm_welcome',
      role: 'assistant',
      content:
        '✨ Hello! I am **Lina**, your AI Home & Family Assistant.\n\nI can help manage your household in real-time:\n- 🛒 "Add organic milk, eggs, and sourdough to our shopping list"\n- 🧹 "Assign Liam a 20-point chore to fold the laundry"\n- 📅 "Add Emma\'s soccer match to calendar for Thursday at 4:30 PM"\n- 💵 "Log a $45 expense for air filters"\n- 🥗 "Show me low stock items in our pantry"\n\nHow can I help you and your family today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
};

export function useAppStoreLogic(): AppState {
  // User Authentication State
  const [user, setUserState] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('lina_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const setUser = (u: UserProfile | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('lina_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('lina_user');
    }
  };

  const login = (
    email: string,
    name?: string,
    provider: 'email' | 'google' | 'guest' = 'email',
    role: string = 'Home Admin',
    avatar?: string
  ) => {
    const formattedName = name && name.trim().length > 0 ? name.trim() : email.split('@')[0];
    const newUser: UserProfile = {
      id: 'usr_' + Date.now(),
      name: formattedName.charAt(0).toUpperCase() + formattedName.slice(1),
      email: email || 'user@lina.ai',
      avatar: avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      role,
      provider,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
  };

  const signup = (name: string, email: string, role: string = 'Home Admin') => {
    login(email, name, 'email', role);
  };

  const loginWithGoogle = async () => {
    const res = await firebaseLoginWithGoogle();
    if (res?.user) {
      const googleUser = res.user;
      login(
        googleUser.email || 'user@google.com',
        googleUser.displayName || googleUser.email?.split('@')[0] || 'Google User',
        'google',
        'Home Lead',
        googleUser.photoURL || undefined
      );
    }
  };

  // Sync with Firebase Auth state listener on mount
  useEffect(() => {
    const unsubscribe = initAuthListener(
      (authUser) => {
        const formattedName = authUser.displayName || authUser.email?.split('@')[0] || 'Google User';
        setUserState((prevUser) => {
          if (prevUser && prevUser.email === authUser.email && prevUser.provider === 'google') {
            return prevUser;
          }
          const syncedUser: UserProfile = {
            id: authUser.uid,
            name: formattedName.charAt(0).toUpperCase() + formattedName.slice(1),
            email: authUser.email || 'user@google.com',
            avatar: authUser.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
            role: prevUser?.role || 'Home Lead',
            provider: 'google',
            createdAt: prevUser?.createdAt || new Date().toISOString(),
          };
          localStorage.setItem('lina_user', JSON.stringify(syncedUser));
          return syncedUser;
        });
      },
      () => {
        // Unauthenticated state
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const logout = () => {
    setUser(null);
    firebaseLogout();
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
  };

  const [activeModule, setActiveModule] = useState<ModuleId>('chat');
  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>(() => {
    try {
      const saved = localStorage.getItem('lina_theme');
      return (saved as 'dark' | 'light' | 'system') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });
  const [activeModel, setActiveModel] = useState<AIModelId>('gemini-2.5-flash');
  const [thinkingEnabled, setThinkingEnabled] = useState<boolean>(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(false);
  const [activePersonaId, setActivePersonaId] = useState<string>('p1');
  const [apiKeyOverride, setApiKeyOverride] = useState<string>('');

  // Multi-model API keys state with LocalStorage persistence
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => localStorage.getItem('lina_key_gemini') || '');
  const [openaiApiKey, setOpenaiApiKey] = useState<string>(() => localStorage.getItem('lina_key_openai') || '');
  const [claudeApiKey, setClaudeApiKey] = useState<string>(() => localStorage.getItem('lina_key_claude') || '');
  const [deepseekApiKey, setDeepseekApiKey] = useState<string>(() => localStorage.getItem('lina_key_deepseek') || '');
  const [openrouterApiKey, setOpenrouterApiKey] = useState<string>(() => localStorage.getItem('lina_key_openrouter') || '');
  const [customApiEndpoint, setCustomApiEndpoint] = useState<string>(() => localStorage.getItem('lina_key_custom_endpoint') || '');
  const [customApiKey, setCustomApiKey] = useState<string>(() => localStorage.getItem('lina_key_custom_key') || '');

  useEffect(() => {
    localStorage.setItem('lina_key_gemini', geminiApiKey);
  }, [geminiApiKey]);
  useEffect(() => {
    localStorage.setItem('lina_key_openai', openaiApiKey);
  }, [openaiApiKey]);
  useEffect(() => {
    localStorage.setItem('lina_key_claude', claudeApiKey);
  }, [claudeApiKey]);
  useEffect(() => {
    localStorage.setItem('lina_key_deepseek', deepseekApiKey);
  }, [deepseekApiKey]);
  useEffect(() => {
    localStorage.setItem('lina_key_openrouter', openrouterApiKey);
  }, [openrouterApiKey]);
  useEffect(() => {
    localStorage.setItem('lina_key_custom_endpoint', customApiEndpoint);
  }, [customApiEndpoint]);
  useEffect(() => {
    localStorage.setItem('lina_key_custom_key', customApiKey);
  }, [customApiKey]);

  // Hands-Free & Voice Modal States
  const [handsFreeEnabled, setHandsFreeEnabled] = useState<boolean>(true);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [initialVoiceQuery, setInitialVoiceQuery] = useState<string>('');
  const [isWakeWordListening, setIsWakeWordListening] = useState<boolean>(false);

  // Conversations State
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    const saved = localStorage.getItem('lina_conversations');
    return saved ? JSON.parse(saved) : [initialConversation];
  });
  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || 'conv_1');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Module Data States
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [memories, setMemories] = useState<AIMemory[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [budget, setBudget] = useState<BudgetEntry[]>([]);
  const [calendar, setCalendar] = useState<CalendarEvent[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [chores, setChores] = useState<ChoreItem[]>([]);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [meals, setMeals] = useState<MealPlanDay[]>([]);
  const [bills, setBills] = useState<BillItem[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceTask[]>([]);
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [emergency, setEmergency] = useState<EmergencyContact[]>([]);
  const [familyChat, setFamilyChat] = useState<FamilyChatMessage[]>([]);

  // Apply Theme & handle System theme changes dynamically
  const setTheme = useCallback((t: 'dark' | 'light' | 'system') => {
    setThemeState(t);
    try {
      localStorage.setItem('lina_theme', t);
    } catch (e) {}
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', listener);
        return () => mediaQuery.removeEventListener('change', listener);
      }
    }
  }, [theme]);

  // Save Conversations to LocalStorage
  useEffect(() => {
    localStorage.setItem('lina_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Fetch all module data from Express API
  const refreshAllModules = useCallback(async () => {
    try {
      const [
        digRes,
        weathRes,
        famRes,
        memRes,
        perRes,
        shopRes,
        budRes,
        calRes,
        remRes,
        choRes,
        panRes,
        notRes,
        meaRes,
        bilRes,
        maintRes,
        petRes,
        wishRes,
        emgRes,
        fChatRes,
      ] = await Promise.all([
        api.getDailyDigest().catch(() => null),
        api.getWeather().catch(() => null),
        api.getFamilyMembers().catch(() => []),
        api.getMemories().catch(() => []),
        api.getPersonas().catch(() => []),
        api.getShopping().catch(() => []),
        api.getBudget().catch(() => []),
        api.getCalendar().catch(() => []),
        api.getReminders().catch(() => []),
        api.getChores().catch(() => []),
        api.getPantry().catch(() => []),
        api.getNotes().catch(() => []),
        api.getMealPlans().catch(() => []),
        api.getBills().catch(() => []),
        api.getMaintenance().catch(() => []),
        api.getPets().catch(() => []),
        api.getWishlist().catch(() => []),
        api.getEmergency().catch(() => []),
        api.getFamilyChat().catch(() => []),
      ]);

      if (digRes) setDigest(digRes);
      if (weathRes) setWeather(weathRes);
      if (famRes) setFamilyMembers(famRes);
      if (memRes) setMemories(memRes);
      if (perRes) setPersonas(perRes);
      if (shopRes) setShopping(shopRes);
      if (budRes) setBudget(budRes);
      if (calRes) setCalendar(calRes);
      if (remRes) setReminders(remRes);
      if (choRes) setChores(choRes);
      if (panRes) setPantry(panRes);
      if (notRes) setNotes(notRes);
      if (meaRes) setMeals(meaRes);
      if (bilRes) setBills(bilRes);
      if (maintRes) setMaintenance(maintRes);
      if (petRes) setPets(petRes);
      if (wishRes) setWishlist(wishRes);
      if (emgRes) setEmergency(emgRes);
      if (fChatRes) setFamilyChat(fChatRes);
    } catch (err) {
      console.error('Error refreshing module data:', err);
    }
  }, []);

  useEffect(() => {
    refreshAllModules();
  }, [refreshAllModules]);

  // Conversation operations
  const createNewConversation = () => {
    const newId = 'conv_' + Date.now();
    const newConv: ChatConversation = {
      id: newId,
      title: 'New Household Chat',
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'm_' + Date.now(),
          role: 'assistant',
          content: '✨ Hi! How can I assist with your home or family today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newId);
    return newId;
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) setActiveConvId(remaining[0].id);
      else createNewConversation();
    }
  };

  const renameConversation = (id: string, newTitle: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)));
  };

  const togglePinConversation = (id: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
  };

  // Send message to AI with SSE streaming and real-time function calling
  const sendMessage = async (
    content: string,
    attachments?: { name: string; url: string; mimeType: string; data?: string }[]
  ) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;
    if (isStreaming) return;

    let targetConvId = activeConvId;
    let currConv = conversations.find((c) => c.id === targetConvId);
    if (!currConv) {
      targetConvId = createNewConversation();
      currConv = conversations.find((c) => c.id === targetConvId);
    }

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content,
      attachments,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMsgId = 'msg_ai_' + (Date.now() + 1);
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: activeModel,
      toolCalls: [],
    };

    // Update conversation state with user message and blank assistant message
    const updatedMessages = [...(currConv?.messages || []), userMsg, assistantMsg];
    const autoTitle =
      currConv?.messages.length === 1 && content.length > 3
        ? content.slice(0, 32) + (content.length > 32 ? '...' : '')
        : currConv?.title || 'Chat';

    setConversations((prev) =>
      prev.map((c) =>
        c.id === targetConvId
          ? {
              ...c,
              title: autoTitle,
              updatedAt: new Date().toISOString(),
              messages: updatedMessages,
            }
          : c
      )
    );

    setIsStreaming(true);

    try {
      await streamChatResponse(
        {
          messages: updatedMessages.slice(0, -1), // exclude empty assistant msg
          model: activeModel,
          thinkingEnabled,
          webSearchEnabled,
          apiKeyOverride: apiKeyOverride || undefined,
          apiKeys: {
            geminiApiKey,
            openaiApiKey,
            claudeApiKey,
            deepseekApiKey,
            openrouterApiKey,
            customApiEndpoint,
            customApiKey,
          },
          personaId: activePersonaId,
        },
        (textChunk) => {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== targetConvId) return c;
              const msgs = c.messages.map((m) =>
                m.id === assistantMsgId ? { ...m, content: m.content + textChunk } : m
              );
              return { ...c, messages: msgs };
            })
          );
        },
        (toolStart) => {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== targetConvId) return c;
              const msgs = c.messages.map((m) => {
                if (m.id === assistantMsgId) {
                  const existingTools = m.toolCalls || [];
                  return {
                    ...m,
                    toolCalls: [
                      ...existingTools,
                      { id: toolStart.id, name: toolStart.name, args: toolStart.args, status: 'executing' },
                    ],
                  };
                }
                return m;
              });
              return { ...c, messages: msgs };
            })
          );
        },
        (toolEnd) => {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== targetConvId) return c;
              const msgs = c.messages.map((m) => {
                if (m.id === assistantMsgId) {
                  const updatedTools = (m.toolCalls || []).map((t) =>
                    t.name === toolEnd.name ? { ...t, result: toolEnd.result, status: 'success' as const } : t
                  );
                  return { ...m, toolCalls: updatedTools };
                }
                return m;
              });
              return { ...c, messages: msgs };
            })
          );
          // Auto refresh module UI data after tool executions!
          refreshAllModules();
        }
      );
    } catch (err: any) {
      console.error('Error during chat streaming:', err);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== targetConvId) return c;
          const msgs = c.messages.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: m.content + `\n\n⚠️ Connection issue: ${err.message || 'Unable to complete request.'}` }
              : m
          );
          return { ...c, messages: msgs };
        })
      );
    } finally {
      setIsStreaming(false);
      refreshAllModules();
    }
  };

  return {
    user,
    isLoggedIn: !!user,
    setUser,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateUserProfile,
    activeModule,
    setActiveModule,
    theme,
    setTheme,
    activeModel,
    setActiveModel,
    thinkingEnabled,
    setThinkingEnabled,
    webSearchEnabled,
    setWebSearchEnabled,
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
    handsFreeEnabled,
    setHandsFreeEnabled,
    isVoiceModalOpen,
    setIsVoiceModalOpen,
    initialVoiceQuery,
    setInitialVoiceQuery,
    isWakeWordListening,
    setIsWakeWordListening,
    conversations,
    activeConvId,
    setActiveConvId,
    createNewConversation,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    sendMessage,
    isStreaming,
    digest,
    weather,
    familyMembers,
    memories,
    personas,
    shopping,
    budget,
    calendar,
    reminders,
    chores,
    pantry,
    notes,
    meals,
    bills,
    maintenance,
    pets,
    wishlist,
    emergency,
    familyChat,
    refreshAllModules,
  };
}

// React Context setup
const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const storeLogic = useAppStoreLogic();
  return <AppContext.Provider value={storeLogic}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
}
