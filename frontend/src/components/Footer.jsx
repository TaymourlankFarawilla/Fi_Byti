import React, { useState } from 'react';
import { Shield, Truck, CreditCard, Lock, Heart } from 'lucide-react';

export default function Footer() {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  return (
    <footer className="bg-artisan-slate text-artisan-sand border-t border-artisan-gold/20 mt-auto">
      {/* Platform Guarantees Banner */}
      <div className="border-b border-white/10 bg-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-artisan-terracotta/20 flex items-center justify-center text-artisan-terracotta shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">100% Egyptian Handmade</h4>
              <p className="text-xs text-artisan-sand/70">Verified independent Egyptian artisans & craft masters.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-artisan-olive/20 flex items-center justify-center text-artisan-olive shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Split Shipping & Pickup</h4>
              <p className="text-xs text-artisan-sand/70">Egypt Post, Express Couriers & Seller Direct Pickup.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-artisan-gold/20 flex items-center justify-center text-artisan-gold shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Secure EGP Payments</h4>
              <p className="text-xs text-artisan-sand/70">Vodafone Cash, InstaPay, Visa/Mastercard & COD.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Law 151/2020 Compliant</h4>
              <p className="text-xs text-artisan-sand/70">Strict Egyptian personal data protection & encrypted storage.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-artisan-terracotta flex items-center justify-center text-white font-serif font-bold text-xl">
              في
            </div>
            <span className="font-serif text-xl font-bold text-white">Fi Byti (في بيتي)</span>
          </div>
          <p className="text-xs text-artisan-sand/70 leading-relaxed">
            Fi Byti is Egypt's dedicated responsive marketplace empowering independent artisans, woodcarvers, weavers, and ceramicists to reach craft lovers directly.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">Marketplace Categories</h4>
          <ul className="space-y-2 text-xs text-artisan-sand/80">
            <li><a href="/catalog?category=pottery-ceramics" className="hover:text-artisan-terracotta transition">Fayoum Pottery & Ceramics</a></li>
            <li><a href="/catalog?category=handwoven-textiles" className="hover:text-artisan-terracotta transition">Akhmim Handwoven Cotton Textiles</a></li>
            <li><a href="/catalog?category=artisan-leathercraft" className="hover:text-artisan-terracotta transition">Khan El-Khalili Leathercraft</a></li>
            <li><a href="/catalog?category=fine-egyptian-jewelry" className="hover:text-artisan-terracotta transition">Amazigh & Silver Filigree Jewelry</a></li>
            <li><a href="/catalog?category=woodwork-carvings" className="hover:text-artisan-terracotta transition">Mother-of-Pearl Wood Inlays</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">Platform Commission</h4>
          <p className="text-xs text-artisan-sand/80 mb-2">
            Fi Byti operates as an intermediary with a transparent <strong className="text-artisan-gold">2% platform commission</strong> on product sales. Sellers receive 98% of product sales directly.
          </p>
          <p className="text-[11px] text-artisan-sand/60">
            Gateway processing fees are listed separately per checkout policy.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">Privacy & Compliance</h4>
          <p className="text-xs text-artisan-sand/80 mb-3">
            Fully compliant with Egypt’s Personal Data Protection Law No. 151 of 2020 and PCI DSS standards for payment security.
          </p>
          <button
            onClick={() => setPrivacyModalOpen(true)}
            className="text-xs text-artisan-gold hover:underline flex items-center space-x-1"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Read Law 151/2020 Privacy Policy</span>
          </button>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-[11px] text-artisan-sand/50">
        © 2026 Fi Byti (في بيتي) Marketplace. All rights reserved. Made for Egyptian Artisans.
      </div>

      {/* Privacy Policy Modal */}
      {privacyModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-artisan-slate rounded-xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h3 className="font-serif font-bold text-lg text-artisan-slate flex items-center space-x-2">
                <Shield className="w-5 h-5 text-artisan-terracotta" />
                <span>Egypt Law No. 151 of 2020 Compliance & Privacy Policy</span>
              </h3>
              <button onClick={() => setPrivacyModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
              <p>
                <strong>Personal Data Protection Notice:</strong> In compliance with Egyptian Law No. 151 of 2020 regarding Personal Data Protection, Fi Byti guarantees the confidentiality and security of all user data processed on this platform.
              </p>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">1. Data Minimization & Purpose</h4>
                <p>We collect personal information (name, phone number, delivery address, seller identity documents) solely to verify artisan identities, facilitate marketplace orders, and comply with tax and statutory requirements.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">2. Identity Document Protection</h4>
                <p>Seller identity verification documents (PDF/JPG/PNG up to 5 MB) are stored in encrypted, isolated file storage. Access is strictly restricted to authorized administrators via role-checked internal endpoints.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">3. PCI DSS & Financial Data Security</h4>
                <p>Fi Byti never stores 16-digit card numbers, CVV security codes, or wallet credentials. Card transactions use tokenized payment provider sandboxes.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">4. Data Subject Rights</h4>
                <p>Under Law 151/2020, users have the right to request access, correction, or deletion of their personal records by contacting support@fibyti.eg.</p>
              </div>
            </div>

            <div className="mt-6 border-t pt-4 text-right">
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
