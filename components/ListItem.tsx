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
          : 'bg-white/80 hover:bg-surface-container-low/60 border border-neutral-200/80 shadow-2xs hover:shadow-xs'
      }`}
    >
      {/* Left side: Checkbox + Name + Quantity string */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-2">
        <button
          onClick={() => onToggleCheck(item.id)}
          aria-label={item.checked ? `Unmark ${item.name}` : `Mark ${item.name} as purchased`}
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-transform group-hover:scale-105 shadow-2xs flex-shrink-0 ${
            item.checked
              ? 'border-primary bg-primary text-white'
              : 'border-neutral-300 hover:border-primary bg-white'
          }`}
        >
          {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold truncate transition-all ${
              item.checked
                ? 'line-through text-on-surface-variant'
                : 'text-on-surface font-medium'
            }`}
          >
            {item.name}
            <span className="text-xs font-normal text-neutral-500 ml-1.5">
              • {item.quantity} {item.unit && item.unit !== 'pieces' ? item.unit : 'pcs'}
            </span>
          </p>
        </div>
      </div>

      {/* Right side: Quick Quantity adjustment + Delete button */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="flex items-center bg-neutral-100/80 rounded-lg p-0.5 border border-neutral-200/60">
          <button
            onClick={() => onModifyQty(item.id, Math.max(1, item.quantity - 1))}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
            className="w-5 h-5 flex items-center justify-center rounded text-neutral-500 hover:bg-white hover:text-neutral-800 disabled:opacity-30 transition"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="px-1.5 text-xs font-bold text-neutral-800 min-w-[1.2rem] text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onModifyQty(item.id, item.quantity + 1)}
            aria-label="Increase quantity"
            className="w-5 h-5 flex items-center justify-center rounded text-neutral-500 hover:bg-white hover:text-neutral-800 transition"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <button
          onClick={() => onDelete(item.id)}
          aria-label={`Delete ${item.name}`}
          className="p-1 rounded-lg text-neutral-300 hover:text-rose-600 hover:bg-rose-50 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
