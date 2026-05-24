const notifications = [
  {
    id: 'notif_1',
    userId: 'user_1',
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your bike repair booking has been confirmed. Provider Rajesh is on the way!',
    icon: 'FaCheckCircle',
    isRead: true,
    createdAt: '2024-11-10T09:35:00Z',
    link: '/user/bookings/bk_1'
  },
  {
    id: 'notif_2',
    userId: 'user_1',
    type: 'booking',
    title: 'Service Completed',
    message: 'Your bike repair service has been completed. Please rate your experience.',
    icon: 'FaStar',
    isRead: true,
    createdAt: '2024-11-10T10:50:00Z',
    link: '/user/bookings/bk_1'
  },
  {
    id: 'notif_3',
    userId: 'user_1',
    type: 'promo',
    title: '🎉 Flat 30% OFF!',
    message: 'Use code SAVE30 to get 30% off on your next car repair booking. Valid till Dec 31.',
    icon: 'FaTag',
    isRead: false,
    createdAt: '2024-12-01T08:00:00Z',
    link: '/user/services/svc_4'
  },
  {
    id: 'notif_4',
    userId: 'user_1',
    type: 'booking',
    title: 'Provider En Route',
    message: 'TowPro Services is on the way to your location. ETA: 15 minutes.',
    icon: 'FaTruck',
    isRead: false,
    createdAt: '2024-12-01T14:35:00Z',
    link: '/user/track/bk_4'
  },
  {
    id: 'notif_5',
    userId: 'user_1',
    type: 'wallet',
    title: 'Cashback Received!',
    message: '₹50 cashback has been added to your wallet for your recent booking.',
    icon: 'FaWallet',
    isRead: false,
    createdAt: '2024-11-16T10:00:00Z',
    link: '/user/wallet'
  },
  {
    id: 'notif_6',
    userId: 'user_2',
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your battery jump start service has been confirmed. BatteryBuddy is on the way!',
    icon: 'FaCheckCircle',
    isRead: true,
    createdAt: '2024-11-20T07:20:00Z',
    link: '/user/bookings/bk_3'
  },
  {
    id: 'notif_7',
    userId: 'prov_1',
    type: 'booking',
    title: 'New Booking Request',
    message: 'You have a new bike repair request from Rahul Sharma. Tap to view details.',
    icon: 'FaBell',
    isRead: true,
    createdAt: '2024-11-10T09:31:00Z',
    link: '/provider/requests/bk_1'
  },
  {
    id: 'notif_8',
    userId: 'prov_1',
    type: 'earning',
    title: 'Payment Received',
    message: '₹400 has been credited to your account for booking #bk_1.',
    icon: 'FaRupeeSign',
    isRead: true,
    createdAt: '2024-11-10T11:00:00Z',
    link: '/provider/earnings'
  },
  {
    id: 'notif_9',
    userId: 'user_1',
    type: 'referral',
    title: 'Referral Bonus!',
    message: 'Your friend Sneha just signed up using your referral code. ₹100 added to wallet!',
    icon: 'FaGift',
    isRead: false,
    createdAt: '2024-11-28T15:00:00Z',
    link: '/user/referral'
  },
  {
    id: 'notif_10',
    userId: 'user_1',
    type: 'system',
    title: 'App Update Available',
    message: 'A new version of ServiceHub is available with exciting features. Update now!',
    icon: 'FaInfoCircle',
    isRead: false,
    createdAt: '2024-12-01T06:00:00Z',
    link: null
  }
];

export default notifications;
