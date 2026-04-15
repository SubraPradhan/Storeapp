import type { Language } from '@/types';

type TranslationKeys = {
  // Navbar
  storeName: string;
  tagline: string;

  // Home
  searchPlaceholder: string;
  allCategories: string;
  noProducts: string;
  addToCart: string;
  outOfStock: string;
  off: string;

  // Product Detail
  relatedProducts: string;
  backToStore: string;
  inStock: string;

  // Cart
  cart: string;
  cartEmpty: string;
  cartEmptyDesc: string;
  proceedToCheckout: string;
  items: string;
  total: string;
  remove: string;

  // Checkout
  checkout: string;
  orderSummary: string;
  deliveryMethod: string;
  delivery: string;
  selfPickup: string;
  deliveryCharge: string;
  free: string;
  subtotal: string;
  grandTotal: string;
  customerDetails: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  orderNotes: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  addressPlaceholder: string;
  notesPlaceholder: string;
  placeOrder: string;
  placingOrder: string;
  addressRequired: string;
  fillRequired: string;

  // OTP
  otpVerification: string;
  otpSentTo: string;
  enterOtp: string;
  verify: string;
  verifying: string;
  resendOtp: string;
  resendIn: string;

  // Tracking
  orderTracking: string;
  orderRef: string;
  payNow: string;
  shippingInfo: string;
  carrier: string;
  trackingId: string;
  estimatedDelivery: string;
  orderItems: string;

  // Status
  statusPending: string;
  statusVerified: string;
  statusAccepted: string;
  statusPaid: string;
  statusShipped: string;
  statusDelivered: string;
  statusCancelled: string;

  // General
  loading: string;
  error: string;
  retry: string;
  goHome: string;
  language: string;
};

const translations: Record<Language, TranslationKeys> = {
  en: {
    storeName: 'MyStore',
    tagline: 'your store Buddy',

    searchPlaceholder: 'Search products...',
    allCategories: 'All',
    noProducts: 'No products found',
    addToCart: 'Add',
    outOfStock: 'Out of Stock',
    off: 'OFF',

    relatedProducts: 'Related Products',
    backToStore: 'Back to Store',
    inStock: 'In Stock',

    cart: 'Cart',
    cartEmpty: 'Your cart is empty',
    cartEmptyDesc: 'Add some items to get started!',
    proceedToCheckout: 'Proceed to Checkout',
    items: 'items',
    total: 'Total',
    remove: 'Remove',

    checkout: 'Checkout',
    orderSummary: 'Order Summary',
    deliveryMethod: 'Delivery Method',
    delivery: 'Delivery (₹40)',
    selfPickup: 'Self Pickup (Free)',
    deliveryCharge: 'Delivery Charge',
    free: 'FREE',
    subtotal: 'Subtotal',
    grandTotal: 'Grand Total',
    customerDetails: 'Customer Details',
    name: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    address: 'Delivery Address',
    orderNotes: 'Order Notes',
    namePlaceholder: 'Enter your name',
    emailPlaceholder: 'you@email.com',
    phonePlaceholder: '10-digit mobile number',
    addressPlaceholder: 'House no., street, landmark...',
    notesPlaceholder: 'Any special instructions...',
    placeOrder: 'Place Order',
    placingOrder: 'Placing Order...',
    addressRequired: 'Address is required for delivery',
    fillRequired: 'Please fill all required fields',

    otpVerification: 'OTP Verification',
    otpSentTo: 'We sent a 6-digit code to your phone',
    enterOtp: 'Enter OTP',
    verify: 'Verify OTP',
    verifying: 'Verifying...',
    resendOtp: 'Resend OTP',
    resendIn: 'Resend in',

    orderTracking: 'Order Tracking',
    orderRef: 'Order Ref',
    payNow: 'Pay Now',
    shippingInfo: 'Shipping Information',
    carrier: 'Carrier',
    trackingId: 'Tracking ID',
    estimatedDelivery: 'Estimated Delivery',
    orderItems: 'Order Items',

    statusPending: 'Order Placed',
    statusVerified: 'Verified',
    statusAccepted: 'Accepted',
    statusPaid: 'Payment Done',
    statusShipped: 'Shipped',
    statusDelivered: 'Delivered',
    statusCancelled: 'Cancelled',

    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Try Again',
    goHome: 'Go Home',
    language: 'हिंदी',
  },
  hi: {
    storeName: 'MyStore',
    tagline: 'आपकी दुकान का साथी',

    searchPlaceholder: 'प्रोडक्ट खोजें...',
    allCategories: 'सभी',
    noProducts: 'कोई प्रोडक्ट नहीं मिला',
    addToCart: 'जोड़ें',
    outOfStock: 'स्टॉक में नहीं',
    off: 'छूट',

    relatedProducts: 'संबंधित प्रोडक्ट',
    backToStore: 'स्टोर पर वापस',
    inStock: 'उपलब्ध है',

    cart: 'कार्ट',
    cartEmpty: 'आपका कार्ट खाली है',
    cartEmptyDesc: 'शुरू करने के लिए कुछ आइटम जोड़ें!',
    proceedToCheckout: 'चेकआउट करें',
    items: 'आइटम',
    total: 'कुल',
    remove: 'हटाएं',

    checkout: 'चेकआउट',
    orderSummary: 'ऑर्डर सारांश',
    deliveryMethod: 'डिलीवरी का तरीका',
    delivery: 'डिलीवरी (₹40)',
    selfPickup: 'खुद लें (मुफ्त)',
    deliveryCharge: 'डिलीवरी शुल्क',
    free: 'मुफ्त',
    subtotal: 'उप-योग',
    grandTotal: 'कुल योग',
    customerDetails: 'ग्राहक विवरण',
    name: 'पूरा नाम',
    email: 'ईमेल',
    phone: 'फ़ोन नंबर',
    address: 'डिलीवरी पता',
    orderNotes: 'ऑर्डर नोट्स',
    namePlaceholder: 'अपना नाम लिखें',
    emailPlaceholder: 'you@email.com',
    phonePlaceholder: '10 अंकों का मोबाइल नंबर',
    addressPlaceholder: 'मकान नं., गली, लैंडमार्क...',
    notesPlaceholder: 'कोई विशेष निर्देश...',
    placeOrder: 'ऑर्डर दें',
    placingOrder: 'ऑर्डर दे रहे हैं...',
    addressRequired: 'डिलीवरी के लिए पता ज़रूरी है',
    fillRequired: 'कृपया सभी आवश्यक फ़ील्ड भरें',

    otpVerification: 'OTP सत्यापन',
    otpSentTo: 'हमने आपके फ़ोन पर 6 अंकों का कोड भेजा',
    enterOtp: 'OTP दर्ज करें',
    verify: 'OTP सत्यापित करें',
    verifying: 'सत्यापित हो रहा है...',
    resendOtp: 'OTP दोबारा भेजें',
    resendIn: 'दोबारा भेजें',

    orderTracking: 'ऑर्डर ट्रैकिंग',
    orderRef: 'ऑर्डर रेफ',
    payNow: 'भुगतान करें',
    shippingInfo: 'शिपिंग जानकारी',
    carrier: 'कैरियर',
    trackingId: 'ट्रैकिंग आईडी',
    estimatedDelivery: 'अनुमानित डिलीवरी',
    orderItems: 'ऑर्डर आइटम',

    statusPending: 'ऑर्डर दिया गया',
    statusVerified: 'सत्यापित',
    statusAccepted: 'स्वीकृत',
    statusPaid: 'भुगतान हुआ',
    statusShipped: 'भेज दिया गया',
    statusDelivered: 'डिलीवर हुआ',
    statusCancelled: 'रद्द',

    loading: 'लोड हो रहा है...',
    error: 'कुछ गलत हो गया',
    retry: 'पुनः प्रयास करें',
    goHome: 'होम पर जाएं',
    language: 'English',
  },
};

export default translations;