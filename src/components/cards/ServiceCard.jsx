import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaGasPump, FaOilCan, FaMotorcycle, FaCar, FaTruckPickup, FaCircle, FaBatteryFull, FaSprayCan, FaShower, FaWrench, FaStar, FaArrowRight, FaAmbulance, FaHeartbeat } from 'react-icons/fa';
import { formatCurrency } from '../../utils/helpers';

const iconMap = {
  FaGasPump, FaOilCan, FaMotorcycle, FaCar, FaTruckPickup, FaCircle,
  FaBatteryFull, FaSprayCan, FaShower, FaWrench, FaAmbulance, FaHeartbeat
};

const gradients = [
  'from-orange-500 to-rose-600',
  'from-blue-500 to-cyan-500',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-indigo-500 to-blue-600',
  'from-cyan-500 to-blue-500',
  'from-teal-500 to-emerald-500',
  'from-red-500 to-rose-600'
];

const ServiceCard = ({ service, index = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const Icon = iconMap[service.icon] || FaWrench;
  const gradient = gradients[index % gradients.length];
  
  const queryParams = new URLSearchParams(location.search);
  const providerParam = queryParams.get('provider');

  const handleCardClick = () => {
    if (providerParam) {
      navigate(`/user/services/${service.slug}?provider=${providerParam}`);
    } else {
      navigate(`/user/services/${service.slug}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={handleCardClick}
      className="group cursor-pointer bg-[var(--card-bg)] rounded-2xl border border-white/[0.06] overflow-hidden hover:border-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5"
    >
      <div className={`h-32 bg-gradient-to-br ${gradient} p-5 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <Icon className="text-4xl text-white/90 relative z-10" />
        {service.isPopular && (
          <span className="absolute top-3 right-3 px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold text-white uppercase tracking-wide">
            Popular
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-base mb-1 group-hover:text-orange-400 transition-colors">
          {service.name}
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mb-3 line-clamp-2">{service.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-orange-400">{formatCurrency(service.basePrice)}</span>
            <span className="text-[10px] text-[var(--text-secondary)] ml-1">onwards</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <FaStar className="text-amber-400" />
            <span className="font-medium">{service.rating}</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-secondary)]">⏱ {service.estimatedTime}</span>
          <motion.span
            className="text-xs text-orange-400 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Book Now <FaArrowRight className="text-[10px]" />
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
