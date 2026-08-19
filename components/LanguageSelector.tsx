'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { SupportedLanguage, LanguageOption } from '@/types';

const LANGUAGES: LanguageOption[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { code: 'en-IN', name: 'English (India)', nativeName: 'Indian English', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
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
      <div className="flex items-center space-x-1.5 bg-white/90 backdrop-blur-sm border border-neutral-200/80 rounded-xl px-2.5 py-1.5 shadow-sm text-xs font-medium text-neutral-700 hover:border-neutral-300 transition">
        <Globe className="w-3.5 h-3.5 text-neutral-500" />
        <span className="text-sm">{selectedLang.flag}</span>
        <select
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          className="bg-transparent text-neutral-800 font-medium cursor-pointer focus:outline-none pr-1"
          aria-label="Select voice recognition language"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="text-neutral-800">
              {lang.flag} {lang.name} ({lang.nativeName})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
