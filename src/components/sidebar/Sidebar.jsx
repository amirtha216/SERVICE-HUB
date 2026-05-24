import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaHome, FaThLarge, FaClipboardList, FaBell, FaWallet, FaUser, FaCog, FaChartBar, FaBriefcase, FaRupeeSign, FaChartPie, FaUsers, FaUserTie, FaCogs, FaFileAlt, FaExclamationCircle, FaPhoneAlt, FaQuestionCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { NAV_LINKS } from '../../constants';
import { useTranslation } from '../../utils/translations';

const iconMap = {
  FaHome, FaThLarge, FaClipboardList, FaBell, FaWallet, FaUser, FaCog,
  FaChartBar, FaBriefcase, FaRupeeSign, FaChartPie, FaUsers, FaUserTie,
  FaCogs, FaFileAlt, FaExclamationCircle
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const links = NAV_LINKS[user?.role] || [];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 lg:p-5 border-b border-white/[0.06]">
        <div className="flex items-center justify-between lg:justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center">
              <span className="text-white font-bold">SH</span>
            </div>
            <div className="lg:hidden">
              <p className="font-bold text-sm">ServiceHub</p>
              <p className="text-[10px] text-[var(--text-secondary)] capitalize">{user?.role} Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-white/10">
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-3">
        <div className="space-y-1">
          {links.map((link) => {
            const Icon = iconMap[link.icon] || FaHome;
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500/20 to-rose-500/10 text-orange-400 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-white/[0.06] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isActive ? 'bg-orange-500/20' : 'bg-white/[0.04] group-hover:bg-white/[0.08]'
                }`}>
                  <Icon className={`text-sm ${isActive ? 'text-orange-400' : ''}`} />
                </div>
                <span>{t(link.label.toLowerCase())}</span>
                {isActive && (
                  <motion.div
                     layoutId="activeTab"
                     className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500"
                  />
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-white/[0.06] space-y-1">
          <NavLink
            to={user?.role === 'user' ? '/user/faq' : user?.role === 'provider' ? '/provider/faq' : user?.role === 'admin' ? '/admin/faq' : '/faq'}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-white/[0.06] hover:text-[var(--text-primary)] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
              <FaQuestionCircle className="text-sm" />
            </div>
            <span>{t('faq_help')}</span>
          </NavLink>
          <NavLink
            to={user?.role === 'user' ? '/user/contact' : user?.role === 'provider' ? '/provider/contact' : user?.role === 'admin' ? '/admin/contact' : '/contact'}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-white/[0.06] hover:text-[var(--text-primary)] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
              <FaPhoneAlt className="text-sm" />
            </div>
            <span>{t('contact_support')}</span>
          </NavLink>
        </div>
      </div>

      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-2">
          <img src={user?.avatar} alt="" className="w-9 h-9 rounded-lg" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-[10px] text-[var(--text-secondary)] capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 flex-col bg-[var(--sidebar-bg)] border-r border-white/[0.06] z-40">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[var(--sidebar-bg)] z-50 lg:hidden flex flex-col"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
