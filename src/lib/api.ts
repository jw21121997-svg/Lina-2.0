import {
  ShoppingItem,
  BudgetEntry,
  CalendarEvent,
  ReminderItem,
  ChoreItem,
  RewardCatalogItem,
  PantryItem,
  NoteItem,
  MealPlanDay,
  RecipeBookmark,
  BillItem,
  MaintenanceTask,
  PetProfile,
  WishlistItem,
  EmergencyContact,
  FamilyMember,
  FamilyChatMessage,
  AIMemory,
  Persona,
  DailyDigest,
  ChatMessage
} from '../types';

const API_BASE = '/api';

export async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `API error ${res.status}`);
  }
  return res.json();
}

// Module Data API Calls
export const api = {
  getWeather: () => fetchJson<any>('/weather'),
  getDailyDigest: () => fetchJson<DailyDigest>('/daily-digest'),
  getFamilyMembers: () => fetchJson<FamilyMember[]>('/family-members'),
  addFamilyMember: (member: Partial<FamilyMember>) =>
    fetchJson<FamilyMember>('/family-members', { method: 'POST', body: JSON.stringify(member) }),

  getMemories: () => fetchJson<AIMemory[]>('/memories'),
  addMemory: (memory: Partial<AIMemory>) =>
    fetchJson<AIMemory>('/memories', { method: 'POST', body: JSON.stringify(memory) }),
  deleteMemory: (id: string) => fetchJson<{ success: boolean }>(`/memories/${id}`, { method: 'DELETE' }),

  getPersonas: () => fetchJson<Persona[]>('/personas'),

  // 1. Shopping
  getShopping: () => fetchJson<ShoppingItem[]>('/shopping'),
  addShoppingItem: (item: Partial<ShoppingItem>) =>
    fetchJson<ShoppingItem>('/shopping', { method: 'POST', body: JSON.stringify(item) }),
  toggleShoppingItem: (id: string, isChecked: boolean) =>
    fetchJson<ShoppingItem>(`/shopping/${id}`, { method: 'PATCH', body: JSON.stringify({ isChecked }) }),
  deleteShoppingItem: (id: string) => fetchJson<{ success: boolean }>(`/shopping/${id}`, { method: 'DELETE' }),

  // 2. Budget
  getBudget: () => fetchJson<BudgetEntry[]>('/budget'),
  addBudgetEntry: (entry: Partial<BudgetEntry>) =>
    fetchJson<BudgetEntry>('/budget', { method: 'POST', body: JSON.stringify(entry) }),
  deleteBudgetEntry: (id: string) => fetchJson<{ success: boolean }>(`/budget/${id}`, { method: 'DELETE' }),

  // 3. Calendar
  getCalendar: () => fetchJson<CalendarEvent[]>('/calendar'),
  addCalendarEvent: (ev: Partial<CalendarEvent>) =>
    fetchJson<CalendarEvent>('/calendar', { method: 'POST', body: JSON.stringify(ev) }),
  deleteCalendarEvent: (id: string) => fetchJson<{ success: boolean }>(`/calendar/${id}`, { method: 'DELETE' }),

  // 4. Reminders
  getReminders: () => fetchJson<ReminderItem[]>('/reminders'),
  addReminder: (rem: Partial<ReminderItem>) =>
    fetchJson<ReminderItem>('/reminders', { method: 'POST', body: JSON.stringify(rem) }),
  toggleReminder: (id: string, isCompleted: boolean) =>
    fetchJson<ReminderItem>(`/reminders/${id}`, { method: 'PATCH', body: JSON.stringify({ isCompleted }) }),
  deleteReminder: (id: string) => fetchJson<{ success: boolean }>(`/reminders/${id}`, { method: 'DELETE' }),

  // 5. Chores & Rewards
  getChores: () => fetchJson<ChoreItem[]>('/chores'),
  addChore: (chore: Partial<ChoreItem>) =>
    fetchJson<ChoreItem>('/chores', { method: 'POST', body: JSON.stringify(chore) }),
  toggleChore: (id: string, isCompleted: boolean) =>
    fetchJson<ChoreItem>(`/chores/${id}`, { method: 'PATCH', body: JSON.stringify({ isCompleted }) }),
  deleteChore: (id: string) => fetchJson<{ success: boolean }>(`/chores/${id}`, { method: 'DELETE' }),
  getRewards: () => fetchJson<RewardCatalogItem[]>('/rewards'),
  redeemReward: (rewardId: string, memberName: string) =>
    fetchJson<{ success: boolean; newBalance: number }>(`/rewards/redeem`, {
      method: 'POST',
      body: JSON.stringify({ rewardId, memberName }),
    }),

  // 6. Pantry
  getPantry: () => fetchJson<PantryItem[]>('/pantry'),
  addPantryItem: (item: Partial<PantryItem>) =>
    fetchJson<PantryItem>('/pantry', { method: 'POST', body: JSON.stringify(item) }),
  updatePantryQty: (id: string, quantity: number) =>
    fetchJson<PantryItem>(`/pantry/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  deletePantryItem: (id: string) => fetchJson<{ success: boolean }>(`/pantry/${id}`, { method: 'DELETE' }),
  syncPantryToShopping: () =>
    fetchJson<{ success: boolean; addedCount: number }>('/pantry/sync-shopping', { method: 'POST' }),

  // 7. Notes
  getNotes: () => fetchJson<NoteItem[]>('/notes'),
  addNote: (note: Partial<NoteItem>) => fetchJson<NoteItem>('/notes', { method: 'POST', body: JSON.stringify(note) }),
  deleteNote: (id: string) => fetchJson<{ success: boolean }>(`/notes/${id}`, { method: 'DELETE' }),

  // 8. Meals & Recipes
  getMealPlans: () => fetchJson<MealPlanDay[]>('/meals'),
  updateMealPlanDay: (id: string, data: Partial<MealPlanDay>) =>
    fetchJson<MealPlanDay>(`/meals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getRecipes: () => fetchJson<RecipeBookmark[]>('/recipes'),
  addRecipe: (recipe: Partial<RecipeBookmark>) =>
    fetchJson<RecipeBookmark>('/recipes', { method: 'POST', body: JSON.stringify(recipe) }),

  // 9. Bills
  getBills: () => fetchJson<BillItem[]>('/bills'),
  addBill: (bill: Partial<BillItem>) => fetchJson<BillItem>('/bills', { method: 'POST', body: JSON.stringify(bill) }),
  updateBillStatus: (id: string, status: string) =>
    fetchJson<BillItem>(`/bills/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // 10. Maintenance
  getMaintenance: () => fetchJson<MaintenanceTask[]>('/maintenance'),
  addMaintenanceTask: (task: Partial<MaintenanceTask>) =>
    fetchJson<MaintenanceTask>('/maintenance', { method: 'POST', body: JSON.stringify(task) }),
  completeMaintenanceTask: (id: string) =>
    fetchJson<MaintenanceTask>(`/maintenance/${id}/complete`, { method: 'PATCH' }),

  // 11. Pets
  getPets: () => fetchJson<PetProfile[]>('/pets'),
  addPet: (pet: Partial<PetProfile>) => fetchJson<PetProfile>('/pets', { method: 'POST', body: JSON.stringify(pet) }),

  // 12. Wishlist
  getWishlist: () => fetchJson<WishlistItem[]>('/wishlist'),
  addWishlistItem: (item: Partial<WishlistItem>) =>
    fetchJson<WishlistItem>('/wishlist', { method: 'POST', body: JSON.stringify(item) }),
  toggleClaimWishlist: (id: string, claimedBy?: string) =>
    fetchJson<WishlistItem>(`/wishlist/${id}/claim`, { method: 'PATCH', body: JSON.stringify({ claimedBy }) }),

  // 13. Emergency
  getEmergency: () => fetchJson<EmergencyContact[]>('/emergency'),
  addEmergencyContact: (contact: Partial<EmergencyContact>) =>
    fetchJson<EmergencyContact>('/emergency', { method: 'POST', body: JSON.stringify(contact) }),

  // 14. Family Chat Room
  getFamilyChat: () => fetchJson<FamilyChatMessage[]>('/family-chat'),
  sendFamilyChatMessage: (content: string, senderName: string, senderAvatar: string) =>
    fetchJson<FamilyChatMessage>('/family-chat', {
      method: 'POST',
      body: JSON.stringify({ content, senderName, senderAvatar }),
    }),
};

// SSE Stream Client for AI Chat Engine
export async function streamChatResponse(
  payload: {
    messages: ChatMessage[];
    model: string;
    thinkingEnabled: boolean;
    webSearchEnabled: boolean;
    apiKeyOverride?: string;
    apiKeys?: {
      geminiApiKey?: string;
      openaiApiKey?: string;
      claudeApiKey?: string;
      deepseekApiKey?: string;
      openrouterApiKey?: string;
      customApiEndpoint?: string;
      customApiKey?: string;
    };
    personaId: string;
  },
  onChunk: (text: string) => void,
  onToolStart: (tool: any) => void,
  onToolEnd: (tool: any) => void
): Promise<void> {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.body) {
    throw new Error('ReadableStream not supported');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.replace('data: ', '').trim();
        if (!jsonStr) continue;

        try {
          const event = JSON.parse(jsonStr);
          if (event.type === 'chunk' && event.text) {
            onChunk(event.text);
          } else if (event.type === 'tool_start' && event.tool) {
            onToolStart(event.tool);
          } else if (event.type === 'tool_end' && event.tool) {
            onToolEnd(event.tool);
          } else if (event.type === 'end') {
            return;
          }
        } catch (e) {
          console.error('Error parsing SSE event', e);
        }
      }
    }
  }
}
