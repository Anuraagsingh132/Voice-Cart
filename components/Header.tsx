'use client';

import React from 'react';
import { HelpCircle, Mic, MicOff, Loader2, Check, LayoutGrid, ShoppingCart, Terminal } from 'lucide-react';
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
    <header className="fixed top-0 left-0 right-0 w-full z-50 glass border-b border-vc-border shadow-glass-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3">
        {/* Brand logo & title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-vc-surface-elevated border border-vc-border-subtle flex items-center justify-center shadow-glass-sm">
            <ShoppingCart className="w-5 h-5 text-vc-cyan" />
          </div>
          <span className="font-bold text-xl md:text-2xl text-gradient-cyan tracking-tight hidden sm:block">
            Voice Cart
          </span>
        </div>

        {/* Center/Right: Live Voice Status Pill + Language Selector + Help Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Background Listening Status Indicator */}
          <button
            onClick={onToggleVoice}
            title={voiceState === 'listening' ? 'Background voice listening active (Click to mute)' : 'Click to activate voice listening'}
            className="flex items-center justify-center gap-1.5 h-11 px-3 sm:px-4 rounded-full text-xs font-semibold transition-all border border-vc-border bg-vc-surface shadow-glass hover:bg-vc-surface-elevated focus-ring active:scale-95 cursor-pointer"
          >
            {voiceState === 'listening' ? (
              <div className="flex items-center gap-2 text-vc-cyan">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-pulse-soft absolute inline-flex h-full w-full rounded-full bg-vc-cyan opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-vc-cyan" />
                </span>
                <Mic className="w-4 h-4 text-vc-cyan" />
                <span className="hidden sm:inline">Listening</span>
              </div>
            ) : voiceState === 'processing' ? (
              <div className="flex items-center gap-2 text-vc-warning">
                <Loader2 className="w-4 h-4 animate-spin text-vc-warning" />
                <span className="hidden sm:inline">Processing</span>
              </div>
            ) : voiceState === 'success' ? (
              <div className="flex items-center gap-2 text-vc-success">
                <Check className="w-4 h-4 text-vc-success" />
                <span className="hidden sm:inline">Updated</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-vc-text-muted">
                <MicOff className="w-4 h-4 text-vc-text-muted" />
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
            className={`btn-glass h-11 px-3 sm:px-4 flex items-center justify-center gap-1.5 cursor-pointer ${
              searchState.isActive && searchState.query === 'All Items'
                ? 'border-vc-emerald bg-vc-emerald-muted text-vc-emerald shadow-glow-emerald'
                : 'text-vc-text-secondary hover:text-vc-emerald'
            }`}
            title="Browse All Store Items & Products"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-bold">ALL</span>
          </button>

          {/* Diagnostics & Event Log Button */}
          {onOpenDiagnostics && (
            <button
              onClick={onOpenDiagnostics}
              aria-label="System Diagnostics & Event Log"
              className="btn-glass h-11 w-11 sm:w-auto sm:px-3 flex items-center justify-center cursor-pointer text-vc-text-secondary hover:text-vc-violet transition-colors"
              title="System Diagnostics & Event Log"
            >
              <Terminal className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline text-xs font-mono font-bold">
                LOGS
              </span>
            </button>
          )}

          {/* Quiet Help Button */}
          <button
            onClick={onOpenGuide}
            aria-label="Help & Voice Command Guide"
            className="btn-glass h-11 w-11 flex items-center justify-center cursor-pointer text-vc-text-secondary hover:text-vc-cyan transition-colors"
            title="Voice Commands Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
