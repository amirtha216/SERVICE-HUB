import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter } from 'react-icons/fa';
import bookingService from '../../services/bookingService';
import providerService from '../../services/providerService';
import ServiceCard from '../../components/cards/ServiceCard';
import { SERVICE_CATEGORIES } from '../../constants';
import { staggerContainer, fadeInUp } from '../../animations';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Services = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState(SERVICE_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    const fetchServicesAndCategories = async () => {
      try {
        const [servicesData, categoriesData] = await Promise.all([
          bookingService.getServices(),
          bookingService.getCategories()
        ]);
        setServices(servicesData);
        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData);
        }
      } catch (e) {
        console.error('Failed to fetch services or categories:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchServicesAndCategories();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search') || '';
    setSearchQuery(searchParam);
  }, [location.search]);

  const providerId = useMemo(() => {
    return new URLSearchParams(location.search).get('provider') || '';
  }, [location.search]);

  useEffect(() => {
    const fetchProvider = async () => {
      if (providerId) {
        const prov = await providerService.getProviderById(providerId);
        setSelectedProvider(prov);
      } else {
        setSelectedProvider(null);
      }
    };
    fetchProvider();
  }, [providerId]);

  const filteredServices = useMemo(() => {
    let list = services;
    if (selectedProvider) {
      list = list.filter(service => selectedProvider.serviceType.includes(service.slug));
    }
    return list.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            service.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, selectedCategory, selectedProvider]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {selectedProvider && (
        <motion.div 
          variants={fadeInUp}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <img src={selectedProvider.avatar} alt="" className="w-10 h-10 rounded-lg bg-white/10" />
            <div>
              <p className="text-sm font-semibold text-white">Showing services from {selectedProvider.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">{selectedProvider.location.address}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/user/services')}
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all"
          >
            Show All Services
          </button>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Our Services</h1>
          <p className="text-sm text-[var(--text-secondary)]">Choose from our wide range of professional services</p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-white/[0.04] border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-orange-500/50"
            />
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex overflow-x-auto hide-scrollbar pb-2 gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selectedCategory === 'all' 
              ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md' 
              : 'bg-white/[0.04] text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          All Services
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === category.id 
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md' 
                : 'bg-white/[0.04] text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Loading services..." />
      ) : (
        <AnimatePresence mode="popLayout">
          {filteredServices.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            >
              {filteredServices.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 bg-white/[0.02] rounded-full flex items-center justify-center mb-4">
                <FaSearch className="text-3xl text-[var(--text-secondary)] opacity-50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No services found</h3>
              <p className="text-[var(--text-secondary)] text-sm">
                We couldn't find any services matching your search criteria.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="mt-6 text-orange-400 font-medium hover:text-orange-300"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default Services;
