import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, ShoppingBag, AlertCircle, ArrowUpDown } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [material, setMaterial] = useState(searchParams.get('material') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const r = await fetch('/api/categories');
      const data = await r.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const queryString = searchParams.toString();
    try {
      const r = await fetch(`/api/products?${queryString}`);
      const data = await r.json();
      if (data.products) setProducts(data.products);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const applyFilters = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category) params.set('category', category);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (material.trim()) params.set('material', material.trim());
    if (sortBy) params.set('sortBy', sortBy);

    setSearchParams(params);
  };

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
        <h1 className="text-3xl font-serif font-bold text-artisan-slate">Handmade Egyptian Crafts Catalog</h1>
        <p className="text-sm text-artisan-slate/70 mt-1">Discover unique creations from verified Egyptian artisan studios</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-artisan-terracotta/15 h-fit space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="font-serif font-bold text-base text-artisan-slate flex items-center space-x-2">
              <Filter className="w-4 h-4 text-artisan-terracotta" />
              <span>Filter Crafts</span>
            </h3>
            <button onClick={clearFilters} className="text-xs text-artisan-terracotta font-medium hover:underline">
              Reset All
            </button>
          </div>

          <form onSubmit={applyFilters} className="space-y-5">
            {/* Search */}
            <div>
              <label className="block text-xs font-bold text-artisan-slate uppercase tracking-wider mb-2">Keyword</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Clay, Throw, Tote"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-artisan-sand/50 border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:ring-1 focus:ring-artisan-terracotta"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5" />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-artisan-slate uppercase tracking-wider mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-artisan-sand/50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-artisan-terracotta"
              >
                <option value="">All Craft Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-bold text-artisan-slate uppercase tracking-wider mb-2">Price Range (EGP)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 bg-artisan-sand/50 border border-gray-200 rounded-lg py-1.5 px-3 text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 bg-artisan-sand/50 border border-gray-200 rounded-lg py-1.5 px-3 text-sm"
                />
              </div>
            </div>

            {/* Material */}
            <div>
              <label className="block text-xs font-bold text-artisan-slate uppercase tracking-wider mb-2">Craft Material</label>
              <input
                type="text"
                placeholder="e.g. Cotton, Leather, Clay"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full bg-artisan-sand/50 border border-gray-200 rounded-lg py-2 px-3 text-sm"
              />
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-bold text-artisan-slate uppercase tracking-wider mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-artisan-sand/50 border border-gray-200 rounded-lg py-2 px-3 text-sm"
              >
                <option value="">Featured / Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Product Name (A-Z)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-artisan-terracotta text-white py-2.5 rounded-lg text-sm font-medium hover:bg-artisan-terracotta-dark shadow-sm transition"
            >
              Apply Filters
            </button>
          </form>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-artisan-terracotta/10 text-xs text-artisan-slate">
            <span>Showing <strong>{products.length}</strong> handmade listings</span>
            {searchParams.toString() && (
              <span className="badge-terracotta">Active Filters Applied</span>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center text-artisan-slate/60">
              <div className="animate-spin w-8 h-8 border-4 border-artisan-terracotta border-t-transparent rounded-full mx-auto mb-3"></div>
              Loading Egyptian crafts...
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
              <AlertCircle className="w-10 h-10 text-artisan-terracotta mx-auto mb-3" />
              <h3 className="font-serif font-bold text-lg text-artisan-slate">No Products Match Your Filter</h3>
              <p className="text-xs text-artisan-slate/60 mt-1 max-w-md mx-auto">
                Try widening your price range, searching for another keyword, or resetting your filter options.
              </p>
              <button onClick={clearFilters} className="mt-4 bg-artisan-terracotta text-white text-xs px-4 py-2 rounded-lg">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const isOutOfStock = product.stock_quantity <= 0;
                const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 3;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-artisan-terracotta/15 flex flex-col hover:shadow-md transition group"
                  >
                    <div className="relative h-56 overflow-hidden bg-artisan-sand">
                      <img
                        src={product.primary_image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />

                      {/* Stock badge */}
                      <div className="absolute top-3 right-3">
                        {isOutOfStock ? (
                          <span className="bg-red-600 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded shadow">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="bg-amber-500 text-slate-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded shadow">
                            Only {product.stock_quantity} left!
                          </span>
                        ) : (
                          <span className="bg-emerald-600 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded shadow">
                            In Stock
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-artisan-slate text-[11px] font-medium px-2 py-0.5 rounded border">
                        📍 {product.seller_city}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="text-[11px] font-semibold text-artisan-terracotta uppercase tracking-wider">
                          {product.store_name}
                        </div>
                        <Link to={`/products/${product.id}`} className="font-serif font-bold text-base text-artisan-slate hover:text-artisan-terracotta line-clamp-2 transition mt-0.5">
                          {product.name}
                        </Link>
                        <p className="text-xs text-artisan-slate/60 mt-1 line-clamp-2">
                          {product.materials}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-400 block">Price</span>
                          <span className="font-bold text-base text-artisan-slate">{product.price_egp} <span className="text-xs font-normal">EGP</span></span>
                        </div>

                        <button
                          disabled={isOutOfStock}
                          onClick={() => addToCart(product, 1)}
                          className={`p-2.5 rounded-xl text-white font-medium shadow-sm transition ${
                            isOutOfStock ? 'bg-gray-300 cursor-not-allowed' : 'bg-artisan-terracotta hover:bg-artisan-terracotta-dark'
                          }`}
                          title={isOutOfStock ? 'Product Out of Stock' : 'Add to Cart'}
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
