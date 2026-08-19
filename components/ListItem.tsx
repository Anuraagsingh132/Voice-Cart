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
      className={`flex items-center justify-between p-3 sm:p-3.5 rounded-xl group transition-all duration-200 ${
        item.checked
          ? 'opacity-50 bg-white/[0.02] border border-vc-border-subtle'
          : 'glass-card glass-card-hover'
      }`}
    >
      {/* Left: Checkbox + Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
        <button
          onClick={() => onToggleCheck(item.id)}
          aria-label={item.checked ? `Unmark ${item.name}` : `Mark ${item.name} as purchased`}
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-90 flex-shrink-0 focus-ring ${
            item.checked
              ? 'border-vc-emerald bg-vc-emerald text-white shadow-sm'
              : 'border-vc-border hover:border-vc-cyan bg-transparent'
          }`}
        >
          {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium truncate transition-all ${
              item.checked
                ? 'line-through text-vc-text-muted'
                : 'text-vc-text'
            }`}
          >
            {item.name}
          </p>
          <p className="text-xs text-vc-text-muted mt-0.5">
            {item.quantity} {item.unit && item.unit !== 'pieces' ? item.unit : 'pcs'}
            {item.brand && <span className="ml-1.5">• {item.brand}</span>}
          </p>
        </div>
      </div>

      {/* Right: Quantity Stepper + Delete */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Quantity Stepper */}
        <div className="flex items-center rounded-lg border border-vc-border bg-white/[0.03]">
          <button
            onClick={() => onModifyQty(item.id, Math.max(1, item.quantity - 1))}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
            className="w-7 h-7 flex items-center justify-center text-vc-text-secondary hover:text-vc-cyan disabled:opacity-25 disabled:hover:text-vc-text-secondary transition active:scale-90 focus-ring"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="px-2 text-xs font-bold text-vc-text min-w-[1.25rem] text-center select-none tabular-nums">
            {item.quantity}
          </span>
          <button
            onClick={() => onModifyQty(item.id, item.quantity + 1)}
            aria-label="Increase quantity"
            className="w-7 h-7 flex items-center justify-center text-vc-text-secondary hover:text-vc-cyan transition active:scale-90 focus-ring"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(item.id)}
          aria-label={`Delete ${item.name}`}
          className="p-2 rounded-lg text-vc-text-muted hover:text-vc-error hover:bg-vc-error/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90 focus-ring sm:p-1.5"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
