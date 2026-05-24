import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCog, FaGlobe, FaMoon, FaSun, FaLock, FaBell, FaUserSlash, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LANGUAGES } from '../../constants';
import { staggerContainer, fadeInUp } from '../../animations';
import { toast } from 'react-hot-toast';
import authService from '../../services/authService';
import { useTranslation } from '../../utils/translations';

const Settings = () => {
  const { user, updateProfile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();

  // Settings State
  const [selectedLanguage, setSelectedLanguage] = useState(user?.language || 'en');
  const [notifPreferences, setNotifPreferences] = useState({
    push: true,
    email: true,
    sms: false,
    promo: true
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleLanguageChange = async (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    try {
      const res = await authService.updateProfile(user.id, { language: lang });
      if (res.success) {
        updateProfile(res.user);
        toast.success(`Language updated to ${LANGUAGES.find(l => l.code === lang)?.label}`);
      }
    } catch (err) {
      toast.error('Failed to update language settings');
    }
  };

  const handleToggleNotif = (key) => {
    setNotifPreferences(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      toast.success('Notification preferences updated');
      return updated;
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    // Since mock users have passwords, check if user.password matches
    // Note: if user signed up, password might be stored, let's allow changing it
    if (user.password && passwordData.currentPassword !== user.password) {
      toast.error('Incorrect current password');
      return;
    }

    setPasswordLoading(true);
    await new Promise(r => setTimeout(r, 1000)); // Simulate API call

    updateProfile({ password: passwordData.newPassword });
    toast.success('Password updated successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordLoading(false);
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.');
    if (confirmDelete) {
      toast.loading('Deleting account...');
      await new Promise(r => setTimeout(r, 1500));
      toast.dismiss();
      toast.success('Account deleted successfully.');
      logout();
    }
  };

  if (!user) return null;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold mb-1">{t('account_settings')}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{t('manage_preferences')}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-3">
          <div className="glass-card rounded-2xl p-4 space-y-1">
            <a href="#preferences" className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-orange-400">
              <span className="flex items-center gap-2.5"><FaGlobe /> General</span>
              <FaChevronRight className="text-xs" />
            </a>
            <a href="#security" className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-white/5 hover:text-white transition-all">
              <span className="flex items-center gap-2.5"><FaLock /> Security</span>
              <FaChevronRight className="text-xs" />
            </a>
            <button 
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <span className="flex items-center gap-2.5"><FaUserSlash /> Delete Account</span>
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>

        {/* Settings Panels */}
        <div className="md:col-span-2 space-y-6">
          {/* General Preferences */}
          <motion.div id="preferences" variants={fadeInUp} className="glass-card rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-3">
              <FaCog className="text-orange-500" /> {t('general_preferences')}
            </h3>

            {/* Language */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-sm">{t('app_language')}</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('select_language')}</p>
              </div>
              <select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5">
              <div>
                <h4 className="font-semibold text-sm">{t('theme_settings')}</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('dark_light')}</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`p-3 rounded-xl border transition-all ${
                  isDark 
                    ? 'border-white/10 bg-white/5 text-amber-400' 
                    : 'border-orange-500/20 bg-orange-500/5 text-slate-400'
                }`}
              >
                {isDark ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
              </button>
            </div>

            {/* Notification Toggles */}
            <div className="pt-4 border-t border-white/5 space-y-4">
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-2 text-white">
                  <FaBell className="text-orange-400 text-xs" /> {t('notif_channels')}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('choose_channels')}</p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'push', label: 'Push Notifications', desc: 'Alerts directly in the browser' },
                  { key: 'email', label: 'Email Confirmations', desc: 'Receipts and service summaries' },
                  { key: 'sms', label: 'SMS Updates', desc: 'Real-time text alerts for emergencies' },
                  { key: 'promo', label: 'Promotional Offers', desc: 'Coupons and discount notifications' }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <h5 className="text-xs font-semibold">{item.label}</h5>
                      <p className="text-[10px] text-[var(--text-secondary)]">{item.desc}</p>
                    </div>
                    
                    <button
                      onClick={() => handleToggleNotif(item.key)}
                      className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                        notifPreferences[item.key] ? 'bg-orange-500' : 'bg-white/10'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        notifPreferences[item.key] ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Security & Password */}
          <motion.div id="security" variants={fadeInUp} className="glass-card rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-3">
              <FaLock className="text-orange-500" /> {t('change_password')}
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 ml-1">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 ml-1">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 ml-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors flex items-center justify-center min-w-[140px]"
              >
                {passwordLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Change Password'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
