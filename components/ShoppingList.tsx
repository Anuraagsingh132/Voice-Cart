'use client';

import React, { useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trash2, Sparkles, CheckCheck } from 'lucide-react';
import { useShoppingList } from '@/context/ShoppingListContext';
import { ListItem } from './ListItem';

const CATEGORY_PILLS: Record<string, { emoji: string; label: string; bg: string; text: string; border: string }> = {
  'Dairy & Eggs': { emoji: '🥛', label: 'Dairy & Eggs', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  'Fruits & Vegetables': { emoji: '🍎', label: 'Fruits & Vegetables', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' },
  'Bakery & Snacks': { emoji: '🍞', label: 'Bakery & Snacks', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  'Beverages': { emoji: '🧃', label: 'Beverages', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-100' },
  'Pantry & Staples': { emoji: '🍚', label: 'Pantry & Staples', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  'Personal Care': { emoji: '🧴', label: 'Personal Care', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  'Household & Cleaning': { emoji: '🧹', label: 'Household', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-100' },
};

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

  if (totalItems === 0) {
    return (
      <section className="bg-white/90 backdrop-blur-md border border-neutral-200/80 rounded-3xl p-6 md:p-8 shadow-sm text-center">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
          🛒
        </div>
        <h2 className="text-lg font-bold text-neutral-900 mb-1">Your Shopping List is Empty</h2>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5">
          Tap the microphone below and speak naturally to add items!
        </p>

        <div className="bg-surface-container-low/70 rounded-2xl p-4 max-w-sm mx-auto border border-neutral-100 text-left">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Try saying:
          </p>
          <ul className="space-y-1.5 text-xs text-neutral-700 font-medium">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              &ldquo;Add 2 bottles of milk&rdquo;
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              &ldquo;I need 5 apples and bread&rdquo;
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              &ldquo;Find toothpaste under $5&rdquo;
            </li>
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white/90 backdrop-blur-md border border-neutral-200/80 rounded-3xl p-5 md:p-7 shadow-sm">
      {/* Header with Title + Progress Bar + Clear All Button */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b border-neutral-100">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2.5 mb-2">
            <h2 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
              Current List
            </h2>
            {isAllComplete && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 animate-fade-in-down">
                <CheckCheck className="w-3.5 h-3.5" />
                All Bought!
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5">
            <div className="flex-1 max-w-xs bg-surface-container-low rounded-full h-2 overflow-hidden shadow-inner">
              <div
                className="bg-primary-container h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-on-surface-variant font-medium">
              {completedItems} / {totalItems} bought ({remainingItems} remaining)
            </p>
          </div>
        </div>

        {/* Clear All button */}
        <button
          onClick={clearList}
          aria-label="Clear List"
          className="text-on-surface-variant hover:text-error hover:bg-error-container/50 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 border border-neutral-200/80 shadow-2xs active:scale-95 flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5 text-neutral-400 group-hover:text-error" />
          <span className="text-xs font-semibold hidden sm:inline">Clear All</span>
        </button>
      </div>

      {/* Categorized List of Items */}
      <div className="space-y-5">
        {categorized.map(([category, catItems]) => {
          const pill = CATEGORY_PILLS[category] || {
            emoji: '🛒',
            label: category,
            bg: 'bg-neutral-100',
            text: 'text-neutral-700',
            border: 'border-neutral-200',
          };

          return (
            <div key={category} className="space-y-2">
              {/* Category Pill Header */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <span
                  className={`px-3 py-0.5 rounded-full ${pill.bg} ${pill.text} text-xs font-semibold flex items-center gap-1.5 border ${pill.border}`}
                >
                  <span>{pill.emoji}</span> {pill.label}
                </span>
                <span className="text-[11px] font-medium text-neutral-400">
                  ({catItems.length})
                </span>
              </div>

              {/* Items in this category */}
              <div className="space-y-1.5">
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
