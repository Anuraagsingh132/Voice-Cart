'use client';

import React, { useState } from 'react';
import { Send, Keyboard, Loader2 } from 'lucide-react';

interface ManualInputProps {
  onProcessText: (text: string) => void;
  isProcessing: boolean;
}

export function ManualInput({ onProcessText, isProcessing }: ManualInputProps) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    onProcessText(inputText.trim());
    setInputText('');
  };

  const hasText = inputText.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-full shadow-md border border-neutral-200/90 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all p-1.5">
        <div className="pl-3.5 pr-2 text-neutral-400">
          <Keyboard className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Or type an item to add, search, or modify..."
          disabled={isProcessing}
          className="w-full bg-transparent text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none disabled:opacity-50 py-1.5 font-medium"
        />

        <button
          type="submit"
          disabled={!hasText || isProcessing}
          aria-label="Submit command"
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 flex-shrink-0 active:scale-95 ${
            hasText && !isProcessing
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs scale-100 cursor-pointer'
              : 'text-neutral-300 bg-transparent cursor-not-allowed scale-95'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </form>
  );
}
