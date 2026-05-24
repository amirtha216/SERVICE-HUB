import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaCheckCircle, FaBriefcase } from 'react-icons/fa';

const ProviderCard = ({ provider, onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-[var(--card-bg)] rounded-2xl border border-white/[0.06] p-4 hover:border-orange-500/20 transition-all cursor-pointer"
      onClick={() => onSelect?.(provider)}
    >
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={provider.avatar}
            alt={provider.name}
            className="w-14 h-14 rounded-xl object-cover"
          />
          {provider.isVerified && (
            <FaCheckCircle className="absolute -bottom-1 -right-1 text-emerald-500 bg-[var(--card-bg)] rounded-full text-sm" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-sm">{provider.name}</h4>
              <p className="text-xs text-[var(--text-secondary)]">{provider.ownerName}</p>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15">
              <FaStar className="text-amber-400 text-xs" />
              <span className="text-xs font-bold text-emerald-400">{provider.rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
              <FaBriefcase className="text-[10px]" /> {provider.totalJobsCompleted} jobs
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] truncate max-w-[120px]" title={provider.location?.address}>
              <FaMapMarkerAlt className="text-[10px]" /> {provider.location?.address}
            </span>
            {provider.distance !== undefined && provider.distance !== null && provider.distance !== 999 && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-orange-400">
                • {provider.distance} km
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {provider.serviceType?.slice(0, 3).map(s => (
              <span key={s} className="px-2 py-0.5 bg-white/[0.06] rounded-md text-[10px] font-medium capitalize">
                {s.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${provider.isAvailable ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <span className={`text-xs font-medium ${provider.isAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
            {provider.isAvailable ? 'Available' : 'Busy'}
          </span>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">{provider.experience} exp</span>
      </div>
    </motion.div>
  );
};

export default ProviderCard;
