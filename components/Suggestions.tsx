'use client';

import React, { useRef } from 'react';
import { Sun, ArrowLeftRight, History, Plus, Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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
      const offset = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const getBadgeInfo = (type: Suggestion['type']) => {
    switch (type) {
      case 'seasonal':
        return {
          icon: Sun,
          label: 'In Season',
          badgeClass: 'badge-amber',
        };
      case 'substitute':
        return {
          icon: ArrowLeftRight,
          label: 'Healthy Swap',
          badgeClass: 'badge-cyan',
        };
      case 'history':
      default:
        return {
          icon: History,
          label: 'Buy Again',
          badgeClass: 'badge-emerald',
        };
    }
  };

  return (
    <section className="w-full relative group/carousel animate-fade-in-up">
      {/* Section Header */}
      <div className="flex justify-between items-end mb-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-vc-text tracking-tight flex items-center gap-2">
            <span>Smart Suggestions</span>
            <span className="badge-cyan text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI
            </span>
          </h2>
          <p className="text-xs text-vc-text-muted mt-0.5">
            Based on your list, seasonal produce, and purchase history
          </p>
        </div>

        {/* Carousel Arrows */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll suggestions left"
            className="btn-glass w-8 h-8 !p-0 flex items-center justify-center !rounded-full focus-ring"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll suggestions right"
            className="btn-glass w-8 h-8 !p-0 flex items-center justify-center !rounded-full focus-ring"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Snap Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto hide-scroll pb-2 snap-x snap-mandatory px-0.5 -mx-0.5"
      >
        {suggestions.map((s) => {
          const badge = getBadgeInfo(s.type);
          const BadgeIcon = badge.icon;
          const onList = isAlreadyInList(s.item);
          const imgSrc = s.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';

          return (
            <div
              key={s.id}
              className="w-60 sm:w-64 md:w-72 flex-shrink-0 snap-start glass-card glass-card-hover rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div>
                {/* Badge + Price */}
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badge.badgeClass}`}>
                    <BadgeIcon className="w-3 h-3" />
                    {badge.label}
                  </span>
                  {s.price && (
                    <span className="text-xs font-bold text-vc-text">
                      ${s.price}
                    </span>
                  )}
                </div>

                {/* Product Title */}
                <h3 className="text-sm font-bold text-vc-text mb-2 truncate" title={s.item}>
                  {s.item}
                </h3>

                {/* Image */}
                <div className="h-24 w-full rounded-lg mb-2.5 bg-white/[0.03] border border-vc-border-subtle flex items-center justify-center p-2 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc}
                    alt={s.item}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Rationale */}
                <div className="rounded-lg p-2.5 mb-3 border border-vc-border-subtle bg-white/[0.02]">
                  <p className="text-[11px] font-medium text-vc-text-secondary leading-snug">
                    💡 {s.reason}
                  </p>
                  {s.description && (
                    <p className="text-[10px] text-vc-text-muted mt-1 line-clamp-1">
                      {s.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={() => acceptSuggestion(s)}
                disabled={onList}
                className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer focus-ring ${
                  onList
                    ? 'badge-emerald cursor-default'
                    : 'btn-primary'
                }`}
              >
                {onList ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Added to List</span>
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
        <div className="w-4 flex-shrink-0" />
      </div>
    </section>
  );
}
