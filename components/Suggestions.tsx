'use client';

import React from 'react';
import { Sun, ArrowLeftRight, History, Plus, Check } from 'lucide-react';
import { useShoppingList } from '@/context/ShoppingListContext';
import { Suggestion } from '@/types';

export function Suggestions() {
  const { suggestions, acceptSuggestion, items } = useShoppingList();

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const isAlreadyInList = (suggestionItem: string) => {
    return items.some(
      (i) => i.name.toLowerCase().includes(suggestionItem.toLowerCase()) ||
             suggestionItem.toLowerCase().includes(i.name.toLowerCase())
    );
  };

  const getBadgeInfo = (type: Suggestion['type']) => {
    switch (type) {
      case 'seasonal':
        return {
          icon: Sun,
          label: 'Peak Season',
          color: 'text-orange-600',
        };
      case 'substitute':
        return {
          icon: ArrowLeftRight,
          label: 'Healthy Swap',
          color: 'text-blue-600',
        };
      case 'history':
      default:
        return {
          icon: History,
          label: 'Usually Bought',
          color: 'text-purple-600',
        };
    }
  };

  return (
    <section className="w-full my-6">
      <div className="flex justify-between items-end mb-3">
        <h2 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
          Smart Suggestions
        </h2>
        <span className="text-xs text-neutral-400 font-medium hidden sm:inline">
          GroceryStoreDataset Picks
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto hide-scroll pb-2 carousel-container px-1 -mx-1">
        {suggestions.map((s) => {
          const badge = getBadgeInfo(s.type);
          const BadgeIcon = badge.icon;
          const onList = isAlreadyInList(s.item);
          const imgSrc = s.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';

          return (
            <div
              key={s.id}
              className="w-56 md:w-64 flex-shrink-0 snap-start bg-white/90 backdrop-blur-md border border-neutral-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Badge */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <BadgeIcon className={`w-3.5 h-3.5 ${badge.color}`} />
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-neutral-900 mb-2 truncate" title={s.item}>
                  {s.item}
                </h3>

                {/* Visual Image Preview with authentic iconic photograph */}
                <div className="h-28 w-full rounded-xl mb-3 bg-surface-container-low overflow-hidden relative shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc}
                    alt={s.item}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>

                {/* Description / Rationale */}
                <p className="text-[11px] text-neutral-500 mb-3 line-clamp-2 leading-relaxed" title={s.description || s.reason}>
                  {s.description || s.reason}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => acceptSuggestion(s)}
                disabled={onList}
                className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                  onList
                    ? 'bg-primary-container text-white cursor-default'
                    : 'bg-surface-container-low text-primary hover:bg-primary-container hover:text-white'
                }`}
              >
                {onList ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to List</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
        {/* Spacer for peek effect */}
        <div className="w-2 flex-shrink-0" />
      </div>
    </section>
  );
}
