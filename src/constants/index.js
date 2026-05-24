export const ROLES = {
  USER: 'user',
  PROVIDER: 'provider',
  ADMIN: 'admin'
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  ON_THE_WAY: 'on_the_way',
  REACHED: 'reached',
  SERVICE_STARTED: 'service_started',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const BOOKING_STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  on_the_way: 'On The Way',
  reached: 'Reached',
  service_started: 'Service Started',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export const BOOKING_STATUS_COLORS = {
  pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  accepted: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  on_the_way: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  reached: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  service_started: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
};

export const PAYMENT_METHODS = [
  { id: 'wallet', label: 'Wallet', icon: 'FaWallet' },
  { id: 'cash', label: 'Cash', icon: 'FaMoneyBillWave' },
  { id: 'upi', label: 'UPI', icon: 'FaMobileAlt' },
  { id: 'card', label: 'Card', icon: 'FaCreditCard' }
];

export const SERVICE_CATEGORIES = [
  { id: 'fuel', label: 'Fuel Delivery', icon: 'FaGasPump', color: '#f59e0b' },
  { id: 'repair', label: 'Repairs', icon: 'FaWrench', color: '#3b82f6' },
  { id: 'towing', label: 'Towing', icon: 'FaTruckPickup', color: '#ef4444' },
  { id: 'electrical', label: 'Electrical', icon: 'FaBolt', color: '#8b5cf6' },
  { id: 'wash', label: 'Wash & Clean', icon: 'FaSprayCan', color: '#06b6d4' },
  { id: 'emergency', label: 'Emergency', icon: 'FaExclamationTriangle', color: '#dc2626' },
  { id: 'medical', label: 'Medical Service', icon: 'FaHeartbeat', color: '#ec4899' },
  { id: 'ambulance', label: 'Ambulance Service', icon: 'FaAmbulance', color: '#10b981' }
];

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' }
];

export const COUPONS = [
  { code: 'SAVE30', discount: 30, type: 'percentage', maxDiscount: 150, minOrder: 300, validTill: '2025-12-31', description: '30% off up to ₹150' },
  { code: 'FIRST50', discount: 50, type: 'percentage', maxDiscount: 200, minOrder: 200, validTill: '2025-12-31', description: '50% off on first booking' },
  { code: 'FLAT100', discount: 100, type: 'flat', maxDiscount: 100, minOrder: 500, validTill: '2025-06-30', description: 'Flat ₹100 off' },
  { code: 'RESCUE20', discount: 20, type: 'percentage', maxDiscount: 300, minOrder: 400, validTill: '2025-12-31', description: '20% off on emergency services' }
];

export const FAQ_DATA = [
  { q: 'How does ServiceHub work?', a: 'ServiceHub connects you with nearby verified service providers for vehicle emergencies and maintenance. Simply select a service, choose a provider, and get help at your location.' },
  { q: 'Is ServiceHub available 24/7?', a: 'Yes! Our emergency services like towing, mechanic support, and battery jump start are available 24/7. Other services are available from 6 AM to 10 PM.' },
  { q: 'How do I pay?', a: 'You can pay through our wallet, cash, UPI, or card. All payments are secure and transparent.' },
  { q: 'Are the service providers verified?', a: 'Absolutely! All providers go through a rigorous verification process including ID proof, skill assessment, and background check.' },
  { q: 'Can I cancel a booking?', a: 'Yes, you can cancel a booking before the provider starts the service. Cancellation charges may apply if the provider has already arrived.' },
  { q: 'How is pricing calculated?', a: 'Pricing includes a base service charge plus distance-based fees. You see the total estimated cost before confirming your booking.' },
  { q: 'What if I am not satisfied with the service?', a: 'You can raise a complaint through the app. Our support team will review and take appropriate action within 24 hours.' },
  { q: 'How do referrals work?', a: 'Share your referral code with friends. When they sign up and complete their first booking, both of you get ₹100 in your wallet!' }
];

export const NAV_LINKS = {
  user: [
    { path: '/user/home', label: 'Home', icon: 'FaHome' },
    { path: '/user/services', label: 'Services', icon: 'FaThLarge' },
    { path: '/user/bookings', label: 'Bookings', icon: 'FaClipboardList' },
    { path: '/user/notifications', label: 'Notifications', icon: 'FaBell' },
    { path: '/user/wallet', label: 'Wallet', icon: 'FaWallet' },
    { path: '/user/profile', label: 'Profile', icon: 'FaUser' },
    { path: '/user/settings', label: 'Settings', icon: 'FaCog' }
  ],
  provider: [
    { path: '/provider/dashboard', label: 'Dashboard', icon: 'FaChartBar' },
    { path: '/provider/requests', label: 'Requests', icon: 'FaClipboardList' },
    { path: '/provider/bookings', label: 'My Jobs', icon: 'FaBriefcase' },
    { path: '/provider/earnings', label: 'Earnings', icon: 'FaRupeeSign' },
    { path: '/provider/profile', label: 'Profile', icon: 'FaUser' }
  ],
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'FaChartPie' },
    { path: '/admin/users', label: 'Users', icon: 'FaUsers' },
    { path: '/admin/providers', label: 'Providers', icon: 'FaUserTie' },
    { path: '/admin/services', label: 'Services', icon: 'FaCogs' },
    { path: '/admin/bookings', label: 'Bookings', icon: 'FaClipboardList' },
    { path: '/admin/notifications', label: 'Notifications', icon: 'FaBell' },
    { path: '/admin/reports', label: 'Reports', icon: 'FaFileAlt' },
    { path: '/admin/complaints', label: 'Complaints', icon: 'FaExclamationCircle' }
  ]
};

export const DEFAULT_CENTER = { lat: 13.0827, lng: 80.2707 };
export const DEFAULT_ZOOM = 12;
