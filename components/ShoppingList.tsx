'use client';

import React, { useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trash2, Sparkles, CheckCheck } from 'lucide-react';
import { useShoppingList } from '@/context/ShoppingListContext';
import { ListItem } from './ListItem';

const CATEGORY_PILLS: Record<string, { emoji: string; label: string; style: string }> = {
  'Fruits & Vegetables': { emoji: '🍎', label: 'Fruits & Vegetables', style: 'bg-lime-100 text-lime-700' },
  'Dairy & Eggs': { emoji: '🥛', label: 'Dairy & Eggs', style: 'bg-sky-100 text-sky-700' },
  'Bakery & Snacks': { emoji: '🍞', label: 'Bakery & Snacks', style: 'bg-amber-100 text-amber-700' },
  'Beverages': { emoji: '🧃', label: 'Beverages', style: 'bg-cyan-100 text-cyan-700' },
  'Pantry & Staples': { emoji: '🍚', label: 'Pantry & Staples', style: 'bg-orange-100 text-orange-700' },
  'Personal Care': { emoji: '🧴', label: 'Personal Care', style: 'bg-pink-100 text-pink-700' },
  'Household & Cleaning': { emoji: '🧹', label: 'Household & Cleaning', style: 'bg-violet-100 text-violet-700' },
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
      <section className="bg-white border border-neutral-200/80 rounded-3xl p-6 md:p-8 shadow-xs text-center">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
          🛒
        </div>
        <h2 className="text-lg font-bold text-neutral-900 mb-1">Your Shopping List is Empty</h2>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5">
          The microphone is always active. Speak naturally to add items anytime!
        </p>

        <div className="bg-neutral-50 rounded-2xl p-4 max-w-sm mx-auto border border-neutral-100 text-left">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Try saying:
          </p>
          <ul className="space-y-1.5 text-xs text-neutral-700 font-medium">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              &ldquo;Add 2 bottles of milk and bread&rdquo;
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              &ldquo;5 apples and 2 oranges&rdquo;
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              &ldquo;Find juice under $5&rdquo;
            </li>
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-neutral-200/80 rounded-3xl p-5 md:p-7 shadow-xs">
      {/* Header with Title + High Contrast Progress Bar + Clear All Button */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b border-neutral-100">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2.5 mb-2">
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">
              Current List
            </h2>
            {isAllComplete && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full animate-fade-in-down">
                <CheckCheck className="w-3.5 h-3.5" />
                All Bought!
              </span>
            )}
          </div>

          {/* High Contrast Progress Bar (Neutral-200 Track + Emerald-500 Fill) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5">
            <div className="flex-1 max-w-xs bg-neutral-200 rounded-full h-2 overflow-hidden shadow-inner">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              {completedItems} / {totalItems} bought ({remainingItems} remaining)
            </p>
          </div>
        </div>

        {/* Clear All button */}
        <button
          onClick={clearList}
          aria-label="Clear List"
          className="text-neutral-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 border border-neutral-200 shadow-2xs active:scale-95 flex-shrink-0 text-xs font-semibold"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear All</span>
        </button>
      </div>

      {/* Categorized List of Items */}
      <div className="space-y-5">
        {categorized.map(([category, catItems]) => {
          const pill = CATEGORY_PILLS[category] || {
            emoji: '🛒',
            label: category,
            style: 'bg-neutral-100 text-neutral-700',
          };

          return (
            <div key={category} className="space-y-2">
              {/* Category Pill with Consistent Quiet Pastel Hue */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <span
                  className={`px-3 py-0.5 rounded-full ${pill.style} text-xs font-semibold flex items-center gap-1.5`}
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
