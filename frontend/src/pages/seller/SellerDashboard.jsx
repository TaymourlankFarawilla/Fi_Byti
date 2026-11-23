import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Store, Upload, ShieldCheck, Clock, AlertTriangle, Plus, Edit, Trash2,
  Package, DollarSign, Truck, CheckCircle2, FileText, Ban
} from 'lucide-react';

export default function SellerDashboard() {
  const { user, sellerProfile, token, fetchMe } = useAuth();
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();

  // Route protection
  useEffect(() => {
    if (!user || user.role !== 'SELLER') {
      navigate('/login');
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders' | 'financials' | 'verification'
  const [profileData, setProfileData] = useState(null);
  const [verificationDoc, setVerificationDoc] = useState(null);
  const [products, setProducts] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Upload Identity Document state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docUploadMsg, setDocUploadMsg] = useState('');

  // Product Modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  // Product Form fields
  const [prodName, setProdName] = useState('');
  const [prodCatId, setProdCatId] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodMaterials, setProdMaterials] = useState('');
  const [prodSize, setProdSize] = useState('');
  const [prodWeight, setProdWeight] = useState('0.5');
  const [prodPackaging, setProdPackaging] = useState('Corrugated craft box with eco cushioning');
  const [prodLeadTime, setProdLeadTime] = useState('2');
  const [prodStock, setProdStock] = useState('10');
  const [prodStatus, setProdStatus] = useState('PUBLISHED');
  const [prodPhotoFiles, setProdPhotoFiles] = useState([]);
  const [samplePhotoUrl, setSamplePhotoUrl] = useState('https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80');
  const [submittingProd, setSubmittingProd] = useState(false);

  // Shipment Update Modal state
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [newFulfillmentStatus, setNewFulfillmentStatus] = useState('CONFIRMED');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrierNotes, setCarrierNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateResult, setStatusUpdateResult] = useState(null);

  useEffect(() => {
    if (token) {
      loadSellerProfile();
      loadCategories();
      loadProducts();
      loadOrders();
      loadAnalytics();
    }
  }, [token]);

  const loadSellerProfile = async () => {
    try {
      const res = await fetch('/api/seller/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.profile) {
        setProfileData(data.profile);
        setVerificationDoc(data.verificationDoc);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
        setProdCatId(data.categories[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/seller/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (e) {
      console.error(e);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/seller/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.shipments) setShipments(data.shipments);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/seller/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.summary) setAnalytics(data.summary);
    } catch (e) {
      console.error(e);
    }
  };

  // Upload Verification Document
  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a PDF, JPG, or PNG file (up to 5 MB).');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5 MB limit. Please select a smaller file.');
      return;
    }

    setUploadingDoc(true);
    setDocUploadMsg('');

    const formData = new FormData();
    formData.append('identityDocument', selectedFile);

    try {
      const res = await fetch('/api/seller/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      setUploadingDoc(false);

      if (!res.ok) throw new Error(data.error || 'Upload failed.');

      setDocUploadMsg(data.message);
      setProfileData(data.profile);
      setVerificationDoc(data.document);
      fetchMe();
    } catch (err) {
      setUploadingDoc(false);
      alert(err.message);
    }
  };

  // Open Product Modal
  const openProductModal = (product = null) => {
    const defaultCatId = categories.length > 0 ? categories[0].id : 'cat-pottery';

    if (product) {
      setEditingProduct(product);
      setProdName(product.name);
      setProdCatId(product.category_id || defaultCatId);
      setProdDesc(product.description);
      setProdPrice(product.price_egp.toString());
      setProdMaterials(product.materials);
      setProdSize(product.size_dimensions);
      setProdWeight(product.weight_kg.toString());
      setProdPackaging(product.packaging_details);
      setProdLeadTime(product.production_time_days.toString());
      setProdStock(product.stock_quantity.toString());
      setProdStatus(product.status);
      setSamplePhotoUrl(product.primary_image || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80');
    } else {
      setEditingProduct(null);
      setProdName('');
      setProdCatId(defaultCatId);
      setProdDesc('');
      setProdPrice('500');
      setProdMaterials('Handcrafted Egyptian Clay / Cotton');
      setProdSize('Standard size');
      setProdWeight('0.5');
      setProdPackaging('Corrugated craft box with eco cushioning');
      setProdLeadTime('2');
      setProdStock('10');
      setProdStatus('PUBLISHED');
      setSamplePhotoUrl('https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80');
    }
    setProductModalOpen(true);
  };

  // Submit Product Form
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const targetCatId = prodCatId || (categories[0] ? categories[0].id : 'cat-pottery');

    if (!prodName.trim() || !targetCatId || !prodDesc.trim() || !prodPrice || !prodMaterials.trim()) {
      alert('Please fill in all required product fields (Title, Category, Price, Description, Materials).');
      return;
    }

    setSubmittingProd(true);

    const formData = new FormData();
    formData.append('name', prodName.trim());
    formData.append('categoryId', targetCatId);
    formData.append('description', prodDesc.trim());
    formData.append('priceEgp', prodPrice);
    formData.append('materials', prodMaterials.trim());
    formData.append('sizeDimensions', prodSize.trim() || 'Standard');
    formData.append('weightKg', prodWeight || '0.5');
    formData.append('packagingDetails', prodPackaging.trim() || 'Safe protective craft packaging');
    formData.append('productionTimeDays', prodLeadTime || '2');
    formData.append('stockQuantity', prodStock || '10');
    formData.append('status', prodStatus || 'PUBLISHED');

    if (samplePhotoUrl) {
      formData.append('existingPhotoUrls', samplePhotoUrl);
    }

    if (prodPhotoFiles && prodPhotoFiles.length > 0) {
      for (let i = 0; i < prodPhotoFiles.length; i++) {
        formData.append('photos', prodPhotoFiles[i]);
      }
    }

    try {
      const url = editingProduct ? `/api/seller/products/${editingProduct.id}` : '/api/seller/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      setSubmittingProd(false);

      if (!res.ok) throw new Error(data.error || 'Failed to save product listing.');

      setProductModalOpen(false);
      loadProducts();
    } catch (err) {
      setSubmittingProd(false);
      alert(err.message);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) loadProducts();
    } catch (e) {
      console.error(e);
    }
  };

  // Update Shipment Fulfillment Status
  const handleUpdateShipmentStatus = async (e) => {
    e.preventDefault();
    if (!selectedShipment) return;

    setUpdatingStatus(true);
    setStatusUpdateResult(null);

    try {
      const res = await fetch(`/api/seller/shipments/${selectedShipment.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fulfillmentStatus: newFulfillmentStatus,
          trackingNumber,
          carrierNotes
        })
      });

      const data = await res.json();
      setUpdatingStatus(false);

      if (!res.ok) throw new Error(data.error || 'Failed to update status.');

      setStatusUpdateResult(data);
      loadOrders();
      loadAnalytics();
    } catch (err) {
      setUpdatingStatus(false);
      alert(err.message);
    }
  };

  const status = profileData ? profileData.status : 'PENDING_VERIFICATION';
  const isApproved = status === 'APPROVED';
  const isSuspended = status === 'SUSPENDED';

  if (!user || user.role !== 'SELLER') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Verification Status Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-artisan-terracotta/20 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-12 h-12 rounded-xl bg-artisan-terracotta text-white flex items-center justify-center font-serif font-bold text-2xl">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-artisan-slate dark:text-white">
                {profileData ? profileData.store_name : t('artisanPortal')}
              </h1>
              <p className="text-xs text-artisan-slate/60 dark:text-slate-400">
                Independent Artisan Seller Portal • {profileData ? `${profileData.city}, ${profileData.governorate}` : ''}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div>
            {status === 'APPROVED' && (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 rtl:space-x-reverse">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Store Active & Verified</span>
              </span>
            )}
            {status === 'PENDING_VERIFICATION' && (
              <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 rtl:space-x-reverse">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Verification Pending Review</span>
              </span>
            )}
            {status === 'SUSPENDED' && (
              <span className="bg-red-100 text-red-800 border border-red-300 px-3.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 rtl:space-x-reverse">
                <Ban className="w-4 h-4 text-red-600" />
                <span>Store Suspended by Admin</span>
              </span>
            )}
            {status === 'REJECTED' && (
              <span className="bg-red-100 text-red-800 border border-red-300 px-3.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 rtl:space-x-reverse">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Verification Rejected</span>
              </span>
            )}
          </div>
        </div>

        {/* Store Suspended Notice */}
        {isSuspended && (
          <div className="bg-red-50 dark:bg-red-950 p-4 rounded-xl border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-300 space-y-1">
            <div className="font-bold flex items-center space-x-2 rtl:space-x-reverse">
              <Ban className="w-4 h-4 text-red-600" />
              <span>Notice: Your store has been suspended by administration.</span>
            </div>
            <p>Your products are temporarily hidden from the public marketplace catalog until re-activated by an administrator.</p>
          </div>
        )}

        {/* Verification Status Warning if pending */}
        {status === 'PENDING_VERIFICATION' && (
          <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <div className="font-bold flex items-center space-x-2 rtl:space-x-reverse">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Identity Verification Required</span>
            </div>
            <p>
              Under platform security policies, your store remains inactive until an administrator reviews and approves your identity document submission.
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 space-x-8 rtl:space-x-reverse text-sm font-medium">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 transition ${activeTab === 'products' ? 'border-artisan-terracotta text-artisan-terracotta font-bold' : 'border-transparent text-gray-500 hover:text-artisan-slate'}`}
        >
          {t('manageListings')} ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition ${activeTab === 'orders' ? 'border-artisan-terracotta text-artisan-terracotta font-bold' : 'border-transparent text-gray-500 hover:text-artisan-slate'}`}
        >
          {t('myOrders')} ({shipments.length})
        </button>
        <button
          onClick={() => setActiveTab('financials')}
          className={`pb-3 border-b-2 transition ${activeTab === 'financials' ? 'border-artisan-terracotta text-artisan-terracotta font-bold' : 'border-transparent text-gray-500 hover:text-artisan-slate'}`}
        >
          {t('netEarnings')}
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          className={`pb-3 border-b-2 transition ${activeTab === 'verification' ? 'border-artisan-terracotta text-artisan-terracotta font-bold' : 'border-transparent text-gray-500 hover:text-artisan-slate'}`}
        >
          {t('sellerVerificationTitle')}
        </button>
      </div>

      {/* TAB 1: PRODUCT LISTINGS (ISOLATED TO LOGGED IN SELLER) */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-artisan-slate dark:text-white">{t('manageListings')}</h3>

            <button
              onClick={() => openProductModal()}
              disabled={!isApproved}
              className={`px-4 py-2.5 rounded-xl font-medium text-xs flex items-center space-x-2 rtl:space-x-reverse text-white shadow-sm transition ${
                isApproved ? 'bg-artisan-terracotta hover:bg-artisan-terracotta-dark' : 'bg-gray-300 cursor-not-allowed'
              }`}
              title={!isApproved ? 'Requires Approved Verification status' : 'Add New Product'}
            >
              <Plus className="w-4 h-4" />
              <span>{t('publishProduct')}</span>
            </button>
          </div>

          {products.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-gray-300 dark:border-slate-800 text-center space-y-3">
              <Package className="w-12 h-12 text-artisan-terracotta mx-auto" />
              <h4 className="font-serif font-bold text-base text-artisan-slate dark:text-white">No Listings Created Yet for Your Store</h4>
              <p className="text-xs text-artisan-slate/60 dark:text-slate-400 max-w-md mx-auto">
                Once approved, you can publish your handmade products with name, price in EGP, materials, dimensions, weight, and photos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-artisan-terracotta/20 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="h-44 rounded-xl overflow-hidden bg-artisan-sand dark:bg-slate-800 relative">
                      <img src={product.primary_image} alt="" className="w-full h-full object-cover" />
                      <span className="absolute top-2 right-2 badge-gold text-[10px] uppercase font-bold">
                        Stock: {product.stock_quantity}
                      </span>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-artisan-terracotta uppercase">{product.category_name}</div>
                      <h4 className="font-serif font-bold text-base text-artisan-slate dark:text-white line-clamp-1">{product.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mt-1">{product.materials}</p>
                    </div>

                    <div className="text-xs space-y-1 text-gray-600 dark:text-slate-300 border-t dark:border-slate-800 pt-2">
                      <div><strong>Dimensions:</strong> {product.size_dimensions}</div>
                      <div><strong>Weight:</strong> {product.weight_kg} kg • <strong>Lead Time:</strong> {product.production_time_days} days</div>
                    </div>
                  </div>

                  <div className="border-t dark:border-slate-800 pt-3 flex items-center justify-between">
                    <div className="font-bold text-base text-artisan-slate dark:text-white">{product.price_egp} {t('egp')}</div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <button onClick={() => openProductModal(product)} className="p-2 text-gray-500 hover:text-artisan-terracotta">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORDERS & FULFILLMENT (ISOLATED TO LOGGED IN SELLER) */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h3 className="font-serif font-bold text-lg text-artisan-slate dark:text-white">{t('myOrders')}</h3>

          {shipments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border dark:border-slate-800 text-center text-xs text-gray-500 dark:text-slate-400">
              No orders received yet for your store.
            </div>
          ) : (
            <div className="space-y-4">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-artisan-terracotta/20 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b dark:border-slate-800 pb-3">
                    <div>
                      <span className="text-gray-500">Buyer:</span> <strong className="text-artisan-slate dark:text-white font-bold">{shipment.shipping_full_name}</strong>
                      <span className="text-gray-400 ml-3">📍 {shipment.shipping_city}, {shipment.shipping_governorate}</span>
                    </div>

                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <span className="badge-olive">Carrier: {shipment.shipping_method}</span>
                      <span className="font-bold uppercase text-artisan-terracotta">Status: {shipment.fulfillment_status}</span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-1">
                    {shipment.items.map((item) => (
                      <div key={item.id} className="flex justify-between py-1 text-gray-700 dark:text-slate-300">
                        <span>{item.product_name} x {item.quantity}</span>
                        <span className="font-bold">{item.total_price_egp} {t('egp')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t dark:border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-4">
                    <div className="text-gray-600 dark:text-slate-300">
                      <div>Gross Amount: <strong>{shipment.seller_subtotal_egp} EGP</strong></div>
                      <div>2% Platform Commission: <strong>{shipment.seller_commission_egp} EGP</strong></div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-bold">Your Net Payout (98%): {shipment.seller_net_amount_egp} EGP</div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedShipment(shipment);
                        setNewFulfillmentStatus(shipment.fulfillment_status);
                        setTrackingNumber(shipment.tracking_number || '');
                        setStatusUpdateResult(null);
                      }}
                      className="bg-artisan-terracotta text-white px-4 py-2 rounded-lg font-medium text-xs hover:bg-artisan-terracotta-dark"
                    >
                      Update Fulfillment Status & Trigger WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FINANCIALS & 2% COMMISSION (ISOLATED TO LOGGED IN SELLER) */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          <h3 className="font-serif font-bold text-lg text-artisan-slate dark:text-white">{t('netEarnings')}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-artisan-terracotta/20 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs text-gray-500 font-bold uppercase">{t('grossSales')}</span>
              <div className="text-3xl font-extrabold text-artisan-slate dark:text-white">{analytics ? analytics.grossSalesEgp : 0} {t('egp')}</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-amber-200 dark:border-amber-700 shadow-sm space-y-2">
              <span className="text-xs text-amber-800 dark:text-amber-300 font-bold uppercase">{t('commissionRate')}</span>
              <div className="text-3xl font-extrabold text-amber-700 dark:text-amber-300">{analytics ? analytics.platformCommissionEgp : 0} {t('egp')}</div>
              <p className="text-[11px] text-gray-400">{t('commissionDesc')}</p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-2">
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold uppercase">{t('netPayout')}</span>
              <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">{analytics ? analytics.netPayoutEgp : 0} {t('egp')}</div>
              <p className="text-[11px] text-emerald-800/70 dark:text-emerald-400">Direct net earnings</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IDENTITY VERIFICATION UPLOAD */}
      {activeTab === 'verification' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-artisan-terracotta/20 dark:border-slate-800 shadow-sm space-y-6 max-w-2xl">
          <h3 className="font-serif font-bold text-lg text-artisan-slate dark:text-white border-b dark:border-slate-800 pb-3 flex items-center space-x-2 rtl:space-x-reverse">
            <ShieldCheck className="w-5 h-5 text-artisan-terracotta" />
            <span>{t('sellerVerificationTitle')} (PDF, JPG, PNG &lt; 5 MB)</span>
          </h3>

          <p className="text-xs text-artisan-slate/70 dark:text-slate-300 leading-relaxed">
            Required under platform guidelines and Law 151/2020. Upload your National ID or Commercial Register document. Your document is stored securely in encrypted private file storage and restricted strictly to authorized administrators.
          </p>

          {docUploadMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs font-medium">
              {docUploadMsg}
            </div>
          )}

          {verificationDoc && (
            <div className="bg-artisan-sand dark:bg-slate-800 p-4 rounded-xl border border-artisan-terracotta/20 dark:border-slate-700 space-y-1 text-xs">
              <div className="font-bold text-artisan-slate dark:text-white">Current Uploaded Document:</div>
              <div>Filename: {verificationDoc.original_filename}</div>
              <div>File Format: {verificationDoc.file_type}</div>
              <div>File Size: {(verificationDoc.file_size / (1024 * 1024)).toFixed(2)} MB</div>
              <div className="text-gray-400">Uploaded: {new Date(verificationDoc.uploaded_at).toLocaleString()}</div>
            </div>
          )}

          <form onSubmit={handleDocUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-artisan-slate dark:text-slate-200 mb-2">Select Identity File (PDF, JPG, PNG up to 5MB):</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-artisan-terracotta file:text-white hover:file:bg-artisan-terracotta-dark"
              />
            </div>

            <button
              type="submit"
              disabled={uploadingDoc}
              className="bg-artisan-terracotta text-white font-medium text-xs px-6 py-3 rounded-xl hover:bg-artisan-terracotta-dark shadow-sm"
            >
              {uploadingDoc ? 'Uploading...' : 'Submit Identity Document for Admin Review'}
            </button>
          </form>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-artisan-slate dark:text-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-4">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-artisan-slate dark:text-white">
                {editingProduct ? 'Edit Product Listing' : t('publishProduct')}
              </h3>
              <button onClick={() => setProductModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Fayoum Glazed Clay Jug"
                    className="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Craft Category *</label>
                  <select
                    required
                    value={prodCatId}
                    onChange={(e) => setProdCatId(e.target.value)}
                    className="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-sm"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{isRtl && c.name_ar ? c.name_ar : c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Price in EGP *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="680"
                    className="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Product Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    placeholder="Describe craft technique, regional story, glazing, weave pattern..."
                    className="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Craft Materials *</label>
                  <input
                    type="text"
                    required
                    value={prodMaterials}
                    onChange={(e) => setProdMaterials(e.target.value)}
                    placeholder="Red Nile Terracotta Clay, Glaze"
                    className="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Size & Dimensions *</label>
                  <input
                    type="text"
                    required
                    value={prodSize}
                    onChange={(e) => setProdSize(e.target.value)}
                    placeholder="Height: 25cm, Dia: 18cm"
                    className="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={prodWeight}
                    onChange={(e) => setProdWeight(e.target.value)}
                    className="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Production Lead Time (Days) *</label>
                  <input
                    type="number"
                    required
                    value={prodLeadTime}
                    onChange={(e) => setProdLeadTime(e.target.value)}
                    className="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Available Quantity (Stock) *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Listing Status</label>
                  <select
                    value={prodStatus}
                    onChange={(e) => setProdStatus(e.target.value)}
                    className="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-sm"
                  >
                    <option value="PUBLISHED">Published (Visible in Catalog)</option>
                    <option value="DRAFT">Draft</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Packaging Details *</label>
                  <input
                    type="text"
                    required
                    value={prodPackaging}
                    onChange={(e) => setProdPackaging(e.target.value)}
                    placeholder="Corrugated craft box with eco-friendly cushioning"
                    className="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Sample Photo Image URL (Optional)</label>
                  <input
                    type="text"
                    value={samplePhotoUrl}
                    onChange={(e) => setSamplePhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="border-t dark:border-slate-800 pt-4 flex justify-end space-x-3 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-slate-300 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProd}
                  className="px-5 py-2 bg-artisan-terracotta text-white rounded-lg font-bold"
                >
                  {submittingProd ? 'Saving...' : 'Save Product Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE SHIPMENT STATUS MODAL */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-artisan-slate dark:text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-artisan-slate dark:text-white">Update Shipment Fulfillment Status</h3>
              <button onClick={() => setSelectedShipment(null)} className="text-gray-400 font-bold">✕</button>
            </div>

            {statusUpdateResult && (
              <div className="bg-emerald-950 text-emerald-100 p-4 rounded-xl text-xs space-y-2">
                <div className="font-bold text-emerald-400">✓ Status Updated & WhatsApp Triggered!</div>
                <div>{statusUpdateResult.whatsappNotification?.statusMessage}</div>
              </div>
            )}

            <form onSubmit={handleUpdateShipmentStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Fulfillment Status:</label>
                <select
                  value={newFulfillmentStatus}
                  onChange={(e) => setNewFulfillmentStatus(e.target.value)}
                  className="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-sm"
                >
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="IN_SHIPMENT">IN_SHIPMENT (Dispatched)</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Carrier Tracking Number:</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. EGPOST-98231-FAY"
                  className="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Carrier Notes:</label>
                <input
                  type="text"
                  value={carrierNotes}
                  onChange={(e) => setCarrierNotes(e.target.value)}
                  placeholder="Handed over to Egypt Post courier"
                  className="w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-sm"
                />
              </div>

              <div className="border-t dark:border-slate-800 pt-4 flex justify-end space-x-3 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => setSelectedShipment(null)}
                  className="px-4 py-2 border rounded-lg text-gray-600 dark:text-slate-300"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-5 py-2 bg-artisan-terracotta text-white rounded-lg font-bold"
                >
                  {updatingStatus ? 'Updating...' : 'Save & Trigger WhatsApp Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
