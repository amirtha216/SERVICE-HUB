import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaChartBar, FaRupeeSign, FaPercentage, FaCheckCircle, FaTimesCircle, FaMobileAlt, FaWallet, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';
import { useBooking } from '../../context/BookingContext';
import { formatCurrency } from '../../utils/helpers';
import { staggerContainer, fadeInUp } from '../../animations';

const Reports = () => {
  const { bookings } = useBooking();

  // Financial calculations from reactive context
  const stats = useMemo(() => {
    const completed = bookings.filter(b => b.status === 'completed');
    const cancelled = bookings.filter(b => b.status === 'cancelled');
    
    const gmv = completed.reduce((sum, b) => sum + (b.finalAmount || 0), 0);
    const platformCommission = gmv * 0.15; // 15% platform fee
    const avgTicket = completed.length > 0 ? gmv / completed.length : 0;
    
    const finishedTotal = completed.length + cancelled.length;
    const successRate = finishedTotal > 0 ? (completed.length / finishedTotal) * 100 : 100;

    // Payment composition count
    const paymentMethods = { wallet: 0, cash: 0, upi: 0, card: 0 };
    completed.forEach(b => {
      if (paymentMethods[b.paymentMethod] !== undefined) {
        paymentMethods[b.paymentMethod] += b.finalAmount || 0;
      }
    });

    return {
      gmv,
      platformCommission,
      avgTicket,
      successRate,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      totalCount: bookings.length,
      payments: paymentMethods
    };
  }, [bookings]);

  // Generate dynamic height percentage array for SVG bars based on bookings count
  // We distribute completed bookings across mock days (Mon - Sun)
  const dailyDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const completed = bookings.filter(b => b.status === 'completed');
    completed.forEach(b => {
      const day = new Date(b.bookingDate).getDay(); // 0-6
      const idx = day === 0 ? 6 : day - 1; // Map Sun to idx 6
      counts[idx]++;
    });
    
    const maxCount = Math.max(...counts, 1);
    return counts.map(c => (c / maxCount) * 80 + 20); // map between 20% and 100% height
  }, [bookings]);

  const cards = [
    { label: 'Gross Merchandise Value', value: formatCurrency(stats.gmv), subtext: 'Total completed sales volume', icon: FaRupeeSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Platform Revenue (15%)', value: formatCurrency(stats.platformCommission), subtext: 'Service commissions collected', icon: FaRupeeSign, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { label: 'Average Order Value', value: formatCurrency(stats.avgTicket), subtext: 'Average ticket price', icon: FaPercentage, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Job Success Rate', value: `${stats.successRate.toFixed(1)}%`, subtext: `${stats.completedCount} finished, ${stats.cancelledCount} cancelled`, icon: FaCheckCircle, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' }
  ];

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <FaChartBar className="text-orange-500" /> Platform Reports & Analytics
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">Financial summaries and transactional analysis</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, idx) => (
          <motion.div key={idx} variants={fadeInUp} className={`glass-card rounded-2xl p-6 border ${c.border} flex justify-between items-center`}>
            <div>
              <p className="text-[var(--text-secondary)] text-xs mb-1 font-semibold">{c.label}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">{c.value}</h3>
              <p className="text-[10px] text-[var(--text-secondary)] mt-1.5">{c.subtext}</p>
            </div>
            <div className={`p-3.5 rounded-xl shrink-0 ${c.bg} ${c.color}`}>
              <c.icon className="text-lg" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Graphs Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* SVG Chart Panel */}
        <motion.div variants={fadeInUp} className="glass-card rounded-3xl p-6 border border-white/5">
          <h3 className="font-bold text-lg mb-6">Service Frequency Analysis</h3>
          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
              const h = dailyDistribution[idx];
              return (
                <div key={day} className="flex-1 flex flex-col justify-end h-full group">
                  <div className="w-full bg-white/[0.02] border border-white/5 rounded-t-lg h-44 relative flex items-end justify-center overflow-hidden">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="w-full max-w-[20px] bg-gradient-to-t from-orange-500/20 to-orange-500/80 rounded-t-sm group-hover:from-orange-400/40 group-hover:to-orange-400 transition-all cursor-pointer"
                    />
                    {/* Hover Tooltip */}
                    <span className="opacity-0 group-hover:opacity-100 absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/85 text-white text-[9px] py-0.5 px-1 rounded-md border border-white/10 font-bold pointer-events-none transition-opacity z-10">
                      {Math.round(h)}%
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-[var(--text-secondary)] text-center mt-2">{day}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Payment Shares Panel */}
        <motion.div variants={fadeInUp} className="glass-card rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-6">Payment Composition (Sales Vol)</h3>
            <div className="space-y-4">
              {[
                { name: 'UPI Gateway', key: 'upi', icon: FaMobileAlt, color: 'bg-blue-500/20 text-blue-400', progressColor: 'bg-blue-400' },
                { name: 'Service Wallet', key: 'wallet', icon: FaWallet, color: 'bg-emerald-500/20 text-emerald-400', progressColor: 'bg-emerald-400' },
                { name: 'Cash on Hand', key: 'cash', icon: FaMoneyBillWave, color: 'bg-amber-500/20 text-amber-400', progressColor: 'bg-amber-400' },
                { name: 'Credit/Debit Card', key: 'card', icon: FaCreditCard, color: 'bg-rose-500/20 text-rose-400', progressColor: 'bg-rose-400' }
              ].map(pay => {
                const amount = stats.payments[pay.key] || 0;
                const percent = stats.gmv > 0 ? (amount / stats.gmv) * 100 : 0;
                return (
                  <div key={pay.key} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 font-medium">
                        <div className={`p-1.5 rounded-lg ${pay.color}`}>
                          <pay.icon className="text-xs" />
                        </div>
                        <span>{pay.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-semibold">{formatCurrency(amount)}</span>
                        <span className="text-[var(--text-secondary)]">({percent.toFixed(0)}%)</span>
                      </div>
                    </div>
                    {/* Dynamic Bar */}
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.6 }}
                        className={`h-full rounded-full ${pay.progressColor}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-6 border-t border-white/5 pt-4 flex justify-between items-center text-xs text-[var(--text-secondary)]">
            <span>Commission Margin: 15% flat rate</span>
            <span className="font-semibold text-white">GMV Fee System</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Reports;
