import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, Heart, Sparkles, MapPin, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        if (data.products) setFeaturedProducts(data.products.slice(0, 4));
      })
      .catch(err => console.error(err));

    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-artisan-sand via-artisan-sand-light to-artisan-terracotta/10 border-b border-artisan-terracotta/20 py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-artisan-terracotta/10 text-artisan-terracotta px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide">
                <Sparkles className="w-4 h-4" />
                <span>Authentic Egyptian Handcrafts</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-artisan-slate leading-tight">
                Authentic Egyptian Crafts, Direct from Artisan <span className="text-artisan-terracotta">Homes & Studios.</span>
              </h1>
              <p className="text-base sm:text-lg text-artisan-slate/80 max-w-xl font-normal leading-relaxed">
                Connecting independent Egyptian artisans from Tunis Village, Akhmim, Khan El-Khalili & Siwa directly with craft lovers. Fair platform transparent <strong className="text-artisan-terracotta font-semibold">2% commission</strong>.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/catalog"
                  className="w-full sm:w-auto bg-artisan-terracotta text-white font-medium px-8 py-3.5 rounded-xl hover:bg-artisan-terracotta-dark shadow-lg shadow-artisan-terracotta/20 transition flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Explore Marketplace</span>
                </Link>

                <Link
                  to="/register"
                  className="w-full sm:w-auto bg-white border border-artisan-terracotta/30 text-artisan-slate font-medium px-6 py-3.5 rounded-xl hover:bg-artisan-sand transition flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-artisan-terracotta" />
                  <span>Join as an Artisan Seller</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-artisan-terracotta/15 text-xs text-artisan-slate/70">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-artisan-olive" />
                  <span>Verified Identity Sellers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-artisan-terracotta" />
                  <span>Split Shipping per Seller</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-artisan-gold" />
                  <span>Egypt Post & Pickup</span>
                </div>
              </div>
            </div>

            {/* Hero Image Collage */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80"
                  alt="Fayoum Pottery"
                  className="rounded-2xl shadow-xl object-cover h-64 w-full transform hover:scale-105 transition duration-300"
                />
                <img
                  src="https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=600&q=80"
                  alt="Akhmim Handloom Weaving"
                  className="rounded-2xl shadow-xl object-cover h-64 w-full mt-8 transform hover:scale-105 transition duration-300"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-artisan-terracotta/20 hidden sm:flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-artisan-gold/20 flex items-center justify-center text-artisan-brass font-bold font-serif text-lg">
                  2%
                </div>
                <div>
                  <div className="font-bold text-xs text-artisan-slate">Platform Intermediary</div>
                  <div className="text-[11px] text-artisan-slate/60">Artisans retain 98% of product sales</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-artisan-slate">Explore Egyptian Craft Heritage</h2>
            <p className="text-sm text-artisan-slate/70">Shop by traditional region and craft discipline</p>
          </div>
          <Link to="/catalog" className="text-sm font-semibold text-artisan-terracotta hover:underline flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-white shadow-sm border border-artisan-terracotta/10 hover:shadow-md transition"
            >
              <div className="h-36 overflow-hidden">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
              </div>
              <div className="p-3 text-center">
                <h3 className="font-serif font-bold text-sm text-artisan-slate group-hover:text-artisan-terracotta transition">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-serif font-bold text-artisan-slate">Handmade Egyptian Craft Highlights</h2>
          <p className="text-sm text-artisan-slate/70 mt-2">Unique artisan pieces crafted with natural Egyptian materials</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-artisan-terracotta/15 flex flex-col hover:shadow-lg transition group"
            >
              <div className="relative h-64 overflow-hidden bg-artisan-sand">
                <img
                  src={product.primary_image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-artisan-slate text-[11px] font-medium px-2.5 py-1 rounded-full border">
                  📍 {product.seller_city}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-semibold text-artisan-terracotta uppercase tracking-wider mb-1">
                    {product.store_name}
                  </div>
                  <Link to={`/products/${product.id}`} className="font-serif font-bold text-base text-artisan-slate hover:text-artisan-terracotta line-clamp-2 transition">
                    {product.name}
                  </Link>
                  <p className="text-xs text-artisan-slate/60 mt-1 line-clamp-2">
                    {product.materials}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block">Price</span>
                    <span className="font-bold text-lg text-artisan-slate">{product.price_egp} <span className="text-xs font-normal">EGP</span></span>
                  </div>

                  <button
                    onClick={() => addToCart(product, 1)}
                    className="bg-artisan-terracotta text-white p-2.5 rounded-xl hover:bg-artisan-terracotta-dark shadow-sm transition"
                    title="Add to Cart"
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
