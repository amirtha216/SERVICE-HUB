import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane, FaUser, FaHeading } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { staggerContainer, fadeInUp } from '../../animations';
import bookingService from '../../services/bookingService';

const Contact = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      toast.error('Please enter your message');
      return;
    }

    setIsSubmitting(true);
    try {
      await bookingService.createComplaint({
        userId: user?.id || 'guest',
        userName: formData.name || user?.name || 'Guest User',
        subject: formData.subject,
        message: formData.message,
        priority: 'medium'
      });
      toast.success('Your ticket has been submitted successfully! Our team will get back to you shortly.');
      setFormData((prev) => ({
        ...prev,
        message: ''
      }));
    } catch (err) {
      toast.error(err.message || 'Failed to submit support ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <FaPhoneAlt className="text-orange-500 text-xl" /> Contact Support
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Need help? Our customer support agents are ready to assist you.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Panel */}
        <motion.div variants={fadeInUp} className="md:col-span-1 space-y-4">
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-5">
            <h3 className="font-semibold text-white text-lg">Support Channels</h3>
            
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                <FaPhoneAlt className="text-base" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Phone Number</p>
                <p className="text-sm font-semibold text-white mt-0.5">+91 98765 43210</p>
                <span className="text-[10px] text-emerald-400 font-medium">Available 24/7 (Emergency)</span>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                <FaEnvelope className="text-base" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Email Support</p>
                <p className="text-sm font-semibold text-white mt-0.5">support@servicehub.com</p>
                <span className="text-[10px] text-[var(--text-secondary)]">Response in 24 hours</span>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                <FaMapMarkerAlt className="text-base" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Headquarters</p>
                <p className="text-sm font-semibold text-white mt-0.5">ServiceHub HQ</p>
                <p className="text-xs text-[var(--text-secondary)]">100 Feet Rd, Indiranagar, Bengaluru, India</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                <FaClock className="text-base" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Working Hours</p>
                <p className="text-sm font-semibold text-white mt-0.5">Mon - Sun: 06:00 AM - 10:00 PM</p>
                <span className="text-[10px] text-orange-400 font-medium">Emergency Towing/Mechanics: 24/7</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Message Form Panel */}
        <motion.div variants={fadeInUp} className="md:col-span-2">
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="font-semibold text-white text-lg">Send us a Message</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Have feedback, complaints or custom queries? Message us directly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                  <FaUser className="text-[var(--text-secondary)]" /> Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                  <FaEnvelope className="text-[var(--text-secondary)]" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Your email address"
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <FaHeading className="text-[var(--text-secondary)]" /> Subject
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50"
              >
                <option value="General Inquiry" className="bg-[#121214] text-white">General Inquiry</option>
                <option value="Booking Assistance" className="bg-[#121214] text-white">Booking Assistance</option>
                {user?.role === 'provider' ? (
                  <>
                    <option value="Earnings & Payouts" className="bg-[#121214] text-white">Earnings & Payouts</option>
                    <option value="Customer Dispute" className="bg-[#121214] text-white">Customer Dispute</option>
                  </>
                ) : user?.role === 'admin' ? (
                  <>
                    <option value="System Configuration Issue" className="bg-[#121214] text-white">System Configuration Issue</option>
                    <option value="Platform Setup Inquiry" className="bg-[#121214] text-white">Platform Setup Inquiry</option>
                  </>
                ) : (
                  <>
                    <option value="Wallet & Payment Issue" className="bg-[#121214] text-white">Wallet & Payment Issue</option>
                    <option value="Provider Complaint" className="bg-[#121214] text-white">Provider Complaint</option>
                  </>
                )}
                <option value="Feedback & Suggestions" className="bg-[#121214] text-white">Feedback & Suggestions</option>
              </select>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                Your Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Write your message details here..."
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 placeholder-white/20 resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/55 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="text-xs" />
                    Submit Ticket
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Contact;
