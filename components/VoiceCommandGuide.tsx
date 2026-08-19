'use client';

import React from 'react';
import { X, Mic, PlusCircle, MinusCircle, Sliders, Search, Globe, Sparkles, Trash2 } from 'lucide-react';


interface VoiceCommandGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceCommandGuide({ isOpen, onClose }: VoiceCommandGuideProps) {
  if (!isOpen) return null;

  const categories = [
    {
      icon: PlusCircle,
      title: 'Adding Items & Quantities',
      badge: 'badge-emerald',
      examples: [
        '"Add milk"',
        '"I need apples and bread"',
        '"Add 2 bottles of mineral water"',
        '"Buy 5 oranges"',
        '"Put 1 kg brown eggs on my list"',
        '"I want to buy bananas"',
      ],
    },
    {
      icon: MinusCircle,
      title: 'Removing Items',
      badge: 'badge-rose',
      examples: [
        '"Remove milk from my list"',
        '"Delete apples"',
        '"Take off bread"',
        '"Drop toothpaste"',
      ],
    },
    {
      icon: Sliders,
      title: 'Modifying Quantities',
      badge: 'badge-cyan',
      examples: [
        '"Change apples to 3"',
        '"Make bananas 5 pieces"',
        '"Update water to 4 bottles"',
      ],
    },
    {
      icon: Search,
      title: 'Search & Price Filtering',
      badge: 'badge-violet',
      examples: [
        '"Find me organic apples"',
        '"Find toothpaste under $5"',
        '"Search for Amul milk"',
        '"Look for gluten free bread"',
      ],
    },
    {
      icon: Trash2,
      title: 'Clearing Cart & Undo',
      badge: 'badge-rose',
      examples: [
        '"Clear cart" or "Clear list"',
        '"Empty my cart"',
        '"Delete all items from cart"',
        '"Undo" (Reverts previous action)',
      ],
    },

    {
      icon: Globe,
      title: 'Multilingual Support (Switch Language)',
      badge: 'badge-amber',
      examples: [
        'Hindi: "doodh jod do", "kela hatao", "pani dhundo"',
        'Spanish: "agrega leche", "eliminar pan", "buscar manzanas"',
        'French: "ajouter du lait", "chercher des pommes"',
        'German: "milch hinzufügen", "äpfel suchen"',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg glass-card shadow-glass-lg rounded-3xl p-6 max-h-[85vh] overflow-y-auto styled-scroll border border-vc-border animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-vc-border-subtle">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 badge-cyan rounded-xl">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-vc-text">
                Voice Command Guide
              </h2>
              <p className="text-xs text-vc-text-secondary">
                Speak naturally — NLP understands varied phrasing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close guide"
            className="p-1.5 text-vc-text-secondary hover:text-vc-text focus-ring rounded-xl transition btn-glass"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl glass border border-vc-border-subtle bg-vc-bg/40"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${cat.badge}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-vc-text">
                    {cat.title}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {cat.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="text-xs font-medium text-vc-text-secondary bg-vc-bg-subtle/50 px-2.5 py-1.5 rounded-xl border border-vc-border-subtle shadow-glass font-mono glass"
                    >
                      {ex}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-vc-border-subtle flex items-center justify-between text-xs text-vc-text-muted">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-vc-emerald" />
            Powered by Groq Llama 3.1 & Web Speech API
          </span>
          <button
            onClick={onClose}
            className="font-bold btn-primary px-4 py-2 rounded-xl text-sm"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
