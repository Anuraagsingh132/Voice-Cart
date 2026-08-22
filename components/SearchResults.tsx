'use client';

import React, { useState } from 'react';
import { Search, X, Plus, Tag, Check, CheckCircle2, Package } from 'lucide-react';
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
    <section className="w-full my-3 glass-card rounded-2xl p-4 sm:p-5 md:p-6 border-vc-border-accent animate-fade-in-down relative z-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-vc-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-vc-cyan-muted flex items-center justify-center flex-shrink-0">
            <Search className="w-4 h-4 text-vc-cyan" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-vc-text flex items-center gap-2">
              <span>{query === 'All Items' ? 'Store Catalog' : 'Search Results'}</span>
              <span className="badge-cyan text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                {totalMatches} {totalMatches === 1 ? 'item' : 'items'}
              </span>
            </h3>
            <p className="text-xs text-vc-text-muted">
              {query === 'All Items' ? (
                <span>Browse all available products</span>
              ) : (
                <span>Query: <span className="font-semibold text-vc-text-secondary">&ldquo;{query || 'all items'}&rdquo;</span></span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={clearSearch}
          aria-label="Close search results"
          className="btn-glass text-xs flex items-center gap-1 px-3 py-1.5 focus-ring"
        >
          <span>Done</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Success Banner */}
      {justAddedName && (
        <div className="mb-3.5 badge-emerald text-xs font-semibold rounded-lg p-2.5 flex items-center gap-2 animate-fade-in-down">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Added &ldquo;{justAddedName}&rdquo; to your shopping list!</span>
        </div>
      )}

      {/* Filter Badges */}
      {(filters?.priceMax != null || filters?.priceMin != null || filters?.brand || filters?.size) && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          <span className="text-[11px] font-semibold text-vc-text-muted mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Filters:
          </span>
          {filters.priceMax != null && (
            <span className="badge-cyan text-[11px] font-medium px-2 py-0.5 rounded-lg">
              Max: ${filters.priceMax}
            </span>
          )}
          {filters.priceMin != null && (
            <span className="badge-cyan text-[11px] font-medium px-2 py-0.5 rounded-lg">
              Min: ${filters.priceMin}
            </span>
          )}
          {filters.brand && (
            <span className="badge-violet text-[11px] font-medium px-2 py-0.5 rounded-lg">
              {filters.brand}
            </span>
          )}
          {filters.size && (
            <span className="badge-violet text-[11px] font-medium px-2 py-0.5 rounded-lg">
              {filters.size}
            </span>
          )}
        </div>
      )}

      {/* Results */}
      {results.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-vc-border flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6 text-vc-text-muted" />
          </div>
          <p className="text-sm font-semibold text-vc-text mb-1">
            No matching products found
          </p>
          <p className="text-xs text-vc-text-muted max-w-xs mx-auto">
            Try searching for items like &ldquo;Apple Juice&rdquo;, &ldquo;Milk&rdquo;, or &ldquo;Potato&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto styled-scroll pr-1">
          {results.map((product: Product) => {
            const onList = isAlreadyInList(product.name);

            return (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-xl border border-vc-border-subtle bg-white/[0.02] hover:bg-white/[0.04] hover:border-vc-border transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0 mr-2">
                  {product.image ? (
                    <div className="w-12 h-12 rounded-lg bg-white/[0.04] border border-vc-border-subtle flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />

                    </div>
                  ) : (
                    <span className="text-2xl select-none flex-shrink-0">
                      {product.imageEmoji || '📦'}
                    </span>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-vc-text truncate">
                      {product.name}
                    </p>
                    {product.description && (
                      <p className="text-[11px] text-vc-text-muted line-clamp-1">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-vc-text-muted truncate">
                        {product.brand}
                      </span>
                      <span className="text-vc-text-muted">•</span>
                      <span className="text-xs font-bold text-vc-emerald">
                        ${product.discountedPrice ?? product.price}
                      </span>
                      {product.discountedPrice && (
                        <span className="text-[10px] line-through text-vc-text-muted">
                          ${product.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add Button */}
                <button
                  type="button"
                  onClick={(e) => handleAddProduct(product, e)}
                  aria-label={`Add ${product.name} to shopping list`}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all flex-shrink-0 active:scale-95 cursor-pointer focus-ring ${
                    onList
                      ? 'badge-emerald'
                      : 'btn-primary !py-2 !px-3'
                  }`}
                >
                  {onList ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Added</span>
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
