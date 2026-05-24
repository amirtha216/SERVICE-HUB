import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUser, FaPhoneAlt, FaBriefcase } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Signup = () => {
  const [role, setRole] = useState('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await signup({ ...formData, role });
      if (res.success) {
        toast.success('Account created successfully!');
        navigate(`/${role}/home`);
      } else {
        toast.error(res.error || 'Signup failed');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md z-10"
    >
      <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Create Account</h2>
          <p className="text-[var(--text-secondary)] text-sm">Join ServiceHub today</p>
        </div>

        <div className="flex p-1 bg-white/[0.04] rounded-xl mb-6">
          {[
            { id: 'user', icon: FaUser, label: 'User' },
            { id: 'provider', icon: FaBriefcase, label: 'Provider' }
          ].map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === r.id
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <r.icon className={role === r.id ? 'text-white' : ''} />
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all"
                placeholder="Full Name"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all"
                placeholder="Email Address"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all"
                placeholder="Phone Number"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all"
                placeholder="Create Password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-3.5 rounded-xl mt-6 hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-secondary)] mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-400 font-semibold hover:text-orange-300">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Signup;
