'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { SupportedLanguage } from '@/types';

interface HeaderProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onOpenGuide: () => void;
}

export function Header({
  currentLanguage,
  onLanguageChange,
  onOpenGuide,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 backdrop-blur-md border-b border-neutral-200/80 shadow-xs bg-white/95 transition-all duration-300">
      <div className="max-w-4xl mx-auto flex justify-between items-center px-4 md:px-8 py-3">
        {/* Brand logo & title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <span className="text-base font-bold">🛒</span>
          </div>
          <span className="font-bold text-xl md:text-2xl text-emerald-700 tracking-tight">
            Voice Cart
          </span>
        </div>

        {/* Right controls: Language Selector + Quiet Help Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
          />

          <button
            onClick={onOpenGuide}
            aria-label="Help & Voice Command Guide"
            className="flex items-center justify-center w-8 h-8 rounded-xl text-neutral-400 hover:text-emerald-700 hover:bg-neutral-100 transition-colors active:scale-95"
            title="Voice Commands Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
