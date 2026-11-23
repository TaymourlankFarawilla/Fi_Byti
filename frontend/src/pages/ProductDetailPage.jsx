import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Store, MapPin, Package, Clock, ShieldCheck, Truck, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/products/${id}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Product not found.');
      setProduct(data.product);
      if (data.product.images && data.product.images.length > 0) {
        setSelectedImage(data.product.images[0].image_url);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-artisan-terracotta border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-sm text-artisan-slate/70">Loading artisan product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-artisan-terracotta mx-auto mb-4" />
        <h2 className="text-2xl font-serif font-bold text-artisan-slate">Listing Not Found</h2>
        <p className="text-sm text-artisan-slate/60 mt-2">{error || 'This product does not exist or has been removed.'}</p>
        <Link to="/catalog" className="mt-6 inline-block bg-artisan-terracotta text-white px-6 py-2.5 rounded-lg text-sm font-medium">
          Return to Marketplace Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-artisan-slate/60 mb-6 flex items-center space-x-2">
        <Link to="/" className="hover:underline">Home</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:underline">Catalog</Link>
        <span>/</span>
        <span className="text-artisan-slate font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Photo Gallery */}
        <div className="space-y-4">
          <div className="h-96 sm:h-[450px] rounded-2xl overflow-hidden bg-artisan-sand border border-artisan-terracotta/20 shadow-sm relative">
            <img
              src={selectedImage || product.images[0]?.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                    selectedImage === img.image_url ? 'border-artisan-terracotta scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details & Purchasing */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="badge-terracotta font-semibold uppercase tracking-wider">{product.category_name}</span>
              {product.pickup_available === 1 && (
                <span className="badge-olive">Direct Pickup Available</span>
              )}
            </div>

            <h1 className="text-3xl font-serif font-bold text-artisan-slate leading-tight">{product.name}</h1>

            <div className="mt-4 flex items-baseline space-x-3">
              <span className="text-3xl font-extrabold text-artisan-slate">{product.price_egp}</span>
              <span className="text-base text-artisan-slate/60 font-medium">EGP</span>
              <span className="text-xs text-gray-400"> (Taxes included)</span>
            </div>
          </div>

          {/* Stock Status Indicator */}
          <div className="p-3 rounded-xl border flex items-center justify-between text-xs font-semibold">
            <span>Listing Status & Stock:</span>
            {isOutOfStock ? (
              <span className="text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                Out of Stock (0 units remaining)
              </span>
            ) : product.stock_quantity <= 3 ? (
              <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                ⚠️ Low Stock: Only {product.stock_quantity} left in stock!
              </span>
            ) : (
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                ✓ Available ({product.stock_quantity} items in stock)
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-serif font-bold text-sm text-artisan-slate mb-2">Artisan Description</h3>
            <p className="text-sm text-artisan-slate/80 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {/* Specifications Table */}
          <div className="bg-white p-5 rounded-xl border border-artisan-terracotta/15 space-y-3 text-xs">
            <h3 className="font-serif font-bold text-sm text-artisan-slate border-b pb-2">Craft Specifications</h3>

            <div className="grid grid-cols-2 gap-2">
              <div><strong className="text-gray-500">Materials:</strong> <p className="text-artisan-slate font-medium">{product.materials}</p></div>
              <div><strong className="text-gray-500">Dimensions:</strong> <p className="text-artisan-slate font-medium">{product.size_dimensions}</p></div>
              <div><strong className="text-gray-500">Weight:</strong> <p className="text-artisan-slate font-medium">{product.weight_kg} kg</p></div>
              <div><strong className="text-gray-500">Production Lead Time:</strong> <p className="text-artisan-slate font-medium">{product.production_time_days} business days</p></div>
            </div>

            <div className="border-t pt-2">
              <strong className="text-gray-500">Packaging Details:</strong>
              <p className="text-artisan-slate mt-0.5">{product.packaging_details}</p>
            </div>
          </div>

          {/* Quantity Selector & Add to Cart */}
          {!isOutOfStock && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                <label className="text-xs font-bold text-artisan-slate uppercase">Quantity:</label>
                <div className="flex items-center border rounded-lg bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 font-bold text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-400">Max available: {product.stock_quantity}</span>
              </div>

              <button
                onClick={() => addToCart(product, quantity)}
                className="w-full bg-artisan-terracotta text-white py-4 rounded-xl font-bold text-base hover:bg-artisan-terracotta-dark shadow-lg shadow-artisan-terracotta/20 transition flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add {quantity} to Dynamic Cart</span>
              </button>
            </div>
          )}

          {/* Seller Profile Banner */}
          <div className="bg-artisan-sand p-5 rounded-xl border border-artisan-terracotta/20 flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-artisan-terracotta text-white flex items-center justify-center font-serif font-bold text-xl shrink-0">
              {product.store_name ? product.store_name[0] : 'S'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-serif font-bold text-sm text-artisan-slate">{product.store_name}</h4>
                <span className="badge-olive text-[10px]">Verified Artisan</span>
              </div>
              <p className="text-xs text-artisan-slate/70 line-clamp-2">{product.store_bio || 'Independent Egyptian craft workshop.'}</p>
              <div className="text-[11px] text-artisan-slate/60 flex items-center space-x-3 pt-1">
                <span className="flex items-center space-x-1"><MapPin className="w-3.5 h-3.5 text-artisan-terracotta" /><span>{product.seller_city}, {product.seller_governorate}</span></span>
                {product.seller_address && <span className="text-gray-400">({product.seller_address})</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
