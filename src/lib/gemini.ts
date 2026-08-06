import type { Expense, Income, Budget, CurrencyCode, FinancialReport, CategoryId } from '../types';
import { CATEGORIES, isValidCategory, CURRENCY_SYMBOLS } from '../constants';

const GEMINI_MODEL = 'gemini-2.0-flash';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

console.log('Gemini API Key exists:', !!API_KEY);
console.log('[Gemini] Using model:', GEMINI_MODEL);

// --- Core Gemini call helpers ---

async function geminiText(prompt: string, jsonMode = false): Promise<string> {
  if (!API_KEY) {
    throw new Error('[Gemini] VITE_GEMINI_API_KEY is missing. Set it in your .env file.');
  }
  return callGemini(prompt, undefined, undefined, jsonMode);
}

async function geminiVision(prompt: string, imageBase64: string, mimeType = 'image/jpeg', jsonMode = false): Promise<string> {
  if (!API_KEY) {
    throw new Error('[Gemini] VITE_GEMINI_API_KEY is missing. Set it in your .env file.');
  }
  return callGemini(prompt, imageBase64, mimeType, jsonMode);
}

async function callGemini(
  prompt: string,
  imageBase64?: string,
  mimeType?: string,
  jsonMode = false,
): Promise<string> {
  const url = `${BASE_URL}/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

  const parts: Record<string, unknown>[] = [{ text: prompt }];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: mimeType ?? 'image/jpeg', data: imageBase64 } });
  }

  const body: Record<string, unknown> = {
    contents: [{ parts }],
  };
  if (jsonMode) {
    body.generationConfig = { responseMimeType: 'application/json' };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`[Gemini] HTTP ${res.status} from model "${GEMINI_MODEL}":`, errBody);
    let errMsg = `Gemini API error (HTTP ${res.status})`;
    try {
      const errJson = JSON.parse(errBody);
      if (errJson?.error?.message) errMsg = errJson.error.message;
    } catch {
      if (errBody) errMsg = errBody.slice(0, 200);
    }
    throw new Error(`[Gemini] ${errMsg}`);
  }

  const data = await res.json();
  console.log('Gemini Response:', data);

  if (data?.promptFeedback?.blockReason) {
    console.error('[Gemini] Prompt blocked:', data.promptFeedback.blockReason);
    throw new Error(`[Gemini] Prompt blocked: ${data.promptFeedback.blockReason}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  console.log('Gemini Text:', text);

  if (!text) {
    const finishReason = data?.candidates?.[0]?.finishReason;
    console.warn(`[Gemini] Empty text. finishReason=${finishReason}`);
  }

  return text;
}

// --- JSON extraction ---

function stripJsonFences(text: string): string {
  let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  // If there's still surrounding text, try to extract the first {...} block
  if (!cleaned.startsWith('{')) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) cleaned = match[0];
  }
  return cleaned;
}

function safeJsonParse<T>(text: string): T | null {
  if (!text) return null;
  try {
    return JSON.parse(stripJsonFences(text)) as T;
  } catch {
    console.error('[Gemini] JSON.parse failed on text:', text.slice(0, 300));
    return null;
  }
}

const str = (v: unknown, fallback: string): string =>
  typeof v === 'string' && v.trim() ? v.trim() : fallback;

// --- Categorization ---

const CATEGORY_LIST = CATEGORIES.map((c) => `${c.id} (${c.label})`).join(', ');

export async function categorizeExpense(
  description: string,
  amount: number,
): Promise<CategoryId> {
  const fallback: CategoryId = guessCategory(description);
  try {
    const prompt = `You categorize personal expenses into exactly one of these categories: ${CATEGORY_LIST}.

Common examples to guide you:
- food: restaurants, cafes, groceries, snacks, coffee, food delivery, swiggy, zomato, mcdonalds, kitchen
- transport: uber, lyft, gas, fuel, petrol, bus, train, metro, parking, taxi, ola, flight tickets
- shopping: amazon, clothes, shoes, electronics, gadgets, books (non-educational), home decor, furniture
- entertainment: movies, netflix, spotify, concert, gaming, steam, theater, amusement park
- health: pharmacy, doctor, dentist, hospital, gym, medicine, supplements, therapy
- education: tuition, course, udemy, coursera, school fees, textbooks, workshop, training
- housing: rent, electricity, water, internet, maintenance, property tax, groceries if household
- other: anything that doesn't fit above

Reply with ONLY the category id (lowercase, no punctuation, no explanation). Description: "${description}" Amount: ${amount}`;

    const text = await geminiText(prompt);
    const cleaned = text.trim().toLowerCase().replace(/[^a-z]/g, '');
    return isValidCategory(cleaned) ? cleaned : fallback;
  } catch (err) {
    console.error('Categorize failed:', err);
    return fallback;
  }
}

function guessCategory(description: string): CategoryId {
  const desc = description.toLowerCase();
  const rules: Array<[CategoryId, string[]]> = [
    ['food', ['food', 'lunch', 'dinner', 'breakfast', 'cafe', 'coffee', 'restaurant', 'pizza', 'burger', 'grocery', 'groceries', 'snack', 'swiggy', 'zomato', 'meal', 'eat', 'kitchen']],
    ['transport', ['uber', 'lyft', 'ola', 'taxi', 'bus', 'train', 'metro', 'fuel', 'gas', 'petrol', 'parking', 'flight', 'cab', 'ride', 'transport']],
    ['shopping', ['amazon', 'clothes', 'shoes', 'shirt', 'pants', 'electronics', 'phone', 'laptop', 'gadget', 'furniture', 'decor', 'mall', 'store', 'purchase']],
    ['entertainment', ['movie', 'netflix', 'spotify', 'concert', 'game', 'gaming', 'steam', 'theater', 'music', 'show', 'ticket']],
    ['health', ['pharmacy', 'doctor', 'dentist', 'hospital', 'gym', 'medicine', 'health', 'therapy', 'supplement', 'medical', 'clinic']],
    ['education', ['tuition', 'course', 'udemy', 'coursera', 'school', 'college', 'textbook', 'workshop', 'training', 'class', 'education', 'book']],
    ['housing', ['rent', 'electricity', 'water', 'internet', 'wifi', 'maintenance', 'mortgage', 'property', 'utility', 'utilities', 'broadband']],
  ];
  for (const [cat, keywords] of rules) {
    if (keywords.some((kw) => desc.includes(kw))) return cat;
  }
  return 'other';
}

// --- Financial report ---

export async function generateFinancialReport(
  expenses: Expense[],
  incomes: Income[],
  budgets: Budget[],
  currency: CurrencyCode = 'INR',
): Promise<FinancialReport> {
  const fallback: FinancialReport = {
    summary: 'Unable to generate analysis at this time.',
    patterns: '',
    largestCategories: '',
    budgetSuggestions: '',
    reduceAreas: '',
    healthScore: 0,
    healthLabel: 'N/A',
  };

  try {
    const symbol = CURRENCY_SYMBOLS[currency] ?? '₹';
    const expCtx = expenses
      .map((e) => `${e.date} | ${symbol}${e.amount} | ${e.category} | ${e.description}`)
      .join('\n');
    const incCtx = incomes.length > 0
      ? `\nIncome:\n${incomes.map((i) => `${i.date} | ${symbol}${i.amount} | ${i.description}`).join('\n')}`
      : '\nNo income recorded.';
    const budCtx = budgets.length > 0
      ? `\nBudgets:\n${budgets.map((b) => `${b.category}: ${symbol}${b.limit} for ${b.month}`).join('\n')}`
      : '\nNo budgets set.';

    const prompt = `You are a professional personal-finance analyst. Currency is ${currency} (${symbol}). Respond ONLY with JSON.

Expenses:
${expCtx}${incCtx}${budCtx}

Analyze this financial data and return JSON with exactly these fields:
- summary: 2-3 sentence spending summary
- patterns: 2-3 sentences describing spending patterns and trends
- largestCategories: 1-2 sentences naming the largest expense categories with amounts
- budgetSuggestions: 2-3 actionable budget improvement suggestions
- reduceAreas: 2-3 sentences identifying specific areas where spending can be reduced
- healthScore: integer 0-100 representing overall financial health (higher is better)
- healthLabel: one word: "Excellent", "Good", "Fair", "Poor", or "Critical"`;

    const text = await geminiText(prompt, true);

    const data = safeJsonParse<Partial<FinancialReport>>(text);
    if (!data) return fallback;

    return {
      summary: str(data.summary, fallback.summary),
      patterns: str(data.patterns, fallback.patterns),
      largestCategories: str(data.largestCategories, fallback.largestCategories),
      budgetSuggestions: str(data.budgetSuggestions, fallback.budgetSuggestions),
      reduceAreas: str(data.reduceAreas, fallback.reduceAreas),
      healthScore: typeof data.healthScore === 'number' ? Math.max(0, Math.min(100, Math.round(data.healthScore))) : 0,
      healthLabel: str(data.healthLabel, fallback.healthLabel),
    };
  } catch (err) {
    console.error('Financial report failed:', err);
    return fallback;
  }
}

// --- Chat ---

export async function chatWithGemini(
  message: string,
  expenses: Expense[],
  currency: CurrencyCode = 'INR',
): Promise<string> {
  const fallback = 'Sorry, I could not generate a response right now. Please try again later.';
  try {
    if (expenses.length === 0) {
      return "You don't have any recorded expenses yet. Add some transactions first, then I can answer questions about your spending.";
    }

    const symbol = CURRENCY_SYMBOLS[currency] ?? '₹';
    const expCtx = expenses
      .map((e) => `${e.date} | ${symbol}${e.amount} | ${e.category} | ${e.description}`)
      .join('\n');

    const prompt = `You are a warm, concise personal-finance assistant inside an expense tracker app. Currency is ${currency} (${symbol}). You have access to the user's expense history. Answer questions about their spending naturally and specifically, referencing real numbers and categories. Keep answers short and skimmable (2-4 sentences).

User's expense data:
${expCtx}

Question: ${message}`;

    const text = await geminiText(prompt);
    return text || fallback;
  } catch (err) {
    console.error('Chat failed:', err);
    return `Sorry, I couldn't reach the AI service right now. ${err instanceof Error ? err.message : 'Please try again later.'}`;
  }
}

// --- Receipt scanning ---

export interface ReceiptData {
  merchant: string;
  amount: number | null;
  date: string | null;
  items: string[];
}

export async function scanReceipt(imageBase64: string): Promise<ReceiptData> {
  const fallback: ReceiptData = { merchant: '', amount: null, date: null, items: [] };
  try {
    const prompt = `Analyze this receipt image and extract information. Return ONLY a JSON object with:
- merchant: store/merchant name (string)
- amount: total amount as a number
- date: date in YYYY-MM-DD format (string or null)
- items: array of item descriptions (strings)
Return only valid JSON, no markdown fences.`;

    const text = await geminiVision(prompt, imageBase64, 'image/jpeg', true);

    const obj = safeJsonParse<Partial<ReceiptData> & { amount?: number | string }>(text);
    if (!obj) return fallback;

    return {
      merchant: typeof obj.merchant === 'string' ? obj.merchant : '',
      amount: typeof obj.amount === 'number' ? obj.amount : typeof obj.amount === 'string' ? parseFloat(obj.amount) || null : null,
      date: typeof obj.date === 'string' ? obj.date : null,
      items: Array.isArray(obj.items) ? obj.items.filter((i): i is string => typeof i === 'string') : [],
    };
  } catch (err) {
    console.error('Receipt scan failed:', err);
    return fallback;
  }
}
