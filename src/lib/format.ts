import type { CurrencyCode } from '../types';
import { CURRENCY_SYMBOLS } from '../constants';

// Format a monetary value using the selected currency symbol.
export const formatCurrency = (
  value: number,
  currency: CurrencyCode = 'INR',
): string => {
  if (!Number.isFinite(value)) return `${CURRENCY_SYMBOLS[currency] ?? '₹'}0`;
  const symbol = CURRENCY_SYMBOLS[currency] ?? '₹';
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return `${symbol}${value.toLocaleString(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;
};

// Compact form for axis labels: ₹1.2k, ₹3.4L
export const formatCompact = (
  value: number,
  currency: CurrencyCode = 'INR',
): string => {
  const symbol = CURRENCY_SYMBOLS[currency] ?? '₹';
  if (!Number.isFinite(value) || value === 0) return `${symbol}0`;
  if (value >= 1_00_00_000) return `${symbol}${(value / 1_00_00_000).toFixed(1)}Cr`;
  if (value >= 1_00_000) return `${symbol}${(value / 1_00_000).toFixed(1)}L`;
  if (value >= 1_000) return `${symbol}${(value / 1_000).toFixed(1)}k`;
  return formatCurrency(value, currency);
};

// Pretty date: "12 Jul 2026"
export const formatDate = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Short date: "12 Jul"
export const formatShortDate = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

// Today as yyyy-mm-dd for the date picker default.
export const todayISO = (): string => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60_000);
  return local.toISOString().slice(0, 10);
};

// Current month as YYYY-MM
export const currentMonth = (): string => todayISO().slice(0, 7);

// Relative label for chat / insights context.
export const relativeDate = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  const today = new Date(todayISO() + 'T00:00:00');
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays > 0 && diffDays < 7) return `${diffDays} days ago`;
  return formatDate(iso);
};

// Month label from YYYY-MM: "July 2026"
export const monthLabel = (ym: string): string => {
  const [y, m] = ym.split('-');
  const d = new Date(parseInt(y), parseInt(m) - 1, 1);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};
