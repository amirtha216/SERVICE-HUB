import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaCheckCircle, FaTimesCircle, FaStar } from 'react-icons/fa';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/helpers';
import { staggerContainer, fadeInUp } from '../../animations';
import { toast } from 'react-hot-toast';

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, verified, unverified

  useEffect(() => {
    const fetchProviders = async () => {
      const data = await adminService.getAllProviders();
      setProviders(data);
      setLoading(false);
    };
    fetchProviders();
  }, []);

  const handleVerify = async (providerId) => {
    try {
      await adminService.verifyProvider(providerId);
      setProviders(prev => prev.map(p => p.id === providerId ? { ...p, isVerified: true } : p));
      toast.success('Provider verified successfully');
    } catch (err) {
      toast.error('Failed to verify provider');
    }
  };

  const handleDelete = async (providerId) => {
    if (!window.confirm('Are you sure you want to delete this provider? This action cannot be undone.')) {
      return;
    }
    try {
      await adminService.deleteProvider(providerId);
      setProviders(prev => prev.filter(p => p.id !== providerId));
      toast.success('Provider deleted successfully');
    } catch (err) {
      toast.error('Failed to delete provider');
    }
  };

  const filteredProviders = providers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'verified' && p.isVerified) || 
                         (filter === 'unverified' && !p.isVerified);
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Manage Providers</h1>
          <p className="text-sm text-[var(--text-secondary)]">Approve and monitor service providers</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex bg-white/5 p-1 rounded-xl">
            {['all', 'verified', 'unverified'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === f ? 'bg-white/10 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search providers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-orange-500/50"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : (
        <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map(provider => (
            <div key={provider.id} className="glass-card rounded-2xl p-5 border-t-4 border-t-transparent hover:border-t-orange-500 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={provider.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[var(--card-bg)] ${provider.isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  </div>
                  <div>
                    <h3 className="font-bold flex items-center gap-1">
                      {provider.name}
                      {provider.isVerified && <FaCheckCircle className="text-emerald-400 text-xs" />}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">{provider.ownerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg">
                  <FaStar className="text-amber-400 text-xs" />
                  <span className="text-xs font-bold text-amber-500">{provider.rating}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[var(--text-secondary)]">Total Jobs</span>
                  <span className="font-semibold">{provider.totalJobsCompleted}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[var(--text-secondary)]">Total Earnings</span>
                  <span className="font-semibold text-emerald-400">{formatCurrency(provider.earnings.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Services</span>
                  <span className="font-semibold text-right max-w-[120px] truncate">{provider.serviceType.length} types</span>
                </div>
              </div>

              <div className="flex gap-2">
                {!provider.isVerified ? (
                  <button 
                    onClick={() => handleVerify(provider.id)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Verify Documents
                  </button>
                ) : (
                  <button className="flex-1 bg-white/5 text-[var(--text-secondary)] py-2 rounded-xl text-sm font-medium cursor-not-allowed">
                    Verified
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(provider.id)}
                  className="px-4 bg-red-500/10 text-red-400 hover:bg-red-500/20 py-2 rounded-xl transition-colors"
                  title="Delete Provider"
                >
                  <FaTimesCircle />
                </button>
              </div>
            </div>
          ))}
          {filteredProviders.length === 0 && (
            <div className="col-span-full text-center py-10 bg-white/5 rounded-2xl border border-white/5 text-[var(--text-secondary)]">
              No providers found
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Providers;
