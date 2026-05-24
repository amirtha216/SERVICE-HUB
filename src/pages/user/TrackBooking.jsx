import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaCommentDots, FaShieldAlt, FaChevronLeft, FaMapMarkerAlt } from 'react-icons/fa';
import { useBooking } from '../../context/BookingContext';
import providerService from '../../services/providerService';
import TrackingMap from '../../components/maps/TrackingMap';
import StatusBadge from '../../components/common/StatusBadge';
import { getStatusStep } from '../../utils/helpers';
import { staggerContainer, fadeInUp } from '../../animations';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TrackBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookings } = useBooking();
  
  // Real-time tracking states
  const [liveLocation, setLiveLocation] = useState(null);
  const [currentEta, setCurrentEta] = useState('');
  const [currentDistance, setCurrentDistance] = useState(0);
  const [provider, setProvider] = useState(null);
  const [loadingProvider, setLoadingProvider] = useState(true);

  // Derive booking from context reactively
  const booking = useMemo(() => bookings.find(b => b.id === id), [bookings, id]);

  useEffect(() => {
    const loadProvider = async () => {
      if (booking?.providerId) {
        setLoadingProvider(true);
        const prov = await providerService.getProviderById(booking.providerId);
        setProvider(prov);
        setLoadingProvider(false);
      } else {
        setLoadingProvider(false);
      }
    };
    loadProvider();
  }, [booking]);

  useEffect(() => {
    if (booking?.providerLocation) {
      setLiveLocation(booking.providerLocation);
    }
  }, [booking]);

  const currentStep = booking ? getStatusStep(booking.status) : 0;
  const isTrackingActive = booking ? ['accepted', 'on_the_way'].includes(booking.status) : false;

  const handleLocationUpdate = (newLoc, dist, eta) => {
    setLiveLocation(newLoc);
    setCurrentDistance(dist);
    setCurrentEta(eta);
  };

  if (!booking) return <div className="text-center py-10 text-[var(--text-secondary)]">Booking not found</div>;
  if (loadingProvider || !provider) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Connecting to provider..." />
      </div>
    );
  }

  return (
    <motion.div 
      variants={staggerContainer} 
      initial="initial" 
      animate="animate" 
      className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => navigate('/user/bookings')}
          className="flex items-center gap-2 text-sm font-medium hover:text-orange-400 transition-colors"
        >
          <FaChevronLeft /> Back to Bookings
        </button>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Map Section */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative h-[40vh] lg:h-full">
          <TrackingMap 
            userLocation={booking.userLocation}
            providerLocation={liveLocation || booking.providerLocation}
            isTracking={isTrackingActive}
            onLocationUpdate={handleLocationUpdate}
          />
        </div>

        {/* Info Section */}
        <div className="flex flex-col gap-6 overflow-y-auto hide-scrollbar pb-4 lg:h-full">
          {/* OTP Card */}
          {['pending', 'accepted', 'on_the_way', 'reached', 'service_started'].includes(booking.status) && booking.otp && (
            <div 
              style={{ 
                background: 'rgba(249, 115, 22, 0.08)', 
                border: '1px solid rgba(249, 115, 22, 0.25)',
                borderRadius: '16px',
                padding: '20px 24px'
              }}
            >
              <p className="text-sm text-[var(--text-secondary)] mb-2">Share this OTP to start service</p>
              <div className="flex items-center justify-between">
                <span 
                  style={{ 
                    fontSize: '32px', 
                    fontWeight: 900, 
                    letterSpacing: '0.25em', 
                    color: '#fb923c',
                    lineHeight: 1.2
                  }}
                >
                  {booking.otp}
                </span>
                <FaShieldAlt style={{ fontSize: '24px', color: '#34d399', opacity: 0.9 }} />
              </div>
            </div>
          )}

          {/* Provider Card */}
          <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Provider Details</h3>
            <div className="flex items-center gap-4 mb-4">
              <img src={provider.avatar} alt={provider.name} className="w-14 h-14 rounded-xl object-cover" />
              <div className="flex-1">
                <h4 className="font-bold">{provider.name}</h4>
                <p className="text-sm text-[var(--text-secondary)]">{provider.vehicleType}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-2.5 rounded-xl text-sm font-medium transition-colors">
                <FaPhoneAlt className="text-emerald-400" /> Call
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-2.5 rounded-xl text-sm font-medium transition-colors">
                <FaCommentDots className="text-blue-400" /> Message
              </button>
            </div>
          </motion.div>

          {/* Tracking Status Timeline */}
          <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-6 flex-1">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-6">Status</h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {[
                { step: 0, label: 'Booking Pending', sub: 'Waiting for provider to accept' },
                { step: 1, label: 'Booking Accepted', sub: 'Provider is preparing to leave' },
                { step: 2, label: 'On The Way', sub: isTrackingActive ? `${currentDistance} km away (ETA: ${currentEta})` : 'Provider is en route' },
                { step: 3, label: 'Reached Location', sub: 'Provider has arrived' },
                { step: 4, label: 'Service Started', sub: 'Work in progress' },
                { step: 5, label: 'Completed', sub: 'Service finished successfully' }
              ].map((item) => (
                <div key={item.step} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 bg-[var(--card-bg)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${
                    currentStep >= item.step ? 'border-orange-500 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'border-white/20'
                  }`}>
                    {currentStep >= item.step && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  
                  <div className={`w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 ${item.step === currentStep ? 'opacity-100' : currentStep > item.step ? 'opacity-70' : 'opacity-40'}`}>
                    <h4 className="font-semibold text-sm">{item.label}</h4>
                    <p className="text-xs text-[var(--text-secondary)]">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrackBooking;
