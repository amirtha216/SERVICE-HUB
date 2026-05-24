import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';
import ServiceCard from '../../components/cards/ServiceCard';
import ProviderCard from '../../components/cards/ProviderCard';
import { staggerContainer, fadeInUp } from '../../animations';
import { useTranslation } from '../../utils/translations';
import { useBooking } from '../../context/BookingContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { bookings: allBookings } = useBooking();
  const [services, setServices] = useState([]);
  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');

  const activeBookings = allBookings
    .filter(b => b.userId === user?.id && ['pending', 'accepted', 'on_the_way', 'reached', 'service_started'].includes(b.status))
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/user/services?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/user/services');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const activeAddr = user?.savedAddresses?.[0];
      const [allServices, providers] = await Promise.all([
        bookingService.getServices(),
        bookingService.getNearbyProviders(activeAddr?.lat, activeAddr?.lng)
      ]);
      setServices(allServices.filter(s => s.isPopular));
      setNearbyProviders(providers.slice(0, 4));
      setLoading(false);
    };
    loadData();
  }, [user]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Header section */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            {t('good_morning')}, <span className="text-gradient">{user?.name.split(' ')[0]}</span>
          </h1>
          <p className="text-[var(--text-secondary)]">{t('need_assistance')}</p>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.04] px-4 py-2 rounded-xl border border-white/[0.06] w-full md:w-auto">
          <FaMapMarkerAlt className="text-orange-500" />
          <span className="text-sm font-medium truncate max-w-[200px]">{user?.address || t('detecting_location')}</span>
        </div>
      </motion.div>

      {/* Active Booking Banner */}
      {activeBookings.length > 0 && (
        <motion.div 
          variants={fadeInUp} 
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-500/20 via-orange-600/10 to-transparent border border-orange-500/30 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[0_0_30px_rgba(249,115,22,0.15)]"
        >
          <div className="absolute -left-6 -top-6 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">{t('active_request') || 'Active Service Request'}</span>
            </div>
            <h3 className="text-xl font-bold">{activeBookings[0].serviceName}</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Status: <span className="text-orange-400 capitalize font-medium">{activeBookings[0].status.replace(/_/g, ' ')}</span>
            </p>
            {activeBookings[0].otp && (
              <div className="inline-flex items-center gap-2 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20 mt-2">
                <span className="text-xs text-orange-400 font-semibold uppercase tracking-wider">Verification OTP:</span>
                <span className="text-base font-extrabold tracking-wider text-orange-400">{activeBookings[0].otp}</span>
              </div>
            )}
          </div>
          <div className="relative z-10 flex flex-row items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => navigate(`/user/track/${activeBookings[0].id}`)}
              className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/25"
            >
              Track Progress
            </button>
          </div>
        </motion.div>
      )}

      {/* Hero Banner */}
      <motion.div variants={fadeInUp} className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 border border-white/[0.1] shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        <div className="relative p-8 md:p-12 z-10 w-full md:w-2/3">
          <span className="inline-block px-3 py-1 bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider rounded-lg mb-4 backdrop-blur-md">24/7 Support</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{t('instant_roadside')}<br/><span className="text-orange-400">{t('assistance')}</span></h2>
          <p className="text-gray-300 mb-8 max-w-md">{t('hero_description')}</p>
          
          <form onSubmit={handleSearchSubmit} className="relative max-w-md flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
            <FaSearch className="absolute left-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('what_service_do_you_need')}
              className="w-full bg-transparent border-none outline-none pl-12 pr-4 py-3 text-white placeholder:text-gray-400"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors h-full">
              {t('find')}
            </button>
          </form>
        </div>
      </motion.div>

      {/* Popular Services */}
      <motion.div variants={fadeInUp}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{t('popular_services')}</h2>
          <button 
            onClick={() => navigate('/user/services')}
            className="text-sm font-medium text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
          >
            {t('see_all')} <FaArrowRight className="text-[10px]" />
          </button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Nearby Providers */}
      <motion.div variants={fadeInUp}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{t('nearby_providers')}</h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyProviders.map((provider) => (
              <ProviderCard 
                key={provider.id} 
                provider={provider} 
                onSelect={(p) => navigate(`/user/services?provider=${p.id}`)}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Home;
