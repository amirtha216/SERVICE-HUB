import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaClipboardList, FaFilter } from 'react-icons/fa';
import { useBooking } from '../../context/BookingContext';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime, formatCurrency } from '../../utils/helpers';
import { staggerContainer, fadeInUp } from '../../animations';

const Bookings = () => {
  const { bookings: contextBookings } = useBooking();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sort newest first reactively from context
  const sortedBookings = useMemo(() => {
    return [...contextBookings].sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
  }, [contextBookings]);

  const filteredBookings = useMemo(() => {
    return sortedBookings.filter(b => {
      const matchesSearch = b.id.toLowerCase().includes(search.toLowerCase()) || 
                            b.serviceName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sortedBookings, search, statusFilter]);

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <FaClipboardList className="text-orange-500" /> Booking History
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">Monitor all platform transactions</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/[0.04] border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-orange-500/50 text-sm text-white"
          >
            <option value="all" className="bg-[#121214]">All Statuses</option>
            <option value="pending" className="bg-[#121214]">Pending</option>
            <option value="accepted" className="bg-[#121214]">Accepted</option>
            <option value="on_the_way" className="bg-[#121214]">On The Way</option>
            <option value="reached" className="bg-[#121214]">Reached</option>
            <option value="service_started" className="bg-[#121214]">Service Started</option>
            <option value="completed" className="bg-[#121214]">Completed</option>
            <option value="cancelled" className="bg-[#121214]">Cancelled</option>
          </select>
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search ID or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-orange-500/50 text-sm text-white"
            />
          </div>
        </div>
      </div>

      <motion.div variants={fadeInUp} className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Booking ID</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Service</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Date & Time</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Amount</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Status</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Payment</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono text-sm">{booking.id}</td>
                  <td className="p-4">
                    <p className="font-semibold text-sm">{booking.serviceName}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] truncate max-w-[150px]">{booking.userLocation?.address}</p>
                  </td>
                  <td className="p-4 text-xs text-[var(--text-secondary)]">
                    {formatDateTime(booking.bookingDate)}
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-white">{formatCurrency(booking.finalAmount)}</span>
                    {booking.discount > 0 && <span className="block text-[10px] text-emerald-400">-{formatCurrency(booking.discount)}</span>}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="p-4">
                    <span className={`text-[11px] font-bold uppercase px-2 py-1 rounded-md ${
                      booking.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                      booking.paymentStatus === 'refunded' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-white/5 text-[var(--text-secondary)]'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1 capitalize">{booking.paymentMethod}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="text-center py-10 text-[var(--text-secondary)]">
              No bookings found matching criteria.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Bookings;
