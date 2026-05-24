import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaCheck, FaTimes, FaCarSide } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { staggerContainer, fadeInUp } from '../../animations';
import { toast } from 'react-hot-toast';

const Requests = () => {
  const { user } = useAuth();
  const { bookings, updateBookingStatus, cancelBooking } = useBooking();

  // Derive incoming requests reactively from context
  const requests = useMemo(() => {
    return bookings.filter(b => b.providerId === user?.id && b.status === 'pending');
  }, [bookings, user?.id]);

  const handleAction = async (bookingId, action) => {
    try {
      if (action === 'accept') {
        await updateBookingStatus(bookingId, 'accepted');
        toast.success('Booking accepted successfully!');
      } else {
        await cancelBooking(bookingId);
        toast.success('Booking rejected.');
      }
    } catch (err) {
      toast.error(`Failed to ${action} booking`);
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold mb-1">Incoming Requests</h1>
        <p className="text-sm text-[var(--text-secondary)]">Manage your new service bookings</p>
      </div>

      <AnimatePresence mode="popLayout">
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map(request => (
              <motion.div
                key={request.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                className="glass-card rounded-2xl p-6 border-l-4 border-l-orange-500 relative overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
                
                <div className="flex flex-col md:flex-row gap-6 justify-between relative z-10">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <FaCarSide className="text-orange-400" /> {request.serviceName}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{formatDateTime(request.bookingDate)}</p>
                      </div>
                      <span className="text-xl font-bold text-orange-400">{formatCurrency(request.finalAmount)}</span>
                    </div>

                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-sm">
                      <div className="flex gap-2 mb-2">
                        <FaMapMarkerAlt className="text-rose-400 mt-1 shrink-0" />
                        <div>
                          <p className="text-[var(--text-secondary)] text-xs mb-0.5">Customer Location</p>
                          <p className="font-medium">{request.userLocation?.address}</p>
                        </div>
                      </div>
                      {request.issue && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-[var(--text-secondary)] text-xs mb-0.5">Notes</p>
                          <p className="font-medium text-white/90">"{request.issue}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-3 justify-center min-w-[140px]">
                    <button
                      onClick={() => handleAction(request.id, 'accept')}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <FaCheck /> Accept
                    </button>
                    <button
                      onClick={() => handleAction(request.id, 'reject')}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 py-3 px-4 rounded-xl font-bold transition-all"
                    >
                      <FaTimes /> Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-3xl p-12 text-center border-dashed">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full animate-ping"></div>
              <FaCarSide className="text-3xl text-orange-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No pending requests</h3>
            <p className="text-[var(--text-secondary)] max-w-sm mx-auto">
              You're all caught up! Make sure you're marked as "Online" to receive new bookings.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Requests;
