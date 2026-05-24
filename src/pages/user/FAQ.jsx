import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaQuestionCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FAQ_DATA } from '../../constants';
import { staggerContainer, fadeInUp } from '../../animations';
import { useAuth } from '../../context/AuthContext';

const FAQ = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = FAQ_DATA.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <FaQuestionCircle className="text-orange-500" /> FAQ & Help Center
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Find answers to commonly asked questions about ServiceHub.
          </p>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={fadeInUp} className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <FaSearch className="text-[var(--text-secondary)]" />
        </div>
        <input
          type="text"
          placeholder="Search questions or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
        />
      </motion.div>

      {/* FAQ Accordion list */}
      <motion.div variants={fadeInUp} className="space-y-3">
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`glass-card rounded-2xl overflow-hidden border transition-all duration-300 ${
                  isOpen ? 'border-orange-500/20 bg-orange-500/[0.01]' : 'border-white/5 hover:border-white/10'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-semibold text-white/95 text-sm sm:text-base pr-4">
                    {faq.q}
                  </span>
                  <div className={`p-1.5 rounded-lg bg-white/5 text-[var(--text-secondary)] transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-orange-400 bg-orange-500/10' : ''
                  }`}>
                    <FaChevronDown className="text-xs" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-5 pt-2 text-sm text-[var(--text-secondary)] border-t border-white/[0.04] leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="glass-card rounded-3xl p-12 text-center border-dashed border-white/10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-2xl text-[var(--text-secondary)] opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No matches found</h3>
            <p className="text-[var(--text-secondary)] text-sm">
              We couldn't find any answers for "{searchQuery}". Try using other keywords.
            </p>
          </div>
        )}
      </motion.div>

      {/* Direct Contact CTA */}
      <motion.div
        variants={fadeInUp}
        className="glass-card rounded-2xl p-6 border border-white/5 bg-gradient-to-r from-orange-500/5 to-rose-500/5 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div>
          <h3 className="font-semibold text-white mb-1">Still need help?</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Our support team is here to assist you with any questions or issues.
          </p>
        </div>
        <a
          href={user?.role === 'provider' ? '/provider/contact' : user?.role === 'admin' ? '/admin/contact' : '/user/contact'}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
        >
          Contact Support
        </a>
      </motion.div>
    </motion.div>
  );
};

export default FAQ;
