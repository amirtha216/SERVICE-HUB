import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaUserTie, FaClipboardList, FaRupeeSign, FaExclamationTriangle, FaCheckCircle, FaTrash, FaEdit } from 'react-icons/fa';
import adminService from '../../services/adminService';
import { useBooking } from '../../context/BookingContext';
import { formatCurrency } from '../../utils/helpers';
import { staggerContainer, fadeInUp } from '../../animations';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Dashboard = () => {
  const { bookings } = useBooking();
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersData, providersData, complaintsData] = await Promise.all([
          adminService.getAllUsers(),
          adminService.getAllProviders(),
          adminService.getComplaints()
        ]);
        setUsers(usersData);
        setProviders(providersData);
        setComplaints(complaintsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Compute live booking stats reactively from context
  const stats = useMemo(() => {
    const totalEarnings = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.finalAmount || 0), 0);
    return {
      totalBookings: bookings.length,
      totalEarnings,
      activeBookings: bookings.filter(b => !['completed', 'cancelled'].includes(b.status)).length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length
    };
  }, [bookings]);

  const statCards = [
    { label: "Total Users", value: users.length, icon: FaUsers, color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500" },
    { label: "Total Providers", value: providers.length, icon: FaUserTie, color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500" },
    { label: "Active Bookings", value: stats.activeBookings, icon: FaClipboardList, color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500" },
    { label: "Total Earnings", value: formatCurrency(stats.totalEarnings), icon: FaRupeeSign, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500" }
  ];

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)]">Platform overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <motion.div key={idx} variants={fadeInUp} className={`glass-card rounded-2xl p-6 border-l-4 ${card.border} relative overflow-hidden`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[var(--text-secondary)] text-sm mb-1">{card.label}</p>
                <h3 className="text-2xl font-bold">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon className="text-xl" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={fadeInUp} className="lg:col-span-2 glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Booking Overview</h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Completed ({stats.completedBookings})</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Cancelled ({stats.cancelledBookings})</span>
            </div>
          </div>
          {/* Dashboard volume bars */}
          <div className="h-64 flex items-end gap-3 pt-6">
            {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end h-full group">
                <div className="w-full bg-white/[0.02] border border-white/5 rounded-t-lg h-44 relative flex items-end overflow-hidden">
                  <div 
                    className="w-full bg-gradient-to-t from-orange-500/20 to-orange-500/80 rounded-t-lg transition-all group-hover:from-orange-400/40 group-hover:to-orange-400" 
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
                <div className="text-center text-[10px] mt-2 text-[var(--text-secondary)] font-medium">Day {i+1}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaExclamationTriangle className="text-rose-400" /> Recent Complaints
            </h2>
          </div>
          
          <div className="space-y-4">
            {complaints.length > 0 ? complaints.slice(0, 4).map(comp => (
              <div key={comp.id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm">{comp.subject}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-bold ${
                    comp.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                    comp.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {comp.priority}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-2 line-clamp-2">{comp.message}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10 text-[10px] text-[var(--text-secondary)]">
                  <span>By: {comp.userName}</span>
                  <span className={`flex items-center gap-1 ${comp.status === 'resolved' ? 'text-emerald-400' : ''}`}>
                    {comp.status === 'resolved' ? <FaCheckCircle /> : null} {comp.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-[var(--text-secondary)]">No active complaints</div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
