'use client';

import React from 'react';
import { ShoppingBag, HelpCircle } from 'lucide-react';
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
    <header className="w-full max-w-3xl mx-auto flex items-center justify-between py-4 px-2 mb-2">
      {/* Brand logo & title */}
      <div className="flex items-center space-x-2.5">
        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-tight text-neutral-900 leading-tight">
            Voice Cart
          </h1>
          <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            Shopping Assistant
          </p>
        </div>
      </div>

      {/* Right controls: Language Selector + Help Button */}
      <div className="flex items-center space-x-2">
        <LanguageSelector
          currentLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
        />

        <button
          onClick={onOpenGuide}
          aria-label="View Voice Command Guide"
          className="flex items-center space-x-1 p-2 rounded-xl bg-white/90 border border-neutral-200/80 text-neutral-600 hover:text-emerald-700 hover:border-emerald-300 shadow-xs transition"
          title="Voice Commands Guide"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-semibold">Guide</span>
        </button>
      </div>
    </header>
  );
}
