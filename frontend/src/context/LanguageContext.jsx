import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    appName: "Fi Byti",
    appNameAr: "(في بيتي)",
    tagline: "Handmade Egyptian Crafts Marketplace",
    browseMarketplace: "Browse Marketplace",
    joinSeller: "Become a Seller / Join",
    myOrders: "My Orders",
    artisanPortal: "Artisan Portal",
    adminDashboard: "Admin Dashboard",
    signIn: "Sign In",
    signOut: "Sign Out",
    register: "Create Account / Join",
    searchPlaceholder: "Search clay vases, cotton throws, leather bags...",

    heroTitlePrefix: "Authentic Egyptian Crafts, Direct from Artisan",
    heroTitleSuffix: "Homes & Studios.",
    heroSubtitle: "Connecting independent Egyptian artisans from Tunis Village, Akhmim, Khan El-Khalili & Siwa directly with craft lovers. Fair platform 2% commission.",
    exploreCatalog: "Explore Marketplace",

    categoriesTitle: "Explore Egyptian Craft Heritage",
    categoriesSubtitle: "Shop by traditional region and craft discipline",
    viewAll: "View All",

    highlightsTitle: "Handmade Egyptian Craft Highlights",
    highlightsSubtitle: "Unique artisan pieces crafted with natural Egyptian materials",

    filterTitle: "Filter Crafts",
    resetAll: "Reset All",
    keyword: "Keyword",
    category: "Category",
    priceRange: "Price Range (EGP)",
    craftMaterial: "Craft Material",
    sortBy: "Sort By",
    applyFilters: "Apply Filters",

    inStock: "In Stock",
    lowStock: "Low Stock",
    outOfStock: "Out of Stock",
    addToCart: "Add to Cart",

    cartTitle: "Marketplace Shopping Cart",
    cartSubtitle: "Multi-seller cart with split shipping per artisan studio",
    clearCart: "Clear Cart",
    shipmentFrom: "Shipment from",
    chooseShipping: "Choose Shipping Method",
    egyptPost: "Egypt Post",
    privateCourier: "Private Express Courier",
    directPickup: "Direct Seller Pickup",

    orderSummary: "Order Financial Summary",
    productsSubtotal: "Craft Products Subtotal",
    splitShippingTotal: "Split Shipping Total",
    commissionNotice: "Platform Commission Notice",
    commissionDesc: "Calculated transparently on seller product sales. Net artisan proceeds recorded separately.",
    grandTotal: "Grand Total",
    proceedCheckout: "Proceed to Checkout",

    checkoutTitle: "Checkout & Payment",
    checkoutSubtitle: "Complete your order with split shipping per seller & sandbox payment security",
    deliveryAddress: "1. Delivery Address",
    fullName: "Full Recipient Name",
    phoneWhatsApp: "Phone Number (For WhatsApp Notifications)",
    streetAddress: "Detailed Street Address",
    cityDistrict: "City / District",
    governorate: "Governorate",

    paymentOption: "2. Payment Option",
    eWallets: "E-Wallets",
    bankCards: "Bank Cards",
    cashOnDelivery: "Cash on Delivery",

    confirmOrder: "Confirm Order",
    processingOrder: "Processing Order...",

    lawNotice: "Egypt Personal Data Protection Law No. 151 of 2020 Compliant",

    quickDemoAccounts: "1-Click Quick Demo Accounts",
    quickDemoSubtitle: "Select any demo persona below to auto-fill credentials and sign in instantly:",
    adminPersona: "Platform Administrator",
    approvedSellerPersona: "Approved Artisan (Amina Ceramics)",
    pendingSellerPersona: "Pending Verification Seller (Siwa Salt)",
    buyerPersona: "Marketplace Buyer (Sarah Mansour)",

    langEnglish: "English",
    langArabic: "العربية",
    themeLight: "Light Mode",
    themeDark: "Dark Mode"
  },
  ar: {
    appName: "في بيتي",
    appNameAr: "Fi Byti",
    tagline: "سوق الحرف اليدوية المصرية الأصيلة",
    browseMarketplace: "تصفح السوق",
    joinSeller: "انضم كحرفي بائع",
    myOrders: "طلباتي",
    artisanPortal: "بوابة الحرفيين",
    adminDashboard: "لوحة الإدارة",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    register: "إنشاء حساب جديد",
    searchPlaceholder: "ابحث عن أواني الفخار، المنسوجات، الحقائب الجلدية...",

    heroTitlePrefix: "حرف يدوية مصرية أصيلة، مباشرة من ورش",
    heroTitleSuffix: "وبيوت الحرفيين.",
    heroSubtitle: "نربط الحرفيين المستقلين من قرية تونس بالفايوم، أخميم، خان الخليلي، وسيوة مباشرة بعشاق الفن. عمولة منصة عادلة 2% فقط.",
    exploreCatalog: "استكشف المعروضات",

    categoriesTitle: "استكشف التراث الحرفي المصري",
    categoriesSubtitle: "تسوق حسب المنطقة والتقنية التراثية",
    viewAll: "عرض الكل",

    highlightsTitle: "أبرز منتجات الحرف اليدوية المصرية",
    highlightsSubtitle: "قطع فنية فريدة مصنوعة من خامات طبيعية مصرية 100%",

    filterTitle: "تصفية المنتجات",
    resetAll: "إعادة ضبط",
    keyword: "كلمة البحث",
    category: "القسم الحرفي",
    priceRange: "نطاق السعر (جنيه مصري)",
    craftMaterial: "الخامة المستخدمة",
    sortBy: "ترتيب حسب",
    applyFilters: "تطبيق التصفية",

    inStock: "متوفر بالمخزون",
    lowStock: "كمية محدودة",
    outOfStock: "نفذت الكمية",
    addToCart: "إضافة للسلة",

    cartTitle: "سلة التسوق",
    cartSubtitle: "سلة متعددة البائعين مع شحن منفصل لكل ورشة حرفية",
    clearCart: "تفريغ السلة",
    shipmentFrom: "شحنة من ورشة",
    chooseShipping: "اختر طريقة الشحن",
    egyptPost: "البريد المصري",
    privateCourier: "شركة شحن سريعة",
    directPickup: "استلام مباشر من ورشة البائع",

    orderSummary: "ملخص الحساب والطلب",
    productsSubtotal: "إجمالي المنتجات",
    splitShippingTotal: "إجمالي الشحن المنفصل",
    commissionNotice: "إشعار عمولة المنصة",
    commissionDesc: "تحسب بشفافية 2% فقط على مبيعات المنتجات. يسجل صافي الحرفي منفصلاً.",
    grandTotal: "المبلغ الإجمالي",
    proceedCheckout: "الانتقال لإتمام الدفع",

    checkoutTitle: "إتمام الشراء والدفع",
    checkoutSubtitle: "أكمل طلبك مع شحن منفصل وبوابة تجريبية آمنة",
    deliveryAddress: "1. عنوان التوصيل",
    fullName: "اسم المستلم بالكامل",
    phoneWhatsApp: "رقم الهاتف (لإشعارات واتساب)",
    streetAddress: "العنوان بالتفصيل",
    cityDistrict: "المدينة / الحي",
    governorate: "المحافظة",

    paymentOption: "2. طريقة الدفع",
    eWallets: "محافظ إلكترونية",
    bankCards: "بطاقات بنكية",
    cashOnDelivery: "الدفع عند الاستلام",

    confirmOrder: "تأكيد الطلب النهائي",
    processingOrder: "جاري معالجة الطلب...",

    lawNotice: "متوافق مع قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020",

    quickDemoAccounts: "حسابات تجريبية سريعة بنقرة واحدة",
    quickDemoSubtitle: "اختر أي حساب تجريبي أدناه لتعبئة بيانات الدخول والتسجيل فوراً:",
    adminPersona: "مدير المنصة (الإدارة)",
    approvedSellerPersona: "حرفي معتمد (فخار الفايوم)",
    pendingSellerPersona: "حرفي قيد المراجعة (ملح سيوة)",
    buyerPersona: "مشتري (سارة منصور)",

    langEnglish: "English",
    langArabic: "العربية",
    themeLight: "الوضع الفاتح",
    themeDark: "الوضع الداكن"
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('fibyti_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('fibyti_lang', lang);
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t, isRtl: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
