import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <motion.div
        className={`${sizes[size]} rounded-full border-3 border-white/10 border-t-orange-500`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      {text && <p className="text-sm text-[var(--text-secondary)]">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
