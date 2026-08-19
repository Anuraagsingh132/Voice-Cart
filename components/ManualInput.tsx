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
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="glass-input relative flex items-center rounded-full p-1.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-vc-cyan/50 focus-within:border-vc-cyan">
        <div className="pl-4 pr-2 text-vc-text-muted">
          <Keyboard className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type an item to add, search, or modify..."
          disabled={isProcessing}
          className="w-full bg-transparent text-sm text-vc-text placeholder:text-vc-text-muted focus:outline-none disabled:opacity-50 py-2.5 font-medium"
        />

        <button
          type="submit"
          disabled={!hasText || isProcessing}
          aria-label="Submit command"
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 flex-shrink-0 active:scale-95 focus-ring ${
            hasText && !isProcessing
              ? 'bg-vc-emerald shadow-glow-emerald text-vc-bg hover:scale-105 cursor-pointer'
              : 'btn-glass opacity-50 cursor-not-allowed scale-95'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin text-vc-text-muted" />
          ) : (
            <Send className={`w-4 h-4 ${hasText && !isProcessing ? 'text-white' : 'text-vc-text-muted'}`} />
          )}
        </button>
      </div>
    </form>
  );
}
