'use client';

import React from 'react';
import { Sparkles, Plus, X, ArrowRight } from 'lucide-react';
import { useShoppingList } from '@/context/ShoppingListContext';
import { Suggestion } from '@/types';

export function Suggestions() {
  const { suggestions, acceptSuggestion, dismissSuggestion } = useShoppingList();

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const getTypeIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'substitute':
        return '🔄';
      case 'seasonal':
        return '🌿';
      case 'history':
        return '⭐';
      default:
        return '💡';
    }
  };

  const getBadgeStyle = (type: Suggestion['type']) => {
    switch (type) {
      case 'substitute':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'seasonal':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'history':
        return 'bg-sky-100 text-sky-900 border-sky-200';
      default:
        return 'bg-purple-100 text-purple-900 border-purple-200';
    }
  };

  return (
    <div className="w-full my-4">
      <div className="flex items-center justify-between px-1 mb-2.5">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            Smart Suggestions & Substitutes
          </h3>
        </div>
        <span className="text-[11px] font-medium text-neutral-400">
          Opt-in recommendations
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {suggestions.map((s) => (
          <div
            key={s.id}
            className="group relative flex flex-col justify-between p-3 bg-white/95 rounded-2xl border border-neutral-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200"
          >
            {/* Top row: Type badge + Dismiss button */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeStyle(
                  s.type
                )}`}
              >
                <span>{getTypeIcon(s.type)}</span>
                <span>{s.type}</span>
              </span>

              <button
                onClick={() => dismissSuggestion(s.id)}
                aria-label="Dismiss suggestion"
                className="text-neutral-300 hover:text-neutral-500 p-0.5 rounded-md hover:bg-neutral-100 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Item Title + Reason */}
            <div className="mb-2.5">
              <p className="text-sm font-bold text-neutral-900 leading-snug">
                {s.item}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                {s.reason}
              </p>
            </div>

            {/* Action Row: Category Tag + Add Button */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <span className="text-[10px] font-medium text-neutral-400">
                {s.category}
              </span>

              <button
                onClick={() => acceptSuggestion(s)}
                className="flex items-center space-x-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-2.5 py-1 rounded-xl border border-emerald-200 hover:border-transparent transition-all shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to list</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
