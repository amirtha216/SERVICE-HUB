import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import BookingCard from '../../components/cards/BookingCard';
import { staggerContainer, fadeInUp } from '../../animations';
import { FaBriefcase } from 'react-icons/fa';

const Bookings = () => {
  const { user } = useAuth();
  const { bookings: allBookings } = useBooking();
  const [filter, setFilter] = useState('all');

  // Filter and sort bookings for this provider (excluding pending requests)
  const bookings = useMemo(() => {
    return allBookings
      .filter(b => b.providerId === user?.id && b.status !== 'pending')
      .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
  }, [allBookings, user?.id]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (filter === 'all') return true;
      if (filter === 'active') {
        return ['accepted', 'on_the_way', 'reached', 'service_started'].includes(b.status);
      }
      if (filter === 'past') {
        return ['completed', 'cancelled'].includes(b.status);
      }
      return true;
    });
  }, [bookings, filter]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2.5">
            <FaBriefcase className="text-orange-500" /> My Jobs
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Manage your active service assignments and view job history
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          {['all', 'active', 'past'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-orange-500/20 to-rose-500/10 text-orange-400 shadow-sm border border-orange-500/10'
                  : 'text-[var(--text-secondary)] hover:text-white border border-transparent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Bookings Grid */}
      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredBookings.map(booking => (
              <motion.div
                key={booking.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <BookingCard booking={booking} role="provider" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          variants={fadeInUp}
          className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/5"
        >
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBriefcase className="text-2xl text-[var(--text-secondary)] opacity-50" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
          <p className="text-[var(--text-secondary)] text-sm">
            You don't have any {filter !== 'all' ? filter : ''} jobs assigned at the moment.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Bookings;
