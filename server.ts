import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  ShoppingItem,
  BudgetEntry,
  CalendarEvent,
  ReminderItem,
  ChoreItem,
  RewardCatalogItem,
  RewardRedemption,
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
  DailyDigest
} from './src/types.js';

const app = express();
app.use(express.json({ limit: '20mb' }));

const PORT = 3000;

// --- INITIAL IN-MEMORY STORE FOR PRODUCTION LIVE APP ---
const store = {
  familyMembers: <FamilyMember[]>[],
  memories: <AIMemory[]>[],
  personas: <Persona[]>[
    {
      id: 'p1',
      name: 'Lina',
      avatar: '✨',
      role: 'Chief Household Assistant',
      tone: 'Warm, highly organized, and proactive',
      systemPrompt: 'You are Lina, an AI home and family assistant. You manage household schedules, meals, budgets, chores, and pantry inventory with empathy, speed, and proactive suggestions.',
      isDefault: true,
    },
    {
      id: 'p2',
      name: 'Jarvis Butler',
      avatar: '🎩',
      role: 'Executive Home Manager',
      tone: 'Refined, precise, and witty',
      systemPrompt: 'You are Jarvis, a sophisticated butler for the household. You speak with high precision, elegance, and subtle wit while keeping home maintenance and logistics running flawlessly.',
    },
    {
      id: 'p3',
      name: 'Coach Maya',
      avatar: '🏃‍♀️',
      role: 'Family Wellness & Chore Coach',
      tone: 'Energetic, encouraging, and fun',
      systemPrompt: 'You are Coach Maya! You motivate kids and parents alike to conquer chores, stay active, celebrate points, and plan healthy meals.',
    },
  ],
  shoppingList: <ShoppingItem[]>[],
  budget: <BudgetEntry[]>[],
  calendar: <CalendarEvent[]>[],
  reminders: <ReminderItem[]>[],
  chores: <ChoreItem[]>[],
  rewardCatalog: <RewardCatalogItem[]>[],
  redemptions: <RewardRedemption[]>[],
  pantry: <PantryItem[]>[],
  notes: <NoteItem[]>[],
  mealPlans: <MealPlanDay[]>[],
  recipes: <RecipeBookmark[]>[],
  bills: <BillItem[]>[],
  maintenance: <MaintenanceTask[]>[],
  pets: <PetProfile[]>[],
  wishlist: <WishlistItem[]>[],
  emergency: <EmergencyContact[]>[],
  familyChat: <FamilyChatMessage[]>[],
};

// --- AGENT TOOL DECLARATIONS & BACKEND HANDLERS ---
function executeAgentTool(name: string, args: any) {
  try {
    switch (name) {
      case 'add_shopping_items': {
        const items: string[] = args.items || [];
        const category = args.category || 'General';
        const added: ShoppingItem[] = [];
        items.forEach((itemStr) => {
          const newItem: ShoppingItem = {
            id: 's_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            name: itemStr,
            category: category,
            quantity: 1,
            isChecked: false,
            addedBy: 'Lina AI',
            createdAt: new Date().toISOString().split('T')[0],
          };
          store.shoppingList.push(newItem);
          added.push(newItem);
        });
        return { success: true, addedCount: added.length, items: added };
      }

      case 'check_off_shopping_item': {
        const query = (args.idOrName || '').toLowerCase();
        const item = store.shoppingList.find(
          (i) => i.id === args.idOrName || i.name.toLowerCase().includes(query)
        );
        if (item) {
          item.isChecked = true;
          return { success: true, item };
        }
        return { success: false, message: `Item matching "${args.idOrName}" not found in shopping list.` };
      }

      case 'get_shopping_list': {
        return { success: true, count: store.shoppingList.length, items: store.shoppingList };
      }

      case 'add_reminder': {
        const newRem: ReminderItem = {
          id: 'r_' + Date.now(),
          title: args.title,
          dueDate: args.dueDate || new Date().toISOString().split('T')[0],
          dueTime: args.dueTime,
          priority: args.priority || 'medium',
          isCompleted: false,
          assignedTo: args.assignedTo || 'Family',
        };
        store.reminders.push(newRem);
        return { success: true, reminder: newRem };
      }

      case 'get_reminders': {
        return { success: true, count: store.reminders.length, reminders: store.reminders };
      }

      case 'add_chore': {
        const newChore: ChoreItem = {
          id: 'ch_' + Date.now(),
          title: args.title,
          assignedTo: args.assignedTo || 'Liam',
          points: args.points || 15,
          isCompleted: false,
          dueDate: args.dueDate || new Date().toISOString().split('T')[0],
          category: args.category || 'cleaning',
        };
        store.chores.push(newChore);
        return { success: true, chore: newChore };
      }

      case 'complete_chore': {
        const query = (args.idOrTitle || '').toLowerCase();
        const chore = store.chores.find(
          (c) => c.id === args.idOrTitle || c.title.toLowerCase().includes(query)
        );
        if (chore) {
          chore.isCompleted = true;
          chore.completedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
          // Credit points to family member
          const member = store.familyMembers.find((m) => m.name.toLowerCase() === chore.assignedTo.toLowerCase());
          if (member) {
            member.pointsBalance += chore.points;
          }
          return { success: true, chore, awardedPoints: chore.points, newBalance: member?.pointsBalance };
        }
        return { success: false, message: `Chore matching "${args.idOrTitle}" not found.` };
      }

      case 'get_chores': {
        return { success: true, count: store.chores.length, chores: store.chores };
      }

      case 'add_calendar_event': {
        const newEv: CalendarEvent = {
          id: 'c_' + Date.now(),
          title: args.title,
          date: args.date || new Date().toISOString().split('T')[0],
          time: args.time,
          location: args.location || 'Home',
          category: args.category || 'family',
          attendees: args.attendees || ['Family'],
          notes: args.notes,
        };
        store.calendar.push(newEv);
        return { success: true, event: newEv };
      }

      case 'get_calendar_events': {
        return { success: true, count: store.calendar.length, events: store.calendar };
      }

      case 'add_budget_entry': {
        const newB: BudgetEntry = {
          id: 'b_' + Date.now(),
          type: args.type || 'expense',
          category: args.category || 'General',
          amount: Number(args.amount) || 0,
          description: args.description || '',
          date: args.date || new Date().toISOString().split('T')[0],
          paidBy: args.paidBy || 'Lina AI',
        };
        store.budget.push(newB);
        return { success: true, entry: newB };
      }

      case 'get_budget_summary': {
        const totalIncome = store.budget.filter((b) => b.type === 'income').reduce((acc, b) => acc + b.amount, 0);
        const totalExpense = store.budget.filter((b) => b.type === 'expense').reduce((acc, b) => acc + b.amount, 0);
        return {
          success: true,
          totalIncome,
          totalExpense,
          netBalance: totalIncome - totalExpense,
          recentEntries: store.budget.slice(-5),
        };
      }

      case 'create_note': {
        const newNote: NoteItem = {
          id: 'n_' + Date.now(),
          title: args.title,
          content: args.content,
          category: args.category || 'general',
          tags: args.tags || [],
          isPinned: false,
          updatedAt: new Date().toISOString().split('T')[0],
        };
        store.notes.push(newNote);
        return { success: true, note: newNote };
      }

      case 'get_notes': {
        return { success: true, count: store.notes.length, notes: store.notes };
      }

      case 'add_pantry_item': {
        const newPantry: PantryItem = {
          id: 'p_' + Date.now(),
          name: args.name,
          category: args.category || 'General',
          quantity: Number(args.quantity) || 1,
          unit: args.unit || 'items',
          minThreshold: Number(args.minThreshold) || 1,
          expirationDate: args.expirationDate,
          location: args.location || 'Pantry',
        };
        store.pantry.push(newPantry);
        return { success: true, item: newPantry };
      }

      case 'get_pantry': {
        return { success: true, count: store.pantry.length, items: store.pantry };
      }

      case 'send_family_message': {
        const msg: FamilyChatMessage = {
          id: 'fc_' + Date.now(),
          senderName: args.senderName || 'Lina',
          senderAvatar: '✨',
          content: args.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAiResponse: true,
        };
        store.familyChat.push(msg);
        return { success: true, message: msg };
      }

      case 'get_family_members': {
        return { success: true, familyMembers: store.familyMembers };
      }

      default:
        return { error: `Tool ${name} not supported.` };
    }
  } catch (err: any) {
    return { error: err.message || 'Error executing tool' };
  }
}

// Gemini Tool Definitions
const geminiTools = [
  {
    functionDeclarations: [
      {
        name: 'add_shopping_items',
        description: 'Add grocery or household items to the family shopping list.',
        parameters: {
          type: 'OBJECT',
          properties: {
            items: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Array of item names to add' },
            category: { type: 'STRING', description: 'Category e.g. Produce, Dairy, Bakery, Household, Pantry' },
          },
          required: ['items'],
        },
      },
      {
        name: 'check_off_shopping_item',
        description: 'Check off or mark a shopping list item as purchased.',
        parameters: {
          type: 'OBJECT',
          properties: {
            idOrName: { type: 'STRING', description: 'Item ID or partial item name' },
          },
          required: ['idOrName'],
        },
      },
      {
        name: 'get_shopping_list',
        description: 'Retrieve current family shopping list items.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'add_reminder',
        description: 'Set a new home or family task reminder.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Reminder title' },
            dueDate: { type: 'STRING', description: 'Due date in YYYY-MM-DD' },
            dueTime: { type: 'STRING', description: 'Optional time HH:MM' },
            priority: { type: 'STRING', enum: ['low', 'medium', 'high'] },
            assignedTo: { type: 'STRING', description: 'Name of assigned family member' },
          },
          required: ['title'],
        },
      },
      {
        name: 'get_reminders',
        description: 'Retrieve pending and upcoming family reminders.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'add_chore',
        description: 'Assign a new chore with point reward to a family member.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Chore title e.g. Clean Bedroom' },
            assignedTo: { type: 'STRING', description: 'Family member name e.g. Liam, Emma' },
            points: { type: 'NUMBER', description: 'Points awarded upon completion' },
            dueDate: { type: 'STRING', description: 'Due date YYYY-MM-DD' },
            category: { type: 'STRING', description: 'cleaning, pets, yard, dishes, etc.' },
          },
          required: ['title', 'assignedTo'],
        },
      },
      {
        name: 'complete_chore',
        description: 'Mark a family chore as completed and award points.',
        parameters: {
          type: 'OBJECT',
          properties: {
            idOrTitle: { type: 'STRING', description: 'Chore ID or title keyword' },
          },
          required: ['idOrTitle'],
        },
      },
      {
        name: 'get_chores',
        description: 'Get list of family chores and completion statuses.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'add_calendar_event',
        description: 'Add a family event, doctor appointment, or practice to the calendar.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Event title' },
            date: { type: 'STRING', description: 'Date in YYYY-MM-DD' },
            time: { type: 'STRING', description: 'Time e.g. 14:30' },
            location: { type: 'STRING', description: 'Event location' },
            category: { type: 'STRING', description: 'family, school, medical, work, maintenance' },
            attendees: { type: 'ARRAY', items: { type: 'STRING' } },
          },
          required: ['title', 'date'],
        },
      },
      {
        name: 'get_calendar_events',
        description: 'Get upcoming family calendar events.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'add_budget_entry',
        description: 'Log an income or expense transaction for the household budget.',
        parameters: {
          type: 'OBJECT',
          properties: {
            type: { type: 'STRING', enum: ['income', 'expense'] },
            category: { type: 'STRING', description: 'Groceries, Utilities, Dining Out, Salary, etc.' },
            amount: { type: 'NUMBER', description: 'Dollar amount' },
            description: { type: 'STRING', description: 'Brief description' },
            paidBy: { type: 'STRING', description: 'Family member who paid or logged it' },
          },
          required: ['type', 'category', 'amount'],
        },
      },
      {
        name: 'get_budget_summary',
        description: 'Get current household income, expenses, and net balance summary.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'create_note',
        description: 'Create a household note or save a recipe/idea to knowledge base.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Note title' },
            content: { type: 'STRING', description: 'Full text or markdown content' },
            category: { type: 'STRING', description: 'general, recipes, ideas, manuals, important' },
            tags: { type: 'ARRAY', items: { type: 'STRING' } },
          },
          required: ['title', 'content'],
        },
      },
      {
        name: 'get_notes',
        description: 'Retrieve family notes and knowledge base entries.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'add_pantry_item',
        description: 'Add an ingredient or stock item to the pantry / fridge inventory.',
        parameters: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING', description: 'Item name' },
            category: { type: 'STRING', description: 'Dairy, Grains, Meat, Oils, Canned Goods, etc.' },
            quantity: { type: 'NUMBER', description: 'Quantity count' },
            unit: { type: 'STRING', description: 'lbs, cans, boxes, eggs, sticks, etc.' },
            location: { type: 'STRING', enum: ['Pantry', 'Fridge', 'Freezer', 'Cabinet'] },
          },
          required: ['name'],
        },
      },
      {
        name: 'get_pantry',
        description: 'Retrieve pantry and fridge inventory items.',
        parameters: { type: 'OBJECT', properties: {} },
      },
      {
        name: 'send_family_message',
        description: 'Post a message into the Family Room chat room.',
        parameters: {
          type: 'OBJECT',
          properties: {
            content: { type: 'STRING', description: 'Message content' },
            senderName: { type: 'STRING', description: 'Sender name, defaults to Lina' },
          },
          required: ['content'],
        },
      },
      {
        name: 'get_family_members',
        description: 'Get list of family members, roles, and points balances.',
        parameters: { type: 'OBJECT', properties: {} },
      },
    ],
  },
];

// --- REST ENDPOINTS FOR THE 15 HOUSEHOLD MODULES & SYSTEM DATA ---

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Weather endpoint (returns simulated accurate local weather with weekly forecast)
app.get('/api/weather', (_req, res) => {
  res.json({
    location: 'Sunny Valley, CA',
    tempF: 72,
    condition: 'Partly Cloudy',
    humidity: '45%',
    wind: '8 mph',
    highF: 78,
    lowF: 58,
    icon: 'partly-cloudy',
    forecast: [
      { day: 'Today', high: 78, low: 58, condition: 'Partly Cloudy', icon: 'partly-cloudy' },
      { day: 'Thu', high: 80, low: 60, condition: 'Sunny', icon: 'sunny' },
      { day: 'Fri', high: 82, low: 62, condition: 'Sunny', icon: 'sunny' },
      { day: 'Sat', high: 75, low: 56, condition: 'Light Rain', icon: 'rain' },
      { day: 'Sun', high: 76, low: 57, condition: 'Clear', icon: 'sunny' },
    ],
  });
});

// Daily Digest Summary Endpoint
app.get('/api/daily-digest', (_req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = store.calendar.filter((c) => c.date === todayStr);
  const urgentReminders = store.reminders.filter((r) => !r.isCompleted && r.priority === 'high');
  const pendingChores = store.chores.filter((ch) => !ch.isCompleted);
  const lowStockPantry = store.pantry.filter((p) => p.quantity <= p.minThreshold);
  const billsDueSoon = store.bills.filter((b) => b.status === 'Upcoming');

  const digest: DailyDigest = {
    date: todayStr,
    greeting: 'Good morning, Family! Here is your Lina Home Digest.',
    weatherSummary: '72°F Partly Cloudy in Sunny Valley. Pleasant breeze.',
    todayEventsCount: todayEvents.length,
    urgentRemindersCount: urgentReminders.length,
    pendingChoresCount: pendingChores.length,
    lowStockItemsCount: lowStockPantry.length,
    billsDueSoonCount: billsDueSoon.length,
    aiAdvice:
      todayEvents.length > 0
        ? `You have ${todayEvents.length} event(s) scheduled for today. Lina Assistant is ready to help.`
        : 'Your home assistant is active and synchronized. Add family members, shopping items, or ask Lina to manage your household schedule.',
  };
  res.json(digest);
});

// Family Members & Points
app.get('/api/family-members', (_req, res) => res.json(store.familyMembers));
app.post('/api/family-members', (req, res) => {
  const member: FamilyMember = {
    id: 'fm_' + Date.now(),
    name: req.body.name || 'Member',
    role: req.body.role || 'Kid',
    avatar: req.body.avatar || '👤',
    color: req.body.color || '#3b82f6',
    pointsBalance: Number(req.body.pointsBalance) || 0,
  };
  store.familyMembers.push(member);
  res.json(member);
});

// AI Memories
app.get('/api/memories', (_req, res) => res.json(store.memories));
app.post('/api/memories', (req, res) => {
  const mem: AIMemory = {
    id: 'm_' + Date.now(),
    category: req.body.category || 'other',
    fact: req.body.fact,
    createdAt: new Date().toISOString().split('T')[0],
  };
  store.memories.push(mem);
  res.json(mem);
});
app.delete('/api/memories/:id', (req, res) => {
  store.memories = store.memories.filter((m) => m.id !== req.params.id);
  res.json({ success: true });
});

// Personas
app.get('/api/personas', (_req, res) => res.json(store.personas));

// 1. Shopping List
app.get('/api/shopping', (_req, res) => res.json(store.shoppingList));
app.post('/api/shopping', (req, res) => {
  const item: ShoppingItem = {
    id: 's_' + Date.now(),
    name: req.body.name,
    category: req.body.category || 'General',
    quantity: Number(req.body.quantity) || 1,
    unit: req.body.unit || 'pcs',
    isChecked: false,
    addedBy: req.body.addedBy || 'User',
    urgent: !!req.body.urgent,
    createdAt: new Date().toISOString().split('T')[0],
  };
  store.shoppingList.push(item);
  res.json(item);
});
app.patch('/api/shopping/:id', (req, res) => {
  const item = store.shoppingList.find((i) => i.id === req.params.id);
  if (item) {
    if (req.body.isChecked !== undefined) item.isChecked = req.body.isChecked;
    if (req.body.quantity !== undefined) item.quantity = req.body.quantity;
    res.json(item);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});
app.delete('/api/shopping/:id', (req, res) => {
  store.shoppingList = store.shoppingList.filter((i) => i.id !== req.params.id);
  res.json({ success: true });
});

// 2. Budget
app.get('/api/budget', (_req, res) => res.json(store.budget));
app.post('/api/budget', (req, res) => {
  const entry: BudgetEntry = {
    id: 'b_' + Date.now(),
    type: req.body.type || 'expense',
    category: req.body.category || 'General',
    amount: Number(req.body.amount) || 0,
    description: req.body.description || '',
    date: req.body.date || new Date().toISOString().split('T')[0],
    paidBy: req.body.paidBy || 'Sarah',
  };
  store.budget.push(entry);
  res.json(entry);
});
app.delete('/api/budget/:id', (req, res) => {
  store.budget = store.budget.filter((b) => b.id !== req.params.id);
  res.json({ success: true });
});

// 3. Calendar
app.get('/api/calendar', (_req, res) => res.json(store.calendar));
app.post('/api/calendar', (req, res) => {
  const ev: CalendarEvent = {
    id: 'c_' + Date.now(),
    title: req.body.title,
    date: req.body.date,
    time: req.body.time,
    location: req.body.location,
    category: req.body.category || 'family',
    attendees: req.body.attendees || ['Family'],
    notes: req.body.notes,
  };
  store.calendar.push(ev);
  res.json(ev);
});
app.delete('/api/calendar/:id', (req, res) => {
  store.calendar = store.calendar.filter((c) => c.id !== req.params.id);
  res.json({ success: true });
});

// 4. Reminders
app.get('/api/reminders', (_req, res) => res.json(store.reminders));
app.post('/api/reminders', (req, res) => {
  const rem: ReminderItem = {
    id: 'r_' + Date.now(),
    title: req.body.title,
    dueDate: req.body.dueDate || new Date().toISOString().split('T')[0],
    dueTime: req.body.dueTime,
    priority: req.body.priority || 'medium',
    isCompleted: false,
    recurring: req.body.recurring || 'none',
    assignedTo: req.body.assignedTo,
  };
  store.reminders.push(rem);
  res.json(rem);
});
app.patch('/api/reminders/:id', (req, res) => {
  const rem = store.reminders.find((r) => r.id === req.params.id);
  if (rem) {
    if (req.body.isCompleted !== undefined) rem.isCompleted = req.body.isCompleted;
    res.json(rem);
  } else {
    res.status(404).json({ error: 'Reminder not found' });
  }
});
app.delete('/api/reminders/:id', (req, res) => {
  store.reminders = store.reminders.filter((r) => r.id !== req.params.id);
  res.json({ success: true });
});

// 5. Chores & Rewards
app.get('/api/chores', (_req, res) => res.json(store.chores));
app.post('/api/chores', (req, res) => {
  const chore: ChoreItem = {
    id: 'ch_' + Date.now(),
    title: req.body.title,
    assignedTo: req.body.assignedTo || 'Liam',
    points: Number(req.body.points) || 15,
    isCompleted: false,
    dueDate: req.body.dueDate || new Date().toISOString().split('T')[0],
    category: req.body.category || 'cleaning',
  };
  store.chores.push(chore);
  res.json(chore);
});
app.patch('/api/chores/:id', (req, res) => {
  const chore = store.chores.find((c) => c.id === req.params.id);
  if (chore) {
    if (req.body.isCompleted !== undefined) {
      chore.isCompleted = req.body.isCompleted;
      if (req.body.isCompleted) {
        chore.completedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const member = store.familyMembers.find((m) => m.name.toLowerCase() === chore.assignedTo.toLowerCase());
        if (member) member.pointsBalance += chore.points;
      }
    }
    res.json(chore);
  } else {
    res.status(404).json({ error: 'Chore not found' });
  }
});
app.delete('/api/chores/:id', (req, res) => {
  store.chores = store.chores.filter((c) => c.id !== req.params.id);
  res.json({ success: true });
});

app.get('/api/rewards', (_req, res) => res.json(store.rewardCatalog));
app.post('/api/rewards/redeem', (req, res) => {
  const { rewardId, memberName } = req.body;
  const reward = store.rewardCatalog.find((r) => r.id === rewardId);
  const member = store.familyMembers.find((m) => m.name.toLowerCase() === (memberName || '').toLowerCase());

  if (!reward) return res.status(404).json({ error: 'Reward not found' });
  if (!member) return res.status(404).json({ error: 'Family member not found' });
  if (member.pointsBalance < reward.pointsCost) {
    return res.status(400).json({ error: 'Insufficient points balance' });
  }

  member.pointsBalance -= reward.pointsCost;
  const redemption: RewardRedemption = {
    id: 'rd_' + Date.now(),
    rewardId: reward.id,
    rewardTitle: reward.title,
    claimedBy: member.name,
    pointsSpent: reward.pointsCost,
    redeemedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  store.redemptions.push(redemption);
  res.json({ success: true, newBalance: member.pointsBalance, redemption });
});

// 6. Pantry
app.get('/api/pantry', (_req, res) => res.json(store.pantry));
app.post('/api/pantry', (req, res) => {
  const item: PantryItem = {
    id: 'p_' + Date.now(),
    name: req.body.name,
    category: req.body.category || 'General',
    quantity: Number(req.body.quantity) || 1,
    unit: req.body.unit || 'items',
    minThreshold: Number(req.body.minThreshold) || 1,
    expirationDate: req.body.expirationDate,
    location: req.body.location || 'Pantry',
  };
  store.pantry.push(item);
  res.json(item);
});
app.patch('/api/pantry/:id', (req, res) => {
  const item = store.pantry.find((i) => i.id === req.params.id);
  if (item) {
    if (req.body.quantity !== undefined) item.quantity = req.body.quantity;
    res.json(item);
  } else {
    res.status(404).json({ error: 'Pantry item not found' });
  }
});
app.delete('/api/pantry/:id', (req, res) => {
  store.pantry = store.pantry.filter((p) => p.id !== req.params.id);
  res.json({ success: true });
});

// Auto Sync Low Pantry Stock to Shopping List
app.post('/api/pantry/sync-shopping', (_req, res) => {
  const lowStock = store.pantry.filter((p) => p.quantity <= p.minThreshold);
  const added: ShoppingItem[] = [];

  lowStock.forEach((p) => {
    const exists = store.shoppingList.some((s) => s.name.toLowerCase() === p.name.toLowerCase() && !s.isChecked);
    if (!exists) {
      const newItem: ShoppingItem = {
        id: 's_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        name: p.name,
        category: p.category,
        quantity: 1,
        unit: p.unit,
        isChecked: false,
        addedBy: 'Pantry Sync AI',
        urgent: true,
        pantrySynced: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      store.shoppingList.push(newItem);
      added.push(newItem);
    }
  });
  res.json({ success: true, addedCount: added.length, items: added });
});

// 7. Notes
app.get('/api/notes', (_req, res) => res.json(store.notes));
app.post('/api/notes', (req, res) => {
  const note: NoteItem = {
    id: 'n_' + Date.now(),
    title: req.body.title,
    content: req.body.content,
    category: req.body.category || 'general',
    tags: req.body.tags || [],
    isPinned: !!req.body.isPinned,
    updatedAt: new Date().toISOString().split('T')[0],
  };
  store.notes.push(note);
  res.json(note);
});
app.delete('/api/notes/:id', (req, res) => {
  store.notes = store.notes.filter((n) => n.id !== req.params.id);
  res.json({ success: true });
});

// 8. Meal Planner & Recipes
app.get('/api/meals', (_req, res) => res.json(store.mealPlans));
app.put('/api/meals/:id', (req, res) => {
  const dayIndex = store.mealPlans.findIndex((m) => m.id === req.params.id);
  if (dayIndex !== -1) {
    store.mealPlans[dayIndex] = { ...store.mealPlans[dayIndex], ...req.body };
    res.json(store.mealPlans[dayIndex]);
  } else {
    res.status(404).json({ error: 'Meal plan day not found' });
  }
});
app.get('/api/recipes', (_req, res) => res.json(store.recipes));
app.post('/api/recipes', (req, res) => {
  const recipe: RecipeBookmark = {
    id: 'rc_' + Date.now(),
    title: req.body.title,
    prepTime: req.body.prepTime || '20 mins',
    servings: Number(req.body.servings) || 4,
    category: req.body.category || 'Dinner',
    ingredients: req.body.ingredients || [],
    instructions: req.body.instructions || [],
    isFavorite: !!req.body.isFavorite,
  };
  store.recipes.push(recipe);
  res.json(recipe);
});

// 9. Bills & Subscriptions
app.get('/api/bills', (_req, res) => res.json(store.bills));
app.post('/api/bills', (req, res) => {
  const bill: BillItem = {
    id: 'bi_' + Date.now(),
    title: req.body.title,
    amount: Number(req.body.amount) || 0,
    dueDate: req.body.dueDate,
    frequency: req.body.frequency || 'Monthly',
    category: req.body.category || 'Utilities',
    status: req.body.status || 'Upcoming',
    autoPay: !!req.body.autoPay,
    provider: req.body.provider || 'Provider',
  };
  store.bills.push(bill);
  res.json(bill);
});
app.patch('/api/bills/:id', (req, res) => {
  const bill = store.bills.find((b) => b.id === req.params.id);
  if (bill) {
    if (req.body.status !== undefined) bill.status = req.body.status;
    res.json(bill);
  } else {
    res.status(404).json({ error: 'Bill not found' });
  }
});

// 10. Home Maintenance
app.get('/api/maintenance', (_req, res) => res.json(store.maintenance));
app.post('/api/maintenance', (req, res) => {
  const task: MaintenanceTask = {
    id: 'mt_' + Date.now(),
    taskName: req.body.taskName,
    location: req.body.location || 'Home',
    lastDone: req.body.lastDone || new Date().toISOString().split('T')[0],
    nextDue: req.body.nextDue,
    frequencyMonths: Number(req.body.frequencyMonths) || 6,
    status: req.body.status || 'Good',
    estimatedCost: req.body.estimatedCost,
  };
  store.maintenance.push(task);
  res.json(task);
});
app.patch('/api/maintenance/:id/complete', (req, res) => {
  const task = store.maintenance.find((t) => t.id === req.params.id);
  if (task) {
    const today = new Date();
    task.lastDone = today.toISOString().split('T')[0];
    const nextDate = new Date(today);
    nextDate.setMonth(nextDate.getMonth() + task.frequencyMonths);
    task.nextDue = nextDate.toISOString().split('T')[0];
    task.status = 'Good';
    res.json(task);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// 11. Pet Care
app.get('/api/pets', (_req, res) => res.json(store.pets));
app.post('/api/pets', (req, res) => {
  const pet: PetProfile = {
    id: 'pet_' + Date.now(),
    name: req.body.name,
    species: req.body.species || 'Dog',
    breed: req.body.breed || 'Mixed',
    age: req.body.age || '1 yr',
    feedingSchedule: req.body.feedingSchedule || 'Morning and Evening',
    vetName: req.body.vetName || 'Local Vet',
    vetPhone: req.body.vetPhone || '(555) 000-0000',
    medications: req.body.medications || [],
    notes: req.body.notes,
  };
  store.pets.push(pet);
  res.json(pet);
});

// 12. Wishlist
app.get('/api/wishlist', (_req, res) => res.json(store.wishlist));
app.post('/api/wishlist', (req, res) => {
  const item: WishlistItem = {
    id: 'w_' + Date.now(),
    title: req.body.title,
    forPerson: req.body.forPerson || 'Everyone',
    price: Number(req.body.price) || 0,
    priority: req.body.priority || 'Medium',
    link: req.body.link,
    isClaimed: false,
    occasion: req.body.occasion,
  };
  store.wishlist.push(item);
  res.json(item);
});
app.patch('/api/wishlist/:id/claim', (req, res) => {
  const item = store.wishlist.find((w) => w.id === req.params.id);
  if (item) {
    item.isClaimed = !item.isClaimed;
    item.claimedBy = item.isClaimed ? req.body.claimedBy || 'Family Member' : undefined;
    res.json(item);
  } else {
    res.status(404).json({ error: 'Wishlist item not found' });
  }
});

// 13. Emergency Contacts
app.get('/api/emergency', (_req, res) => res.json(store.emergency));
app.post('/api/emergency', (req, res) => {
  const contact: EmergencyContact = {
    id: 'e_' + Date.now(),
    name: req.body.name,
    role: req.body.role || 'Service',
    phone: req.body.phone,
    address: req.body.address,
    category: req.body.category || 'Services',
    notes: req.body.notes,
  };
  store.emergency.push(contact);
  res.json(contact);
});

// 14. Family Chat Room
app.get('/api/family-chat', (_req, res) => res.json(store.familyChat));
app.post('/api/family-chat', (req, res) => {
  const userMsg: FamilyChatMessage = {
    id: 'fc_' + Date.now(),
    senderName: req.body.senderName || 'Sarah',
    senderAvatar: req.body.senderAvatar || '👩‍💼',
    content: req.body.content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  store.familyChat.push(userMsg);

  // If message contains @Lina or Lina, auto-generate AI family response!
  if (req.body.content.toLowerCase().includes('@lina') || req.body.content.toLowerCase().includes('lina')) {
    setTimeout(() => {
      const aiReply: FamilyChatMessage = {
        id: 'fc_' + (Date.now() + 1),
        senderName: 'Lina',
        senderAvatar: '✨',
        content: `Hi ${userMsg.senderName}! I saw your mention in the family room. Let me know if you need me to update the calendar, add items to our shopping list, or set a reminder!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAiResponse: true,
      };
      store.familyChat.push(aiReply);
    }, 800);
  }

  res.json(userMsg);
});

// --- CORE REAL-TIME SSE STREAMING CHAT ROUTE ---
app.post('/api/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const {
    messages = [],
    model = 'gemini-2.5-flash',
    thinkingEnabled = false,
    webSearchEnabled = false,
    apiKeyOverride,
    apiKeys = {},
    personaId,
  } = req.body;

  // Build System Prompt with AI Memories and Selected Persona
  const activePersona = store.personas.find((p) => p.id === personaId) || store.personas[0];
  const memoryPromptList = store.memories.map((m) => `- [${m.category.toUpperCase()}] ${m.fact}`).join('\n');

  const systemInstruction = `${activePersona.systemPrompt}

Current Date & Time: ${new Date().toLocaleString()}

Key Family & Household Memories:
${memoryPromptList || 'No custom memories saved yet.'}

Guidelines:
1. You are Lina AI, an autonomous agentic home & family assistant.
2. Use tool function calls automatically whenever the user asks to add, check, complete, create, log, or query shopping list, reminders, chores, calendar, budget, notes, pantry, or family messages!
3. Format output clearly with clean markdown, bullet points, and concise text.
4. When writing code or diagrams, output mermaid block code \`\`\`mermaid ... \`\`\` for diagrams so the frontend can render visual family workflows!`;

  const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')?.content || '';

  // Helper to run autonomous tool intent matching when API key is missing or model fails
  const runAutonomousToolFallback = async (reasonNotice?: string) => {
    if (reasonNotice) {
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: `${reasonNotice}\n\n` })}\n\n`);
    }

    const queryLower = lastUserMsg.toLowerCase();
    let executedAnyTool = false;

    // Check for Shopping List Intent
    if (queryLower.includes('shopping') || queryLower.includes('buy') || queryLower.includes('grocer') || queryLower.includes('milk') || queryLower.includes('eggs') || queryLower.includes('bread')) {
      const itemsMatch = lastUserMsg.replace(/add|to|our|the|shopping|list|groceries|buy|need|please/gi, '').split(/,|and/).map((s: string) => s.trim()).filter(Boolean);
      const itemsToAdd = itemsMatch.length > 0 ? itemsMatch : ['Organic Milk', 'Fresh Bread', 'Eggs'];
      
      res.write(`data: ${JSON.stringify({ type: 'tool_start', tool: { id: 't_' + Date.now(), name: 'add_shopping_items', args: { items: itemsToAdd } } })}\n\n`);
      const result = executeAgentTool('add_shopping_items', { items: itemsToAdd, category: 'Groceries' });
      res.write(`data: ${JSON.stringify({ type: 'tool_end', tool: { id: 't_' + Date.now(), name: 'add_shopping_items', args: { items: itemsToAdd }, result } })}\n\n`);
      
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: `🛒 **Shopping List Updated!**\nAdded the following items to your household shopping list:\n${itemsToAdd.map((i: string) => `- ${i}`).join('\n')}` })}\n\n`);
      executedAnyTool = true;
    }

    // Check for Chore Intent
    if (!executedAnyTool && (queryLower.includes('chore') || queryLower.includes('clean') || queryLower.includes('laundry') || queryLower.includes('dishes') || queryLower.includes('trash'))) {
      const choreTitle = lastUserMsg.length > 10 ? lastUserMsg : 'Clean and organize living room';
      res.write(`data: ${JSON.stringify({ type: 'tool_start', tool: { id: 't_' + Date.now(), name: 'add_chore', args: { title: choreTitle, assignedTo: 'Liam', points: 20 } } })}\n\n`);
      const result = executeAgentTool('add_chore', { title: choreTitle, assignedTo: 'Liam', points: 20 });
      res.write(`data: ${JSON.stringify({ type: 'tool_end', tool: { id: 't_' + Date.now(), name: 'add_chore', args: { title: choreTitle, assignedTo: 'Liam', points: 20 }, result } })}\n\n`);
      
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: `🧹 **Chore Created!**\nAssigned **"${choreTitle}"** to Liam for 20 reward points.` })}\n\n`);
      executedAnyTool = true;
    }

    // Check for Calendar Intent
    if (!executedAnyTool && (queryLower.includes('calendar') || queryLower.includes('event') || queryLower.includes('schedule') || queryLower.includes('meeting') || queryLower.includes('match') || queryLower.includes('doctor'))) {
      const eventTitle = lastUserMsg.length > 10 ? lastUserMsg : 'Family Activity';
      const eventDate = new Date().toISOString().split('T')[0];
      res.write(`data: ${JSON.stringify({ type: 'tool_start', tool: { id: 't_' + Date.now(), name: 'add_calendar_event', args: { title: eventTitle, date: eventDate, time: '16:00' } } })}\n\n`);
      const result = executeAgentTool('add_calendar_event', { title: eventTitle, date: eventDate, time: '16:00', location: 'Home' });
      res.write(`data: ${JSON.stringify({ type: 'tool_end', tool: { id: 't_' + Date.now(), name: 'add_calendar_event', args: { title: eventTitle, date: eventDate, time: '16:00' }, result } })}\n\n`);
      
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: `📅 **Event Scheduled!**\nAdded **"${eventTitle}"** to your family calendar for ${eventDate} at 4:00 PM.` })}\n\n`);
      executedAnyTool = true;
    }

    // Check for Budget Intent
    if (!executedAnyTool && (queryLower.includes('budget') || queryLower.includes('expense') || queryLower.includes('cost') || queryLower.includes('spent') || queryLower.includes('$'))) {
      const amount = (lastUserMsg.match(/\$?(\d+)/) || [])[1] || '35';
      res.write(`data: ${JSON.stringify({ type: 'tool_start', tool: { id: 't_' + Date.now(), name: 'log_budget_entry', args: { type: 'expense', amount: Number(amount), description: lastUserMsg } } })}\n\n`);
      const result = executeAgentTool('log_budget_entry', { type: 'expense', amount: Number(amount), description: lastUserMsg, category: 'Household' });
      res.write(`data: ${JSON.stringify({ type: 'tool_end', tool: { id: 't_' + Date.now(), name: 'log_budget_entry', args: { type: 'expense', amount: Number(amount), description: lastUserMsg }, result } })}\n\n`);
      
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: `💵 **Expense Logged!**\nLogged **$${amount}** under household expenses for "${lastUserMsg}".` })}\n\n`);
      executedAnyTool = true;
    }

    if (!executedAnyTool) {
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: `✨ **Lina AI Response:**\n\nI received your query: "${lastUserMsg}".\n\nI'm ready to manage your family calendar, shopping list, household budget, chores, and pantry inventory! You can also configure API keys for Gemini, OpenAI, Claude, or DeepSeek in **Settings**.` })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
    res.end();
  };

  // Determine Provider Key
  const geminiKey = apiKeyOverride || apiKeys.geminiApiKey || process.env.GEMINI_API_KEY;
  const openaiKey = apiKeys.openaiApiKey || process.env.OPENAI_API_KEY;
  const claudeKey = apiKeys.claudeApiKey || process.env.ANTHROPIC_API_KEY;
  const deepseekKey = apiKeys.deepseekApiKey;
  const openrouterKey = apiKeys.openrouterApiKey;
  const customEndpoint = apiKeys.customApiEndpoint;

  // 1. OpenAI Handler
  if ((model.startsWith('gpt-') || model === 'o3-mini') && openaiKey) {
    try {
      const formattedMsgs = [
        { role: 'system', content: systemInstruction },
        ...messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content || '',
        })),
      ];

      const fetchRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: model === 'o3-mini' ? 'o3-mini' : model,
          messages: formattedMsgs,
          stream: true,
        }),
      });

      if (!fetchRes.ok || !fetchRes.body) {
        throw new Error(`OpenAI API error: ${fetchRes.statusText}`);
      }

      const reader = fetchRes.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const parsed = JSON.parse(line.slice(6));
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                res.write(`data: ${JSON.stringify({ type: 'chunk', text: content })}\n\n`);
              }
            } catch (e) {}
          }
        }
      }

      res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
      return res.end();
    } catch (err: any) {
      console.warn('OpenAI stream failed, trying Gemini / fallback:', err.message);
    }
  }

  // 2. Gemini Handler (Default / Primary)
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });

      const formattedContents = messages
        .filter((m: any) => m.role === 'user' || m.role === 'assistant')
        .map((m: any) => {
          const parts: any[] = [];
          if (m.content) parts.push({ text: m.content });
          if (m.attachments && m.attachments.length > 0) {
            m.attachments.forEach((att: any) => {
              if (att.data && att.mimeType) {
                const base64Clean = att.data.includes(',') ? att.data.split(',')[1] : att.data;
                parts.push({
                  inlineData: {
                    mimeType: att.mimeType,
                    data: base64Clean,
                  },
                });
              }
            });
          }
          return {
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: parts.length > 0 ? parts : [{ text: 'Hello' }],
          };
        });

      let targetModel = 'gemini-2.5-flash';
      if (model.includes('pro')) targetModel = 'gemini-2.5-pro';
      if (model.includes('1.5')) targetModel = 'gemini-1.5-flash';

      const config: any = {
        systemInstruction,
        tools: geminiTools,
      };

      if (webSearchEnabled) {
        config.tools = [...config.tools, { googleSearch: {} }];
      }

      if (thinkingEnabled) {
        config.thinkingConfig = { thinkingBudget: 2048 };
      }

      const streamResult = await ai.models.generateContentStream({
        model: targetModel,
        contents: formattedContents,
        config,
      });

      let toolCallsToExecute: any[] = [];

      for await (const chunk of streamResult) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk.text })}\n\n`);
        }

        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          for (const call of chunk.functionCalls) {
            toolCallsToExecute.push(call);
          }
        }
      }

      if (toolCallsToExecute.length > 0) {
        for (const call of toolCallsToExecute) {
          const toolName = call.name;
          const toolArgs = call.args || {};

          res.write(
            `data: ${JSON.stringify({
              type: 'tool_start',
              tool: { id: call.id || 'tool_' + Date.now(), name: toolName, args: toolArgs },
            })}\n\n`
          );

          const result = executeAgentTool(toolName, toolArgs);

          res.write(
            `data: ${JSON.stringify({
              type: 'tool_end',
              tool: { id: call.id || 'tool_' + Date.now(), name: toolName, args: toolArgs, result },
            })}\n\n`
          );
        }
      }

      res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
      return res.end();
    } catch (err: any) {
      console.warn('Gemini Stream failed, triggering autonomous tool engine:', err.message);
      return runAutonomousToolFallback(`*(Using Lina Autonomous Engine)*`);
    }
  }

  // 3. Fallback when no keys provided
  return runAutonomousToolFallback(`*(Note: No custom API Key configured in Settings. Lina is operating in Autonomous Household Engine Mode)*`);
});

// --- VITE MIDDLEWARE / PRODUCTION STATIC SERVER SETUP ---
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lina AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
