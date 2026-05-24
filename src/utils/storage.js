const storageKeys = {
  USER: 'servicehub_user',
  BOOKINGS: 'servicehub_bookings',
  NOTIFICATIONS: 'servicehub_notifications',
  THEME: 'servicehub_theme',
  LANGUAGE: 'servicehub_language',
  ADDRESSES: 'servicehub_addresses'
};

export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },
  remove: (key) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    Object.values(storageKeys).forEach(key => localStorage.removeItem(key));
  }
};

export default storageKeys;
