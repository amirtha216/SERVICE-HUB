import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaSearch, FaChevronDown, FaCheckCircle, FaUser, FaClock, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { formatDateTime } from '../../utils/helpers';
import { toast } from 'react-hot-toast';
import { staggerContainer, fadeInUp } from '../../animations';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for updates
  const [ticketStatus, setTicketStatus] = useState('open');
  const [ticketPriority, setTicketPriority] = useState('medium');

  const fetchComplaints = async () => {
    try {
      const data = await adminService.getComplaints();
      setComplaints(data);
    } catch (e) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setTicketStatus(ticket.status);
    setTicketPriority(ticket.priority);
    setIsModalOpen(true);
  };

  const handleSaveTicket = async () => {
    if (!selectedTicket) return;
    try {
      const res = await adminService.updateComplaint(selectedTicket.id, {
        status: ticketStatus,
        priority: ticketPriority
      });
      if (res.success) {
        toast.success('Ticket updated successfully');
        setIsModalOpen(false);
        fetchComplaints();
      }
    } catch (e) {
      toast.error('Failed to update ticket');
    }
  };

  const filteredTickets = useMemo(() => {
    return complaints.filter(t => {
      const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || 
                            t.userName.toLowerCase().includes(search.toLowerCase()) ||
                            t.message.toLowerCase().includes(search.toLowerCase());
      
      let matchesTab = true;
      if (filter === 'open') {
        matchesTab = ['open', 'in_progress'].includes(t.status);
      } else if (filter === 'resolved') {
        matchesTab = t.status === 'resolved';
      }
      return matchesSearch && matchesTab;
    });
  }, [complaints, search, filter]);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <FaExclamationTriangle className="text-rose-500" /> Platform Complaints & Disputes
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage user tickets and dispatch service issues</p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          {['all', 'open', 'resolved'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-orange-500/20 to-rose-500/10 text-orange-400 shadow-sm border border-orange-500/10'
                  : 'text-[var(--text-secondary)] hover:text-white border border-transparent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input
          type="text"
          placeholder="Search ticket subjects, users, keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50"
        />
      </div>

      {/* Complaints Grid */}
      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredTickets.map(ticket => (
              <motion.div
                key={ticket.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -2 }}
                onClick={() => handleOpenTicket(ticket)}
                className={`glass-card rounded-2xl p-5 border cursor-pointer hover:border-white/15 transition-all flex flex-col justify-between ${
                  ticket.status === 'resolved' 
                    ? 'border-white/5 opacity-75 bg-white/[0.005]' 
                    : 'border-rose-500/10 bg-rose-500/[0.005] hover:bg-rose-500/[0.015]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-bold ${
                      ticket.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                      ticket.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {ticket.priority} Priority
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                      ticket.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-semibold text-white text-base mb-1">{ticket.subject}</h3>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed mb-4">
                    {ticket.message}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/5 text-[10px] text-[var(--text-secondary)] mt-2">
                  <span className="flex items-center gap-1.5 font-medium text-white/95">
                    <FaUser /> {ticket.userName}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaClock /> {formatDateTime(ticket.createdAt).split(' ')[0]}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-white/[0.01] rounded-2xl border border-white/5">
          <FaExclamationCircle className="text-4xl text-[var(--text-secondary)] opacity-30 mx-auto mb-3" />
          <p className="text-[var(--text-secondary)] text-sm">No complaints found matching selection</p>
        </div>
      )}

      {/* Ticket Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Complaint Ticket Details">
        {selectedTicket && (
          <div className="space-y-5">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>Ticket ID: {selectedTicket.id}</span>
                <span>Created: {formatDateTime(selectedTicket.createdAt)}</span>
              </div>
              <h3 className="font-bold text-white text-lg">{selectedTicket.subject}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed pt-2 border-t border-white/5">
                {selectedTicket.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-white/5 p-3 rounded-xl">
                <span className="text-[var(--text-secondary)] block mb-1">Customer Details</span>
                <span className="font-semibold text-white">{selectedTicket.userName}</span>
                <span className="block text-[10px] text-[var(--text-secondary)] mt-0.5">ID: {selectedTicket.userId}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <span className="text-[var(--text-secondary)] block mb-1">Linked Booking</span>
                <span className="font-semibold text-orange-400 font-mono">#{selectedTicket.bookingId}</span>
              </div>
            </div>

            {/* Editing Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Ticket Priority</label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/25 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white"
                >
                  <option value="low" className="bg-[#121214]">Low</option>
                  <option value="medium" className="bg-[#121214]">Medium</option>
                  <option value="high" className="bg-[#121214]">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Resolution Status</label>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/25 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white"
                >
                  <option value="open" className="bg-[#121214]">Open</option>
                  <option value="in_progress" className="bg-[#121214]">In Progress</option>
                  <option value="resolved" className="bg-[#121214]">Resolved</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveTicket}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <FaCheck /> Save Ticket Status
            </button>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default Complaints;
