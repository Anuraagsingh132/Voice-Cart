'use client';

import React from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
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
    <header className="fixed top-0 left-0 right-0 w-full z-50 backdrop-blur-md border-b border-neutral-200/50 shadow-xs bg-white/90 transition-all duration-300">
      <div className="max-w-4xl mx-auto flex justify-between items-center px-4 md:px-8 py-3.5">
        {/* Brand logo & title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white shadow-sm shadow-primary/20">
            <span className="text-base font-bold">🛒</span>
          </div>
          <span className="font-bold text-xl md:text-2xl text-primary tracking-tight">
            Voice Cart
          </span>
        </div>

        {/* Right controls: Language Selector + Help Button */}
        <div className="flex items-center gap-3">
          <LanguageSelector
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
          />

          <button
            onClick={onOpenGuide}
            aria-label="Help & Voice Command Guide"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-primary hover:bg-primary/10 transition-all active:scale-95"
            title="Voice Commands Guide"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
