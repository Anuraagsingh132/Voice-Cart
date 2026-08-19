'use client';

import React, { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';

interface ManualInputProps {
  onProcessText: (text: string) => Promise<void> | void;
  isProcessing: boolean;
}

export function ManualInput({ onProcessText, isProcessing }: ManualInputProps) {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isProcessing) return;

    const query = inputVal.trim();
    setInputVal('');
    await onProcessText(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl mx-auto mt-4"
    >
      <div className="relative flex items-center bg-white rounded-2xl border border-neutral-200/90 shadow-sm focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100 transition-all p-1.5">
        <div className="pl-3 text-neutral-400">
          <Sparkles className="w-4 h-4 text-emerald-600" />
        </div>

        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={isProcessing}
          placeholder="Or type a command... (e.g., 'Add 2 bottles of water', 'Find apples under $4')"
          className="w-full px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 bg-transparent focus:outline-none disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!inputVal.trim() || isProcessing}
          aria-label="Submit command"
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-100 disabled:text-neutral-300 text-white transition-all shadow-xs disabled:shadow-none flex-shrink-0"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
      <p className="text-[11px] text-center text-neutral-400 mt-1.5">
        Type natural phrases or tap the microphone above to speak
      </p>
    </form>
  );
}
