import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWallet, FaPlus, FaArrowUp, FaArrowDown, FaRupeeSign, FaCheck, FaTimes, FaQrcode } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import authService from '../../services/authService';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { staggerContainer, fadeInUp } from '../../animations';
import { toast } from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { useTranslation } from '../../utils/translations';

const Wallet = () => {
  const { user, updateProfile } = useAuth();
  const { bookings } = useBooking();
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);

  // Load and generate transaction history
  useEffect(() => {
    if (!user) return;

    // 1. Initial mock transactions (stored in localStorage or defaulted)
    const storageKey = `servicehub_transactions_${user.id}`;
    let txs = localStorage.getItem(storageKey);
    
    if (txs) {
      txs = JSON.parse(txs);
    } else {
      // Create some default history
      txs = [
        {
          id: 'tx_init',
          type: 'credit',
          title: 'Welcome Bonus',
          description: 'Cashback credited on sign-up',
          amount: 500,
          date: user.createdAt || new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'success'
        }
      ];
      localStorage.setItem(storageKey, JSON.stringify(txs));
    }

    // 2. Dynamically merge booking transactions so they show up here too
    const userBookings = bookings.filter(b => b.userId === user.id);
    const bookingTxs = userBookings.flatMap(b => {
      const list = [];
      // Debit for paying
      list.push({
        id: `tx_pay_${b.id}`,
        type: 'debit',
        title: `Payment for ${b.serviceName}`,
        description: `Booking ID: ${b.id}`,
        amount: b.finalAmount,
        date: b.bookingDate,
        status: b.status === 'cancelled' ? 'failed' : 'success'
      });
      // Credit for refunds
      if (b.status === 'cancelled' && b.paymentStatus === 'refunded') {
        list.push({
          id: `tx_ref_${b.id}`,
          type: 'credit',
          title: `Refund for ${b.serviceName}`,
          description: `Booking ID: ${b.id}`,
          amount: b.finalAmount,
          date: new Date(new Date(b.bookingDate).getTime() + 10 * 60000).toISOString(), // 10 mins later
          status: 'success'
        });
      }
      return list;
    });

    // Merge and sort
    const allTxs = [...txs, ...bookingTxs].sort((a, b) => new Date(b.date) - new Date(a.date));
    setTransactions(allTxs);
  }, [user, bookings]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // Simulate payment gateway

    const newWalletBalance = (user.wallet || 0) + amount;
    
    try {
      const res = await authService.updateProfile(user.id, { wallet: newWalletBalance });
      if (res.success) {
        // Update profile in Auth context
        updateProfile(res.user);
      }
    } catch (err) {
      toast.error('Failed to save deposit to server');
      setLoading(false);
      return;
    }

    // Add transaction to localStorage list
    const storageKey = `servicehub_transactions_${user.id}`;
    let txs = localStorage.getItem(storageKey);
    txs = txs ? JSON.parse(txs) : [];
    
    const newTx = {
      id: `tx_${Date.now()}`,
      type: 'credit',
      title: 'Money Added',
      description: `Deposited via ${paymentMethod.toUpperCase()}`,
      amount,
      date: new Date().toISOString(),
      status: 'success'
    };

    const updatedTxs = [newTx, ...txs];
    localStorage.setItem(storageKey, JSON.stringify(updatedTxs));
    
    toast.success(`${formatCurrency(amount)} added to wallet!`);
    setDepositAmount('');
    setIsModalOpen(false);
    setLoading(false);
  };

  const handlePresetClick = (amount) => {
    setDepositAmount(amount.toString());
  };

  if (!user) return null;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">{t('my_wallet')}</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage your funds and view transactions</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Wallet Balance Card */}
        <motion.div
          variants={fadeInUp}
          className="glass-card rounded-3xl p-6 bg-gradient-to-br from-orange-500/20 via-rose-500/10 to-transparent border-orange-500/30 flex flex-col justify-between min-h-[200px] relative overflow-hidden shadow-2xl"
        >
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{t('wallet_balance')}</span>
            <FaWallet className="text-2xl text-orange-400" />
          </div>

          <div className="my-4">
            <h2 className="text-4xl font-black text-white flex items-baseline gap-1">
              <span className="text-2xl font-medium text-orange-400">₹</span>
              {user.wallet?.toLocaleString('en-IN') || 0}
            </h2>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">Safe and secure digital wallet payments</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all text-sm"
          >
            <FaPlus className="text-xs" /> {t('add_money')}
          </button>
        </motion.div>

        {/* Payment Benefits Card */}
        <motion.div
          variants={fadeInUp}
          className="md:col-span-2 glass-card rounded-3xl p-6 flex flex-col justify-between"
        >
          <h3 className="font-bold text-base mb-4">Why use ServiceHub Wallet?</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <h4 className="font-semibold text-sm text-orange-400 mb-1 flex items-center gap-2">
                ⚡ Instant Bookings
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('quick_booking_desc')}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <h4 className="font-semibold text-sm text-emerald-400 mb-1 flex items-center gap-2">
                🛡️ Hassle-Free Refunds
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Get immediate refunds to your wallet if you cancel a booking before service starts.
              </p>
            </div>
          </div>
          <div className="mt-4 text-xs text-[var(--text-secondary)] flex items-center gap-2 bg-orange-500/5 px-4 py-2.5 rounded-xl border border-orange-500/10">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
            Get flat ₹50 cashback on adding ₹1,000 or more!
          </div>
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div variants={fadeInUp} className="glass-card rounded-3xl p-6">
        <h3 className="font-bold text-lg mb-6">{t('transaction_history')}</h3>
        
        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-xl ${
                    tx.status === 'failed'
                      ? 'bg-red-500/10 text-red-400'
                      : tx.type === 'credit'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-orange-500/10 text-orange-400'
                  }`}>
                    {tx.status === 'failed' ? (
                      <FaTimes className="text-xs" />
                    ) : tx.type === 'credit' ? (
                      <FaArrowDown className="text-xs" />
                    ) : (
                      <FaArrowUp className="text-xs" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold truncate text-white">{tx.title}</h4>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{tx.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`font-bold text-sm ${
                    tx.status === 'failed'
                      ? 'text-gray-500 line-through'
                      : tx.type === 'credit'
                      ? 'text-emerald-400'
                      : 'text-white'
                  }`}>
                    {tx.type === 'credit' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </span>
                  <span className="block text-[10px] text-[var(--text-secondary)] mt-1">
                    {formatDateTime(tx.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-sm text-[var(--text-secondary)]">No transactions recorded yet.</p>
          </div>
        )}
      </motion.div>

      {/* Add Money Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Money to Wallet">
        <form onSubmit={handleDeposit} className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-[var(--text-secondary)] mb-2">Enter Amount</p>
            <div className="relative inline-block w-48">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-orange-400">₹</span>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-center font-bold text-2xl focus:outline-none focus:border-orange-500/50"
                required
                min="10"
              />
            </div>
            
            {/* Presets */}
            <div className="flex justify-center gap-2 mt-4">
              {[200, 500, 1000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handlePresetClick(amt)}
                  className="px-4 py-1.5 bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 border border-white/10 rounded-xl text-xs font-semibold transition-all"
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Payment Method</p>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'upi', label: 'UPI / GPay', icon: FaQrcode },
                { id: 'card', label: 'Credit/Debit Card', icon: FaWallet }
              ].map(method => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                    paymentMethod === method.id
                      ? 'border-orange-500 bg-orange-500/5 text-white'
                      : 'border-white/10 bg-white/5 text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  <method.icon className="text-xl mb-2" />
                  <span className="text-xs font-semibold">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-3.5 rounded-xl hover:shadow-lg transition-all flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              `Proceed to Pay ₹${depositAmount || '0'}`
            )}
          </button>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Wallet;
