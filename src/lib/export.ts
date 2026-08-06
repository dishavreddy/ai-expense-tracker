import type { Expense, Income, Budget, FinancialReport, CurrencyCode } from '../types';
import type { CategorySlice } from './selectors';
import { formatCurrency, formatDate, monthLabel } from './format';

// --- CSV Export ---

const csvEscape = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export function exportCSV(
  expenses: Expense[],
  incomes: Income[],
  budgets: Budget[],
  report: FinancialReport | null,
): void {
  const sections: string[] = [];

  // Expenses
  sections.push('EXPENSES');
  sections.push('Date,Description,Category,Amount');
  for (const e of expenses) {
    sections.push(
      [csvEscape(e.date), csvEscape(e.description), csvEscape(e.category), e.amount].join(','),
    );
  }

  // Incomes
  sections.push('');
  sections.push('INCOMES');
  sections.push('Date,Source,Amount');
  for (const i of incomes) {
    sections.push([csvEscape(i.date), csvEscape(i.description), i.amount].join(','));
  }

  // Budgets
  sections.push('');
  sections.push('BUDGETS');
  sections.push('Category,Month,Limit');
  for (const b of budgets) {
    sections.push([csvEscape(b.category), csvEscape(b.month), b.limit].join(','));
  }

  // AI Analysis
  if (report) {
    sections.push('');
    sections.push('AI ANALYSIS');
    sections.push(`Summary,${csvEscape(report.summary)}`);
    sections.push(`Patterns,${csvEscape(report.patterns)}`);
    sections.push(`Largest Categories,${csvEscape(report.largestCategories)}`);
    sections.push(`Budget Suggestions,${csvEscape(report.budgetSuggestions)}`);
    sections.push(`Reduce Areas,${csvEscape(report.reduceAreas)}`);
    sections.push(`Health Score,${report.healthScore}`);
    sections.push(`Health Label,${csvEscape(report.healthLabel)}`);
  }

  const blob = new Blob([sections.join('\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `expense-report-${new Date().toISOString().slice(0, 10)}.csv`);
}

// --- PDF Export (print-to-PDF via new window) ---

export function exportPDF(
  expenses: Expense[],
  incomes: Income[],
  budgets: Budget[],
  slices: CategorySlice[],
  report: FinancialReport | null,
  currency: CurrencyCode = 'INR',
  profileName: string,
): void {
  const win = window.open('', '_blank');
  if (!win) return;

  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const totalInc = incomes.reduce((s, i) => s + i.amount, 0);
  const balance = totalInc - totalExp;

  const expRows = expenses
    .slice(0, 50)
    .map(
      (e) =>
        `<tr><td>${formatDate(e.date)}</td><td>${escapeHtml(e.description)}</td><td>${escapeHtml(e.category)}</td><td style="text-align:right">${formatCurrency(e.amount, currency)}</td></tr>`,
    )
    .join('');

  const incRows = incomes
    .slice(0, 20)
    .map(
      (i) =>
        `<tr><td>${formatDate(i.date)}</td><td>${escapeHtml(i.description)}</td><td style="text-align:right">${formatCurrency(i.amount, currency)}</td></tr>`,
    )
    .join('');

  const budgetRows = budgets
    .map(
      (b) =>
        `<tr><td>${escapeHtml(b.category)}</td><td>${monthLabel(b.month)}</td><td style="text-align:right">${formatCurrency(b.limit, currency)}</td></tr>`,
    )
    .join('');

  const sliceRows = slices
    .map(
      (s) =>
        `<tr><td>${escapeHtml(s.label)}</td><td style="text-align:right">${formatCurrency(s.value, currency)}</td><td style="text-align:right">${((s.value / totalExp) * 100).toFixed(1)}%</td></tr>`,
    )
    .join('');

  const reportHtml = report
    ? `<div class="section"><h2>AI Financial Analysis</h2>
       <table class="report-table">
         <tr><td class="label">Health Score</td><td><strong>${report.healthScore}/100 — ${escapeHtml(report.healthLabel)}</strong></td></tr>
         <tr><td class="label">Summary</td><td>${escapeHtml(report.summary)}</td></tr>
         <tr><td class="label">Patterns</td><td>${escapeHtml(report.patterns)}</td></tr>
         <tr><td class="label">Largest Categories</td><td>${escapeHtml(report.largestCategories)}</td></tr>
         <tr><td class="label">Budget Suggestions</td><td>${escapeHtml(report.budgetSuggestions)}</td></tr>
         <tr><td class="label">Areas to Reduce</td><td>${escapeHtml(report.reduceAreas)}</td></tr>
       </table></div>`
    : '';

  win.document.write(`<!DOCTYPE html><html><head><title>Expense Report</title>
    <style>
      body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #000; padding: 40px; max-width: 800px; margin: 0 auto; }
      h1 { font-size: 24px; border-bottom: 3px solid #16A34A; padding-bottom: 8px; }
      h2 { font-size: 16px; color: #16A34A; margin-top: 32px; text-transform: uppercase; letter-spacing: 1px; }
      .summary { display: flex; gap: 20px; margin: 20px 0; }
      .summary-card { flex: 1; border-top: 2px solid #16A34A; padding: 12px; }
      .summary-card .label { font-size: 11px; color: #666; text-transform: uppercase; }
      .summary-card .value { font-size: 22px; font-weight: 200; margin-top: 4px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
      th { text-align: left; border-bottom: 1px solid #E5E5E5; padding: 8px 4px; color: #666; font-size: 11px; text-transform: uppercase; }
      td { padding: 6px 4px; border-bottom: 1px solid #F0F0F0; }
      .report-table td { padding: 8px 4px; vertical-align: top; }
      .report-table .label { color: #666; width: 160px; font-size: 11px; text-transform: uppercase; }
      .section { margin-top: 24px; }
      .footer { margin-top: 40px; font-size: 10px; color: #999; text-align: center; }
      @media print { body { padding: 20px; } }
    </style>
  </head><body>
    <h1>Financial Report${profileName ? ` — ${escapeHtml(profileName)}` : ''}</h1>
    <p style="color:#666;font-size:12px">Generated on ${formatDate(new Date().toISOString().slice(0, 10))}</p>

    <div class="summary">
      <div class="summary-card"><div class="label">Total Income</div><div class="value">${formatCurrency(totalInc, currency)}</div></div>
      <div class="summary-card"><div class="label">Total Expenses</div><div class="value">${formatCurrency(totalExp, currency)}</div></div>
      <div class="summary-card"><div class="label">Balance</div><div class="value">${formatCurrency(balance, currency)}</div></div>
    </div>

    <div class="section"><h2>Expenses</h2><table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th style="text-align:right">Amount</th></tr></thead><tbody>${expRows}</tbody></table></div>

    ${incRows ? `<div class="section"><h2>Income</h2><table><thead><tr><th>Date</th><th>Source</th><th style="text-align:right">Amount</th></tr></thead><tbody>${incRows}</tbody></table></div>` : ''}

    <div class="section"><h2>Category Breakdown</h2><table><thead><tr><th>Category</th><th style="text-align:right">Amount</th><th style="text-align:right">%</th></tr></thead><tbody>${sliceRows}</tbody></table></div>

    ${budgetRows ? `<div class="section"><h2>Budgets</h2><table><thead><tr><th>Category</th><th>Month</th><th style="text-align:right">Limit</th></tr></thead><tbody>${budgetRows}</tbody></table></div>` : ''}

    ${reportHtml}

    <div class="footer">Generated by ExpenseAI</div>
  </body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
