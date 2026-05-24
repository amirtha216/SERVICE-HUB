import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaMoneyBillWave, FaShieldAlt, FaChevronLeft, FaMapMarkerAlt, FaCarSide, FaInfoCircle } from 'react-icons/fa';
import bookingService from '../../services/bookingService';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import ProviderCard from '../../components/cards/ProviderCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../utils/helpers';
import { toast } from 'react-hot-toast';

const ServiceDetails = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { createBooking } = useBooking();
  
  const [service, setService] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [step, setStep] = useState(1); // 1: Info, 2: Provider, 3: Confirm
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [issue, setIssue] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [distance, setDistance] = useState(4.5);
  
  const queryParams = new URLSearchParams(location.search);
  const preSelectedProviderId = queryParams.get('provider');

  useEffect(() => {
    if (selectedProvider) {
      const dist = selectedProvider.distance !== undefined && selectedProvider.distance !== null && selectedProvider.distance !== 999 
        ? selectedProvider.distance 
        : 4.5;
      setDistance(dist);
    }
  }, [selectedProvider]);

  const distanceFare = service ? Math.round(service.pricePerKm * distance) : 0;
  const basePriceClamped = service ? Math.max(99, service.basePrice) : 99;
  const totalFare = service ? Math.round(basePriceClamped + distanceFare) : 0;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const svc = await bookingService.getServiceBySlug(slug);
      if (svc) {
        setService(svc);
        const activeAddr = user?.savedAddresses?.[0];
        const provs = await bookingService.getProvidersByService(svc.slug, activeAddr?.lat, activeAddr?.lng);
        setProviders(provs);
        
        if (preSelectedProviderId) {
          const prov = provs.find(p => p.id === preSelectedProviderId);
          if (prov) {
            setSelectedProvider(prov);
            setStep(3); // Jump to confirm
          }
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [slug, preSelectedProviderId, user]);

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setStep(3);
  };

  const handleBook = async () => {
    if (!selectedProvider) return;
    
    if ((user.wallet || 0) < totalFare) {
      toast.error('Insufficient wallet balance. Please add money first!');
      navigate('/user/wallet');
      return;
    }

    setIsBooking(true);
    try {
      const activeAddr = user?.savedAddresses?.[0] || { lat: 13.0827, lng: 80.2707, address: user.address || 'Chennai, Tamil Nadu' };
      
      const providerLat = selectedProvider.location?.lat || 13.0827;
      const providerLng = selectedProvider.location?.lng || 80.2707;
      const adjustedUserLocation = {
        ...activeAddr,
        lat: parseFloat((providerLat + (distance / 111.12)).toFixed(5)),
        lng: providerLng
      };
      
      const newBooking = await createBooking({
        userId: user.id,
        providerId: selectedProvider.id,
        serviceId: service.id,
        serviceName: service.name,
        userLocation: adjustedUserLocation,
        providerLocation: selectedProvider.location,
        amount: totalFare,
        discount: 0,
        finalAmount: totalFare,
        paymentMethod: 'wallet',
        issue
      });
      
      // Persist the updated wallet balance to Supabase
      const walletRes = await authService.updateProfile(user.id, { wallet: (user.wallet || 0) - totalFare });
      if (walletRes.success) {
        updateProfile(walletRes.user);
      }
      
      toast.success('Booking confirmed!');
      navigate(`/user/track/${newBooking.id}`);
    } catch (error) {
      toast.error('Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading service details..." />;
  if (!service) return <div className="text-center py-10">Service not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-white mb-6 transition-colors"
      >
        <FaChevronLeft /> Back
      </button>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-orange-500 rounded-full z-0 transition-all duration-300"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        ></div>
        
        {['Service Details', 'Select Provider', 'Confirm Booking'].map((label, idx) => {
          const num = idx + 1;
          const isActive = step >= num;
          return (
            <div key={num} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-[var(--card-bg)] border border-white/20 text-white/50'
              }`}>
                {num}
              </div>
              <span className={`text-[10px] sm:text-xs font-medium absolute -bottom-6 w-max ${isActive ? 'text-white' : 'text-white/50'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-3xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-orange-500/20 to-rose-600/20 border border-orange-500/20 flex items-center justify-center overflow-hidden">
                     {/* Using a placeholder gradient since we don't have real images in dummy data */}
                     <FaCarSide className="text-6xl text-orange-400 opacity-50" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{service.name}</h1>
                    <p className="text-[var(--text-secondary)] leading-relaxed">{service.longDescription}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10">
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] mb-1">Base Price</p>
                      <p className="text-xl font-bold text-orange-400">{formatCurrency(service.basePrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] mb-1">Per Km Rate</p>
                      <p className="text-xl font-bold text-white">{formatCurrency(service.pricePerKm)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1.5"><FaClock className="text-orange-400"/> {service.estimatedTime}</span>
                    <span className="flex items-center gap-1.5"><FaShieldAlt className="text-emerald-400"/> Verified</span>
                    <span className="flex items-center gap-1.5"><FaMoneyBillWave className="text-blue-400"/> Cashless</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setStep(2)}
                className="bg-gradient-to-r from-orange-500 to-rose-500 px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all"
              >
                Continue to Select Provider
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Available Providers Near You</h2>
              <span className="text-sm text-[var(--text-secondary)] bg-white/5 px-3 py-1 rounded-full">
                {providers.length} found
              </span>
            </div>
            
            {providers.length === 0 ? (
              <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/10">
                <FaInfoCircle className="text-4xl text-[var(--text-secondary)] mx-auto mb-3 opacity-50" />
                <p>No providers currently available for this service.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map(provider => (
                  <ProviderCard key={provider.id} provider={provider} onSelect={handleProviderSelect} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {step === 3 && selectedProvider && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">Service Details</h3>
                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                    <div className="p-3 bg-orange-500/20 text-orange-400 rounded-lg">
                      <FaCarSide className="text-xl" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{service.name}</h4>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{service.description}</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 border border-orange-500/20 bg-orange-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <FaMapMarkerAlt className="text-orange-400" />
                    <h3 className="text-lg font-bold text-white">Adjust Distance (Simulation)</h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
                    Set the simulated travel distance to the provider. The price recalculates instantly.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-semibold text-white">
                      <span>Simulated Distance:</span>
                      <span className="text-orange-400 text-lg font-black">{distance} km</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="0.5"
                      value={distance}
                      onChange={(e) => setDistance(parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex justify-between text-[10px] text-[var(--text-secondary)] font-bold">
                      <span>1 km</span>
                      <span>5 km</span>
                      <span>10 km</span>
                      <span>15 km (Max)</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">Add Notes (Optional)</h3>
                  <textarea
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="E.g., Honda City, White color, parked near gate 2..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-orange-500/50 min-h-[100px]"
                  ></textarea>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">Selected Provider</h3>
                  <div className="flex items-center gap-3">
                    <img src={selectedProvider.avatar} alt="" className="w-12 h-12 rounded-lg" />
                    <div>
                      <p className="font-semibold">{selectedProvider.name}</p>
                      <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                        <FaMapMarkerAlt /> {selectedProvider.location.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">Payment Summary</h3>
                  <div className="space-y-3 text-sm mb-4">
                    <div className="flex justify-between text-[var(--text-secondary)]">
                      <span>Base Fare</span>
                      <span>{formatCurrency(service.basePrice)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-secondary)]">
                      <span>Distance Fare ({distance} km)</span>
                      <span>{formatCurrency(distanceFare)}</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-orange-400">
                        {formatCurrency(totalFare)}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleBook}
                    disabled={isBooking}
                    className="w-full bg-gradient-to-r from-orange-500 to-rose-500 py-3.5 rounded-xl font-bold flex items-center justify-center disabled:opacity-70"
                  >
                    {isBooking ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceDetails;
