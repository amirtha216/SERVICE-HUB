import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaRupeeSign, FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import providerService from '../../services/providerService';
import { formatCurrency } from '../../utils/helpers';
import { staggerContainer, fadeInUp } from '../../animations';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Earnings = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      const data = await providerService.getEarnings(user.id);
      setEarnings(data);
      setLoading(false);
    };
    fetchEarnings();
  }, [user.id]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!earnings) return null;

  const earningCards = [
    { label: "Today's Earnings", value: earnings.today, icon: FaCalendarDay, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { label: "This Week", value: earnings.week, icon: FaCalendarWeek, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { label: "This Month", value: earnings.month, icon: FaCalendarAlt, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    { label: "Total Earnings", value: earnings.total, icon: FaChartLine, color: 'text-purple-400', bg: 'bg-purple-500/20' }
  ];

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold mb-1">My Earnings</h1>
        <p className="text-sm text-[var(--text-secondary)]">Track your financial performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {earningCards.map((card, idx) => (
          <motion.div key={idx} variants={fadeInUp} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl transition-all group-hover:scale-150 ${card.bg}`}></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-2">{card.label}</p>
                <h3 className="text-2xl lg:text-3xl font-bold">{formatCurrency(card.value)}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon className="text-xl" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={fadeInUp} className="glass-card rounded-3xl p-8 mt-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold">Recent Transactions</h2>
          <button className="text-orange-400 text-sm font-medium hover:text-orange-300">View All</button>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                  <FaRupeeSign />
                </div>
                <div>
                  <h4 className="font-semibold">Payment from ServiceHub</h4>
                  <p className="text-xs text-[var(--text-secondary)]">Booking #bk_10{i} • Completed</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-bold text-emerald-400">+{formatCurrency(450 + (i * 50))}</span>
                <span className="text-xs text-[var(--text-secondary)]">Today, {10 + i}:30 AM</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Earnings;
