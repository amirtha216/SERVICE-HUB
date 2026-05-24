import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import StatusBadge from '../common/StatusBadge';

const BookingCard = ({ booking, role = 'user' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (role === 'user') {
      if (['pending', 'accepted', 'on_the_way', 'reached', 'service_started'].includes(booking.status)) {
        navigate(`/user/track/${booking.id}`);
      } else {
        navigate(`/user/bookings/${booking.id}`);
      }
    } else if (role === 'provider') {
      navigate(`/provider/bookings/${booking.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      onClick={handleClick}
      className="bg-[var(--card-bg)] rounded-2xl border border-white/[0.06] p-4 cursor-pointer hover:border-white/10 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-sm">{booking.serviceName}</h4>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {formatDateTime(booking.bookingDate)}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-3">
        <span className="truncate">📍 {booking.userLocation?.address}</span>
      </div>

      {booking.issue && (
        <p className="text-xs text-[var(--text-secondary)] bg-white/[0.03] rounded-lg p-2 mb-3">
          💬 {booking.issue}
        </p>
      )}

      {role === 'user' && ['pending', 'accepted', 'on_the_way', 'reached', 'service_started'].includes(booking.status) && booking.otp && (
        <div className="mb-3 px-3 py-2 bg-orange-500/5 border border-orange-500/10 rounded-xl flex items-center justify-between text-xs">
          <span className="text-[var(--text-secondary)]">Verification OTP:</span>
          <span className="font-bold tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg text-sm">{booking.otp}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        <span className="text-base font-bold text-orange-400">
          {formatCurrency(booking.finalAmount)}
        </span>
        <span className="text-[11px] text-[var(--text-secondary)] capitalize px-2 py-0.5 bg-white/[0.04] rounded-md">
          {booking.paymentMethod}
        </span>
      </div>
    </motion.div>
  );
};

export default BookingCard;
