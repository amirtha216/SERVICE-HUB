import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaBell, FaMoon, FaSun, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { NAV_LINKS } from '../../constants';
import { useTranslation } from '../../utils/translations';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { getUnreadCount } = useNotifications();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const unreadCount = user ? getUnreadCount(user.id) : 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-xl bg-[var(--nav-bg)] border-b border-white/[0.06]">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <FaBars className="text-lg" />
          </button>
          <Link to={`/${user?.role}/home`} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <span className="text-white font-bold text-sm">SH</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent hidden sm:block">
              ServiceHub
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-white/10 transition-colors relative"
          >
            {isDark ? <FaSun className="text-amber-400" /> : <FaMoon className="text-slate-400" />}
          </motion.button>

          <Link
            to={`/${user?.role}/notifications`}
            className="p-2.5 rounded-xl hover:bg-white/10 transition-colors relative"
          >
            <FaBell className="text-lg" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
                {user?.name}
              </span>
              <FaChevronDown className={`text-xs transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-56 z-50 rounded-xl overflow-hidden border border-white/10 bg-[var(--card-bg)] backdrop-blur-xl shadow-2xl"
                  >
                    <div className="p-3 border-b border-white/10">
                      <p className="font-semibold text-sm">{user?.name}</p>
                      <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-orange-500/20 text-orange-400">
                        {user?.role}
                      </span>
                    </div>
                    <div className="p-1.5">
                      <Link
                        to={`/${user?.role}/profile`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/10 transition-colors"
                      >
                        {t('profile')}
                      </Link>
                      {user?.role === 'user' && (
                        <Link
                          to="/user/settings"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/10 transition-colors"
                        >
                          {t('settings')}
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors"
                      >
                        <FaSignOutAlt /> {t('logout')}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
