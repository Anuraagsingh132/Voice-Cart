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

export function ListItem({
  item,
  onToggleCheck,
  onDelete,
  onModifyQty,
}: ListItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-2xl group transition-all ${
        item.checked
          ? 'opacity-60 bg-neutral-50/60 border border-neutral-200/50'
          : 'bg-white hover:bg-neutral-50/80 border border-neutral-200/80 shadow-2xs hover:shadow-xs'
      }`}
    >
      {/* Left side: Checkbox + Name + Quantity subtitle */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-2">
        <button
          onClick={() => onToggleCheck(item.id)}
          aria-label={item.checked ? `Unmark ${item.name}` : `Mark ${item.name} as purchased`}
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all duration-200 group-hover:scale-105 active:scale-90 flex-shrink-0 ${
            item.checked
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
              : 'border-neutral-300 hover:border-emerald-500 bg-white'
          }`}
        >
          {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold truncate transition-all ${
              item.checked
                ? 'line-through text-neutral-400'
                : 'text-neutral-900 font-medium'
            }`}
          >
            {item.name}
            <span className="text-xs font-normal text-neutral-500 ml-1.5">
              • {item.quantity} {item.unit && item.unit !== 'pieces' ? item.unit : 'pcs'}
            </span>
          </p>
        </div>
      </div>

      {/* Right side: Quantity Stepper + Delete button */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Quantity Stepper with distinct tappable borders */}
        <div className="flex items-center bg-neutral-50 rounded-lg p-0.5 border border-neutral-200">
          <button
            onClick={() => onModifyQty(item.id, Math.max(1, item.quantity - 1))}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
            className="w-5 h-5 flex items-center justify-center rounded bg-white border border-neutral-200/80 text-neutral-600 hover:text-emerald-700 hover:border-emerald-300 disabled:opacity-30 disabled:hover:text-neutral-600 transition shadow-2xs active:scale-95"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="px-2 text-xs font-bold text-neutral-800 min-w-[1.25rem] text-center select-none">
            {item.quantity}
          </span>
          <button
            onClick={() => onModifyQty(item.id, item.quantity + 1)}
            aria-label="Increase quantity"
            className="w-5 h-5 flex items-center justify-center rounded bg-white border border-neutral-200/80 text-neutral-600 hover:text-emerald-700 hover:border-emerald-300 transition shadow-2xs active:scale-95"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Delete button: Hidden at rest, fades in on row hover */}
        <button
          onClick={() => onDelete(item.id)}
          aria-label={`Delete ${item.name}`}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
