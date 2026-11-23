import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Store, Mail, Lock, Phone, MapPin, AlertCircle, Check } from 'lucide-react';

const EGYPT_GOVERNORATES = [
  'Cairo', 'Alexandria', 'Fayoum', 'Sohag', 'Giza', 'Qalyubia', 'Port Said', 'Suez',
  'Gharbia', 'Dakahlia', 'Sharqia', 'Asyut', 'Aswan', 'Luxor', 'Beheira', 'Matrouh', 'Red Sea'
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('SELLER'); // 'BUYER' | 'SELLER'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Seller store fields
  const [storeName, setStoreName] = useState('');
  const [storeBio, setStoreBio] = useState('');
  const [city, setCity] = useState('Cairo');
  const [governorate, setGovernorate] = useState('Cairo');
  const [addressDetails, setAddressDetails] = useState('');

  // Law 151/2020 Consent
  const [consentDataLaw, setConsentDataLaw] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentDataLaw) {
      setError('You must consent to personal data processing under Egypt Data Protection Law No. 151 of 2020 to register.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const data = await register({
        email,
        password,
        fullName,
        phoneNumber,
        role,
        storeName,
        storeBio,
        city,
        governorate,
        addressDetails,
        consentDataLaw
      });

      setSubmitting(false);

      if (role === 'SELLER') {
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
    <div className="max-w-2xl mx-auto my-12 px-4">
      <div className="bg-white p-8 rounded-3xl border border-artisan-terracotta/20 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-artisan-terracotta text-white font-serif font-bold text-2xl rounded-2xl flex items-center justify-center mx-auto shadow-md">
            في
          </div>
          <h1 className="text-2xl font-serif font-bold text-artisan-slate">Create Your Fi Byti Account</h1>
          <p className="text-xs text-artisan-slate/60">Join as an artisan seller or craft marketplace buyer</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-artisan-sand rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole('SELLER')}
            className={`py-2.5 rounded-lg transition flex items-center justify-center space-x-2 ${
              role === 'SELLER' ? 'bg-artisan-terracotta text-white shadow-sm' : 'text-gray-600 hover:text-artisan-slate'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Artisan Craft Seller</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('BUYER')}
            className={`py-2.5 rounded-lg transition flex items-center justify-center space-x-2 ${
              role === 'BUYER' ? 'bg-artisan-terracotta text-white shadow-sm' : 'text-gray-600 hover:text-artisan-slate'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Marketplace Buyer</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Amina El-Fayoumi"
                className="w-full bg-artisan-sand/40 border rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Phone Number (For WhatsApp Notifications) *</label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+201012345678"
                className="w-full bg-artisan-sand/40 border rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="artisan@fibyti.eg"
                className="w-full bg-artisan-sand/40 border rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-artisan-sand/40 border rounded-xl p-2.5"
              />
            </div>
          </div>

          {/* Seller Store Details */}
          {role === 'SELLER' && (
            <div className="border-t pt-4 space-y-4">
              <div className="font-serif font-bold text-sm text-artisan-slate flex items-center space-x-2">
                <Store className="w-4 h-4 text-artisan-terracotta" />
                <span>Artisan Studio Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Store Name *</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Fayoum Tunis Clay Studio"
                    className="w-full bg-artisan-sand/40 border rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Governorate *</label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full bg-artisan-sand/40 border rounded-xl p-2.5"
                  >
                    {EGYPT_GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">City / District *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Fayoum"
                    className="w-full bg-artisan-sand/40 border rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Studio Address (For Pickup) *</label>
                  <input
                    type="text"
                    required
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    placeholder="Tunis Village Pottery Road"
                    className="w-full bg-artisan-sand/40 border rounded-xl p-2.5"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Craft Studio Bio</label>
                  <textarea
                    rows={2}
                    value={storeBio}
                    onChange={(e) => setStoreBio(e.target.value)}
                    placeholder="Tell buyers about your craft heritage and handmade techniques..."
                    className="w-full bg-artisan-sand/40 border rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Identity Verification Notice:</strong> After creating your seller account, you will be prompted to upload an identity document (PDF, JPG, or PNG up to 5 MB). Your store will remain inactive until an administrator manually reviews and approves your submission.
              </div>
            </div>
          )}

          {/* Personal Data Law 151/2020 Consent Checkbox */}
          <div className="p-4 bg-artisan-sand rounded-xl border border-artisan-terracotta/20 flex items-start space-x-3 text-xs">
            <input
              type="checkbox"
              id="consent"
              checked={consentDataLaw}
              onChange={(e) => setConsentDataLaw(e.target.checked)}
              className="mt-0.5 text-artisan-terracotta rounded focus:ring-artisan-terracotta"
            />
            <label htmlFor="consent" className="text-artisan-slate/80 leading-relaxed cursor-pointer">
              I consent to the collection and processing of my account details under <strong className="text-artisan-slate font-bold">Egypt Personal Data Protection Law No. 151 of 2020</strong>. I acknowledge that identity documents are stored in encrypted private storage restricted to authorized administrators.
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-artisan-terracotta text-white py-3.5 rounded-xl font-bold text-sm hover:bg-artisan-terracotta-dark shadow-md shadow-artisan-terracotta/20 transition flex items-center justify-center space-x-2"
          >
            {submitting ? 'Creating Account...' : 'Complete Account Registration'}
          </button>
        </form>

        <div className="border-t pt-4 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-artisan-terracotta font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
