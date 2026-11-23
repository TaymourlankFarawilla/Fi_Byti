import React, { useState } from 'react';
import { Shield, Truck, CreditCard, Lock, Heart, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t, lang } = useLanguage();
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetDemoData = async () => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت تأكد من إعادة ضبط كافة البيانات التجريبية إلى حالتها الأصلية؟' : 'Are you sure you want to reset all demo data back to pristine initial state?')) {
      return;
    }

    setResetting(true);
    try {
      localStorage.removeItem('fibyti_ghpages_db_v2');
      await fetch('/api/reset-demo', { method: 'POST' });
      alert(t('resetDemoSuccess'));
      window.location.reload();
    } catch (e) {
      localStorage.removeItem('fibyti_ghpages_db_v2');
      window.location.reload();
    }
  };

  return (
    <footer className="bg-artisan-slate dark:bg-slate-950 text-artisan-sand dark:text-slate-300 border-t border-artisan-gold/20 dark:border-slate-800 mt-auto transition-colors">
      {/* Platform Guarantees Banner */}
      <div className="border-b border-white/10 dark:border-slate-800 bg-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left rtl:md:text-right">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-12 h-12 rounded-full bg-artisan-terracotta/20 flex items-center justify-center text-artisan-terracotta shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">{t('footerHandmade')}</h4>
              <p className="text-xs text-artisan-sand/70 dark:text-slate-400">Verified independent Egyptian artisans & craft masters.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-12 h-12 rounded-full bg-artisan-olive/20 flex items-center justify-center text-artisan-olive shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">{t('footerSplitShipping')}</h4>
              <p className="text-xs text-artisan-sand/70 dark:text-slate-400">Egypt Post, Express Couriers & Seller Direct Pickup.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-12 h-12 rounded-full bg-artisan-gold/20 flex items-center justify-center text-artisan-gold shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">{t('footerSecurePayment')}</h4>
              <p className="text-xs text-artisan-sand/70 dark:text-slate-400">Vodafone Cash, InstaPay, Visa/Mastercard & COD.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">{t('footerLawCompliance')}</h4>
              <p className="text-xs text-artisan-sand/70 dark:text-slate-400">Strict Egyptian personal data protection & encrypted storage.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
            <div className="w-9 h-9 rounded-lg bg-artisan-terracotta flex items-center justify-center text-white font-serif font-bold text-xl">
              في
            </div>
            <span className="font-serif text-xl font-bold text-white">{t('appName')}</span>
          </div>
          <p className="text-xs text-artisan-sand/70 dark:text-slate-400 leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>

        <div>
          <h4 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">{t('categoriesTitle')}</h4>
          <ul className="space-y-2 text-xs text-artisan-sand/80 dark:text-slate-300">
            <li><a href="#/catalog?category=pottery-ceramics" className="hover:text-artisan-terracotta transition">{t('lang') === 'ar' ? 'فخار وخزف الفايوم' : 'Fayoum Pottery & Ceramics'}</a></li>
            <li><a href="#/catalog?category=handwoven-textiles" className="hover:text-artisan-terracotta transition">{t('lang') === 'ar' ? 'منسوجات قطن أخميم' : 'Akhmim Handwoven Cotton Textiles'}</a></li>
            <li><a href="#/catalog?category=artisan-leathercraft" className="hover:text-artisan-terracotta transition">{t('lang') === 'ar' ? 'صناعات جلدية خان الخليلي' : 'Khan El-Khalili Leathercraft'}</a></li>
            <li><a href="#/catalog?category=fine-egyptian-jewelry" className="hover:text-artisan-terracotta transition">{t('lang') === 'ar' ? 'مجوهرات وفضيات سيوة' : 'Amazigh & Silver Filigree Jewelry'}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">{t('commissionNotice')}</h4>
          <p className="text-xs text-artisan-sand/80 dark:text-slate-300 mb-2">
            {t('commissionDesc')}
          </p>
          <p className="text-[11px] text-artisan-sand/60">
            Gateway processing fees are listed separately per checkout policy.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-sm text-white uppercase tracking-wider">Privacy & Demo Reset</h4>
          <button
            onClick={() => setPrivacyModalOpen(true)}
            className="text-xs text-artisan-gold hover:underline flex items-center space-x-1.5 rtl:space-x-reverse"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Read Law 151/2020 Privacy Policy</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={handleResetDemoData}
            disabled={resetting}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 rtl:space-x-reverse transition"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-amber-400 ${resetting ? 'animate-spin' : ''}`} />
            <span>{t('resetDemoData')}</span>
          </button>
        </div>
      </div>

      <div className="border-t border-white/10 dark:border-slate-800 py-4 text-center text-[11px] text-artisan-sand/50 dark:text-slate-500">
        © 2026 Fi Byti (في بيتي) Marketplace. All rights reserved. Made for Egyptian Artisans.
      </div>

      {/* Privacy Policy Modal */}
      {privacyModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-artisan-slate dark:text-slate-100 rounded-xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4 mb-4">
              <h3 className="font-serif font-bold text-lg text-artisan-slate dark:text-white flex items-center space-x-2 rtl:space-x-reverse">
                <Shield className="w-5 h-5 text-artisan-terracotta" />
                <span>Egypt Law No. 151 of 2020 Compliance & Privacy Policy</span>
              </h3>
              <button onClick={() => setPrivacyModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <p>
                <strong>Personal Data Protection Notice:</strong> In compliance with Egyptian Law No. 151 of 2020 regarding Personal Data Protection, Fi Byti guarantees the confidentiality and security of all user data processed on this platform.
              </p>
              <div>
                <h4 className="font-bold mb-1">1. Data Minimization & Purpose</h4>
                <p>We collect personal information solely to verify artisan identities, facilitate marketplace orders, and comply with tax requirements.</p>
              </div>
              <div>
                <h4 className="font-bold mb-1">2. Identity Document Protection</h4>
                <p>Seller identity verification documents (PDF/JPG/PNG up to 5 MB) are stored in encrypted, isolated file storage. Access is strictly restricted to authorized administrators.</p>
              </div>
            </div>

            <div className="mt-6 border-t dark:border-slate-800 pt-4 text-right rtl:text-left">
              <button
                onClick={() => setPrivacyModalOpen(false)}
                className="bg-artisan-terracotta text-white px-4 py-2 rounded-lg font-medium text-xs hover:bg-artisan-terracotta-dark"
              >
                Close Disclosure
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
