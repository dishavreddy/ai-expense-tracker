// Domain types shared across the app.

export type CategoryId =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'housing'
  | 'other';

export type ExpenseType = 'expense' | 'income';

export type Frequency = 'daily' | 'weekly' | 'monthly';

export type TimeRange = 'weekly' | 'monthly' | 'yearly';

export type ThemeMode = 'light' | 'dark';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: CategoryId;
  date: string; // ISO yyyy-mm-dd
  emoji: string;
}

export interface Income {
  id: string;
  amount: number;
  description: string;
  date: string;
}

export interface Budget {
  id: string;
  category: CategoryId;
  month: string; // YYYY-MM
  limit: number;
}

export interface RecurringExpense {
  id: string;
  description: string;
  amount: number;
  category: CategoryId;
  emoji: string;
  frequency: Frequency;
  startDate: string;
  nextDate: string;
  active: boolean;
}

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
}

export interface UserProfile {
  name: string;
  email: string;
}

export interface AppSettings {
  currency: CurrencyCode;
  monthlyIncome: number;
  theme: ThemeMode;
}

export type PageId =
  | 'dashboard'
  | 'transactions'
  | 'add'
  | 'analytics'
  | 'ai-analysis'
  | 'ask'
  | 'budgets'
  | 'recurring'
  | 'reports'
  | 'profile'
  | 'settings';

export interface FinancialReport {
  summary: string;
  patterns: string;
  largestCategories: string;
  budgetSuggestions: string;
  reduceAreas: string;
  healthScore: number;
  healthLabel: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}
