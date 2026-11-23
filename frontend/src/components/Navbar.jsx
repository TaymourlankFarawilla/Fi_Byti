import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { ShoppingBag, Search, Store, Shield, User, LogOut, PackageCheck, Menu, X, Globe, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const { lang, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

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
    <nav className="bg-artisan-sand-light dark:bg-slate-900 border-b border-artisan-terracotta/15 dark:border-slate-800 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-opacity-95 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse group">
            <div className="w-11 h-11 rounded-xl bg-artisan-terracotta flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <span className="font-serif font-bold text-2xl">في</span>
            </div>
            <div>
              <div className="font-serif font-bold text-2xl tracking-tight text-artisan-slate dark:text-amber-100 group-hover:text-artisan-terracotta transition-colors">
                {t('appName')} <span className="text-artisan-terracotta text-sm font-sans font-normal ml-1">{t('appNameAr')}</span>
              </div>
              <p className="text-[11px] text-artisan-slate/60 dark:text-slate-400 font-medium tracking-wide">{t('tagline')}</p>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-artisan-terracotta/20 dark:border-slate-700 dark:text-white rounded-full py-2.5 pl-4 pr-10 rtl:pl-10 rtl:pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-artisan-terracotta/40 shadow-inner"
              />
              <button type="submit" className="absolute right-3 rtl:right-auto rtl:left-3 top-2.5 text-artisan-terracotta hover:text-artisan-terracotta-dark">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right Navigation */}
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1.5 rounded-lg border border-artisan-terracotta/20 dark:border-slate-700 bg-white/50 dark:bg-slate-800 text-xs font-bold text-artisan-slate dark:text-slate-200 hover:bg-artisan-sand dark:hover:bg-slate-700 transition"
              title="Toggle Language / تغيير اللغة"
            >
              <Globe className="w-4 h-4 text-artisan-terracotta" />
              <span>{lang === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-artisan-terracotta/20 dark:border-slate-700 bg-white/50 dark:bg-slate-800 text-artisan-slate dark:text-amber-300 hover:bg-artisan-sand dark:hover:bg-slate-700 transition"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-300" />}
            </button>

            <Link to="/catalog" className="text-xs font-bold text-artisan-slate dark:text-slate-200 hover:text-artisan-terracotta transition">
              {t('browseMarketplace')}
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 text-artisan-slate dark:text-slate-200 hover:text-artisan-terracotta transition group">
              <ShoppingBag className="w-6 h-6" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-artisan-terracotta text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* User Dashboard / Auth Options */}
            {user ? (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="badge-gold flex items-center space-x-1 py-1.5 px-2.5">
                    <Shield className="w-4 h-4 text-artisan-brass" />
                    <span>{t('adminDashboard')}</span>
                  </Link>
                )}

                {user.role === 'SELLER' && (
                  <Link to="/seller/dashboard" className="badge-terracotta flex items-center space-x-1 py-1.5 px-2.5">
                    <Store className="w-4 h-4 text-artisan-terracotta" />
                    <span>{t('artisanPortal')}</span>
                  </Link>
                )}

                {user.role === 'BUYER' && (
                  <Link to="/buyer/orders" className="badge-olive flex items-center space-x-1 py-1.5 px-2.5">
                    <PackageCheck className="w-4 h-4 text-artisan-olive" />
                    <span>{t('myOrders')}</span>
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="p-2 text-artisan-slate/60 dark:text-slate-400 hover:text-red-600 transition"
                  title={t('signOut')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Link to="/login" className="text-xs font-bold text-artisan-slate dark:text-slate-200 hover:text-artisan-terracotta px-2.5 py-2">
                  {t('signIn')}
                </Link>
                <Link to="/register" className="bg-artisan-terracotta text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-artisan-terracotta-dark shadow-sm transition">
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2 rtl:space-x-reverse">
            <button onClick={toggleLanguage} className="p-1.5 border rounded text-xs font-bold">
              {lang === 'en' ? 'ع' : 'EN'}
            </button>
            <button onClick={toggleTheme} className="p-1.5 border rounded">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <Link to="/cart" className="relative p-1.5 text-artisan-slate dark:text-slate-200">
              <ShoppingBag className="w-6 h-6" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-artisan-terracotta text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-artisan-slate dark:text-slate-200">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-artisan-terracotta/20 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-artisan-sand dark:bg-slate-800 text-xs rounded-lg py-2 pl-3 pr-9"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-artisan-terracotta">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          <Link to="/catalog" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-bold text-artisan-slate dark:text-slate-200">
            {t('browseMarketplace')}
          </Link>

          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-bold text-amber-600">
                  {t('adminDashboard')}
                </Link>
              )}
              {user.role === 'SELLER' && (
                <Link to="/seller/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-bold text-artisan-terracotta">
                  {t('artisanPortal')}
                </Link>
              )}
              {user.role === 'BUYER' && (
                <Link to="/buyer/orders" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-bold text-artisan-olive">
                  {t('myOrders')}
                </Link>
              )}
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block py-2 text-xs text-red-600 font-bold">
                {t('signOut')} ({user.email})
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-gray-100 flex flex-col space-y-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2 text-xs text-artisan-slate font-bold border rounded-lg">
                {t('signIn')}
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-center py-2 text-xs bg-artisan-terracotta text-white font-bold rounded-lg">
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
