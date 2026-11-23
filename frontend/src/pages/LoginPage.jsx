import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const data = await login(email, password);
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
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white p-8 rounded-3xl border border-artisan-terracotta/20 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-artisan-terracotta text-white font-serif font-bold text-2xl rounded-2xl flex items-center justify-center mx-auto shadow-md">
            في
          </div>
          <h1 className="text-2xl font-serif font-bold text-artisan-slate">Sign In to Fi Byti</h1>
          <p className="text-xs text-artisan-slate/60">Access buyer marketplace, artisan dashboard, or admin portal</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-artisan-sand/40 border border-gray-300 rounded-xl py-2.5 pl-3 pr-9"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-artisan-sand/40 border border-gray-300 rounded-xl py-2.5 pl-3 pr-9"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-artisan-terracotta text-white py-3.5 rounded-xl font-bold text-sm hover:bg-artisan-terracotta-dark shadow-md shadow-artisan-terracotta/20 transition flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="border-t pt-4 text-center text-xs text-gray-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-artisan-terracotta font-bold hover:underline">
            Register Account / Join as Seller
          </Link>
        </div>
      </div>
    </div>
  );
}
