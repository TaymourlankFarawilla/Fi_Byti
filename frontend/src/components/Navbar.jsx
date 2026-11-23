import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Search, Store, Shield, User, LogOut, PackageCheck, Menu, X, Heart } from 'lucide-react';

export default function Navbar() {
  const { user, sellerProfile, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="bg-artisan-sand-light border-b border-artisan-terracotta/15 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-artisan-terracotta flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <span className="font-serif font-bold text-2xl">في</span>
            </div>
            <div>
              <div className="font-serif font-bold text-2xl tracking-tight text-artisan-slate group-hover:text-artisan-terracotta transition-colors">
                Fi Byti <span className="text-artisan-terracotta text-sm font-sans font-normal ml-1">(في بيتي)</span>
              </div>
              <p className="text-[11px] text-artisan-slate/60 font-medium tracking-wide">Handmade Egyptian Crafts Marketplace</p>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search clay vases, cotton throws, leather bags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-artisan-terracotta/20 rounded-full py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-artisan-terracotta/40 shadow-inner"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-artisan-terracotta hover:text-artisan-terracotta-dark">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right Navigation */}
          <div className="hidden md:flex items-center space-x-5">
            <Link to="/catalog" className="text-sm font-medium text-artisan-slate hover:text-artisan-terracotta transition">
              Browse Marketplace
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 text-artisan-slate hover:text-artisan-terracotta transition group">
              <ShoppingBag className="w-6 h-6" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-artisan-terracotta text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* User Dashboard / Auth Options */}
            {user ? (
              <div className="flex items-center space-x-3">
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="badge-gold flex items-center space-x-1 py-1.5 px-3">
                    <Shield className="w-4 h-4 text-artisan-brass" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                {user.role === 'SELLER' && (
                  <Link to="/seller/dashboard" className="badge-terracotta flex items-center space-x-1 py-1.5 px-3">
                    <Store className="w-4 h-4 text-artisan-terracotta" />
                    <span>Artisan Portal</span>
                  </Link>
                )}

                {user.role === 'BUYER' && (
                  <Link to="/buyer/orders" className="badge-olive flex items-center space-x-1 py-1.5 px-3">
                    <PackageCheck className="w-4 h-4 text-artisan-olive" />
                    <span>My Orders</span>
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="p-2 text-artisan-slate/60 hover:text-red-600 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-medium text-artisan-slate hover:text-artisan-terracotta px-3 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="bg-artisan-terracotta text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-artisan-terracotta-dark shadow-sm transition">
                  Become a Seller / Join
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            <Link to="/cart" className="relative p-2 text-artisan-slate">
              <ShoppingBag className="w-6 h-6" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-artisan-terracotta text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-artisan-slate hover:text-artisan-terracotta"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-artisan-terracotta/20 bg-white px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Egyptian crafts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-artisan-sand text-sm rounded-lg py-2 pl-3 pr-9"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-artisan-terracotta">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          <Link to="/catalog" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-artisan-slate">
            Browse Marketplace Catalog
          </Link>

          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-bold text-amber-700">
                  Admin Workspace
                </Link>
              )}
              {user.role === 'SELLER' && (
                <Link to="/seller/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-bold text-artisan-terracotta">
                  Seller Portal & Listings
                </Link>
              )}
              {user.role === 'BUYER' && (
                <Link to="/buyer/orders" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-bold text-artisan-olive">
                  My Buyer Orders
                </Link>
              )}
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block py-2 text-sm text-red-600 font-medium">
                Sign Out ({user.email})
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-gray-100 flex flex-col space-y-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2 text-sm text-artisan-slate border rounded-lg">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-center py-2 text-sm bg-artisan-terracotta text-white rounded-lg">
                Create Account / Register Seller
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
