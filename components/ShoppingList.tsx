'use client';

import React, { useMemo } from 'react';
import confetti from 'canvas-confetti';
import { ShoppingBag, Sparkles, CheckCheck, Trash2 } from 'lucide-react';
import { useShoppingList } from '@/context/ShoppingListContext';
import { ListItem } from './ListItem';

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
  const isAllComplete = totalItems > 0 && completedItems === totalItems;

  const handleToggleCheck = (id: string) => {
    toggleCheckItem(id);
    // Trigger confetti if this marks the last item as completed!
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
      <div className="w-full bg-white/80 backdrop-blur-md rounded-3xl border border-neutral-200/80 p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 mb-1">Your Shopping List is Empty</h3>
        <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6">
          Tap the microphone above and say what you need!
        </p>

        <div className="bg-neutral-50 rounded-2xl p-4 max-w-sm mx-auto border border-neutral-100 text-left">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Try saying:
          </p>
          <ul className="space-y-1.5 text-xs font-medium text-neutral-700">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              &ldquo;Add 2 bottles of whole milk&rdquo;
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              &ldquo;I need 5 apples and bread&rdquo;
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              &ldquo;Find toothpaste under $5&rdquo;
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl border border-neutral-200/80 p-5 md:p-6 shadow-sm">
      {/* Header bar: Progress + Count + Clear button */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <span>Shopping List</span>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {completedItems} of {totalItems} items completed
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isAllComplete && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 animate-bounce-subtle">
              <CheckCheck className="w-3.5 h-3.5" />
              All Bought!
            </span>
          )}
          <button
            onClick={clearList}
            className="flex items-center space-x-1 text-xs font-medium text-neutral-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl border border-neutral-200/60 transition"
            title="Clear all items from list"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear List</span>
          </button>
        </div>
      </div>

      {/* Categorized List of Items */}
      <div className="space-y-6">
        {categorized.map(([category, catItems]) => (
          <div key={category} className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                {category}
              </h3>
              <span className="text-[11px] font-semibold text-neutral-400">
                {catItems.length}
              </span>
            </div>

            <div className="space-y-2">
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
        ))}
      </div>
    </div>
  );
}
