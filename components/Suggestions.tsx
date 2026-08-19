'use client';

import React, { useRef } from 'react';
import { Sun, ArrowLeftRight, History, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useShoppingList } from '@/context/ShoppingListContext';
import { Suggestion } from '@/types';

export function Suggestions() {
  const { suggestions, acceptSuggestion, items } = useShoppingList();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const isAlreadyInList = (suggestionItem: string) => {
    return items.some(
      (i) => i.name.toLowerCase().includes(suggestionItem.toLowerCase()) ||
             suggestionItem.toLowerCase().includes(i.name.toLowerCase())
    );
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const getBadgeInfo = (type: Suggestion['type']) => {
    switch (type) {
      case 'seasonal':
        return {
          icon: Sun,
          label: 'Peak Season',
          color: 'text-amber-700',
          bg: 'bg-amber-100',
        };
      case 'substitute':
        return {
          icon: ArrowLeftRight,
          label: 'Healthy Swap',
          color: 'text-sky-700',
          bg: 'bg-sky-100',
        };
      case 'history':
      default:
        return {
          icon: History,
          label: 'Usually Bought',
          color: 'text-emerald-700',
          bg: 'bg-emerald-100',
        };
    }
  };

  return (
    <section className="w-full relative group/carousel">
      {/* Section Header */}
      <div className="flex justify-between items-end mb-3">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-neutral-900 tracking-tight">
            Smart Suggestions
          </h2>
          <p className="text-xs text-neutral-400 font-medium">
            Based on your list and seasonal picks
          </p>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll suggestions left"
            className="w-7 h-7 rounded-full bg-white border border-neutral-200 shadow-xs flex items-center justify-center text-neutral-600 hover:text-emerald-700 hover:border-emerald-300 transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll suggestions right"
            className="w-7 h-7 rounded-full bg-white border border-neutral-200 shadow-xs flex items-center justify-center text-neutral-600 hover:text-emerald-700 hover:border-emerald-300 transition-all active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Snap Scroll Container with partial card peek */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto hide-scroll pb-2 snap-x snap-mandatory px-1 -mx-1"
      >
        {suggestions.map((s) => {
          const badge = getBadgeInfo(s.type);
          const BadgeIcon = badge.icon;
          const onList = isAlreadyInList(s.item);
          const imgSrc = s.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';

          return (
            <div
              key={s.id}
              className="w-56 md:w-64 flex-shrink-0 snap-start bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Badge */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badge.bg} ${badge.color}`}>
                    <BadgeIcon className="w-3 h-3" />
                    {badge.label}
                  </span>
                </div>

                {/* Dominant Product Title */}
                <h3 className="text-base font-bold text-neutral-900 mb-2 truncate" title={s.item}>
                  {s.item}
                </h3>

                {/* Optical Centered Image with soft neutral backdrop */}
                <div className="h-28 w-full rounded-xl mb-3 bg-neutral-50 border border-neutral-100 flex items-center justify-center p-2.5 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc}
                    alt={s.item}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-500 mb-3.5 line-clamp-2 leading-relaxed" title={s.description || s.reason}>
                  {s.description || s.reason}
                </p>
              </div>

              {/* Action Button: Consistent Emerald Palette */}
              <button
                onClick={() => acceptSuggestion(s)}
                disabled={onList}
                className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                  onList
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                }`}
              >
                {onList ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
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
        {/* Spacer for intentional peek effect */}
        <div className="w-4 flex-shrink-0" />
      </div>
    </section>
  );
}
