import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaWallet, FaGift, FaEdit, FaSave } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { staggerContainer, fadeInUp } from '../../animations';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await authService.updateProfile(user.id, formData);
      if (res.success) {
        updateProfile(res.user);
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-6">
      <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="relative group">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-white/10 group-hover:border-orange-500/50 transition-colors"
            />
            <button className="absolute bottom-2 right-2 p-2 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 transition-colors">
              <FaEdit className="text-sm" />
            </button>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{user.name}</h1>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={loading}
                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  isEditing ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 
                 isEditing ? <><FaSave /> Save Changes</> : <><FaEdit /> Edit Profile</>}
              </button>
            </div>
            <p className="text-[var(--text-secondary)] flex items-center justify-center sm:justify-start gap-2 mb-4">
              <FaEnvelope /> {user.email}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-medium uppercase tracking-wide">
                Role: {user.role}
              </span>
              <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-medium uppercase tracking-wide">
                Joined: {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div variants={fadeInUp} className="md:col-span-2 glass-card rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6">Personal Information</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 ml-1">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  name="name"
                  value={isEditing ? formData.name : user.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all disabled:opacity-70"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 ml-1">Phone Number</label>
              <div className="relative">
                <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  name="phone"
                  value={isEditing ? formData.phone : user.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all disabled:opacity-70"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 ml-1">Primary Address</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  name="address"
                  value={isEditing ? formData.address : user.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all disabled:opacity-70"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {user.role === 'user' && (
            <>
              <motion.div variants={fadeInUp} className="glass-card rounded-3xl p-6 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-orange-500/20 text-orange-400 rounded-xl">
                    <FaWallet className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Wallet Balance</h3>
                    <p className="text-2xl font-bold text-orange-400">{formatCurrency(user.wallet)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/user/wallet')}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
                >
                  Add Money
                </button>
              </motion.div>

              <motion.div variants={fadeInUp} className="glass-card rounded-3xl p-6 border-dashed">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <FaGift className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Referral Code</h3>
                    <p className="font-bold tracking-wider">{user.referralCode}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(user.referralCode);
                    toast.success('Referral code copied to clipboard!');
                  }}
                  className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium transition-colors"
                >
                  Share & Earn ₹100
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
