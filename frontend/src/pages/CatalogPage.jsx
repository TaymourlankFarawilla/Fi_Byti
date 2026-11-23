import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, ShoppingBag, AlertCircle, ArrowUpDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { lang, t, isRtl } = useLanguage();

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states (controlled inputs for instant reactive filtering)
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [material, setMaterial] = useState(searchParams.get('material') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');

  useEffect(() => {
    fetchCategories();
  }, [lang]);

  useEffect(() => {
    fetchAllProducts();
  }, [lang]);

  const fetchCategories = async () => {
    try {
      const r = await fetch('/api/categories');
      const data = await r.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/products');
      const data = await r.json();
      if (data.products) setAllProducts(data.products);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  // REAL-TIME REACTIVE IN-MEMORY FILTERING & SORTING WHILE TYPING / SELECTING!
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      // Search Keyword (Name, Description, Materials)
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const nameMatch = (product.name || '').toLowerCase().includes(query) || (product.name_ar || '').toLowerCase().includes(query);
        const descMatch = (product.description || '').toLowerCase().includes(query) || (product.description_ar || '').toLowerCase().includes(query);
        const matMatch = (product.materials || '').toLowerCase().includes(query) || (product.materials_ar || '').toLowerCase().includes(query);
        if (!nameMatch && !descMatch && !matMatch) return false;
      }

      // Category filter
      if (category) {
        if (product.category_id !== category && product.category_slug !== category) {
          const catObj = categories.find(c => c.slug === category || c.id === category);
          if (!catObj || (product.category_id !== catObj.id)) return false;
        }
      }

      // Min Price
      if (minPrice && !isNaN(parseFloat(minPrice))) {
        if (product.price_egp < parseFloat(minPrice)) return false;
      }

      // Max Price
      if (maxPrice && !isNaN(parseFloat(maxPrice))) {
        if (product.price_egp > parseFloat(maxPrice)) return false;
      }

      // Material
      if (material.trim()) {
        const matQuery = material.trim().toLowerCase();
        const matMatch = (product.materials || '').toLowerCase().includes(matQuery) || (product.materials_ar || '').toLowerCase().includes(matQuery);
        if (!matMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price_egp - b.price_egp;
      if (sortBy === 'price_desc') return b.price_egp - a.price_egp;
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0; // Default Featured / Newest order
    });
  }, [allProducts, categories, search, category, minPrice, maxPrice, material, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setMaterial('');
    setSortBy('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-artisan-slate dark:text-white">
          {isRtl ? 'معرض الحرف اليدوية المصرية الأصيلة' : 'Handmade Egyptian Crafts Catalog'}
        </h1>
        <p className="text-sm text-artisan-slate/70 dark:text-slate-400 mt-1">
          {t('highlightsSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-artisan-terracotta/15 dark:border-slate-800 h-fit space-y-6">
          <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
            <h3 className="font-serif font-bold text-base text-artisan-slate dark:text-white flex items-center space-x-2 rtl:space-x-reverse">
              <Filter className="w-4 h-4 text-artisan-terracotta" />
              <span>{t('filterTitle')}</span>
            </h3>
            <button onClick={clearFilters} className="text-xs text-artisan-terracotta font-medium hover:underline">
              {t('resetAll')}
            </button>
          </div>

          <div className="space-y-5">
            {/* Search - Reactive while typing */}
            <div>
              <label className="block text-xs font-bold text-artisan-slate dark:text-slate-300 uppercase tracking-wider mb-2">{t('keyword')}</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Clay, Throw, Tote"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-artisan-sand/50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:text-white rounded-lg py-2 pl-3 pr-8 rtl:pl-8 rtl:pr-3 text-sm focus:ring-1 focus:ring-artisan-terracotta"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-2.5 rtl:right-auto rtl:left-2.5 top-2.5" />
              </div>
            </div>

            {/* Category - Instant Selection */}
            <div>
              <label className="block text-xs font-bold text-artisan-slate dark:text-slate-300 uppercase tracking-wider mb-2">{t('category')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-artisan-sand/50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:text-white rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-artisan-terracotta"
              >
                <option value="">{t('allCategories')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{isRtl && c.name_ar ? c.name_ar : c.name}</option>
                ))}
              </select>
            </div>

            {/* Price Range - Instant Filter */}
            <div>
              <label className="block text-xs font-bold text-artisan-slate dark:text-slate-300 uppercase tracking-wider mb-2">{t('priceRange')}</label>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 bg-artisan-sand/50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:text-white rounded-lg py-1.5 px-3 text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 bg-artisan-sand/50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:text-white rounded-lg py-1.5 px-3 text-sm"
                />
              </div>
            </div>

            {/* Material */}
            <div>
              <label className="block text-xs font-bold text-artisan-slate dark:text-slate-300 uppercase tracking-wider mb-2">{t('craftMaterial')}</label>
              <input
                type="text"
                placeholder="e.g. Cotton, Leather, Clay"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full bg-artisan-sand/50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:text-white rounded-lg py-2 px-3 text-sm"
              />
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-bold text-artisan-slate dark:text-slate-300 uppercase tracking-wider mb-2">{t('sortBy')}</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-artisan-sand/50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:text-white rounded-lg py-2 px-3 text-sm"
              >
                <option value="">Featured / Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Product Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-artisan-terracotta/10 dark:border-slate-800 text-xs text-artisan-slate dark:text-slate-300">
            <span>Showing <strong>{filteredProducts.length}</strong> {isRtl ? 'منتج يدوياً' : 'handmade listings'}</span>
            {(search || category || minPrice || maxPrice || material || sortBy) && (
              <span className="badge-terracotta flex items-center space-x-1 rtl:space-x-reverse">
                <span>Active Filters</span>
                <button onClick={clearFilters} className="ml-1 text-[10px] font-bold">✕</button>
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center text-artisan-slate/60 dark:text-slate-400">
              <div className="animate-spin w-8 h-8 border-4 border-artisan-terracotta border-t-transparent rounded-full mx-auto mb-3"></div>
              Loading Egyptian crafts...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-gray-300 dark:border-slate-800 space-y-3">
              <AlertCircle className="w-10 h-10 text-artisan-terracotta mx-auto" />
              <h3 className="font-serif font-bold text-lg text-artisan-slate dark:text-white">No Products Match Your Filter</h3>
              <p className="text-xs text-artisan-slate/60 dark:text-slate-400 max-w-md mx-auto">
                Try widening your price range, searching for another keyword, or resetting your filter options.
              </p>
              <button onClick={clearFilters} className="mt-4 bg-artisan-terracotta text-white text-xs px-4 py-2 rounded-lg font-bold">
                {t('resetAll')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock_quantity <= 0;
                const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 3;

                return (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-artisan-terracotta/15 dark:border-slate-800 flex flex-col hover:shadow-md transition group"
                  >
                    <div className="relative h-56 overflow-hidden bg-artisan-sand dark:bg-slate-800">
                      <img
                        src={product.primary_image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />

                      {/* Stock badge */}
                      <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3">
                        {isOutOfStock ? (
                          <span className="bg-red-600 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded shadow">
                            {t('outOfStock')}
                          </span>
                        ) : isLowStock ? (
                          <span className="bg-amber-500 text-slate-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded shadow">
                            Only {product.stock_quantity} left!
                          </span>
                        ) : (
                          <span className="bg-emerald-600 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded shadow">
                            {t('inStock')}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-artisan-slate dark:text-slate-200 text-[11px] font-medium px-2 py-0.5 rounded border dark:border-slate-700">
                        📍 {product.seller_city}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="text-[11px] font-semibold text-artisan-terracotta uppercase tracking-wider">
                          {product.store_name}
                        </div>
                        <Link to={`/products/${product.id}`} className="font-serif font-bold text-base text-artisan-slate dark:text-white hover:text-artisan-terracotta line-clamp-2 transition mt-0.5">
                          {isRtl && product.name_ar ? product.name_ar : product.name}
                        </Link>
                        <p className="text-xs text-artisan-slate/60 dark:text-slate-400 mt-1 line-clamp-2">
                          {isRtl && product.materials_ar ? product.materials_ar : product.materials}
                        </p>
                      </div>

                      <div className="pt-3 border-t dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-400 block">{t('price')}</span>
                          <span className="font-bold text-base text-artisan-slate dark:text-amber-100">{product.price_egp} <span className="text-xs font-normal">{t('egp')}</span></span>
                        </div>

                        <button
                          disabled={isOutOfStock}
                          onClick={() => addToCart(product, 1)}
                          className={`p-2.5 rounded-xl text-white font-medium shadow-sm transition ${
                            isOutOfStock ? 'bg-gray-300 dark:bg-slate-700 cursor-not-allowed' : 'bg-artisan-terracotta hover:bg-artisan-terracotta-dark'
                          }`}
                          title={isOutOfStock ? t('outOfStock') : t('addToCart')}
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
