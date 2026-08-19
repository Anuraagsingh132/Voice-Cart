'use client';

import React from 'react';
import { Trash2, Plus, Minus, Check } from 'lucide-react';
import { ListItem as ListItemType } from '@/types';

interface ListItemProps {
  item: ListItemType;
  onToggleCheck: (id: string) => void;
  onDelete: (id: string) => void;
  onModifyQty: (id: string, newQty: number) => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  'Fruits & Vegetables': '🍎',
  'Dairy & Eggs': '🥛',
  'Bakery & Snacks': '🍞',
  'Beverages': '🧃',
  'Pantry & Staples': '🍚',
  'Personal Care': '🧴',
  'Household & Cleaning': '🧹',
};

export function ListItem({
  item,
  onToggleCheck,
  onDelete,
  onModifyQty,
}: ListItemProps) {
  const emoji = CATEGORY_EMOJI[item.category] || '🛒';

  return (
    <div
      className={`group relative flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
        item.checked
          ? 'bg-neutral-50/80 border-neutral-200/60 opacity-60'
          : 'bg-white border-neutral-200/80 shadow-sm hover:shadow-md hover:border-emerald-200'
      }`}
    >
      {/* Left side: Checkbox + Emoji + Name + Category */}
      <div className="flex items-center space-x-3 min-w-0 flex-1 mr-2">
        <button
          onClick={() => onToggleCheck(item.id)}
          aria-label={item.checked ? `Unmark ${item.name}` : `Mark ${item.name} as purchased`}
          className={`flex items-center justify-center w-6 h-6 rounded-lg border transition-all ${
            item.checked
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
              : 'border-neutral-300 hover:border-emerald-500 bg-neutral-50'
          }`}
        >
          {item.checked && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        <span className="text-xl flex-shrink-0 select-none">{emoji}</span>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold truncate transition-all ${
              item.checked
                ? 'line-through text-neutral-400'
                : 'text-neutral-900'
            }`}
          >
            {item.name}
          </p>
          <div className="flex items-center space-x-2 mt-0.5">
            <span className="text-[11px] font-medium text-neutral-500 bg-neutral-100/80 px-2 py-0.5 rounded-md">
              {item.category}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Quantity Controls + Delete Button */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        {/* Quantity pill with inline +/- */}
        <div className="flex items-center bg-neutral-100/80 rounded-xl p-0.5 border border-neutral-200/60">
          <button
            onClick={() => onModifyQty(item.id, Math.max(1, item.quantity - 1))}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
            className="w-6 h-6 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-white hover:text-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
          >
            <Minus className="w-3 h-3" />
          </button>

          <span className="px-2 text-xs font-bold text-neutral-800 min-w-[3rem] text-center">
            {item.quantity} {item.unit && item.unit !== 'pieces' ? item.unit : ''}
          </span>

          <button
            onClick={() => onModifyQty(item.id, item.quantity + 1)}
            aria-label="Increase quantity"
            className="w-6 h-6 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-white hover:text-neutral-800 transition"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(item.id)}
          aria-label={`Delete ${item.name}`}
          className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
