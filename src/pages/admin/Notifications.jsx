import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBell, FaCheck, FaTrash, FaCheckCircle, FaStar, FaTag, FaTruck, 
  FaWallet, FaGift, FaInfoCircle, FaUserTie, FaPaperPlane, FaSearch,
  FaFilter, FaExclamationCircle, FaTimes, FaUsers, FaUser, FaCheckDouble
} from 'react-icons/fa';
import supabase from '../../lib/supabase';
import { mapNotificationFromDb } from '../../utils/supabaseHelpers';
import { formatDate } from '../../utils/helpers';
import { staggerContainer, fadeInUp } from '../../animations';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const iconMap = {
  FaCheckCircle, FaStar, FaTag, FaTruck, FaWallet, 
  FaGift, FaInfoCircle, FaBell, FaUserTie, FaExclamationCircle
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
  error: 'FaExclamationCircle',
  booking: 'FaCheckCircle',
  earning: 'FaWallet',
  referral: 'FaGift',
  system: 'FaInfoCircle',
  promo: 'FaTag'
};

const typeColors = {
  success: 'text-emerald-400 bg-emerald-500/15',
  info: 'text-blue-400 bg-blue-500/15',
  error: 'text-rose-400 bg-rose-500/15',
  booking: 'text-orange-400 bg-orange-500/15',
  earning: 'text-emerald-400 bg-emerald-500/15',
  promo: 'text-violet-400 bg-violet-500/15',
  wallet: 'text-cyan-400 bg-cyan-500/15',
  referral: 'text-amber-400 bg-amber-500/15',
  system: 'text-blue-400 bg-blue-500/15'
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendTarget, setSendTarget] = useState('all_users');
  const [sendTitle, setSendTitle] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [sendType, setSendType] = useState('info');
  const [sending, setSending] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch ALL notifications and profiles on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [notifRes, profileRes] = await Promise.all([
          supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('profiles')
            .select('id, name, role, avatar')
        ]);

        if (notifRes.data) setNotifications(notifRes.data.map(mapNotificationFromDb));
        if (profileRes.data) setProfiles(profileRes.data);
      } catch (e) {
        console.error('Error fetching admin notifications:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Real-time listener for ALL notifications
    const channel = supabase
      .channel('admin-all-notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [mapNotificationFromDb(payload.new), ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setNotifications(prev => prev.map(n => 
            n.id === payload.new.id ? mapNotificationFromDb(payload.new) : n
          ));
        } else if (payload.eventType === 'DELETE') {
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Build a userId → profile map
  const profileMap = useMemo(() => {
    const map = {};
    profiles.forEach(p => { map[p.id] = p; });
    return map;
  }, [profiles]);

  // Unique notification types
  const notifTypes = useMemo(() => {
    const types = new Set(notifications.map(n => n.type).filter(Boolean));
    return ['all', ...Array.from(types)];
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchSearch = !searchTerm || 
        n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (profileMap[n.userId]?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'all' || n.type === filterType;
      const matchRead = filterRead === 'all' || 
        (filterRead === 'unread' && !n.isRead) || 
        (filterRead === 'read' && n.isRead);
      return matchSearch && matchType && matchRead;
    });
  }, [notifications, searchTerm, filterType, filterRead, profileMap]);

  // Stats
  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    today: notifications.filter(n => {
      const d = new Date(n.createdAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length
  }), [notifications]);

  // Actions
  const handleDelete = async (id) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setSelectedIds(prev => prev.filter(sid => sid !== id));
  };

  const handleMarkRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    for (const id of selectedIds) {
      await supabase.from('notifications').delete().eq('id', id);
    }
    setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
    setSelectedIds([]);
  };

  const handleBulkMarkRead = async () => {
    if (selectedIds.length === 0) return;
    for (const id of selectedIds) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    }
    setNotifications(prev => prev.map(n => selectedIds.includes(n.id) ? { ...n, isRead: true } : n));
    setSelectedIds([]);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  // Send notification
  const handleSend = async () => {
    if (!sendTitle.trim() || !sendMessage.trim()) return;
    setSending(true);
    try {
      let targetUserIds = [];
      if (sendTarget === 'all_users') {
        targetUserIds = profiles.filter(p => p.role === 'user').map(p => p.id);
      } else if (sendTarget === 'all_providers') {
        targetUserIds = profiles.filter(p => p.role === 'provider').map(p => p.id);
      } else if (sendTarget === 'everyone') {
        targetUserIds = profiles.filter(p => p.role !== 'admin').map(p => p.id);
      }

      const now = new Date().toISOString();
      const insertData = targetUserIds.map((uid, idx) => ({
        id: `notif_admin_${Date.now()}_${idx}`,
        user_id: uid,
        title: sendTitle.trim(),
        message: sendMessage.trim(),
        type: sendType,
        is_read: false,
        link: '',
        created_at: now
      }));

      if (insertData.length > 0) {
        const { error } = await supabase.from('notifications').insert(insertData);
        if (error) throw error;
      }

      // Reset and close
      setSendTitle('');
      setSendMessage('');
      setSendType('info');
      setSendTarget('all_users');
      setShowSendModal(false);
    } catch (e) {
      console.error('Error sending notifications:', e);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
            <FaBell className="text-orange-400" /> Notifications
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage all platform notifications</p>
        </div>
        <button
          onClick={() => setShowSendModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-orange-500/20 transition-all"
        >
          <FaPaperPlane className="text-xs" /> Send Notification
        </button>
      </div>

      {/* Stats Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Notifications', value: stats.total, icon: FaBell, color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
          { label: 'Unread', value: stats.unread, icon: FaExclamationCircle, color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
          { label: 'Sent Today', value: stats.today, icon: FaPaperPlane, color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' }
        ].map((card, idx) => (
          <div key={idx} className={`glass-card rounded-2xl p-5 border ${card.border}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-[var(--text-secondary)] mb-1">{card.label}</p>
                <h3 className="text-2xl font-bold">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon className="text-lg" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-sm" />
          <input
            type="text"
            placeholder="Search by title, message, or user..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500/40 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500/40 cursor-pointer"
          >
            {notifTypes.map(type => (
              <option key={type} value={type} className="bg-[#1a1a2e]">
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          <select 
            value={filterRead} 
            onChange={e => setFilterRead(e.target.value)}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500/40 cursor-pointer"
          >
            <option value="all" className="bg-[#1a1a2e]">All Status</option>
            <option value="unread" className="bg-[#1a1a2e]">Unread Only</option>
            <option value="read" className="bg-[#1a1a2e]">Read Only</option>
          </select>
        </div>
      </motion.div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-3 flex items-center justify-between border border-orange-500/20"
        >
          <span className="text-sm text-[var(--text-secondary)] ml-2">
            <strong className="text-white">{selectedIds.length}</strong> selected
          </span>
          <div className="flex gap-2">
            <button 
              onClick={handleBulkMarkRead}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
            >
              <FaCheckDouble className="text-[10px]" /> Mark Read
            </button>
            <button 
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-400 rounded-lg text-xs font-semibold hover:bg-rose-500/20 transition-colors"
            >
              <FaTrash className="text-[10px]" /> Delete
            </button>
          </div>
        </motion.div>
      )}

      {/* Select All Checkbox */}
      {filteredNotifications.length > 0 && (
        <div className="flex items-center gap-3 px-1">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
            <input 
              type="checkbox" 
              checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-white/20 accent-orange-500"
            />
            Select All ({filteredNotifications.length})
          </label>
        </div>
      )}

      {/* Notifications List */}
      <AnimatePresence mode="popLayout">
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const Icon = iconMap[typeToIcon[notif.type]] || FaBell;
              const profile = profileMap[notif.userId];
              const colorClass = typeColors[notif.type] || 'text-blue-400 bg-blue-500/15';
              const isSelected = selectedIds.includes(notif.id);

              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className={`glass-card rounded-2xl p-4 flex gap-4 items-start relative transition-all border ${
                    isSelected
                      ? 'border-orange-500/40 bg-orange-500/[0.04]'
                      : notif.isRead
                      ? 'border-white/5 bg-white/[0.01] opacity-70'
                      : 'border-orange-500/20 bg-orange-500/[0.02] shadow-[0_0_15px_rgba(249,115,22,0.03)]'
                  }`}
                >
                  {/* Checkbox */}
                  <input 
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(notif.id)}
                    className="mt-1 w-4 h-4 shrink-0 rounded accent-orange-500 cursor-pointer"
                  />

                  {/* Unread dot */}
                  {!notif.isRead && (
                    <span className="absolute top-4 left-14 w-2 h-2 rounded-full bg-orange-500"></span>
                  )}

                  {/* Icon */}
                  <div className={`p-3 rounded-xl shrink-0 ${colorClass}`}>
                    <Icon className="text-lg" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={`text-sm font-semibold ${notif.isRead ? 'text-white/80' : 'text-white'}`}>
                          {notif.title}
                        </h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                      {notif.type && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase shrink-0 ${colorClass}`}>
                          {notif.type}
                        </span>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1">
                        {profile?.role === 'provider' ? <FaUserTie className="text-purple-400" /> : <FaUser className="text-blue-400" />}
                        {profile?.name || notif.userId}
                      </span>
                      <span>•</span>
                      <span>{formatDate(notif.createdAt)}</span>
                      <span>•</span>
                      <span className={notif.isRead ? 'text-emerald-400' : 'text-amber-400'}>
                        {notif.isRead ? 'Read' : 'Unread'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-center">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        title="Mark as read"
                        className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      >
                        <FaCheck className="text-xs" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
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
            <h3 className="text-lg font-semibold mb-1">No notifications found</h3>
            <p className="text-[var(--text-secondary)] text-sm">
              {searchTerm || filterType !== 'all' || filterRead !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'No notifications have been sent on the platform yet.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send Notification Modal */}
      <AnimatePresence>
        {showSendModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSendModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="w-full max-w-lg bg-[var(--card-bg)] border border-white/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto">
                {/* Modal Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <FaPaperPlane className="text-orange-400" /> Send Notification
                  </h2>
                  <button 
                    onClick={() => setShowSendModal(false)}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5">
                  {/* Target Audience */}
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                      Target Audience
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'all_users', label: 'All Users', icon: FaUsers, color: 'text-blue-400' },
                        { value: 'all_providers', label: 'Providers', icon: FaUserTie, color: 'text-purple-400' },
                        { value: 'everyone', label: 'Everyone', icon: FaBell, color: 'text-orange-400' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setSendTarget(opt.value)}
                          className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                            sendTarget === opt.value 
                              ? 'border-orange-500/40 bg-orange-500/10 text-orange-400' 
                              : 'border-white/10 bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
                          }`}
                        >
                          <opt.icon className={`mx-auto text-lg mb-1 ${sendTarget === opt.value ? opt.color : ''}`} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                      Type
                    </label>
                    <select
                      value={sendType}
                      onChange={e => setSendType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500/40"
                    >
                      <option value="info" className="bg-[#1a1a2e]">ℹ️ Info</option>
                      <option value="success" className="bg-[#1a1a2e]">✅ Success</option>
                      <option value="promo" className="bg-[#1a1a2e]">🏷️ Promo / Offer</option>
                      <option value="system" className="bg-[#1a1a2e]">⚙️ System</option>
                      <option value="error" className="bg-[#1a1a2e]">🚨 Alert</option>
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 🎉 Flat 30% OFF this weekend!"
                      value={sendTitle}
                      onChange={e => setSendTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500/40"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                      Message
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Write the notification message..."
                      value={sendMessage}
                      onChange={e => setSendMessage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500/40 resize-none"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">
                    Will be sent to {
                      sendTarget === 'all_users' ? profiles.filter(p => p.role === 'user').length + ' users' :
                      sendTarget === 'all_providers' ? profiles.filter(p => p.role === 'provider').length + ' providers' :
                      profiles.filter(p => p.role !== 'admin').length + ' people'
                    }
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSendModal(false)}
                      className="px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={sending || !sendTitle.trim() || !sendMessage.trim()}
                      className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/20 transition-all"
                    >
                      {sending ? (
                        <>Sending...</>
                      ) : (
                        <><FaPaperPlane className="text-xs" /> Send</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminNotifications;
