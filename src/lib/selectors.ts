import type { Expense, Income, TimeRange } from '../types';
import { CATEGORIES } from '../constants';

const EMOJIS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.emoji]));
const LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));
const COLORS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.color]));

export interface CategorySlice {
  category: string;
  label: string;
  value: number;
  color: string;
  emoji: string;
}

// Aggregates spending by category, sorted high→low.
export const byCategory = (expenses: Expense[]): CategorySlice[] => {
  const map = new Map<string, number>();
  for (const e of expenses) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
  }
  return Array.from(map.entries())
    .map(([category, value]) => ({
      category,
      label: LABELS[category] ?? category,
      value,
      color: COLORS[category] ?? '#999999',
      emoji: EMOJIS[category] ?? '💰',
    }))
    .sort((a, b) => b.value - a.value);
};

export const totalSpent = (expenses: Expense[]): number =>
  expenses.reduce((sum, e) => sum + e.amount, 0);

export const monthTotal = (expenses: Expense[], month: string): number =>
  expenses
    .filter((e) => e.date.startsWith(month))
    .reduce((sum, e) => sum + e.amount, 0);

export const totalIncome = (incomes: Income[]): number =>
  incomes.reduce((sum, i) => sum + i.amount, 0);

export const monthIncome = (incomes: Income[], month: string): number =>
  incomes
    .filter((i) => i.date.startsWith(month))
    .reduce((sum, i) => sum + i.amount, 0);

export const highestCategory = (
  expenses: Expense[],
): CategorySlice | null => {
  const slices = byCategory(expenses);
  return slices.length > 0 ? slices[0] : null;
};

export const recent = (expenses: Expense[], n: number): Expense[] =>
  expenses.slice(0, n);

// Monthly bar chart data — last N months including current.
export interface MonthBucket {
  month: string;
  label: string;
  value: number;
}

export const monthlyBars = (expenses: Expense[], count = 6): MonthBucket[] => {
  const now = new Date();
  const buckets: MonthBucket[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-IN', { month: 'short' });
    const value = expenses
      .filter((e) => e.date.startsWith(ym))
      .reduce((sum, e) => sum + e.amount, 0);
    buckets.push({ month: ym, label, value });
  }
  return buckets;
};

// Spending trend line — daily points within the selected range.
export interface TrendPoint {
  date: string;
  label: string;
  value: number;
}

export const spendingTrend = (
  expenses: Expense[],
  range: TimeRange,
): TrendPoint[] => {
  const now = new Date();
  const points: TrendPoint[] = [];

  if (range === 'weekly') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const value = expenses
        .filter((e) => e.date === iso)
        .reduce((sum, e) => sum + e.amount, 0);
      points.push({
        date: iso,
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        value,
      });
    }
  } else if (range === 'monthly') {
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthExpenses = expenses.filter((e) => e.date.startsWith(ym));
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), i);
      const iso = d.toISOString().slice(0, 10);
      const value = monthExpenses
        .filter((e) => e.date === iso)
        .reduce((sum, e) => sum + e.amount, 0);
      points.push({
        date: iso,
        label: String(i),
        value,
      });
    }
  } else {
    // yearly — monthly aggregation
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const value = expenses
        .filter((e) => e.date.startsWith(ym))
        .reduce((sum, e) => sum + e.amount, 0);
      points.push({
        date: ym,
        label: d.toLocaleDateString('en-IN', { month: 'short' }),
        value,
      });
    }
  }

  return points;
};

// Category breakdown for a specific month — used by budget tracking.
export const categorySpendInMonth = (
  expenses: Expense[],
  category: string,
  month: string,
): number =>
  expenses
    .filter((e) => e.category === category && e.date.startsWith(month))
    .reduce((sum, e) => sum + e.amount, 0);
