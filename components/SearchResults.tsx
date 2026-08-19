'use client';

import React, { useState } from 'react';
import { Search, X, Plus, Tag, Check, CheckCircle2 } from 'lucide-react';
import { useShoppingList } from '@/context/ShoppingListContext';
import { Product } from '@/types';

export function SearchResults() {
  const { searchState, clearSearch, addItem, items } = useShoppingList();
  const [justAddedName, setJustAddedName] = useState<string | null>(null);

  if (!searchState.isActive) {
    return null;
  }

  const { query, filters, results, totalMatches } = searchState;

  const isAlreadyInList = (productName: string) => {
    const norm = productName.toLowerCase().trim();
    return items.some((i) => {
      const iNorm = i.name.toLowerCase().trim();
      return iNorm === norm || iNorm.includes(norm) || norm.includes(iNorm);
    });
  };

  const handleAddProduct = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(
      product.name,
      1,
      product.unit || 'pieces',
      product.brand
    );

    setJustAddedName(product.name);
    setTimeout(() => {
      setJustAddedName(null);
    }, 2500);
  };

  return (
    <section className="w-full my-4 bg-white rounded-3xl border border-emerald-400/80 p-5 md:p-6 shadow-lg animate-fade-in-down relative z-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <span>{query === 'All Items' ? 'Full Store Catalog' : 'Catalog Search Results'}</span>
              <span className="text-xs font-semibold bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                {totalMatches} {totalMatches === 1 ? 'item' : 'items'}
              </span>
            </h3>
            <p className="text-xs text-neutral-500">
              {query === 'All Items' ? (
                <span>Browse all available products in store</span>
              ) : (
                <span>Query: <span className="font-semibold text-neutral-800">&ldquo;{query || 'all items'}&rdquo;</span></span>
              )}
            </p>
          </div>

        </div>

        <button
          onClick={clearSearch}
          aria-label="Close search results"
          className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-xl transition active:scale-95 cursor-pointer"
        >
          <span>Done</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Instant Success Banner on Add */}
      {justAddedName && (
        <div className="mb-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl p-2.5 flex items-center gap-2 animate-fade-in-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Added &ldquo;{justAddedName}&rdquo; to your shopping list below!</span>
        </div>
      )}

      {/* Filter Badges if applied */}
      {(filters?.priceMax != null || filters?.priceMin != null || filters?.brand || filters?.size) && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          <span className="text-[11px] font-semibold text-neutral-400 mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Filters:
          </span>
          {filters.priceMax != null && (
            <span className="text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg">
              Max Price: ${filters.priceMax}
            </span>
          )}
          {filters.priceMin != null && (
            <span className="text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg">
              Min Price: ${filters.priceMin}
            </span>
          )}
          {filters.brand && (
            <span className="text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 px-2 py-0.5 rounded-lg">
              Brand: {filters.brand}
            </span>
          )}
          {filters.size && (
            <span className="text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 px-2 py-0.5 rounded-lg">
              Size: {filters.size}
            </span>
          )}
        </div>
      )}

      {/* Result Cards */}
      {results.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm font-semibold text-neutral-700 mb-1">
            No matching products found
          </p>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Try searching for items like &ldquo;Apple Juice&rdquo;, &ldquo;Milk&rdquo;, &ldquo;Potato&rdquo;, or &ldquo;Ginger&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {results.map((product: Product) => {
            const onList = isAlreadyInList(product.name);

            return (
              <div
                key={product.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/60 hover:bg-white hover:border-emerald-300 transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-3 min-w-0 mr-2">
                  {product.image ? (
                    <div className="w-13 h-13 rounded-xl bg-white border border-neutral-200 flex items-center justify-center p-1 overflow-hidden flex-shrink-0 relative shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <span className="text-2xl select-none flex-shrink-0">
                      {product.imageEmoji || '📦'}
                    </span>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                      {product.name}
                    </p>
                    {product.description && (
                      <p className="text-[11px] text-neutral-500 line-clamp-1">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] font-semibold text-neutral-500 truncate">
                        {product.brand}
                      </span>
                      <span className="text-neutral-300">•</span>
                      <span className="text-xs font-bold text-emerald-700">
                        ${product.discountedPrice ?? product.price}
                      </span>
                      {product.discountedPrice && (
                        <span className="text-[10px] line-through text-neutral-400">
                          ${product.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add to List Button */}
                <button
                  type="button"
                  onClick={(e) => handleAddProduct(product, e)}
                  aria-label={`Add ${product.name} to shopping list`}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 active:scale-95 cursor-pointer shadow-xs ${
                    onList
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {onList ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Added (+1)</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
