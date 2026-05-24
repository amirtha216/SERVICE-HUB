import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaSearch, 
  FaWrench, FaTags, FaClock, FaCheckCircle, FaExclamationTriangle,
  FaFolder, FaPalette, FaIcons as FaIconsGeneral
} from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa';
import adminService from '../../services/adminService';
import { SERVICE_CATEGORIES } from '../../constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../utils/helpers';
import { toast } from 'react-hot-toast';
import { staggerContainer, fadeInUp } from '../../animations';

const AVAILABLE_ICONS = [
  { id: 'FaGasPump', label: 'Gas Pump / Fuel' },
  { id: 'FaWrench', label: 'Wrench / Mechanic' },
  { id: 'FaTruckPickup', label: 'Tow Truck / Towing' },
  { id: 'FaBolt', label: 'Lightning / Electrical' },
  { id: 'FaSprayCan', label: 'Spray Can / Cleaning' },
  { id: 'FaExclamationTriangle', label: 'Warning / Emergency' },
  { id: 'FaHeartbeat', label: 'Heartbeat / Medical' },
  { id: 'FaAmbulance', label: 'Ambulance' },
  { id: 'FaBroom', label: 'Broom / Janitorial' },
  { id: 'FaShower', label: 'Shower / Wash' },
  { id: 'FaCar', label: 'Car / Auto' },
  { id: 'FaMotorcycle', label: 'Motorcycle / Two Wheeler' },
  { id: 'FaOilCan', label: 'Oil Can' },
  { id: 'FaHammer', label: 'Hammer / Handyman' },
  { id: 'FaHome', label: 'Home Services' },
  { id: 'FaShieldAlt', label: 'Shield / Security' },
  { id: 'FaPaintRoller', label: 'Paint Roller / Painting' },
  { id: 'FaLock', label: 'Lock / Locksmith' }
];

const PRESET_COLORS = [
  { hex: '#f59e0b', label: 'Orange' },
  { hex: '#3b82f6', label: 'Blue' },
  { hex: '#ef4444', label: 'Red' },
  { hex: '#8b5cf6', label: 'Purple' },
  { hex: '#06b6d4', label: 'Cyan' },
  { hex: '#dc2626', label: 'Dark Red' },
  { hex: '#ec4899', label: 'Pink' },
  { hex: '#10b981', label: 'Green' },
  { hex: '#14b8a6', label: 'Teal' },
  { hex: '#eab308', label: 'Yellow' }
];

const CategoryIcon = ({ iconName, color }) => {
  const IconComponent = FaIcons[iconName] || FaIcons.FaWrench;
  return (
    <div 
      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all"
      style={{ backgroundColor: `${color}15`, color: color, border: `1px solid ${color}30` }}
    >
      <IconComponent />
    </div>
  );
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState(SERVICE_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'categories'

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCategoryCreateOpen, setIsCategoryCreateOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    basePrice: '99',
    pricePerKm: '',
    estimatedTime: '20-30 min',
    description: '',
    longDescription: ''
  });

  const [categoryFormData, setCategoryFormData] = useState({
    label: '',
    id: '',
    icon: 'FaWrench',
    color: '#f59e0b'
  });

  const loadData = async () => {
    try {
      const [servicesData, categoriesData] = await Promise.all([
        adminService.getAllServices(),
        adminService.getAllCategories()
      ]);
      setServices(servicesData);
      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
      }
    } catch (e) {
      toast.error('Failed to load services or categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      category: categories[0]?.id || 'fuel',
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
      const selectedCategoryConfig = categories.find(c => c.id === formData.category) || categories[0];
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
        icon: selectedCategoryConfig?.icon || 'FaWrench'
      };
      const res = await adminService.createService(payload);
      if (res.success) {
        toast.success('Service created successfully!');
        setIsCreateOpen(false);
        loadData();
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
      const selectedCategoryConfig = categories.find(c => c.id === formData.category) || categories[0];
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
        icon: selectedCategoryConfig?.icon || 'FaWrench'
      };
      const res = await adminService.updateService(selectedService.id, payload);
      if (res.success) {
        toast.success('Service updated successfully');
        setIsEditOpen(false);
        loadData();
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
        loadData();
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
        loadData();
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  // Category Actions
  const handleOpenCategoryCreate = () => {
    setCategoryFormData({
      label: '',
      id: '',
      icon: 'FaWrench',
      color: '#f59e0b'
    });
    setIsCategoryCreateOpen(true);
  };

  const handleCategoryCreateSubmit = async (e) => {
    e.preventDefault();
    if (!categoryFormData.label) {
      toast.error('Please enter a category name');
      return;
    }
    try {
      const customId = categoryFormData.id.trim() || categoryFormData.label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      
      if (categories.some(c => c.id === customId)) {
        toast.error('Category with this ID already exists. Try another name or custom ID.');
        return;
      }

      const payload = {
        label: categoryFormData.label,
        id: customId,
        icon: categoryFormData.icon,
        color: categoryFormData.color
      };

      const res = await adminService.createCategory(payload);
      if (res.success) {
        toast.success('Category created successfully!');
        setIsCategoryCreateOpen(false);
        loadData();
      }
    } catch (err) {
      toast.error('Failed to create category: ' + err.message);
    }
  };

  const handleCategoryDelete = async (cat) => {
    const activeSvcCount = services.filter(s => s.category === cat.id).length;
    if (activeSvcCount > 0) {
      toast.error(`Cannot delete category "${cat.label}". There are ${activeSvcCount} active service(s) assigned to it.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete the category "${cat.label}"?`)) return;

    try {
      const res = await adminService.deleteCategory(cat.id);
      if (res.success) {
        toast.success('Category deleted successfully');
        loadData();
      }
    } catch (err) {
      toast.error('Failed to delete category: ' + err.message);
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <FaWrench className="text-orange-500" /> Services & Categories
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">Create, modify, or delete platform services and categories</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {activeTab === 'services' ? (
            <button 
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <FaPlus /> Create Service
            </button>
          ) : (
            <button 
              onClick={handleOpenCategoryCreate}
              className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <FaPlus /> Add Category
            </button>
          )}
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-white/5 gap-6">
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'services' ? 'text-orange-400' : 'text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          <FaWrench className="text-xs" /> Services ({services.length})
          {activeTab === 'services' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'categories' ? 'text-orange-400' : 'text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          <FaTags className="text-xs" /> Service Categories ({categories.length})
          {activeTab === 'categories' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'services' ? (
          <motion.div
            key="services-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
              <div className="flex bg-white/5 p-1 rounded-xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                    categoryFilter === 'all' ? 'bg-orange-500/20 text-orange-400' : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
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
                <div 
                  key={svc.id} 
                  className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between hover:scale-[1.01] hover:border-orange-500/10 transition-all duration-300"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-0.5 bg-white/5 rounded-md text-[10px] uppercase font-bold text-orange-400">
                        {categories.find(c => c.id === svc.category)?.label || svc.category}
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
                </div>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-20 bg-white/[0.01] rounded-2xl border border-white/5">
                <p className="text-[var(--text-secondary)] text-sm">No services found matching filters</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="categories-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map(cat => {
                const assignedSvcCount = services.filter(s => s.category === cat.id).length;
                return (
                  <div 
                    key={cat.id} 
                    className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between hover:scale-[1.01] hover:border-orange-500/10 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <CategoryIcon iconName={cat.icon} color={cat.color} />
                      <div className="space-y-1">
                        <h3 className="font-bold text-base text-white">{cat.label}</h3>
                        <p className="text-[10px] font-mono text-[var(--text-secondary)]">ID: {cat.id}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                        {assignedSvcCount} {assignedSvcCount === 1 ? 'Service' : 'Services'}
                      </span>

                      <button 
                        onClick={() => handleCategoryDelete(cat)}
                        title="Delete Category"
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 rounded-lg text-red-400 transition-colors"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-20 bg-white/[0.01] rounded-2xl border border-white/5">
                <p className="text-[var(--text-secondary)] text-sm">No service categories found.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Service Modal */}
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
              className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white"
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
                {categories.map(cat => (
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
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white"
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
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white"
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
              className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 resize-none text-white"
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

      {/* Edit Service Modal */}
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
              className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white"
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
                {categories.map(cat => (
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
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white"
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
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white"
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
              className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 resize-none text-white"
            />
          </div>

          <div className="flex gap-4 p-2 bg-white/5 rounded-xl border border-white/5">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white">
              <input 
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                className="rounded text-orange-500 bg-black/20 border-white/10 focus:ring-0 focus:ring-offset-0"
              />
              Active
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white">
              <input 
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                className="rounded text-orange-500 bg-black/20 border-white/10 focus:ring-0 focus:ring-offset-0"
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

      {/* Create Category Modal */}
      <Modal isOpen={isCategoryCreateOpen} onClose={() => setIsCategoryCreateOpen(false)} title="Create New Category">
        <form onSubmit={handleCategoryCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Category Name / Label *</label>
            <input 
              type="text"
              name="label"
              required
              placeholder="e.g. Home Cleaning"
              value={categoryFormData.label}
              onChange={handleCategoryInputChange}
              className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Custom ID / Slug <span className="font-normal text-[10px]">(Optional - Auto generated if left blank)</span>
            </label>
            <input 
              type="text"
              name="id"
              placeholder="e.g. home_cleaning"
              value={categoryFormData.id}
              onChange={handleCategoryInputChange}
              className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Select Icon *</label>
            <div className="grid grid-cols-6 gap-2 bg-black/20 border border-white/10 p-3 rounded-xl max-h-36 overflow-y-auto">
              {AVAILABLE_ICONS.map(ico => {
                const IconComponent = FaIcons[ico.id] || FaIcons.FaWrench;
                const isSelected = categoryFormData.icon === ico.id;
                return (
                  <button
                    key={ico.id}
                    type="button"
                    title={ico.label}
                    onClick={() => setCategoryFormData(prev => ({ ...prev, icon: ico.id }))}
                    className={`h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                      isSelected 
                        ? 'bg-orange-500 text-white scale-105 shadow-md shadow-orange-500/20' 
                        : 'bg-white/5 text-[var(--text-secondary)] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComponent />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Select Color *</label>
            <div className="flex flex-wrap gap-2.5 bg-black/20 border border-white/10 p-3 rounded-xl">
              {PRESET_COLORS.map(c => {
                const isSelected = categoryFormData.color === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.label}
                    onClick={() => setCategoryFormData(prev => ({ ...prev, color: c.hex }))}
                    className="w-6 h-6 rounded-full transition-all relative flex items-center justify-center"
                    style={{ backgroundColor: c.hex }}
                  >
                    {isSelected && (
                      <span className="text-[10px] text-white bg-black/30 w-full h-full rounded-full flex items-center justify-center font-bold">✓</span>
                    )}
                  </button>
                );
              })}
              
              <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                <input 
                  type="color"
                  name="color"
                  value={categoryFormData.color}
                  onChange={handleCategoryInputChange}
                  className="w-7 h-7 bg-transparent border-0 outline-none cursor-pointer rounded"
                />
                <span className="text-[10px] text-[var(--text-secondary)] font-mono uppercase">{categoryFormData.color}</span>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold rounded-xl text-sm transition-transform active:scale-[0.98] shadow-lg shadow-orange-500/10 mt-2"
          >
            Create Category
          </button>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Services;
