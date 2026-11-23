import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Store, ShoppingBag, Clock, UserCheck } from 'lucide-react';

export default function DemoSwitcher() {
  const { login, user, logout } = useAuth();

  const handleSwitch = async (email, pass) => {
    try {
      await login(email, pass);
    } catch (err) {
      alert('Demo switch error: ' + err.message);
    }
  };

  return (
    <div className="bg-artisan-slate text-white text-xs py-2 px-4 shadow-inner border-b border-white/10">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 font-medium">
          <span className="bg-artisan-terracotta text-white px-2 py-0.5 rounded text-[11px] font-bold tracking-wide">
            DEMO MODE
          </span>
          <span className="text-artisan-sand/80 hidden sm:inline">Switch Demo Persona:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handleSwitch('admin@fibyti.eg', 'Admin123!')}
            className={`px-2.5 py-1 rounded transition flex items-center space-x-1 ${
              user && user.role === 'ADMIN' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          <button
            onClick={() => handleSwitch('artisan.amina@fibyti.eg', 'Seller123!')}
            className={`px-2.5 py-1 rounded transition flex items-center space-x-1 ${
              user && user.email === 'artisan.amina@fibyti.eg' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Amina (Approved Seller)</span>
          </button>

          <button
            onClick={() => handleSwitch('artisan.siwa@fibyti.eg', 'Seller123!')}
            className={`px-2.5 py-1 rounded transition flex items-center space-x-1 ${
              user && user.email === 'artisan.siwa@fibyti.eg' ? 'bg-orange-500 text-slate-950 font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Siwa (Pending Verification)</span>
          </button>

          <button
            onClick={() => handleSwitch('buyer.sarah@fibyti.eg', 'Buyer123!')}
            className={`px-2.5 py-1 rounded transition flex items-center space-x-1 ${
              user && user.email === 'buyer.sarah@fibyti.eg' ? 'bg-sky-400 text-slate-950 font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Sarah (Buyer)</span>
          </button>

          {user && (
            <button
              onClick={logout}
              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded text-[11px] ml-1"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
