import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUserShield, FaUser, FaBriefcase } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || `/${role}/home`;

  // Pre-fill for dummy testing
  const handleRoleSelect = (r) => {
    setRole(r);
    if (r === 'user') { setEmail('rahul@example.com'); setPassword('password123'); }
    if (r === 'provider') { setEmail('rajesh.provider@example.com'); setPassword('password123'); }
    if (r === 'admin') { setEmail('admin@servicehub.com'); setPassword('admin123'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password, role);
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
        // Navigate based on role if no 'from' location, or if 'from' is just '/'
        if (location.state?.from?.pathname) {
             navigate(location.state.from.pathname, { replace: true });
        } else {
             navigate(role === 'admin' ? '/admin/dashboard' : `/${role}/home`, { replace: true });
        }
      } else {
        toast.error(res.error || 'Login failed');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md z-10"
    >
      <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
            <span className="text-white text-2xl font-bold">SH</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
          <p className="text-[var(--text-secondary)] text-sm">Login to access your account</p>
        </div>

        <div className="flex p-1 bg-white/[0.04] rounded-xl mb-6">
          {[
            { id: 'user', icon: FaUser, label: 'User' },
            { id: 'provider', icon: FaBriefcase, label: 'Provider' },
            { id: 'admin', icon: FaUserShield, label: 'Admin' }
          ].map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleRoleSelect(r.id)}
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
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 ml-1">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 ml-1">Password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all"
                placeholder="Enter your password"
              />
            </div>
            <div className="text-right mt-2">
              <Link to="/forgot-password" className="text-xs text-orange-400 hover:text-orange-300 font-medium">
                Forgot password?
              </Link>
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
              'Sign In'
            )}
          </button>
        </form>

        {role !== 'admin' && (
          <p className="text-center text-sm text-[var(--text-secondary)] mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-orange-400 font-semibold hover:text-orange-300">
              Sign up
            </Link>
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default Login;
