import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CreditCard, Wallet, Banknote, ShieldCheck, Truck, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

const EGYPT_GOVERNORATES = [
  'Cairo', 'Alexandria', 'Fayoum', 'Sohag', 'Giza', 'Qalyubia', 'Port Said', 'Suez',
  'Gharbia', 'Dakahlia', 'Sharqia', 'Asyut', 'Aswan', 'Luxor', 'Beheira', 'Matrouh', 'Red Sea'
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems, groupedBySeller, subtotalEgp, sellerShippingSelections, clearCart } = useCart();
  const navigate = useNavigate();

  // Address inputs
  const [shippingFullName, setShippingFullName] = useState(user ? user.fullName || '' : '');
  const [shippingPhone, setShippingPhone] = useState(user ? user.phoneNumber || '' : '+201000000000');
  const [shippingAddress, setShippingAddress] = useState('14 Degla Street, Road 206');
  const [shippingCity, setShippingCity] = useState('Cairo');
  const [shippingGovernorate, setShippingGovernorate] = useState('Cairo');

  // Payment method: 'CARD' | 'WALLET' | 'COD'
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  // Sandbox Card / Wallet Details (Never saved to DB!)
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [walletPhone, setWalletPhone] = useState('+201012345678');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Shipping rates map
  const SHIPPING_RATES = { EGYPT_POST: 40, PRIVATE_COURIER: 65, DIRECT_PICKUP: 0 };

  let combinedShippingTotal = 0;
  Object.values(groupedBySeller).forEach(group => {
    const chosen = sellerShippingSelections[group.sellerId] || 'EGYPT_POST';
    const finalMethod = (chosen === 'DIRECT_PICKUP' && !group.pickupAvailable) ? 'EGYPT_POST' : chosen;
    combinedShippingTotal += (SHIPPING_RATES[finalMethod] !== undefined ? SHIPPING_RATES[finalMethod] : 40);
  });

  // Gateway Fee policy: Card & Wallet 2.5% + 3 EGP, COD 0 EGP
  let gatewayFeeEgp = 0;
  if (paymentMethod === 'CARD' || paymentMethod === 'WALLET') {
    gatewayFeeEgp = Math.round((subtotalEgp * 0.025 + 3) * 100) / 100;
  }

  const grandTotalEgp = subtotalEgp + combinedShippingTotal + gatewayFeeEgp;

  // Exact 2% Platform Commission
  const platformCommissionEgp = Math.round(subtotalEgp * 0.02 * 100) / 100;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shippingFullName || !shippingPhone || !shippingAddress || !shippingCity || !shippingGovernorate) {
      setError('Please fill out all delivery address fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('fibyti_token');
      const res = await fetch('/api/checkout/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems,
          shippingFullName,
          shippingPhone,
          shippingAddress,
          shippingCity,
          shippingGovernorate,
          paymentMethod,
          sellerShippingSelections,
          paymentToken: `SANDBOX-TOKEN-${Date.now()}`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order.');

      clearCart();
      navigate('/order-confirmation', { state: { orderResult: data } });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold font-serif">Your cart is empty.</h2>
        <button onClick={() => navigate('/catalog')} className="mt-4 bg-artisan-terracotta text-white px-4 py-2 rounded-lg text-sm">
          Return to Marketplace Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-serif font-bold text-artisan-slate">Checkout & Payment</h1>
        <p className="text-sm text-artisan-slate/70 mt-1">Complete your order with split shipping per seller & sandbox payment security</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Address & Payment Method */}
        <div className="lg:col-span-2 space-y-8">

          {/* Section 1: Delivery Address */}
          <div className="bg-white p-6 rounded-2xl border border-artisan-terracotta/20 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-artisan-slate border-b pb-3 flex items-center space-x-2">
              <span>1. Delivery Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={shippingFullName}
                  onChange={(e) => setShippingFullName(e.target.value)}
                  className="w-full bg-artisan-sand/40 border border-gray-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Phone Number (For WhatsApp Notifications) *</label>
                <input
                  type="text"
                  required
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  className="w-full bg-artisan-sand/40 border border-gray-300 rounded-lg p-2.5"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">Detailed Street Address *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full bg-artisan-sand/40 border border-gray-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">City / District *</label>
                <input
                  type="text"
                  required
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  className="w-full bg-artisan-sand/40 border border-gray-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Governorate *</label>
                <select
                  value={shippingGovernorate}
                  onChange={(e) => setShippingGovernorate(e.target.value)}
                  className="w-full bg-artisan-sand/40 border border-gray-300 rounded-lg p-2.5"
                >
                  {EGYPT_GOVERNORATES.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Payment Gateway Selection */}
          <div className="bg-white p-6 rounded-2xl border border-artisan-terracotta/20 shadow-sm space-y-5">
            <h3 className="font-serif font-bold text-lg text-artisan-slate border-b pb-3 flex items-center justify-between">
              <span>2. Payment Option</span>
              <span className="badge-gold text-xs">Sandbox Test Mode</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">

              {/* Electronic Wallets */}
              <label className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition ${
                paymentMethod === 'WALLET' ? 'border-artisan-terracotta bg-artisan-terracotta/5 font-bold' : 'border-gray-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'WALLET'}
                    onChange={() => setPaymentMethod('WALLET')}
                    className="text-artisan-terracotta"
                  />
                  <Wallet className="w-4 h-4 text-artisan-terracotta" />
                  <span>E-Wallets</span>
                </div>
                <p className="text-[11px] text-gray-500 font-normal mt-2">
                  Vodafone Cash, InstaPay, Etisalat & Orange Cash
                </p>
              </label>

              {/* Bank Card */}
              <label className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition ${
                paymentMethod === 'CARD' ? 'border-artisan-terracotta bg-artisan-terracotta/5 font-bold' : 'border-gray-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="text-artisan-terracotta"
                  />
                  <CreditCard className="w-4 h-4 text-artisan-terracotta" />
                  <span>Bank Cards</span>
                </div>
                <p className="text-[11px] text-gray-500 font-normal mt-2">
                  Visa & Mastercard (Sandbox tokenized)
                </p>
              </label>

              {/* Cash on Delivery */}
              <label className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition ${
                paymentMethod === 'COD' ? 'border-artisan-olive bg-artisan-olive/5 font-bold' : 'border-gray-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-artisan-olive"
                  />
                  <Banknote className="w-4 h-4 text-artisan-olive" />
                  <span>Cash on Delivery</span>
                </div>
                <p className="text-[11px] text-gray-500 font-normal mt-2">
                  Pay upon receiving shipment (0 EGP fee)
                </p>
              </label>
            </div>

            {/* Payment Details Input Fields (Sandbox Mode) */}
            {paymentMethod === 'CARD' && (
              <div className="bg-artisan-sand p-4 rounded-xl border border-artisan-terracotta/20 space-y-3 text-xs">
                <div className="flex items-center justify-between font-bold text-artisan-slate">
                  <span>Card Details (PCI DSS Sandbox Tokenized)</span>
                  <span className="text-[11px] text-artisan-terracotta">Zero raw card storage</span>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">Card Number (Sandbox Test Card)</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-white border rounded p-2 text-sm font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-white border rounded p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">CVV Security Code</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-white border rounded p-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'WALLET' && (
              <div className="bg-artisan-sand p-4 rounded-xl border border-artisan-terracotta/20 space-y-3 text-xs">
                <div className="font-bold text-artisan-slate">Mobile Wallet Details</div>
                <div>
                  <label className="block text-gray-600 mb-1">Vodafone / InstaPay Mobile Wallet Number</label>
                  <input
                    type="text"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value)}
                    className="w-full bg-white border rounded p-2 text-sm font-mono"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'COD' && (
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>You will pay the courier directly when your shipments arrive. No online payment required!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Split Shipments Breakdown & Order Totals */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-artisan-terracotta/20 shadow-sm space-y-6 sticky top-24">
            <h3 className="font-serif font-bold text-lg text-artisan-slate border-b pb-3">Checkout Totals</h3>

            {/* Split Shipments Recap */}
            <div className="space-y-3 text-xs">
              <div className="font-bold text-gray-700">Shipments Split ({Object.keys(groupedBySeller).length} Artisans):</div>
              {Object.values(groupedBySeller).map((g) => {
                const chosen = sellerShippingSelections[g.sellerId] || 'EGYPT_POST';
                const cost = SHIPPING_RATES[chosen] !== undefined ? SHIPPING_RATES[chosen] : 40;
                return (
                  <div key={g.sellerId} className="bg-artisan-sand/60 p-2.5 rounded-lg flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-bold text-artisan-slate block">{g.storeName}</span>
                      <span className="text-gray-500">{g.items.length} items • {chosen}</span>
                    </div>
                    <span className="font-semibold text-artisan-terracotta">+{cost} EGP</span>
                  </div>
                );
              })}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2 border-t pt-4 text-xs">
              <div className="flex items-center justify-between">
                <span>Products Subtotal:</span>
                <span className="font-bold">{subtotalEgp} EGP</span>
              </div>

              <div className="flex items-center justify-between text-artisan-terracotta">
                <span>Split Shipping Total:</span>
                <span className="font-bold">+{combinedShippingTotal} EGP</span>
              </div>

              <div className="flex items-center justify-between text-gray-500">
                <span>Payment Gateway Fee:</span>
                <span className="font-bold">+{gatewayFeeEgp} EGP</span>
              </div>

              <div className="bg-amber-50 p-2.5 rounded-lg text-[11px] text-amber-800 border border-amber-200">
                <span className="font-bold">2% Platform Commission:</span> {platformCommissionEgp} EGP (Calculated transparently on sales).
              </div>

              <div className="border-t pt-3 flex items-baseline justify-between text-base font-extrabold text-artisan-slate">
                <span>Total Due:</span>
                <span className="text-2xl text-artisan-terracotta">{grandTotalEgp} <span className="text-xs font-normal">EGP</span></span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-artisan-terracotta text-white py-4 rounded-xl font-bold text-base hover:bg-artisan-terracotta-dark shadow-lg shadow-artisan-terracotta/20 transition flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Confirm Order ({grandTotalEgp} EGP)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
