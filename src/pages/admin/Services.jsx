import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaSearch, FaWrench, FaTags, FaClock, FaCheckCircle } from 'react-icons/fa';
import adminService from '../../services/adminService';
import { SERVICE_CATEGORIES } from '../../constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../utils/helpers';
import { toast } from 'react-hot-toast';
import { staggerContainer, fadeInUp } from '../../animations';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: 'fuel',
    basePrice: '99',
    pricePerKm: '',
    estimatedTime: '20-30 min',
    description: '',
    longDescription: ''
  });

  const fetchServices = async () => {
    try {
      const data = await adminService.getAllServices();
      setServices(data);
    } catch (e) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      category: 'fuel',
      basePrice: '99',
      pricePerKm: '',
      estimatedTime: '20-30 min',
      description: '',
      longDescription: ''
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.pricePerKm) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        basePrice: 99,
        pricePerKm: parseFloat(formData.pricePerKm),
        estimatedTime: formData.estimatedTime,
        description: formData.description,
        longDescription: formData.longDescription || formData.description,
        image: '/services/default.jpg',
        tags: [formData.category],
        icon: SERVICE_CATEGORIES.find(c => c.id === formData.category)?.icon || 'FaWrench'
      };
      const res = await adminService.createService(payload);
      if (res.success) {
        toast.success('Service created successfully!');
        setIsCreateOpen(false);
        fetchServices();
      }
    } catch (e) {
      toast.error('Failed to create service');
    }
  };

  const handleOpenEdit = (svc) => {
    setSelectedService(svc);
    setFormData({
      name: svc.name,
      category: svc.category,
      basePrice: 99,
      pricePerKm: svc.pricePerKm,
      estimatedTime: svc.estimatedTime || '20-30 min',
      description: svc.description || '',
      longDescription: svc.longDescription || '',
      isAvailable: svc.isAvailable,
      isPopular: svc.isPopular
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        basePrice: 99,
        pricePerKm: parseFloat(formData.pricePerKm),
        estimatedTime: formData.estimatedTime,
        description: formData.description,
        longDescription: formData.longDescription,
        isAvailable: formData.isAvailable,
        isPopular: formData.isPopular,
        icon: SERVICE_CATEGORIES.find(c => c.id === formData.category)?.icon || 'FaWrench'
      };
      const res = await adminService.updateService(selectedService.id, payload);
      if (res.success) {
        toast.success('Service updated successfully');
        setIsEditOpen(false);
        fetchServices();
      }
    } catch (e) {
      toast.error('Failed to update service');
    }
  };

  const handleDelete = async (svcId) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await adminService.deleteService(svcId);
      if (res.success) {
        toast.success('Service deleted successfully');
        fetchServices();
      }
    } catch (e) {
      toast.error('Failed to delete service');
    }
  };

  const handleToggleAvailable = async (svc) => {
    try {
      const res = await adminService.updateService(svc.id, { isAvailable: !svc.isAvailable });
      if (res.success) {
        toast.success(`Service status changed to ${!svc.isAvailable ? 'Available' : 'Unavailable'}`);
        fetchServices();
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleTogglePopular = async (svc) => {
    try {
      const res = await adminService.updateService(svc.id, { isPopular: !svc.isPopular });
      if (res.success) {
        toast.success(`Service popular status changed`);
        fetchServices();
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                            s.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [services, search, categoryFilter]);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <FaWrench className="text-orange-500" /> Services Management
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">Create, modify, or toggle platform services</p>
        </div>

        <button 
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <FaPlus /> Create Service
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
        <div className="flex bg-white/5 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
              categoryFilter === 'all' ? 'bg-orange-500/20 text-orange-400' : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            All
          </button>
          {SERVICE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                categoryFilter === cat.id ? 'bg-orange-500/20 text-orange-400' : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-sm" />
          <input
            type="text"
            placeholder="Search service name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-orange-500/50 text-sm text-white"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredServices.map(svc => (
          <motion.div 
            key={svc.id} 
            variants={fadeInUp} 
            className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-0.5 bg-white/5 rounded-md text-[10px] uppercase font-bold text-orange-400">
                  {svc.category}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    svc.isAvailable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {svc.isAvailable ? 'Active' : 'Inactive'}
                  </span>
                  {svc.isPopular && (
                    <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full font-bold">
                      ⭐ Popular
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-base mb-1">{svc.name}</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-2 leading-relaxed">
                {svc.description}
              </p>

              <div className="space-y-1 bg-white/[0.02] p-3 rounded-xl border border-white/5 mb-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Base Price:</span>
                  <span className="font-semibold text-white">{formatCurrency(svc.basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Per Km Price:</span>
                  <span className="font-semibold text-white">{formatCurrency(svc.pricePerKm)}/km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Est. Arrival:</span>
                  <span className="font-semibold text-white">{svc.estimatedTime}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 border-t border-white/5 pt-4 mt-2">
              <button 
                onClick={() => handleToggleAvailable(svc)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors border ${
                  svc.isAvailable 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                    : 'bg-white/5 border-white/5 text-[var(--text-secondary)] hover:bg-white/10'
                }`}
              >
                {svc.isAvailable ? 'Deactivate' : 'Activate'}
              </button>
              <button 
                onClick={() => handleOpenEdit(svc)}
                title="Edit Service"
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-white"
              >
                <FaEdit className="text-sm" />
              </button>
              <button 
                onClick={() => handleDelete(svc.id)}
                title="Delete Service"
                className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 rounded-lg text-red-400"
              >
                <FaTrash className="text-sm" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-20 bg-white/[0.01] rounded-2xl border border-white/5">
          <p className="text-[var(--text-secondary)] text-sm">No services found matching filters</p>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Service">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Service Name *</label>
            <input 
              type="text"
              name="name"
              required
              placeholder="e.g. Car Polish"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white"
              >
                {SERVICE_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-[#121214]">{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Est. Arrival *</label>
              <input 
                type="text"
                name="estimatedTime"
                required
                value={formData.estimatedTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-mono">Base Price (₹) * [Fixed]</label>
              <input 
                type="number"
                name="basePrice"
                disabled={true}
                value={99}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-[var(--text-secondary)] opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Price Per Km (₹) *</label>
              <input 
                type="number"
                name="pricePerKm"
                required
                placeholder="15"
                value={formData.pricePerKm}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description *</label>
            <textarea 
              name="description"
              required
              rows={3}
              placeholder="Short summary of the service..."
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-transform active:scale-[0.98]"
          >
            Create Service
          </button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Service">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Service Name *</label>
            <input 
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white"
              >
                {SERVICE_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-[#121214]">{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Est. Arrival *</label>
              <input 
                type="text"
                name="estimatedTime"
                required
                value={formData.estimatedTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 font-mono">Base Price (₹) * [Fixed]</label>
              <input 
                type="number"
                name="basePrice"
                disabled={true}
                value={99}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-[var(--text-secondary)] opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Price Per Km (₹) *</label>
              <input 
                type="number"
                name="pricePerKm"
                required
                value={formData.pricePerKm}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description *</label>
            <textarea 
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <div className="flex gap-4 p-2 bg-white/5 rounded-xl border border-white/5">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
              <input 
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                className="rounded text-orange-500"
              />
              Active
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
              <input 
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                className="rounded text-orange-500"
              />
              Popular (⭐)
            </label>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-transform active:scale-[0.98]"
          >
            Save Changes
          </button>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Services;
