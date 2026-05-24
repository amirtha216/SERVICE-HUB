import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import BookingCard from '../../components/cards/BookingCard';
import Modal from '../../components/common/Modal';
import StarRating from '../../components/common/StarRating';
import { staggerContainer, fadeInUp } from '../../animations';
import { useTranslation } from '../../utils/translations';

const Bookings = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { bookings: allBookings, rateBooking, updateBookingStatus } = useBooking();
  
  const [filter, setFilter] = useState('all');
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Derive user bookings from context, sorted newest-first
  const bookings = useMemo(() => {
    return allBookings
      .filter(b => b.userId === user?.id)
      .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
  }, [allBookings, user?.id]);

  useEffect(() => {
    if (id && bookings.length > 0) {
      const found = bookings.find(b => b.id === id);
      if (found) {
        setSelectedBooking(found);
        setIsModalOpen(true);
      }
    }
  }, [id, bookings]);

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['completed', 'cancelled'].includes(b.status);
    if (filter === 'past') return ['completed', 'cancelled'].includes(b.status);
    return true;
  });

  const handleCancel = async () => {
    if (!selectedBooking) return;
    await updateBookingStatus(selectedBooking.id, 'cancelled');
    setIsModalOpen(false);
  };

  const submitReview = async () => {
    if (!selectedBooking) return;
    await rateBooking(selectedBooking.id, rating, reviewText);
    setIsModalOpen(false);
  };

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">{t('my_bookings')}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t('manage_requests')}</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl">
          {['all', 'active', 'past'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f ? 'bg-white/10 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              {t(f)}
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredBookings.map(booking => (
              <motion.div key={booking.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <BookingCard booking={booking} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/5">
          <h3 className="text-lg font-semibold mb-2">{t('no_bookings')}</h3>
          <p className="text-[var(--text-secondary)]">{t('no_bookings_desc')}</p>
        </div>
      )}

      {/* Booking Details / Review Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('booking_details')}>
        {selectedBooking && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg">{selectedBooking.serviceName}</h4>
                <p className="text-sm text-[var(--text-secondary)]">ID: {selectedBooking.id}</p>
              </div>
              <span className="font-bold text-xl text-orange-400">₹{selectedBooking.finalAmount}</span>
            </div>

            {['pending', 'accepted', 'on_the_way', 'reached', 'service_started'].includes(selectedBooking.status) && (
              <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-xl text-center space-y-1 relative overflow-hidden">
                <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider block">{t('service_verification_otp')}</span>
                <span className="text-2xl font-bold tracking-[0.25em] text-orange-400">{selectedBooking.otp}</span>
                <p className="text-[10px] text-[var(--text-secondary)]">{t('otp_share_message')}</p>
              </div>
            )}

            {selectedBooking.status === 'completed' && !selectedBooking.rating && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h5 className="font-medium mb-3">{t('rate_experience')}</h5>
                <div className="mb-4">
                  <StarRating rating={rating} interactive={true} onChange={setRating} size="lg" />
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Leave a review (optional)"
                  className="w-full bg-black/20 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 ring-orange-500 mb-3"
                  rows="3"
                />
                <button 
                  onClick={submitReview}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  {t('submit_review')}
                </button>
              </div>
            )}
            
            {selectedBooking.status === 'pending' && (
              <button 
                onClick={handleCancel}
                className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium py-2 rounded-lg transition-colors"
              >
                {t('cancel_booking')}
              </button>
            )}
          </div>
        )}
      </Modal>

    </motion.div>
  );
};

export default Bookings;
