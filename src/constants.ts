import type { CategoryId, CategoryMeta, CurrencyCode } from './types';

export const CATEGORIES: CategoryMeta[] = [
  { id: 'food', label: 'Food', emoji: '🍔', color: '#3b82f6' },
  { id: 'transport', label: 'Transport', emoji: '🚗', color: '#06b6d4' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#8b5cf6' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬', color: '#ec4899' },
  { id: 'health', label: 'Health', emoji: '💊', color: '#f59e0b' },
  { id: 'education', label: 'Education', emoji: '📚', color: '#10b981' },
  { id: 'housing', label: 'Housing', emoji: '🏠', color: '#6366f1' },
  { id: 'other', label: 'Other', emoji: '💰', color: '#64748b' },
];

const CATEGORY_MAP: Record<CategoryId, CategoryMeta> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CategoryId, CategoryMeta>,
);

export const categoryMeta = (id: CategoryId): CategoryMeta =>
  CATEGORY_MAP[id] ?? CATEGORY_MAP.other;

export const isValidCategory = (value: string): value is CategoryId =>
  value in CATEGORY_MAP;

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  INR: 'Indian Rupee (₹)',
  USD: 'US Dollar ($)',
  EUR: 'Euro (€)',
  GBP: 'British Pound (£)',
  JPY: 'Japanese Yen (¥)',
};

export const CHART_COLORS = [
  '#3b82f6',
  '#06b6d4',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#6366f1',
  '#64748b',
];
