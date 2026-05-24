import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaCar, FaCheckCircle, FaBriefcase, FaEdit, FaSave } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import providerService from '../../services/providerService';
import bookingService from '../../services/bookingService';
import { staggerContainer, fadeInUp } from '../../animations';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [provider, setProvider] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchProfileAndServices = async () => {
      try {
        const [profileData, servicesData] = await Promise.all([
          providerService.getProviderById(user.id),
          bookingService.getServices()
        ]);
        setProvider(profileData);
        setAllServices(servicesData);
        setFormData({
          name: profileData.name || '',
          ownerName: profileData.ownerName || '',
          phone: profileData.phone || '',
          address: profileData.location?.address || '',
          vehicleType: profileData.vehicleType || '',
          serviceType: profileData.serviceType || [],
          documents: profileData.documents || { aadhar: false, pan: false, license: false }
        });
      } catch (e) {
        console.error('Error fetching profile:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndServices();
  }, [user.id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // If documents were modified, reset verification status to require admin review
      const documentsModified = JSON.stringify(formData.documents) !== JSON.stringify(provider.documents);
      const updates = { 
        ...formData, 
        location: { ...provider.location, address: formData.address },
        ...(documentsModified ? { isVerified: false } : {}) // Reset verification to trigger admin review
      };
      
      const res = await providerService.updateProfile(user.id, updates);
      if (res.success) {
        const updatedProvider = { ...provider, ...updates };
        setProvider(updatedProvider);
        updateProfile(updates); // Update auth context with all updates
        toast.success(documentsModified ? 'Profile saved. Documents submitted for admin verification!' : 'Profile updated successfully');
        setIsEditing(false);
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!provider) return <div>Profile not found</div>;

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-6">
      <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="relative group">
            <img 
              src={provider.avatar} 
              alt={provider.name} 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-white/10"
            />
            {provider.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-[var(--card-bg)] rounded-full p-1">
                <FaCheckCircle className="text-xl text-emerald-400" title="Verified Provider" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{provider.name}</h1>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={saving}
                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  isEditing ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 
                 isEditing ? <><FaSave /> Save Changes</> : <><FaEdit /> Edit Profile</>}
              </button>
            </div>
            <p className="text-[var(--text-secondary)] flex items-center justify-center sm:justify-start gap-2 mb-4">
              <FaEnvelope /> {provider.email}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {provider.serviceType.map(type => (
                <span key={type} className="px-3 py-1 bg-white/5 rounded-lg text-xs font-medium capitalize">
                  {type.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} className="glass-card rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><FaUser className="text-orange-400" /> Business Details</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 ml-1">Business Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500/50 disabled:opacity-70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 ml-1">Owner Name</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500/50 disabled:opacity-70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 ml-1">Phone Number</label>
              <div className="relative">
                <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-orange-500/50 disabled:opacity-70"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="glass-card rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><FaBriefcase className="text-blue-400" /> Service Information</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 ml-1">Primary Location</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-orange-500/50 disabled:opacity-70"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 ml-1">Vehicle Type</label>
              <div className="relative">
                <FaCar className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-orange-500/50 disabled:opacity-70"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 ml-1">Services Offered</label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-3 bg-white/[0.02] border border-white/10 p-4 rounded-xl max-h-48 overflow-y-auto">
                  {allServices.map(service => {
                    const isChecked = formData.serviceType?.includes(service.slug);
                    return (
                      <label key={service.id} className="flex items-center gap-2.5 text-sm cursor-pointer select-none text-white">
                        <input
                          type="checkbox"
                          checked={isChecked || false}
                          onChange={() => {
                            const newServices = isChecked
                              ? formData.serviceType.filter(s => s !== service.slug)
                              : [...(formData.serviceType || []), service.slug];
                            setFormData({ ...formData, serviceType: newServices });
                          }}
                          className="w-4 h-4 accent-orange-500 rounded border-white/10"
                        />
                        <span className="capitalize">{service.name}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {provider.serviceType.map(type => (
                    <span key={type} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-xs font-medium capitalize">
                      {type.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Documents Status</h3>
              <div className="space-y-2">
                {['aadhar', 'pan', 'license'].map((doc) => {
                  const isUploaded = formData.documents?.[doc] || false;
                  return (
                    <div key={doc} className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                      <span className="capitalize text-sm">{doc}</span>
                      {isEditing ? (
                        <label className="flex items-center gap-2 cursor-pointer select-none text-white">
                          <input
                            type="checkbox"
                            checked={isUploaded}
                            onChange={(e) => {
                              const newDocs = {
                                ...formData.documents,
                                [doc]: e.target.checked
                              };
                              setFormData({ ...formData, documents: newDocs });
                            }}
                            className="w-4 h-4 accent-orange-500"
                          />
                          <span className="text-xs text-[var(--text-secondary)]">Uploaded</span>
                        </label>
                      ) : provider.isVerified ? (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-md">Verified</span>
                      ) : isUploaded ? (
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-1 rounded-md">Pending Approval</span>
                      ) : (
                        <span className="text-xs font-bold text-rose-400 bg-rose-500/20 px-2 py-1 rounded-md">Missing</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;
