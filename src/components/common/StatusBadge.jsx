import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../../constants';

const StatusBadge = ({ status, size = 'sm' }) => {
  const colors = BOOKING_STATUS_COLORS[status] || BOOKING_STATUS_COLORS.pending;
  const label = BOOKING_STATUS_LABELS[status] || status;
  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center rounded-lg font-semibold ${sizeClass} ${colors.bg} ${colors.text} border ${colors.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'completed' ? 'bg-emerald-400' : status === 'cancelled' ? 'bg-red-400' : 'bg-current animate-pulse'}`} />
      {label}
    </span>
  );
};

export default StatusBadge;
