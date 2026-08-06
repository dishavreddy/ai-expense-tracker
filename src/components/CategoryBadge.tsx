import type { CategoryId } from '../types';
import { categoryMeta } from '../constants';

interface CategoryBadgeProps {
  category: CategoryId;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const meta = categoryMeta(category);
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${pad}`}
      style={{
        backgroundColor: `${meta.color}15`,
        color: meta.color,
      }}
    >
      <span aria-hidden>{meta.emoji}</span>
      {meta.label}
    </span>
  );
}
