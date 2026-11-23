import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PackageCheck, Truck, Store, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BuyerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('fibyti_token');
      const res = await fetch('/api/checkout/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-artisan-terracotta border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-xs text-gray-500">Loading your marketplace orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-serif font-bold text-artisan-slate">My Orders & Shipments</h1>
        <p className="text-sm text-artisan-slate/70 mt-1">Track your handmade craft orders and fulfillment status across artisan studios</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border text-center space-y-3">
          <PackageCheck className="w-12 h-12 text-artisan-terracotta mx-auto" />
          <h3 className="font-serif font-bold text-lg">No Orders Placed Yet</h3>
          <p className="text-xs text-gray-500">Discover authentic crafts from Fayoum, Akhmim, and Khan El-Khalili.</p>
          <Link to="/catalog" className="inline-block bg-artisan-terracotta text-white px-5 py-2.5 rounded-lg text-xs font-medium">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-artisan-terracotta/20 overflow-hidden shadow-sm space-y-4">

              {/* Order Header */}
              <div className="bg-artisan-sand p-4 border-b border-artisan-terracotta/15 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Order ID:</span> <strong className="font-mono text-sm text-artisan-slate">#{order.id}</strong>
                  <span className="text-gray-400 ml-3">• {new Date(order.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="badge-gold uppercase">{order.payment_method} ({order.payment_status})</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[11px] ${
                    order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                    order.status === 'IN_SHIPMENT' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Seller Shipments Breakdown */}
              <div className="p-4 space-y-4">
                <div className="text-xs font-bold text-gray-700">Artisan Shipments ({order.shipments.length}):</div>

                {order.shipments.map((shipment) => (
                  <div key={shipment.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                      <div className="flex items-center space-x-2">
                        <Store className="w-4 h-4 text-artisan-terracotta" />
                        <strong className="text-artisan-slate">{shipment.store_name}</strong>
                        <span className="text-gray-400">({shipment.seller_city})</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-600">Carrier: {shipment.shipping_method}</span>
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          shipment.fulfillment_status === 'DELIVERED' ? 'bg-emerald-600 text-white' :
                          shipment.fulfillment_status === 'IN_SHIPMENT' ? 'bg-sky-600 text-white' : 'bg-amber-600 text-white'
                        }`}>
                          {shipment.fulfillment_status}
                        </span>
                      </div>
                    </div>

                    {shipment.tracking_number && (
                      <div className="text-[11px] text-artisan-terracotta font-mono font-bold bg-white p-2 rounded border">
                        📦 Tracking Number: {shipment.tracking_number}
                      </div>
                    )}

                    {/* Shipment Items */}
                    <div className="space-y-1">
                      {shipment.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-1 text-gray-700">
                          <span>{item.product_name} x {item.quantity}</span>
                          <span className="font-bold">{item.total_price_egp} EGP</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="pt-2 border-t flex justify-between items-center text-xs">
                  <span className="text-gray-500">Shipping: {order.total_shipping_egp} EGP</span>
                  <span className="font-extrabold text-base text-artisan-slate">Grand Total: {order.total_amount_egp} EGP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
