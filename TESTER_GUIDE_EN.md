# 🧪 Fi Byti (في بيتي) - Complete Testing Guide (English)

Welcome to the comprehensive QA & Testing Guide for **Fi Byti (في بيتي)** Egyptian Handmade Craft Marketplace.

* **Live Public Deployment URL**: [https://taymourlankfarawilla.github.io/Fi_Byti/](https://taymourlankfarawilla.github.io/Fi_Byti/)
* **GitHub Repository**: [https://github.com/TaymourlankFarawilla/Fi_Byti](https://github.com/TaymourlankFarawilla/Fi_Byti)

---

## 👥 Pre-Configured Demo Personas & Credentials

You can sign in using any of the 6 demo credentials directly on the **Sign In** page (`/#/login`), where 1-click Quick Demo cards are provided for instant login:

| Role | Name & Studio | Email | Password | Status |
| :--- | :--- | :--- | :--- | :--- |
| 🛡️ **Administrator** | Platform Admin | `admin@fibyti.eg` | `Admin123!` | Active Admin |
| 🏺 **Approved Seller 1** | Amina Fayoum Clay Studio | `artisan.amina@fibyti.eg` | `Seller123!` | Store Approved |
| 🧵 **Approved Seller 2** | Nile Looms Akhmim Textiles | `artisan.nile@fibyti.eg` | `Seller123!` | Store Approved |
| 💼 **Approved Seller 3** | Khedive Leather Cairo | `artisan.tarek@fibyti.eg` | `Seller123!` | Store Approved |
| 📄 **Pending Seller** | Siwa Oasis Salt & Silver | `artisan.siwa@fibyti.eg` | `Seller123!` | Pending Verification |
| 🛍️ **Buyer Account** | Sarah Mansour | `buyer.sarah@fibyti.eg` | `Buyer123!` | Active Buyer |

> **Note**: You can also register a brand new custom account on the **Sign Up** page (`/#/register`) with your own email and password!

---

## 📋 Complete Step-by-Step Test Scenarios

### Test Scenario 1: Artisan Identity Verification & Admin Approval
1. Go to **Sign In** (`/#/login`) and click **Pending Verification Seller (Siwa Salt)**.
2. Open **Identity Verification Upload** tab in the Artisan Portal.
3. Observe store status is `PENDING_VERIFICATION` and identity document `Fatima_Siwa_National_ID.pdf` is attached.
4. Sign out and sign in as **Platform Administrator** (`admin@fibyti.eg` / `Admin123!`).
5. In the **Admin Dashboard**, notice the **Verification Queue** badge counter `(1)`.
6. Click **Inspect ID File (Secure Admin Route)** to inspect the protected verification document.
7. Click **Approve & Activate Seller Store**.
8. **Result**: The seller's status immediately updates to `APPROVED` and moves to the active sellers table.

---

### Test Scenario 2: Seller Product Creation & Stock Tracking
1. Sign in as **Amina (Approved Seller)** (`artisan.amina@fibyti.eg` / `Seller123!`).
2. Navigate to **Artisan Portal** -> **My Craft Listings**.
3. Click **Publish New Handmade Product**.
4. Fill out form fields:
   - **Title**: *Fayoum Terracotta Glazed Jug*
   - **Category**: *Pottery & Ceramics*
   - **Price in EGP**: *450*
   - **Materials**: *Natural Nile Clay, Cobalt Glaze*
   - **Dimensions**: *Height 22cm, Diameter 14cm*
   - **Weight**: *0.8 kg*
   - **Lead Time**: *2 days*
   - **Stock Quantity**: *10*
5. Click **Save Product Listing**.
6. **Result**: The new product is published instantly and appears in the live marketplace catalog.

---

### Test Scenario 3: Multi-Seller Cart & Split Shipping
1. Sign in as **Sarah (Buyer)** (`buyer.sarah@fibyti.eg` / `Buyer123!`).
2. Go to **Browse Marketplace** (`/#/catalog`).
3. Add **Fayoum Turquoise Glazed Clay Vase** (from Amina Fayoum Studio) to cart.
4. Add **Akhmim 100% Egyptian Cotton Throw** (from Nile Looms) to cart.
5. Open **Cart** (`/#/cart`).
6. Notice items are grouped into 2 distinct **Artisan Studio Shipments**.
7. Select shipping per seller:
   - *Amina Studio*: Select **Egypt Post** (40 EGP).
   - *Nile Looms*: Select **Private Express Courier** (65 EGP) or **Direct Pickup** (0 EGP).
8. Observe combined shipping total and grand total automatically update.

---

### Test Scenario 4: Checkout, Gateway Fees & 2% Platform Commission
1. Click **Proceed to Checkout**.
2. Enter delivery address details (Full Name, Phone Number, Governorate, City, Street Address).
3. Select Payment Option:
   - **E-Wallets** (Vodafone Cash / InstaPay)
   - **Bank Cards** (Visa / Mastercard test card `4242 4242 4242 4242`)
   - **Cash on Delivery (COD)**
4. Note transparent payment gateway fee (2.5% + 3 EGP for Card/Wallet, 0 EGP for COD).
5. Click **Confirm Order**.
6. **Result**: Order is confirmed (`#FB-2026-XXXX`). The system records the exact **2% Platform Commission** on product subtotal and 98% net seller earnings.

---

### Test Scenario 5: Order Status Update & WhatsApp Demo Inspector
1. Sign in as **Amina (Approved Seller)** -> **Orders & Fulfillment**.
2. Click **Update Fulfillment Status & Trigger WhatsApp**.
3. Change status from `CONFIRMED` to `IN_SHIPMENT`, enter tracking number `EGPOST-98231-FAY`, and submit.
4. Observe the green WhatsApp notification box showing the exact Meta WhatsApp Business API JSON payload.
5. Sign in as **Platform Administrator** -> **WhatsApp Demo Inspector** tab to view the complete audit log of all simulated messages.

---

### Test Scenario 6: Resetting Demo Data
1. Scroll to the **Footer** on any page or go to the **Sign In** page.
2. Click **Reset Demo Data (إعادة ضبط البيانات التجريبية)**.
3. Confirm the dialog prompt.
4. **Result**: All local database modifications reset back to pristine initial seed state.

---

## 🌍 Language & Dark Theme Testing
- Click `🌍 English` / `العربية` in the Navbar to switch between English and Arabic with complete RTL layout support.
- Click `☀️` / `🌙` in the Navbar to toggle between Light mode and Dark mode.
