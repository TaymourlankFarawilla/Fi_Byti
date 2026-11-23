import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Store, MapPin, Truck, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const SHIPPING_RATES = {
  EGYPT_POST: 40,
  PRIVATE_COURIER: 65,
  DIRECT_PICKUP: 0
};

export default function CartPage() {
  const {
    cartItems,
    groupedBySeller,
    subtotalEgp,
    sellerShippingSelections,
    setSellerShipping,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const navigate = useNavigate();

  // Calculate combined shipping across all seller groups
  let combinedShippingTotal = 0;
  const sellerShipmentSummaries = Object.values(groupedBySeller).map(group => {
    const chosenMethod = sellerShippingSelections[group.sellerId] || 'EGYPT_POST';
    const finalMethod = (chosenMethod === 'DIRECT_PICKUP' && !group.pickupAvailable) ? 'EGYPT_POST' : chosenMethod;
    const cost = SHIPPING_RATES[finalMethod] !== undefined ? SHIPPING_RATES[finalMethod] : 40;
    combinedShippingTotal += cost;

    return {
      ...group,
      chosenMethod: finalMethod,
      shippingCostEgp: cost
    };
  });

  const grandTotalEgp = subtotalEgp + combinedShippingTotal;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-artisan-sand rounded-full flex items-center justify-center text-artisan-terracotta mx-auto mb-4 border border-artisan-terracotta/20">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-artisan-slate">Your Cart is Empty</h2>
        <p className="text-sm text-artisan-slate/60 mt-2 max-w-md mx-auto">
          Explore our marketplace catalog to discover handcrafted Fayoum pottery, Akhmim woven textiles, and leathercraft.
        </p>
        <Link
          to="/catalog"
          className="mt-6 inline-flex items-center space-x-2 bg-artisan-terracotta text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-artisan-terracotta-dark transition shadow-sm"
        >
          <span>Browse Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-artisan-slate">Marketplace Shopping Cart</h1>
          <p className="text-sm text-artisan-slate/70 mt-1">Multi-seller cart with split shipping per artisan studio</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:underline flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Grouped by Seller */}
        <div className="lg:col-span-2 space-y-8">
          {sellerShipmentSummaries.map((group) => (
            <div
              key={group.sellerId}
              className="bg-white rounded-2xl border border-artisan-terracotta/20 overflow-hidden shadow-sm space-y-4"
            >
              {/* Seller Header */}
              <div className="bg-artisan-sand p-4 border-b border-artisan-terracotta/15 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-artisan-terracotta text-white font-serif font-bold flex items-center justify-center text-base">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-artisan-slate">{group.storeName}</h3>
                    <div className="text-xs text-artisan-slate/60 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-artisan-terracotta" />
                      <span>Artisan Location: {group.sellerCity}</span>
                    </div>
                  </div>
                </div>

                <span className="badge-terracotta text-xs">Shipment #1 from {group.storeName}</span>
              </div>

              {/* Items in this Seller Shipment */}
              <div className="divide-y px-4">
                {group.items.map((item) => (
                  <div key={item.productId} className="py-4 flex items-center space-x-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-artisan-sand border shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.productId}`} className="font-serif font-bold text-sm text-artisan-slate hover:text-artisan-terracotta truncate block">
                        {item.name}
                      </Link>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.priceEgp} EGP per unit
                      </div>

                      {/* Quantity control */}
                      <div className="flex items-center space-x-3 mt-2">
                        <div className="flex items-center border rounded-lg bg-artisan-sand/40">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-2.5 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-200"
                          >
                            -
                          </button>
                          <span className="px-3 py-0.5 text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-2.5 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-200"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[11px] text-gray-400">(Max: {item.stockQuantity})</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-sm text-artisan-slate block">
                        {item.priceEgp * item.quantity} <span className="text-xs font-normal">EGP</span>
                      </span>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-gray-400 hover:text-red-600 mt-2 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Per-Seller Shipping Selector */}
              <div className="p-4 bg-gray-50/60 border-t border-gray-100 rounded-b-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-artisan-slate">
                  <span className="flex items-center space-x-1.5">
                    <Truck className="w-4 h-4 text-artisan-terracotta" />
                    <span>Choose Shipping Method for {group.storeName}:</span>
                  </span>
                  <span className="text-artisan-terracotta font-semibold">
                    + {group.shippingCostEgp} EGP
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {/* Egypt Post */}
                  <label className={`p-2.5 rounded-xl border cursor-pointer flex flex-col justify-between transition ${
                    group.chosenMethod === 'EGYPT_POST' ? 'border-artisan-terracotta bg-artisan-terracotta/5 font-semibold' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`shipping-${group.sellerId}`}
                        checked={group.chosenMethod === 'EGYPT_POST'}
                        onChange={() => setSellerShipping(group.sellerId, 'EGYPT_POST')}
                        className="text-artisan-terracotta focus:ring-artisan-terracotta"
                      />
                      <span>Egypt Post</span>
                    </div>
                    <span className="text-gray-500 font-normal mt-1 text-[11px]">40 EGP (3-5 days)</span>
                  </label>

                  {/* Private Courier */}
                  <label className={`p-2.5 rounded-xl border cursor-pointer flex flex-col justify-between transition ${
                    group.chosenMethod === 'PRIVATE_COURIER' ? 'border-artisan-terracotta bg-artisan-terracotta/5 font-semibold' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`shipping-${group.sellerId}`}
                        checked={group.chosenMethod === 'PRIVATE_COURIER'}
                        onChange={() => setSellerShipping(group.sellerId, 'PRIVATE_COURIER')}
                        className="text-artisan-terracotta focus:ring-artisan-terracotta"
                      />
                      <span>Private Express Courier</span>
                    </div>
                    <span className="text-gray-500 font-normal mt-1 text-[11px]">65 EGP (1-2 days)</span>
                  </label>

                  {/* Direct Pickup */}
                  <label className={`p-2.5 rounded-xl border cursor-pointer flex flex-col justify-between transition ${
                    !group.pickupAvailable ? 'opacity-50 cursor-not-allowed bg-gray-100' : (group.chosenMethod === 'DIRECT_PICKUP' ? 'border-artisan-olive bg-artisan-olive/5 font-semibold' : 'border-gray-200 bg-white')
                  }`}>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`shipping-${group.sellerId}`}
                        disabled={!group.pickupAvailable}
                        checked={group.chosenMethod === 'DIRECT_PICKUP'}
                        onChange={() => setSellerShipping(group.sellerId, 'DIRECT_PICKUP')}
                        className="text-artisan-olive focus:ring-artisan-olive"
                      />
                      <span>Direct Seller Pickup</span>
                    </div>
                    <span className="text-gray-500 font-normal mt-1 text-[11px]">
                      {group.pickupAvailable ? '0 EGP (Free at studio)' : 'Unavailable for store'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-artisan-terracotta/20 shadow-sm space-y-6 sticky top-24">
            <h3 className="font-serif font-bold text-lg text-artisan-slate border-b pb-3">Order Financial Summary</h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-artisan-slate">
                <span>Craft Products Subtotal:</span>
                <span className="font-bold text-sm">{subtotalEgp} EGP</span>
              </div>

              <div className="flex items-center justify-between text-artisan-slate">
                <span>Split Shipping Total ({sellerShipmentSummaries.length} seller shipments):</span>
                <span className="font-bold text-sm text-artisan-terracotta">+{combinedShippingTotal} EGP</span>
              </div>

              <div className="bg-artisan-sand p-3 rounded-xl border border-artisan-terracotta/10 space-y-1 text-[11px] text-artisan-slate/70">
                <div className="font-bold text-artisan-slate flex items-center justify-between">
                  <span>Platform Commission Notice:</span>
                  <span className="badge-gold">2% Intermediary</span>
                </div>
                <p>Calculated transparently on seller product sales. Net artisan proceeds recorded separately.</p>
              </div>

              <div className="border-t pt-3 flex items-baseline justify-between text-base font-extrabold text-artisan-slate">
                <span>Grand Total:</span>
                <span className="text-2xl text-artisan-terracotta">{grandTotalEgp} <span className="text-xs font-normal text-artisan-slate">EGP</span></span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-artisan-terracotta text-white py-4 rounded-xl font-bold text-base hover:bg-artisan-terracotta-dark shadow-lg shadow-artisan-terracotta/20 transition flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
