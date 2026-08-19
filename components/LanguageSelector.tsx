'use client';

import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { SupportedLanguage, LanguageOption } from '@/types';

const LANGUAGES: LanguageOption[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { code: 'en-IN', name: 'English (IN)', nativeName: 'Indian English', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'Hindi (हिन्दी)', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
];

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export function LanguageSelector({
  currentLanguage,
  onLanguageChange,
}: LanguageSelectorProps) {
  const selectedLang = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  return (
    <div className="relative inline-flex items-center">
      <div className="btn-glass h-11 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 focus-within:ring-2 focus-within:ring-vc-cyan/50 transition-all cursor-pointer relative overflow-hidden">
        <Globe className="w-4 h-4 text-vc-text-muted flex-shrink-0" />
        <span className="text-sm flex-shrink-0">{selectedLang.flag}</span>
        
        {/* Visible compact code */}
        <span className="text-xs font-semibold text-vc-text pointer-events-none">
          {selectedLang.code.split('-')[0].toUpperCase()}
        </span>
        
        <select
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Select voice recognition language"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-vc-bg text-vc-text">
              {lang.name}
            </option>
          ))}
        </select>
        
        <ChevronDown className="w-3 h-3 text-vc-text-muted pointer-events-none hidden sm:block" />
      </div>
    </div>
  );
}
