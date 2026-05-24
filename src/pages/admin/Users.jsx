import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaUserCheck, FaUserTimes, FaEllipsisV } from 'react-icons/fa';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { staggerContainer, fadeInUp } from '../../animations';
import { toast } from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await adminService.getAllUsers();
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const nextStatus = !currentStatus;
      await adminService.toggleUserStatus(userId, nextStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: nextStatus } : u));
      toast.success(`User ${currentStatus ? 'suspended' : 'activated'} successfully`);
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Manage Users</h1>
          <p className="text-sm text-[var(--text-secondary)]">Total {users.length} registered users</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-orange-500/50"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : (
        <motion.div variants={fadeInUp} className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">User</th>
                  <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Contact</th>
                  <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Joined</th>
                  <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Wallet</th>
                  <th className="p-4 text-sm font-semibold text-[var(--text-secondary)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt="" className="w-10 h-10 rounded-xl bg-white/10" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{user.name}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              user.isActive !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                              {user.isActive !== false ? 'Active' : 'Suspended'}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)]">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{user.email}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{user.phone}</p>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-orange-400">₹{user.wallet}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleToggleStatus(user.id, user.isActive !== false)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isActive !== false 
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                          title={user.isActive !== false ? "Suspend User" : "Activate User"}
                        >
                          {user.isActive !== false ? <FaUserTimes /> : <FaUserCheck />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-10 text-[var(--text-secondary)]">
                No users found matching "{search}"
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Users;
