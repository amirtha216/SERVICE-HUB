import { motion } from 'framer-motion';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { getStarArray } from '../../utils/helpers';

const StarRating = ({ rating, size = 'sm', showValue = true, interactive = false, onChange }) => {
  const stars = getStarArray(rating);
  const sizeClass = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-xl';

  if (interactive) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange?.(i)}
            className={`${sizeClass} ${i <= rating ? 'text-amber-400' : 'text-white/20'} transition-colors`}
          >
            <FaStar />
          </motion.button>
        ))}
        {showValue && <span className="ml-1 text-sm font-medium">{rating}/5</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((type, i) => (
        <span key={i} className={`${sizeClass} text-amber-400`}>
          {type === 'full' ? <FaStar /> : type === 'half' ? <FaStarHalfAlt /> : <FaRegStar className="text-white/20" />}
        </span>
      ))}
      {showValue && <span className="ml-1.5 text-sm font-medium text-[var(--text-secondary)]">{rating}</span>}
    </div>
  );
};

export default StarRating;
