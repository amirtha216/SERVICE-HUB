import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRupeeSign, FaBriefcase, FaStar, FaClock, FaToggleOn, FaToggleOff, FaShieldAlt, FaPhoneAlt, FaMapMarkerAlt, FaTimes, FaCheckCircle, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import providerService from '../../services/providerService';
import BookingCard from '../../components/cards/BookingCard';
import Modal from '../../components/common/Modal';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { staggerContainer, fadeInUp } from '../../animations';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { bookings, updateBookingStatus } = useBooking();
  
  const [selectedBookingId, setSelectedBookingId] = useState(routeId || null);
  const [otpInput, setOtpInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Load fresh profile details (rating, earnings, etc.) reactively on mount
  useEffect(() => {
    const loadFreshProfile = async () => {
      if (user?.id) {
        try {
          const freshProfile = await providerService.getProviderById(user.id);
          if (freshProfile) {
            updateProfile(freshProfile);
          }
        } catch (e) {
          console.error('Failed to load fresh provider profile:', e);
        }
      }
    };
    loadFreshProfile();
  }, [user?.id]);

  // Sync route param with state
  useEffect(() => {
    if (routeId) {
      setSelectedBookingId(routeId);
    }
  }, [routeId]);

  // Retrieve provider profile info reactively
  const provider = user;

  // Derive bookings associated with this provider
  const providerBookings = useMemo(() => {
    return bookings.filter(b => b.providerId === user?.id);
  }, [bookings, user?.id]);

  // Filter jobs based on states
  const activeJobs = useMemo(() => {
    return providerBookings.filter(b => 
      ['accepted', 'on_the_way', 'reached', 'service_started'].includes(b.status)
    );
  }, [providerBookings]);

  const completedJobsCount = useMemo(() => {
    const contextCount = providerBookings.filter(b => b.status === 'completed').length;
    return (provider?.totalJobsCompleted || 0) + contextCount;
  }, [providerBookings, provider?.totalJobsCompleted]);

  const earningsToday = useMemo(() => {
    const baseEarnings = provider?.earnings?.today || 0;
    // Add amount of completed bookings from today
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const contextTodayEarnings = providerBookings
      .filter(b => b.status === 'completed' && new Date(b.bookingDate).getTime() >= startOfToday)
      .reduce((sum, b) => sum + (b.finalAmount || 0), 0);
    return baseEarnings + contextTodayEarnings;
  }, [providerBookings, provider?.earnings?.today]);

  const selectedBooking = useMemo(() => {
    return bookings.find(b => b.id === selectedBookingId) || null;
  }, [bookings, selectedBookingId]);

  const toggleAvailability = async () => {
    const newStatus = !provider.isAvailable;
    try {
      await providerService.toggleAvailability(user.id, newStatus);
      updateProfile({ isAvailable: newStatus });
      toast.success(`You are now ${newStatus ? 'online (Available)' : 'offline (Busy)'}`);
    } catch (err) {
      toast.error('Failed to update status on server');
    }
  };

  const handleStatusTransition = async (bookingId, currentStatus) => {
    let nextStatus = '';
    if (currentStatus === 'accepted') nextStatus = 'on_the_way';
    else if (currentStatus === 'on_the_way') nextStatus = 'reached';
    else if (currentStatus === 'service_started') nextStatus = 'completed';

    if (!nextStatus) return;

    try {
      await updateBookingStatus(bookingId, nextStatus);
      toast.success(`Job status updated to: ${nextStatus.replace(/_/g, ' ')}`);
      
      if (nextStatus === 'completed') {
        setSelectedBookingId(null);
        navigate('/provider/dashboard');
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    if (otpInput.trim() !== selectedBooking.otp) {
      toast.error('Invalid OTP. Please check with the customer.');
      return;
    }

    setIsVerifying(true);
    try {
      await updateBookingStatus(selectedBooking.id, 'service_started');
      toast.success('OTP verified! Service started.');
      setOtpInput('');
    } catch (err) {
      toast.error('Failed to verify OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!provider) return <div className="text-center py-10">Provider not found</div>;

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Provider Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)]">Welcome back, {provider.name}</p>
        </div>
        
        <button 
          onClick={toggleAvailability}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
            provider.isAvailable 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
              : 'bg-white/5 text-[var(--text-secondary)] border-white/10 hover:bg-white/10'
          }`}
        >
          {provider.isAvailable ? <FaToggleOn className="text-xl text-emerald-400" /> : <FaToggleOff className="text-xl" />}
          {provider.isAvailable ? 'Online (Accepting Jobs)' : 'Offline'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider mb-1">Today's Earnings</p>
              <h3 className="text-3xl font-black text-white">{formatCurrency(earningsToday)}</h3>
            </div>
            <div className="p-3 bg-orange-500/15 rounded-xl text-orange-400">
              <FaRupeeSign className="text-lg" />
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider mb-1">Active Jobs</p>
              <h3 className="text-3xl font-black text-white">{activeJobs.length}</h3>
            </div>
            <div className="p-3 bg-blue-500/15 rounded-xl text-blue-400">
              <FaClock className="text-lg" />
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider mb-1">Completed Jobs</p>
              <h3 className="text-3xl font-black text-white">{completedJobsCount}</h3>
            </div>
            <div className="p-3 bg-emerald-500/15 rounded-xl text-emerald-400">
              <FaBriefcase className="text-lg" />
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider mb-1">Rating</p>
              <h3 className="text-3xl font-black text-white">{provider.rating || '5.0'}</h3>
            </div>
            <div className="p-3 bg-amber-500/15 rounded-xl text-amber-400">
              <FaStar className="text-lg" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Active Jobs Section */}
      <motion.div variants={fadeInUp} className="space-y-4">
        <h2 className="text-xl font-bold">Current Active Jobs</h2>
        {activeJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeJobs.map(job => (
              <BookingCard 
                key={job.id} 
                booking={job} 
                role="provider"
                onClick={() => {
                  setSelectedBookingId(job.id);
                  navigate(`/provider/bookings/${job.id}`);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-12 text-center border-dashed border-white/10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBriefcase className="text-2xl text-[var(--text-secondary)] opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No active jobs</h3>
            <p className="text-[var(--text-secondary)] text-sm">
              {provider.isAvailable ? 'Waiting for new requests...' : 'Go online to receive new requests.'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Slide-over detailed Modal */}
      <Modal 
        isOpen={!!selectedBooking} 
        onClose={() => {
          setSelectedBookingId(null);
          navigate('/provider/dashboard');
        }} 
        title={`Active Job Details`}
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <h4 className="font-bold text-lg text-white">{selectedBooking.serviceName}</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Booking ID: {selectedBooking.id}</p>
              </div>
              <span className="font-black text-xl text-orange-400">{formatCurrency(selectedBooking.finalAmount)}</span>
            </div>

            {/* Customer Details */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Customer Contact</h5>
              <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <FaPhoneAlt />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Call Customer</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">+91 98765 43210</p>
                  </div>
                </div>
                <a 
                  href="tel:+919876543210"
                  className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Call
                </a>
              </div>
            </div>

            {/* Location details */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Service Location</h5>
              <div className="flex gap-2.5 items-start p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <FaMapMarkerAlt className="text-orange-400 mt-0.5 shrink-0" />
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{selectedBooking.userLocation?.address}</p>
              </div>
            </div>

            {/* Status progress tracker / action */}
            <div className="space-y-3 pt-2">
              <h5 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Current Status</h5>
              
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
                  <span className="text-sm font-bold capitalize text-white">
                    {selectedBooking.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* OTP Verification form (if reached) */}
                {selectedBooking.status === 'reached' ? (
                  <form onSubmit={handleVerifyOtp} className="space-y-3 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 mb-1">
                      <FaShieldAlt /> Please verify OTP from customer to start
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength="4"
                        placeholder="Enter 4-digit OTP"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-center text-sm font-bold tracking-[0.2em] focus:outline-none focus:border-orange-500/50"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isVerifying || otpInput.length < 4}
                        className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all"
                      >
                        {isVerifying ? 'Verifying...' : 'Verify & Start'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => handleStatusTransition(selectedBooking.id, selectedBooking.status)}
                    className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                  >
                    {selectedBooking.status === 'accepted' && (
                      <>Start Journey (On The Way) <FaChevronRight className="text-xs" /></>
                    )}
                    {selectedBooking.status === 'on_the_way' && (
                      <>Arrived at Location (Reached) <FaChevronRight className="text-xs" /></>
                    )}
                    {selectedBooking.status === 'service_started' && (
                      <>Complete Service <FaCheckCircle className="text-xs" /></>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default Dashboard;
