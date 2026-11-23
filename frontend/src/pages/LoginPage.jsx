import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Lock, Mail, AlertCircle, ArrowRight, Shield, Store, ShoppingBag, Clock, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e, customEmail = null, customPass = null) => {
    if (e) e.preventDefault();

    const targetEmail = customEmail || email;
    const targetPass = customPass || password;

    if (!targetEmail || !targetPass) {
      setError('Please enter your email address and password.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const data = await login(targetEmail, targetPass);
      setSubmitting(false);

      if (data.user.role === 'ADMIN') {
        navigate('/admin');
      } else if (data.user.role === 'SELLER') {
        navigate('/seller/dashboard');
      } else {
        navigate('/catalog');
      }
    } catch (err) {
      setSubmitting(false);
      setError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-12 px-4 space-y-8">

      {/* Quick Demo Login Accounts Section */}
      <div className="bg-gradient-to-br from-amber-500/10 via-artisan-sand to-artisan-terracotta/10 dark:from-slate-800 dark:to-slate-900 p-6 rounded-3xl border border-amber-300 dark:border-slate-700 shadow-md space-y-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-artisan-slate dark:text-amber-100">
          <Sparkles className="w-5 h-5 text-artisan-terracotta" />
          <h2 className="font-serif font-bold text-base">{t('quickDemoAccounts')}</h2>
        </div>
        <p className="text-xs text-artisan-slate/70 dark:text-slate-300 leading-relaxed">
          {t('quickDemoSubtitle')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Admin */}
          <button
            onClick={() => handleLoginSubmit(null, 'admin@fibyti.eg', 'Admin123!')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-500/40 text-left rtl:text-right hover:scale-[1.02] transition shadow-sm flex items-center space-x-3 rtl:space-x-reverse group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <strong className="font-bold text-artisan-slate dark:text-white block group-hover:text-amber-600">
                {t('adminPersona')}
              </strong>
              <span className="text-[11px] text-gray-500 font-mono">admin@fibyti.eg</span>
            </div>
          </button>

          {/* Approved Seller */}
          <button
            onClick={() => handleLoginSubmit(null, 'artisan.amina@fibyti.eg', 'Seller123!')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-500/40 text-left rtl:text-right hover:scale-[1.02] transition shadow-sm flex items-center space-x-3 rtl:space-x-reverse group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <strong className="font-bold text-artisan-slate dark:text-white block group-hover:text-emerald-600">
                {t('approvedSellerPersona')}
              </strong>
              <span className="text-[11px] text-gray-500 font-mono">artisan.amina@fibyti.eg</span>
            </div>
          </button>

          {/* Pending Seller */}
          <button
            onClick={() => handleLoginSubmit(null, 'artisan.siwa@fibyti.eg', 'Seller123!')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-orange-300 dark:border-orange-500/40 text-left rtl:text-right hover:scale-[1.02] transition shadow-sm flex items-center space-x-3 rtl:space-x-reverse group"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white font-bold flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <strong className="font-bold text-artisan-slate dark:text-white block group-hover:text-orange-600">
                {t('pendingSellerPersona')}
              </strong>
              <span className="text-[11px] text-gray-500 font-mono">artisan.siwa@fibyti.eg</span>
            </div>
          </button>

          {/* Buyer */}
          <button
            onClick={() => handleLoginSubmit(null, 'buyer.sarah@fibyti.eg', 'Buyer123!')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-500/40 text-left rtl:text-right hover:scale-[1.02] transition shadow-sm flex items-center space-x-3 rtl:space-x-reverse group"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white font-bold flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <strong className="font-bold text-artisan-slate dark:text-white block group-hover:text-sky-600">
                {t('buyerPersona')}
              </strong>
              <span className="text-[11px] text-gray-500 font-mono">buyer.sarah@fibyti.eg</span>
            </div>
          </button>
        </div>
      </div>

      {/* Manual Login Card */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-artisan-terracotta/20 dark:border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-serif font-bold text-artisan-slate dark:text-white">{t('signIn')}</h1>
          <p className="text-xs text-artisan-slate/60 dark:text-slate-400">Enter custom registered account details</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center space-x-2 rtl:space-x-reverse">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => handleLoginSubmit(e)} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-artisan-sand/40 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-white rounded-xl py-2.5 pl-3 pr-9 rtl:pl-9 rtl:pr-3"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-3 rtl:right-auto rtl:left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-artisan-sand/40 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-white rounded-xl py-2.5 pl-3 pr-9 rtl:pl-9 rtl:pr-3"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute right-3 rtl:right-auto rtl:left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-artisan-terracotta text-white py-3.5 rounded-xl font-bold text-xs hover:bg-artisan-terracotta-dark shadow-md shadow-artisan-terracotta/20 transition flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>{t('signIn')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>

        <div className="border-t dark:border-slate-800 pt-4 text-center text-xs text-gray-500 dark:text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-artisan-terracotta font-bold hover:underline">
            {t('register')}
          </Link>
        </div>
      </div>
    </div>
  );
}
