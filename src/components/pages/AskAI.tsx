import { useEffect, useRef, useState } from 'react';
import { Send, MessageSquare, Sparkles } from 'lucide-react';
import type { Expense, ChatMessage, CurrencyCode } from '../../types';
import { chatWithGemini } from '../../lib/gemini';
import { Card } from '../Card';
import { EmptyState } from '../EmptyState';
import { Spinner } from '../Spinner';

interface AskAIProps {
  expenses: Expense[];
  currency: CurrencyCode;
  onGoAdd: () => void;
}

const SUGGESTIONS = [
  'How much did I spend on food this month?',
  "What's my biggest spending weakness?",
  'Where can I cut back?',
  'Am I saving enough?',
];

export function AskAI({ expenses, currency, onGoAdd }: AskAIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: 'assistant', text: '' }]);
    setInput('');
    setSending(true);
    const reply = await chatWithGemini(trimmed, expenses, currency);
    setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, text: reply } : m)));
    setSending(false);
    inputRef.current?.focus();
  };

  if (expenses.length === 0) {
    return (
      <Card className="mt-4">
        <EmptyState icon={<MessageSquare className="h-8 w-8" />} title="No expenses to chat about" message="Add some expenses first, then ask AI anything about your spending habits."
          action={<button onClick={onGoAdd} className="btn-primary px-5 py-2.5 text-sm font-semibold">Add an expense</button>} />
      </Card>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col lg:h-[calc(100vh-160px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Ask AI</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Chat with AI about your spending</p>
      </div>

      <div ref={scrollRef} className="no-scrollbar flex-1 space-y-3 overflow-y-auto pb-2">
        {messages.length === 0 ? (
          <WelcomeState count={expenses.length} suggestions={SUGGESTIONS} onPick={send} />
        ) : (
          messages.map((m) => <Bubble key={m.id} message={m} sending={sending} />)
        )}
      </div>

      <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
          <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your spending..." disabled={sending} className="input-field flex-1" />
          <button type="submit" disabled={!input.trim() || sending} className="btn-primary grid h-11 w-11 shrink-0 place-items-center" aria-label="Send">
            {sending ? <Spinner size={16} color="#fff" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}

function WelcomeState({ count, suggestions, onPick }: { count: number; suggestions: string[]; onPick: (s: string) => void }) {
  return (
    <div className="flex flex-col items-center px-2 py-10 text-center animate-fade-up">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-600/10 dark:text-brand-300">
        <Sparkles className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold">Ask me about your spending</h3>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        I can see your {count} recorded {count === 1 ? 'expense' : 'expenses'}. Try one of these:
      </p>
      <div className="mt-5 flex w-full max-w-sm flex-col gap-2">
        {suggestions.map((s) => (
          <button key={s} onClick={() => onPick(s)} className="card card-hover rounded-xl px-4 py-3 text-left text-sm">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function Bubble({ message, sending }: { message: ChatMessage; sending: boolean }) {
  const isUser = message.role === 'user';
  const isStreaming = !isUser && sending && message.text === '';
  return (
    <div className={`flex animate-fade-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser ? 'rounded-br-md bg-brand-600 text-white' : 'rounded-bl-md bg-slate-100 text-slate-800 dark:bg-surface-dark-muted dark:text-slate-100'}`}>
        {isStreaming ? (
          <span className="inline-flex items-center gap-1.5 text-slate-400"><Spinner size={14} /> Thinking...</span>
        ) : (
          <span className="whitespace-pre-wrap">{message.text}</span>
        )}
      </div>
    </div>
  );
}
