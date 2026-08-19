'use client';

import React, { useState } from 'react';
import { Send, Keyboard, Loader2 } from 'lucide-react';

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
      className="w-full max-w-2xl mx-auto"
    >
      <div className="w-full bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-full flex items-center px-4 md:px-5 py-2 md:py-2.5 shadow-sm hover:shadow-md transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <Keyboard className="w-5 h-5 text-neutral-400 mr-2.5 flex-shrink-0" />

        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={isProcessing}
          placeholder="Or type an item to add, search, or modify..."
          className="w-full bg-transparent border-none focus:outline-none text-on-surface text-xs md:text-sm placeholder-neutral-400 p-0"
        />

        <button
          type="submit"
          disabled={!inputVal.trim() || isProcessing}
          aria-label="Submit command"
          className="text-white bg-primary hover:bg-primary-container disabled:bg-neutral-200 disabled:text-neutral-400 p-2 rounded-full transition-all ml-2 flex-shrink-0 active:scale-95 shadow-2xs"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
  );
}
