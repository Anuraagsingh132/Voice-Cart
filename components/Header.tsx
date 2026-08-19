'use client';

import React from 'react';
import { HelpCircle, Mic, MicOff, Loader2, Check, LayoutGrid } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { useShoppingList } from '@/context/ShoppingListContext';
import { SupportedLanguage, VoiceState } from '@/types';

interface HeaderProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onOpenGuide: () => void;
  onOpenDiagnostics?: () => void;
  voiceState?: VoiceState;
  onToggleVoice?: () => void;
}

export function Header({
  currentLanguage,
  onLanguageChange,
  onOpenGuide,
  onOpenDiagnostics,
  voiceState = 'listening',
  onToggleVoice,
}: HeaderProps) {
  const { showAllProducts, searchState } = useShoppingList();

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 backdrop-blur-md border-b border-neutral-200/80 shadow-xs bg-white/95 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3">
        {/* Brand logo & title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <span className="text-base font-bold">🛒</span>
          </div>
          <span className="font-bold text-xl md:text-2xl text-emerald-700 tracking-tight">
            Voice Cart
          </span>
        </div>

        {/* Center/Right: Live Voice Status Pill + Language Selector + Help Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Background Listening Status Indicator */}
          <button
            onClick={onToggleVoice}
            title={voiceState === 'listening' ? 'Background voice listening active (Click to mute)' : 'Click to activate voice listening'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border shadow-2xs active:scale-95 cursor-pointer"
          >
            {voiceState === 'listening' ? (
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <Mic className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Listening</span>
              </div>
            ) : voiceState === 'processing' ? (
              <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border-amber-200">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                <span className="hidden sm:inline">Processing</span>
              </div>
            ) : voiceState === 'success' ? (
              <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-100 border-emerald-300">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Updated</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-neutral-500 bg-neutral-100 border-neutral-200">
                <MicOff className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">Muted</span>
              </div>
            )}
          </button>

          {/* Language Selector */}
          <LanguageSelector
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
          />

          {/* ALL Items Catalog Button */}
          <button
            onClick={showAllProducts}
            aria-label="Browse All Catalog Items"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border shadow-2xs active:scale-95 cursor-pointer ${
              searchState.isActive && searchState.query === 'All Items'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200 ring-2 ring-emerald-400/50'
                : 'bg-neutral-100 hover:bg-emerald-50 text-neutral-700 hover:text-emerald-700 border-neutral-200/80 hover:border-emerald-200'
            }`}
            title="Browse All Store Items & Products"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>ALL</span>
          </button>

          {/* Diagnostics & Event Log Button */}
          {onOpenDiagnostics && (
            <button
              onClick={onOpenDiagnostics}
              aria-label="System Diagnostics & Event Log"
              className="flex items-center justify-center w-8 h-8 rounded-xl text-neutral-400 hover:text-emerald-700 hover:bg-neutral-100 transition-colors active:scale-95"
              title="System Diagnostics & Event Log"
            >
              <span className="text-xs font-mono font-bold px-1 py-0.5 rounded-md bg-neutral-100 text-neutral-600 hover:bg-emerald-100 hover:text-emerald-800">
                LOGS
              </span>
            </button>
          )}


          {/* Quiet Help Button */}
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

