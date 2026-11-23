import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('fibyti_cart');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      // Filter out invalid items
      return Array.isArray(parsed) ? parsed.filter(i => i && i.productId && i.sellerProfileId) : [];
    } catch (e) {
      return [];
    }
  });

  const [sellerShippingSelections, setSellerShippingSelections] = useState(() => {
    const saved = localStorage.getItem('fibyti_shipping_selections');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('fibyti_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('fibyti_shipping_selections', JSON.stringify(sellerShippingSelections));
  }, [sellerShippingSelections]);

  const addToCart = (product, quantity = 1) => {
    if (!product || !product.id) return;

    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.productId === product.id);
      const stockAvailable = product.stock_quantity !== undefined ? product.stock_quantity : (product.stockQuantity || 10);

      if (existingIdx > -1) {
        const existing = prev[existingIdx];
        const newQty = existing.quantity + quantity;
        if (newQty > stockAvailable) {
          alert(`Cannot add more. Reached available stock limit (${stockAvailable} available).`);
          return prev;
        }
        const updated = [...prev];
        updated[existingIdx] = { ...existing, quantity: newQty };
        return updated;
      } else {
        if (quantity > stockAvailable) {
          alert(`Cannot add. Reached available stock limit (${stockAvailable} available).`);
          return prev;
        }
        return [...prev, {
          productId: product.id,
          name: product.name,
          priceEgp: product.price_egp,
          stockQuantity: stockAvailable,
          sellerProfileId: product.seller_id || product.seller_profile_id,
          storeName: product.store_name || 'Artisan Workshop',
          sellerCity: product.seller_city || product.city || 'Cairo',
          pickupAvailable: product.pickup_available === 1 || product.pickup_available === true,
          imageUrl: product.images && product.images[0] ? product.images[0].image_url : (product.primary_image || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80'),
          quantity
        }];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          if (newQuantity > item.stockQuantity) {
            alert(`Stock limit reached! Max available: ${item.stockQuantity}`);
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const setSellerShipping = (sellerId, method) => {
    setSellerShippingSelections(prev => ({
      ...prev,
      [sellerId]: method
    }));
  };

  const clearCart = () => {
    setCartItems([]);
    setSellerShippingSelections({});
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Group items by seller
  const groupedBySeller = cartItems.reduce((acc, item) => {
    const sId = item.sellerProfileId || 'default-seller';
    if (!acc[sId]) {
      acc[sId] = {
        sellerId: sId,
        storeName: item.storeName || 'Artisan Workshop',
        sellerCity: item.sellerCity || 'Cairo',
        pickupAvailable: item.pickupAvailable,
        items: [],
        subtotalEgp: 0
      };
    }
    const itemSubtotal = item.priceEgp * item.quantity;
    acc[sId].items.push(item);
    acc[sId].subtotalEgp += itemSubtotal;
    return acc;
  }, {});

  const subtotalEgp = cartItems.reduce((acc, item) => acc + item.priceEgp * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      groupedBySeller,
      totalItemsCount,
      subtotalEgp,
      sellerShippingSelections,
      addToCart,
      updateQuantity,
      removeFromCart,
      setSellerShipping,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
