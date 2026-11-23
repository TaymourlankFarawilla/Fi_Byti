import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, MessageSquare, Truck, ShieldCheck, ShoppingBag, ArrowRight } from 'lucide-react';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const orderResult = location.state?.orderResult;

  if (!orderResult || !orderResult.order) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold font-serif">Order Confirmation</h2>
        <p className="text-sm text-gray-500 mt-2">No active order session found.</p>
        <Link to="/catalog" className="mt-4 inline-block bg-artisan-terracotta text-white px-4 py-2 rounded-lg text-sm">
          Return to Marketplace Catalog
        </Link>
      </div>
    );
  }

  const { order, platformCommissionEgp, whatsappNotification } = orderResult;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-8 rounded-3xl border border-artisan-terracotta/20 text-center shadow-md space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-artisan-slate">Order Placed Successfully!</h1>
        <p className="text-sm text-artisan-slate/70">
          Thank you for supporting Egyptian independent artisans. Order ID: <strong className="text-artisan-terracotta font-mono font-bold text-base">#{order.id}</strong>
        </p>
      </div>

      {/* WhatsApp Demo Mode Notification Box */}
      {whatsappNotification && (
        <div className="bg-emerald-950 text-emerald-100 p-6 rounded-2xl border border-emerald-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">WhatsApp Business API Notification Triggered</h3>
            </div>
            {whatsappNotification.isDemoMode ? (
              <span className="bg-amber-500 text-slate-950 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                DEMO MODE ACTIVE
              </span>
            ) : (
              <span className="bg-emerald-500 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                LIVE SENT
              </span>
            )}
          </div>

          <p className="text-xs text-emerald-200/90 leading-relaxed">
            {whatsappNotification.statusMessage}
          </p>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-emerald-900/60 font-mono text-[11px] space-y-1 overflow-x-auto text-emerald-300">
            <div><strong className="text-emerald-400">Recipient Phone:</strong> {order.shipping_phone}</div>
            <div><strong className="text-emerald-400">Event:</strong> ORDER_STATUS_CONFIRMED</div>
            <div className="pt-1 text-[10px] text-gray-400">Payload Preview:</div>
            <pre className="text-[10px] text-emerald-400/90">{JSON.stringify(whatsappNotification.payload, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Order Details Grid */}
      <div className="bg-white p-6 rounded-2xl border border-artisan-terracotta/20 shadow-sm space-y-6">
        <h3 className="font-serif font-bold text-lg text-artisan-slate border-b pb-3">Order & Financial Record</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <strong className="text-gray-500 block mb-1">Delivery Address:</strong>
            <div className="font-medium text-artisan-slate">{order.shipping_full_name}</div>
            <div>{order.shipping_address}</div>
            <div>{order.shipping_city}, {order.shipping_governorate}</div>
            <div className="text-gray-500 mt-1">Phone: {order.shipping_phone}</div>
          </div>

          <div>
            <strong className="text-gray-500 block mb-1">Payment & Financials:</strong>
            <div><span className="text-gray-500">Method:</span> <strong className="uppercase">{order.payment_method}</strong> ({order.payment_status})</div>
            <div><span className="text-gray-500">Subtotal:</span> {order.subtotal_egp} EGP</div>
            <div><span className="text-gray-500">Shipping:</span> {order.total_shipping_egp} EGP</div>
            <div><span className="text-gray-500">Platform Commission (2%):</span> <strong className="text-artisan-terracotta">{platformCommissionEgp} EGP</strong></div>
            <div className="font-bold text-sm text-artisan-slate mt-1">Total Paid: {order.total_amount_egp} EGP</div>
          </div>
        </div>

        <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/buyer/orders" className="text-sm font-semibold text-artisan-terracotta hover:underline flex items-center space-x-1">
            <span>View All My Orders & Track Status</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link to="/catalog" className="bg-artisan-terracotta text-white text-xs font-medium px-5 py-2.5 rounded-lg hover:bg-artisan-terracotta-dark">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
