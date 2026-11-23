const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');
const { authenticateToken } = require('../middleware/authMiddleware');
const { sendOrderStatusWhatsAppNotification } = require('../services/whatsappService');

const SHIPPING_RATES = {
  EGYPT_POST: 40,
  PRIVATE_COURIER: 65,
  DIRECT_PICKUP: 0
};

// Calculate multi-seller split shipping totals
router.post('/calculate-shipping', (req, res) => {
  const { items, sellerShippingSelections } = req.body;
  // sellerShippingSelections: { [sellerId]: 'EGYPT_POST' | 'PRIVATE_COURIER' | 'DIRECT_PICKUP' }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  // Group items by seller
  const sellerMap = {};

  for (const item of items) {
    const product = db.prepare(`
      SELECT p.id, p.name, p.price_egp, p.stock_quantity, p.seller_profile_id,
        sp.store_name, sp.city as seller_city, sp.pickup_available
      FROM products p
      JOIN seller_profiles sp ON p.seller_profile_id = sp.id
      WHERE p.id = ?
    `).get(item.productId);

    if (!product) {
      return res.status(400).json({ error: `Product ID ${item.productId} not found.` });
    }

    if (item.quantity > product.stock_quantity) {
      return res.status(400).json({
        error: `Requested quantity (${item.quantity}) for "${product.name}" exceeds available stock (${product.stock_quantity}).`
      });
    }

    if (!sellerMap[product.seller_profile_id]) {
      sellerMap[product.seller_profile_id] = {
        sellerId: product.seller_profile_id,
        storeName: product.store_name,
        sellerCity: product.seller_city,
        pickupAvailable: product.pickup_available === 1,
        subtotalEgp: 0,
        items: []
      };
    }

    const itemSubtotal = product.price_egp * item.quantity;
    sellerMap[product.seller_profile_id].subtotalEgp += itemSubtotal;
    sellerMap[product.seller_profile_id].items.push({
      productId: product.id,
      name: product.name,
      priceEgp: product.price_egp,
      quantity: item.quantity,
      totalPriceEgp: itemSubtotal
    });
  }

  // Calculate per-seller shipping and totals
  let combinedShippingTotal = 0;
  let productsSubtotal = 0;
  const sellerShipmentsBreakdown = [];

  for (const sellerId in sellerMap) {
    const seller = sellerMap[sellerId];
    productsSubtotal += seller.subtotalEgp;

    // Selected shipping method for this seller
    const chosenMethod = sellerShippingSelections && sellerShippingSelections[sellerId]
      ? sellerShippingSelections[sellerId]
      : 'EGYPT_POST';

    // Verify pickup availability
    const finalMethod = (chosenMethod === 'DIRECT_PICKUP' && !seller.pickupAvailable)
      ? 'EGYPT_POST'
      : chosenMethod;

    const shippingCost = SHIPPING_RATES[finalMethod] !== undefined ? SHIPPING_RATES[finalMethod] : 40;
    combinedShippingTotal += shippingCost;

    // 2% Platform Commission calculation
    const commissionEgp = Math.round(seller.subtotalEgp * 0.02 * 100) / 100;
    const netSellerEgp = Math.round((seller.subtotalEgp - commissionEgp) * 100) / 100;

    sellerShipmentsBreakdown.push({
      sellerId: seller.sellerId,
      storeName: seller.storeName,
      sellerCity: seller.sellerCity,
      pickupAvailable: seller.pickupAvailable,
      subtotalEgp: seller.subtotalEgp,
      commissionEgp,   // 2%
      netSellerEgp,     // 98%
      chosenShippingMethod: finalMethod,
      shippingCostEgp: shippingCost,
      items: seller.items
    });
  }

  return res.json({
    productsSubtotal,
    combinedShippingTotal,
    sellerShipmentsBreakdown
  });
});

// Place Order
router.post('/place-order', authenticateToken, async (req, res) => {
  const {
    items,
    shippingFullName,
    shippingPhone,
    shippingAddress,
    shippingCity,
    shippingGovernorate,
    paymentMethod, // 'CARD', 'WALLET', 'COD'
    sellerShippingSelections,
    paymentToken // Sandbox payment token from client
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cannot place order with empty cart.' });
  }

  if (!shippingFullName || !shippingPhone || !shippingAddress || !shippingCity || !shippingGovernorate) {
    return res.status(400).json({ error: 'Please provide complete delivery address details.' });
  }

  const validPaymentMethods = ['CARD', 'WALLET', 'COD'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ error: 'Invalid payment method selected.' });
  }

  // 1. Group & validate items & stock
  const sellerMap = {};
  let productsSubtotal = 0;

  for (const item of items) {
    const product = db.prepare(`
      SELECT p.id, p.name, p.price_egp, p.stock_quantity, p.seller_profile_id,
        sp.store_name, sp.city as seller_city, sp.pickup_available
      FROM products p
      JOIN seller_profiles sp ON p.seller_profile_id = sp.id
      WHERE p.id = ?
    `).get(item.productId);

    if (!product) {
      return res.status(400).json({ error: `Product "${item.productId}" no longer exists.` });
    }

    if (item.quantity > product.stock_quantity) {
      return res.status(400).json({
        error: `Stock limit exceeded for "${product.name}". Available stock: ${product.stock_quantity}, requested: ${item.quantity}.`
      });
    }

    if (!sellerMap[product.seller_profile_id]) {
      sellerMap[product.seller_profile_id] = {
        sellerId: product.seller_profile_id,
        subtotalEgp: 0,
        pickupAvailable: product.pickup_available === 1,
        items: []
      };
    }

    const itemSubtotal = product.price_egp * item.quantity;
    productsSubtotal += itemSubtotal;
    sellerMap[product.seller_profile_id].subtotalEgp += itemSubtotal;
    sellerMap[product.seller_profile_id].items.push({
      productId: product.id,
      name: product.name,
      unitPriceEgp: product.price_egp,
      quantity: item.quantity,
      totalPriceEgp: itemSubtotal
    });
  }

  // 2. Calculate Split Shipping per Seller
  let totalShippingEgp = 0;
  const shipmentsData = [];

  for (const sellerId in sellerMap) {
    const seller = sellerMap[sellerId];
    const chosenMethod = sellerShippingSelections && sellerShippingSelections[sellerId]
      ? sellerShippingSelections[sellerId]
      : 'EGYPT_POST';

    const finalMethod = (chosenMethod === 'DIRECT_PICKUP' && !seller.pickupAvailable)
      ? 'EGYPT_POST'
      : chosenMethod;

    const shippingCost = SHIPPING_RATES[finalMethod] !== undefined ? SHIPPING_RATES[finalMethod] : 40;
    totalShippingEgp += shippingCost;

    const commissionEgp = Math.round(seller.subtotalEgp * 0.02 * 100) / 100;
    const netSellerEgp = Math.round((seller.subtotalEgp - commissionEgp) * 100) / 100;

    shipmentsData.push({
      sellerProfileId: sellerId,
      shippingMethod: finalMethod,
      shippingCostEgp: shippingCost,
      sellerSubtotalEgp: seller.subtotalEgp,
      sellerCommissionEgp: commissionEgp,
      sellerNetAmountEgp: netSellerEgp,
      items: seller.items
    });
  }

  // 3. Platform Commission Total (Exact 2%)
  const totalPlatformCommissionEgp = Math.round(productsSubtotal * 0.02 * 100) / 100;

  // 4. Gateway Fees Calculation
  // Card & Wallet: 2.5% + 3 EGP gateway fee. COD: 0 EGP.
  let gatewayFeeEgp = 0;
  if (paymentMethod === 'CARD' || paymentMethod === 'WALLET') {
    gatewayFeeEgp = Math.round((productsSubtotal * 0.025 + 3) * 100) / 100;
  }

  const grandTotalEgp = productsSubtotal + totalShippingEgp + gatewayFeeEgp;

  // 5. Payment Transaction Simulation (Never store raw card info!)
  const paymentTransactionId = paymentMethod === 'COD'
    ? null
    : (paymentToken ? `TXN-SANDBOX-${paymentToken.slice(-8)}` : `TXN-SANDBOX-${Date.now()}`);

  const paymentStatus = paymentMethod === 'COD' ? 'COD_PENDING' : 'PAID';

  const orderId = `FB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // 6. DB Transaction: Insert Order, Shipments, Order Items, & Decrement Stock
  try {
    db.transaction(() => {
      // Insert Order
      db.prepare(`
        INSERT INTO orders (id, buyer_id, status, payment_method, payment_status, payment_transaction_id, subtotal_egp, total_shipping_egp, total_gateway_fee_egp, total_amount_egp, total_platform_commission_egp, shipping_full_name, shipping_phone, shipping_address, shipping_city, shipping_governorate)
        VALUES (?, ?, 'CONFIRMED', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        orderId,
        req.user.id,
        paymentMethod,
        paymentStatus,
        paymentTransactionId,
        productsSubtotal,
        totalShippingEgp,
        gatewayFeeEgp,
        grandTotalEgp,
        totalPlatformCommissionEgp,
        shippingFullName.trim(),
        shippingPhone.trim(),
        shippingAddress.trim(),
        shippingCity.trim(),
        shippingGovernorate.trim()
      );

      // Insert Shipments & Items & Decrement Stock
      for (const shipment of shipmentsData) {
        const shipmentId = uuidv4();
        db.prepare(`
          INSERT INTO order_shipments (id, order_id, seller_profile_id, shipping_method, shipping_cost_egp, seller_subtotal_egp, seller_commission_egp, seller_net_amount_egp, fulfillment_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')
        `).run(
          shipmentId,
          orderId,
          shipment.sellerProfileId,
          shipment.shippingMethod,
          shipment.shippingCostEgp,
          shipment.sellerSubtotalEgp,
          shipment.sellerCommissionEgp,
          shipment.sellerNetAmountEgp
        );

        for (const item of shipment.items) {
          const itemId = uuidv4();
          db.prepare(`
            INSERT INTO order_items (id, order_id, shipment_id, product_id, product_name, unit_price_egp, quantity, total_price_egp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            itemId,
            orderId,
            shipmentId,
            item.productId,
            item.name,
            item.unitPriceEgp,
            item.quantity,
            item.totalPriceEgp
          );

          // Decrement product stock
          db.prepare('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?').run(item.quantity, item.productId);
        }
      }
    })();

    const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const shipments = db.prepare('SELECT * FROM order_shipments WHERE order_id = ?').all(orderId);

    // Send WhatsApp notification for order confirmation
    const whatsappNotification = await sendOrderStatusWhatsAppNotification({
      order: createdOrder,
      shipment: shipments[0],
      newStatus: 'CONFIRMED'
    });

    return res.status(201).json({
      message: 'Order placed successfully!',
      order: createdOrder,
      shipmentsCount: shipments.length,
      platformCommissionEgp: totalPlatformCommissionEgp,
      whatsappNotification
    });
  } catch (err) {
    console.error('Order placement error:', err);
    return res.status(500).json({ error: 'Failed to place order. Please try again.' });
  }
});

// Get Buyer Orders
router.get('/orders', authenticateToken, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC').all(req.user.id);

  const ordersWithDetails = orders.map(order => {
    const shipments = db.prepare(`
      SELECT s.*, sp.store_name, sp.city as seller_city
      FROM order_shipments s
      JOIN seller_profiles sp ON s.seller_profile_id = sp.id
      WHERE s.order_id = ?
    `).all(order.id);

    const shipmentsWithItems = shipments.map(shipment => {
      const items = db.prepare('SELECT * FROM order_items WHERE shipment_id = ?').all(shipment.id);
      return { ...shipment, items };
    });

    return {
      ...order,
      shipments: shipmentsWithItems
    };
  });

  return res.json({ orders: ordersWithDetails });
});

module.exports = router;
