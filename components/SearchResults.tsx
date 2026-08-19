'use client';

import React from 'react';
import { Search, X, Plus, Tag, Check } from 'lucide-react';
import { useShoppingList } from '@/context/ShoppingListContext';
import { Product } from '@/types';

export function SearchResults() {
  const { searchState, clearSearch, addItem, items } = useShoppingList();

  if (!searchState.isActive) {
    return null;
  }

  const { query, filters, results, totalMatches } = searchState;

  const isAlreadyInList = (productName: string) => {
    return items.some(
      (i) => i.name.toLowerCase() === productName.toLowerCase()
    );
  };

  return (
    <section className="w-full my-6 bg-white rounded-3xl border border-emerald-300 p-5 md:p-6 shadow-md animate-fade-in-down">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <span>Catalog Search Results</span>
              <span className="text-xs font-semibold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                {totalMatches} {totalMatches === 1 ? 'match' : 'matches'}
              </span>
            </h3>
            <p className="text-xs text-neutral-500">
              Query: <span className="font-semibold text-neutral-700">&ldquo;{query || 'all items'}&rdquo;</span>
            </p>
          </div>
        </div>

        <button
          onClick={clearSearch}
          aria-label="Close search results"
          className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Badges if applied */}
      {(filters?.priceMax || filters?.priceMin || filters?.brand) && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          <span className="text-[11px] font-semibold text-neutral-400 mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Filters:
          </span>
          {filters.priceMax && (
            <span className="text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg">
              Max Price: ${filters.priceMax}
            </span>
          )}
          {filters.priceMin && (
            <span className="text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg">
              Min Price: ${filters.priceMin}
            </span>
          )}
          {filters.brand && (
            <span className="text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 px-2 py-0.5 rounded-lg">
              Brand: {filters.brand}
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
            Try searching for items like &ldquo;Apple Juice&rdquo;, &ldquo;Milk&rdquo;, &ldquo;Potato&rdquo;, or &ldquo;Orange&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
          {results.map((product: Product) => {
            const onList = isAlreadyInList(product.name);
            return (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-2xl border border-neutral-200 bg-neutral-50/60 hover:bg-white hover:border-emerald-300 transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-3 min-w-0 mr-2">
                  {product.image ? (
                    <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center p-1 overflow-hidden flex-shrink-0 relative shadow-2xs">
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
                    <p className="text-xs font-bold text-neutral-900 truncate">
                      {product.name}
                    </p>
                    {product.description && (
                      <p className="text-[10px] text-neutral-500 line-clamp-1">
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

                <button
                  onClick={() =>
                    addItem(
                      product.name,
                      1,
                      product.unit || 'pieces',
                      product.brand
                    )
                  }
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 active:scale-95 ${
                    onList
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                  }`}
                >
                  {onList ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
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
