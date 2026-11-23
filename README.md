# 🏺 Fi Byti (في بيتي) - Responsive Egyptian Handmade Craft Marketplace

**Fi Byti (في بيتي)** is a responsive Egyptian web marketplace designed to connect independent artisan sellers across Egypt (Fayoum, Akhmim, Khan El-Khalili, Siwa) directly with craft lovers. The platform acts as an intermediary with a transparent **2% platform commission** on product sales.

---

## 🌐 Public Live Web Deployment & Repository

* **Live Public Website**: [https://taymourlankfarawilla.github.io/Fi_Byti/](https://taymourlankfarawilla.github.io/Fi_Byti/)
* **GitHub Repository**: [https://github.com/TaymourlankFarawilla/Fi_Byti](https://github.com/TaymourlankFarawilla/Fi_Byti)

---

## 👥 فريق العمل (Project Team Members)

* **تيمور لنك فراويلة** (Taymourlank Farawilla)
* **أحمد محمود** (Ahmed Mahmoud)
* **محمد صبري** (Mohamed Sabry)
* **دعاء محمود** (Doaa Mahmoud)
* **أماني أحمد** (Amani Ahmed)

---

## ✨ Key Features & MVP Scope

### 1. Accounts & Seller Verification
- Multi-role architecture: **Buyer**, **Seller**, and **Administrator**.
- Sellers submit identity verification documents (PDF, JPG, PNG up to 5 MB).
- Store remains inactive until an administrator manually reviews and approves the submission.
- Identity documents are protected in private storage and restricted to authorized admins.

### 2. Seller Products & Catalog
- Approved sellers manage handmade craft listings with name, description, EGP price, materials, dimensions, weight (kg), packaging details, lead time, stock count, and multi-photo gallery.
- Live stock availability tracking preventing purchases exceeding available inventory.

### 3. Dynamic Multi-Seller Cart & Split Shipping
- Cart groups items automatically per artisan studio shipment.
- Per-seller shipping selector: **Egypt Post** (40 EGP), **Private Express Courier** (65 EGP), and **Direct Seller Pickup** (0 EGP).
- Real-time product subtotals, per-seller shipping charges, and grand totals.

### 4. Checkout, Payment & 2% Commission Engine
- Approved payment options: **Electronic Wallets** (Vodafone Cash, InstaPay), **Bank Cards** (Visa/Mastercard sandbox tokenized - zero raw card storage), and **Cash on Delivery (COD)**.
- Transparent payment gateway fee breakdown (2.5% + 3 EGP for Card/Wallet, 0 EGP for COD).
- Exact **2% platform commission** on product sales with 98% net seller payout recording.

### 5. WhatsApp Status Notifications
- Dispatches status update notifications (`CONFIRMED`, `IN_SHIPMENT`, `DELIVERED`) to buyers.
- Integrated **Demo Mode Inspector** providing full WhatsApp Cloud API payload previews.

### 6. Compliance, Security & Performance
- Compliant with **Egypt Personal Data Protection Law No. 151 of 2020** (explicit registration consent & legal disclosures).
- **PCI DSS Compliant**: Tokenized checkout sandbox without raw card storage.
- Database response times **< 6 ms** under load.
- Automated daily backups + 1-click manual snapshot generator.

### 7. Arabic i18n & Dark Theme
- **Arabic Language Switcher**: Toggle `🌍 English` / `العربية` with complete Right-to-Left (RTL) layout support.
- **Light / Dark Mode**: Toggle `☀️ Light` / `🌙 Dark` mode across all pages.

---

## 👥 Demo Personas & Credentials

| Role | Name & Studio | Email | Password | Status |
| :--- | :--- | :--- | :--- | :--- |
| 🛡️ **Administrator** | Platform Admin | `admin@fibyti.eg` | `Admin123!` | Active Admin |
| 🏺 **Approved Seller 1** | Amina Fayoum Clay Studio | `artisan.amina@fibyti.eg` | `Seller123!` | Store Approved |
| 🧵 **Approved Seller 2** | Nile Looms Akhmim Textiles | `artisan.nile@fibyti.eg` | `Seller123!` | Store Approved |
| 💼 **Approved Seller 3** | Khedive Leather Cairo | `artisan.tarek@fibyti.eg` | `Seller123!` | Store Approved |
| 📄 **Pending Seller** | Siwa Oasis Salt & Silver | `artisan.siwa@fibyti.eg` | `Seller123!` | Pending Verification |
| 🛍️ **Buyer Account** | Sarah Mansour | `buyer.sarah@fibyti.eg` | `Buyer123!` | Active Buyer |

---

## 🚀 Local Installation & Setup

```bash
# 1. Clone repository
git clone https://github.com/TaymourlankFarawilla/Fi_Byti.git
cd Fi_Byti

# 2. Install dependencies
cmd /c npm run install:all

# 3. Seed database
cmd /c npm run seed

# 4. Start full-stack server
cmd /c npm start
```
Visit `http://localhost:5000` in your web browser.

---

## ⚙️ Automated Test Suite

Run the automated verification suite to validate all business rules:
```bash
cd backend && node test-suite.js
```

---
© 2026 Fi Byti (في بيتي) Marketplace. Crafted for Egyptian Artisans.
