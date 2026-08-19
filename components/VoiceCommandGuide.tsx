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
      color: 'text-emerald-600 bg-emerald-50',
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
      color: 'text-rose-600 bg-rose-50',
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
      color: 'text-blue-600 bg-blue-50',
      examples: [
        '"Change apples to 3"',
        '"Make bananas 5 pieces"',
        '"Update water to 4 bottles"',
      ],
    },
    {
      icon: Search,
      title: 'Search & Price Filtering',
      color: 'text-purple-600 bg-purple-50',
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
      color: 'text-rose-600 bg-rose-50',
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
      color: 'text-amber-600 bg-amber-50',
      examples: [
        'Hindi: "doodh jod do", "kela hatao", "pani dhundo"',
        'Spanish: "agrega leche", "eliminar pan", "buscar manzanas"',
        'French: "ajouter du lait", "chercher des pommes"',
        'German: "milch hinzufügen", "äpfel suchen"',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-100 p-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Voice Command Guide
              </h2>
              <p className="text-xs text-neutral-500">
                Speak naturally — NLP understands varied phrasing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close guide"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition"
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
                className="p-3.5 rounded-2xl border border-neutral-100 bg-neutral-50/70"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    {cat.title}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {cat.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="text-xs font-medium text-neutral-800 bg-white px-2.5 py-1.5 rounded-xl border border-neutral-200/60 shadow-2xs font-mono"
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
        <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Powered by Groq Llama 3.1 & Web Speech API
          </span>
          <button
            onClick={onClose}
            className="font-bold text-emerald-700 hover:text-emerald-800"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
