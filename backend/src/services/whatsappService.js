const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');

/**
 * WhatsApp Business API Integration Service
 * Supports live Meta WhatsApp Cloud API sending if credentials are set in environment:
 * - WHATSAPP_API_TOKEN
 * - WHATSAPP_PHONE_NUMBER_ID
 *
 * If credentials are missing, seamlessly logs to Demo Mode with explicit labels.
 */

async function sendOrderStatusWhatsAppNotification({ order, shipment, newStatus }) {
  const recipientPhone = order.shipping_phone || '201000000000';
  const whatsappApiToken = process.env.WHATSAPP_API_TOKEN;
  const whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  const isDemoMode = !whatsappApiToken || !whatsappPhoneId;

  const statusMessages = {
    CONFIRMED: `Hello ${order.shipping_full_name}! Your Fi Byti order #${order.id} has been confirmed by the artisan.`,
    IN_SHIPMENT: `Great news ${order.shipping_full_name}! Your Fi Byti shipment from store #${shipment ? shipment.seller_profile_id : 'Artisan'} is now IN SHIPMENT via ${shipment ? shipment.shipping_method : 'carrier'}. Tracking #: ${shipment && shipment.tracking_number ? shipment.tracking_number : 'FB-TRACK-' + order.id}`,
    DELIVERED: `Delivered! Your Fi Byti order #${order.id} has been safely delivered. Thank you for supporting independent Egyptian artisans!`,
    CANCELLED: `Notice: Your Fi Byti order #${order.id} status was updated to CANCELLED.`
  };

  const messageText = statusMessages[newStatus] || `Update: Your Fi Byti order #${order.id} status is now ${newStatus}.`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipientPhone.replace(/[^0-9]/g, ''),
    type: 'template',
    template: {
      name: 'order_status_update',
      language: { code: 'en_US' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: order.shipping_full_name },
            { type: 'text', text: order.id },
            { type: 'text', text: newStatus },
            { type: 'text', text: messageText }
          ]
        }
      ]
    }
  };

  let status = 'DEMO_SIMULATED';
  let statusMessage = 'Demo Mode: API credentials not configured. WhatsApp message was logged and simulated in Demo Inspector.';

  if (!isDemoMode) {
    try {
      // Live API fetch call simulation / endpoint post
      const response = await fetch(`https://graph.facebook.com/v19.0/${whatsappPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappApiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        status = 'SENT';
        statusMessage = 'Live WhatsApp message dispatched successfully via Meta WhatsApp Business Cloud API.';
      } else {
        const errJson = await response.json();
        status = 'FAILED';
        statusMessage = `WhatsApp API Error: ${errJson.error ? errJson.error.message : 'HTTP ' + response.status}`;
      }
    } catch (err) {
      status = 'FAILED';
      statusMessage = `Network error calling WhatsApp API: ${err.message}`;
    }
  }

  // Record audit log entry in database
  const logId = uuidv4();
  db.prepare(`
    INSERT INTO whatsapp_logs (id, order_id, recipient_phone, event_type, payload_json, status, is_demo_mode, status_message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    logId,
    order.id,
    recipientPhone,
    `ORDER_STATUS_${newStatus}`,
    JSON.stringify(payload, null, 2),
    status,
    isDemoMode ? 1 : 0,
    statusMessage
  );

  return {
    logId,
    isDemoMode,
    status,
    statusMessage,
    payload
  };
}

module.exports = {
  sendOrderStatusWhatsAppNotification
};
