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
      <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-3 py-1.5 shadow-2xs text-xs font-semibold text-neutral-800 hover:border-neutral-300 transition focus-within:ring-2 focus-within:ring-emerald-500/20">
        <Globe className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
        <span className="text-sm flex-shrink-0">{selectedLang.flag}</span>
        
        <select
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          className="bg-transparent text-neutral-800 font-semibold cursor-pointer focus:outline-none appearance-none pr-4 text-xs"
          aria-label="Select voice recognition language"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="text-neutral-800">
              {lang.name}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-neutral-400 pointer-events-none -ml-3" />
      </div>
    </div>
  );
}
