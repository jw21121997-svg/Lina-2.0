import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Define the 'users' table.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'family_members' table
export const familyMembers = pgTable('family_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  role: text('role'),
  avatar: text('avatar'),
  color: text('color'),
  pointsBalance: integer('points_balance').default(0),
});

// Define 'shopping_items' table
export const shoppingItems = pgTable('shopping_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  category: text('category'),
  quantity: integer('quantity').default(1),
  unit: text('unit'),
  isChecked: boolean('is_checked').default(false),
  addedBy: text('added_by'),
  urgent: boolean('urgent').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'chores' table
export const chores = pgTable('chores', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  assignedTo: text('assigned_to'),
  points: integer('points').default(10),
  isCompleted: boolean('is_completed').default(false),
  dueDate: text('due_date'),
  category: text('category'),
});

// Define 'notes' table
export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  content: text('content'),
  category: text('category'),
  isPinned: boolean('is_pinned').default(false),
  updatedAt: text('updated_at'),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  familyMembers: many(familyMembers),
  shoppingItems: many(shoppingItems),
  chores: many(chores),
  notes: many(notes),
}));
