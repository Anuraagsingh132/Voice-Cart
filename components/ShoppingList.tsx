'use client';

import React, { useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trash2, Sparkles, CheckCheck, ShoppingCart } from 'lucide-react';
import { useShoppingList } from '@/context/ShoppingListContext';
import { ListItem } from './ListItem';

const CATEGORY_PILLS: Record<string, { emoji: string; label: string; color: string }> = {
  'Fruits & Vegetables': { emoji: '🍎', label: 'Fruits & Vegetables', color: 'badge-emerald' },
  'Dairy & Eggs': { emoji: '🥛', label: 'Dairy & Eggs', color: 'badge-cyan' },
  'Bakery & Snacks': { emoji: '🍞', label: 'Bakery & Snacks', color: 'badge-amber' },
  'Beverages': { emoji: '🧃', label: 'Beverages', color: 'badge-cyan' },
  'Pantry & Staples': { emoji: '🍚', label: 'Pantry & Staples', color: 'badge-violet' },
  'Personal Care': { emoji: '🧴', label: 'Personal Care', color: 'badge-rose' },
  'Household & Cleaning': { emoji: '🧹', label: 'Household & Cleaning', color: 'badge-violet' },
};

// ── Circular Progress Ring SVG ──
function ProgressRing({ progress, size = 56 }: { progress: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90 flex-shrink-0">
      <circle
        className="progress-ring-track"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className="progress-ring-fill"
        stroke={progress >= 100 ? '#10b981' : '#06b6d4'}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
}

export function ShoppingList() {
  const {
    items,
    toggleCheckItem,
    deleteItemById,
    modifyItem,
    clearList,
  } = useShoppingList();

  // Group items by category
  const categorized = useMemo(() => {
    const map = new Map<string, typeof items>();
    items.forEach((item) => {
      const cat = item.category || 'Pantry & Staples';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(item);
    });
    return Array.from(map.entries());
  }, [items]);

  const totalItems = items.length;
  const completedItems = items.filter((i) => i.checked).length;
  const remainingItems = totalItems - completedItems;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isAllComplete = totalItems > 0 && completedItems === totalItems;

  const handleToggleCheck = (id: string) => {
    toggleCheckItem(id);
    const target = items.find((i) => i.id === id);
    if (target && !target.checked && completedItems + 1 === totalItems && totalItems > 1) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#06b6d4', '#10b981', '#8b5cf6', '#22d3ee'],
        });
      } catch (err) {
        console.warn('Confetti trigger ignored:', err);
      }
    }
  };

  const handleModifyQty = (id: string, newQty: number) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      modifyItem(item.name, newQty);
    }
  };

  // ── Empty State ──
  if (totalItems === 0) {
    return (
      <section className="glass-card rounded-2xl p-6 md:p-8 text-center animate-fade-in-up">
        <div className="w-14 h-14 rounded-2xl bg-vc-cyan-muted flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-7 h-7 text-vc-cyan" />
        </div>
        <h2 className="text-lg font-bold text-vc-text mb-1">Your Shopping List is Empty</h2>
        <p className="text-sm text-vc-text-secondary max-w-sm mx-auto mb-6">
          The microphone is always active. Speak naturally to add items anytime!
        </p>

        <div className="rounded-xl p-4 max-w-sm mx-auto border border-vc-border bg-white/[0.02] text-left">
          <p className="text-xs font-semibold text-vc-cyan uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Try saying:
          </p>
          <ul className="space-y-2 text-sm text-vc-text-secondary">
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-vc-cyan flex-shrink-0" />
              &ldquo;Add 2 bottles of milk and bread&rdquo;
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-vc-emerald flex-shrink-0" />
              &ldquo;5 apples and 2 oranges&rdquo;
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-vc-violet flex-shrink-0" />
              &ldquo;Find juice under $5&rdquo;
            </li>
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section className="glass-card rounded-2xl p-4 sm:p-5 md:p-6 animate-fade-in-up">
      {/* Header: Progress Ring + Title + Clear */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-vc-border-subtle">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Circular Progress */}
          <div className="relative">
            <ProgressRing progress={progressPercent} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-vc-text tabular-nums">
                {progressPercent}%
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-vc-text tracking-tight">
                Shopping List
              </h2>
              {isAllComplete && (
                <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-scale-in">
                  <CheckCheck className="w-3 h-3" />
                  Complete!
                </span>
              )}
            </div>
            <p className="text-xs text-vc-text-muted mt-0.5">
              {completedItems} of {totalItems} bought · {remainingItems} remaining
            </p>
          </div>
        </div>

        {/* Clear All */}
        <button
          onClick={clearList}
          aria-label="Clear List"
          className="btn-glass text-xs flex items-center gap-1.5 px-3 py-2 hover:text-vc-error hover:border-vc-error/30 transition-colors active:scale-95 focus-ring"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* Categorized Items */}
      <div className="space-y-5">
        {categorized.map(([category, catItems]) => {
          const pill = CATEGORY_PILLS[category] || {
            emoji: '🛒',
            label: category,
            color: 'badge-violet',
          };
          const catComplete = catItems.every((i) => i.checked);

          return (
            <div key={category} className="space-y-2">
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`${pill.color} px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5`}
                >
                  <span>{pill.emoji}</span> {pill.label}
                </span>
                <span className="text-[11px] text-vc-text-muted tabular-nums">
                  ({catItems.filter((i) => i.checked).length}/{catItems.length})
                </span>
                {catComplete && (
                  <CheckCheck className="w-3.5 h-3.5 text-vc-emerald" />
                )}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {catItems.map((item) => (
                  <ListItem
                    key={item.id}
                    item={item}
                    onToggleCheck={handleToggleCheck}
                    onDelete={deleteItemById}
                    onModifyQty={handleModifyQty}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
