export type ModuleId =
  | 'chat'
  | 'dashboard'
  | 'shopping'
  | 'budget'
  | 'calendar'
  | 'reminders'
  | 'chores'
  | 'pantry'
  | 'notes'
  | 'meals'
  | 'bills'
  | 'maintenance'
  | 'petcare'
  | 'wishlist'
  | 'emergency'
  | 'familyroom'
  | 'drive';

export type AIModelId =
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro'
  | 'gemini-1.5-flash'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'o3-mini'
  | 'claude-3-5-sonnet'
  | 'deepseek-r1'
  | 'grok-3'
  | 'openrouter-auto'
  | 'custom-llm';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  provider?: 'email' | 'google' | 'guest';
  createdAt?: string;
}

export interface ApiKeysConfig {
  geminiApiKey?: string;
  openaiApiKey?: string;
  claudeApiKey?: string;
  deepseekApiKey?: string;
  openrouterApiKey?: string;
  customApiEndpoint?: string;
  customApiKey?: string;
}

export interface Persona {
  id: string;
  name: string;
  avatar: string;
  role: string;
  tone: string;
  systemPrompt: string;
  isDefault?: boolean;
}

export interface AIMemory {
  id: string;
  category: 'preference' | 'family' | 'home' | 'health' | 'schedule' | 'other';
  fact: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit?: string;
  isChecked: boolean;
  addedBy: string;
  urgent?: boolean;
  pantrySynced?: boolean;
  createdAt: string;
}

export interface BudgetEntry {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  paidBy: string;
  receiptUrl?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location?: string;
  category: 'family' | 'school' | 'medical' | 'work' | 'social' | 'maintenance';
  attendees: string[];
  notes?: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  dueDate: string;
  dueTime?: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  assignedTo?: string;
}

export interface ChoreItem {
  id: string;
  title: string;
  assignedTo: string; // family member name
  points: number;
  isCompleted: boolean;
  completedAt?: string;
  dueDate: string;
  category: 'cleaning' | 'pets' | 'yard' | 'dishes' | 'school' | 'other';
}

export interface RewardCatalogItem {
  id: string;
  title: string;
  pointsCost: number;
  description: string;
  icon: string;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  rewardTitle: string;
  claimedBy: string;
  pointsSpent: number;
  redeemedAt: string;
}

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  expirationDate?: string;
  location: 'Pantry' | 'Fridge' | 'Freezer' | 'Cabinet';
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'recipes' | 'ideas' | 'manuals' | 'important';
  tags: string[];
  isPinned: boolean;
  updatedAt: string;
}

export interface MealPlanDay {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  date: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks?: string;
  prepNotes?: string;
}

export interface RecipeBookmark {
  id: string;
  title: string;
  prepTime: string;
  servings: number;
  category: string;
  ingredients: string[];
  instructions: string[];
  isFavorite: boolean;
}

export interface BillItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly';
  category: 'Utilities' | 'Subscriptions' | 'Housing' | 'Insurance' | 'Loans' | 'Other';
  status: 'Paid' | 'Upcoming' | 'Overdue';
  autoPay: boolean;
  provider: string;
}

export interface MaintenanceTask {
  id: string;
  taskName: string;
  location: string;
  lastDone: string;
  nextDue: string;
  frequencyMonths: number;
  status: 'Good' | 'Due Soon' | 'Overdue';
  estimatedCost?: number;
  contractorContact?: string;
}

export interface PetProfile {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Bird' | 'Fish' | 'Other';
  breed: string;
  age: string;
  photoUrl?: string;
  feedingSchedule: string;
  vetName: string;
  vetPhone: string;
  medications: string[];
  lastVaccineDate?: string;
  notes?: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  forPerson: string;
  price: number;
  priority: 'High' | 'Medium' | 'Low';
  link?: string;
  claimedBy?: string;
  isClaimed: boolean;
  occasion?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  address?: string;
  policyNumber?: string;
  notes?: string;
  category: 'Medical' | 'Utilities' | 'Services' | 'Family' | 'Insurance';
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'Parent' | 'Kid' | 'Teen' | 'Grandparent' | 'Pet' | 'Guest';
  avatar: string;
  color: string;
  pointsBalance: number;
}

export interface FamilyChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isAiResponse?: boolean;
}

export interface ChatConversation {
  id: string;
  title: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ToolCallExecution {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: any;
  status: 'executing' | 'success' | 'error';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: { name: string; url: string; mimeType: string; data?: string }[];
  toolCalls?: ToolCallExecution[];
  reasoningContent?: string;
  modelUsed?: string;
}

export interface DailyDigest {
  date: string;
  greeting: string;
  weatherSummary: string;
  todayEventsCount: number;
  urgentRemindersCount: number;
  pendingChoresCount: number;
  lowStockItemsCount: number;
  billsDueSoonCount: number;
  aiAdvice: string;
}
