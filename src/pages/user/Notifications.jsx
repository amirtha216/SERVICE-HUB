import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaCheck, FaTrash, FaCheckCircle, FaStar, FaTag, FaTruck, FaWallet, FaGift, FaInfoCircle, FaUserTie } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';
import { staggerContainer, fadeInUp } from '../../animations';
import { useNavigate } from 'react-router-dom';

const iconMap = {
  FaCheckCircle: FaCheckCircle,
  FaStar: FaStar,
  FaTag: FaTag,
  FaTruck: FaTruck,
  FaWallet: FaWallet,
  FaGift: FaGift,
  FaInfoCircle: FaInfoCircle,
  FaBell: FaBell,
  FaUserTie: FaUserTie
};

const typeToIcon = {
  success: 'FaCheckCircle',
  star: 'FaStar',
  coupon: 'FaTag',
  offer: 'FaTag',
  towing: 'FaTruck',
  wallet: 'FaWallet',
  gift: 'FaGift',
  info: 'FaInfoCircle',
  bell: 'FaBell',
  provider: 'FaUserTie',
  error: 'FaBell'
};

const Notifications = () => {
  const { user } = useAuth();
  const { notifications, markAsRead, markAllAsRead, deleteNotification, getUserNotifications } = useNotifications();
  const navigate = useNavigate();

  const userNotifications = user ? getUserNotifications(user.id) : [];

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Notifications</h1>
          <p className="text-sm text-[var(--text-secondary)]">Stay updated on your booking status and offers</p>
        </div>
        
        {userNotifications.length > 0 && (
          <button
            onClick={() => markAllAsRead(user.id)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold text-orange-400 transition-all border border-white/5"
          >
            <FaCheck className="text-xs" /> Mark All as Read
          </button>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {userNotifications.length > 0 ? (
          <div className="space-y-3">
            {userNotifications.map((notif) => {
              const Icon = iconMap[notif.icon] || iconMap[typeToIcon[notif.type]] || FaBell;
              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className={`glass-card rounded-2xl p-4 flex gap-4 items-start relative transition-all border ${
                    notif.isRead
                      ? 'border-white/5 bg-white/[0.01] opacity-75'
                      : 'border-orange-500/20 bg-orange-500/[0.02] shadow-[0_0_15px_rgba(249,115,22,0.03)]'
                  }`}
                >
                  {/* Status Indicator */}
                  {!notif.isRead && (
                    <span className="absolute top-4 left-4 w-2 h-2 rounded-full bg-orange-500"></span>
                  )}
                  
                  {/* Icon */}
                  <div className={`p-3 rounded-xl shrink-0 ${
                    notif.isRead 
                      ? 'bg-white/5 text-[var(--text-secondary)]' 
                      : 'bg-orange-500/10 text-orange-400'
                  } ${!notif.isRead ? 'ml-4' : ''}`}>
                    <Icon className="text-lg" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleNotificationClick(notif)}>
                    <h4 className={`text-sm font-semibold ${notif.isRead ? 'text-white/80' : 'text-white'}`}>
                      {notif.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-[var(--text-secondary)] mt-2 block">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-center">
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        title="Mark as read"
                        className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      >
                        <FaCheck className="text-xs" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      title="Delete"
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-3xl p-12 text-center border-dashed"
          >
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBell className="text-2xl text-[var(--text-secondary)] opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No notifications yet</h3>
            <p className="text-[var(--text-secondary)] text-sm">
              We'll notify you here when your bookings update or when new offers arrive.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Notifications;
