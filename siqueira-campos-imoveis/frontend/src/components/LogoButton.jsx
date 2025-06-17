import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LogoButton = ({
  to = '/',
  className = '',
  imageClassName = '',
  showText = false,
  textClassName = '',
  animate = true,
  size = 'default' // 'small', 'default', 'large'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-8';
      case 'large':
        return 'h-20';
      default:
        return 'h-12';
    }
  };

  const logoComponent = (
    <div className={`flex items-center gap-3 ${className}`}>
      {animate ? (
        <motion.img
          src="/logo siqueira campos imoveis.png"
          alt="Siqueira Campos Imóveis"
          className={`${getSizeClasses()} w-auto ${imageClassName}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 15
          }}
        />
      ) : (
        <img
          src="/logo siqueira campos imoveis.png"
          alt="Siqueira Campos Imóveis"
          className={`${getSizeClasses()} w-auto ${imageClassName}`}
        />
      )}

      {showText && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`text-lg font-semibold ${textClassName}`}
        >
          Siqueira Campos Imóveis
        </motion.div>
      )}
    </div>
  );

  // If no link is needed (to is null or false)
  if (!to) {
    return logoComponent;
  }

  // With link
  return (
    <Link to={to} className="focus:outline-none">
      {logoComponent}
    </Link>
  );
};

// Animated Variant
export const AnimatedLogo = () => {
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: [0, 0.71, 0.2, 1.01],
          scale: {
            type: 'spring',
            damping: 10,
            stiffness: 100
          }
        }}
      >
        <LogoButton animate={false} size="large" />
      </motion.div>
      <motion.div
        className="absolute -inset-4 bg-black/5 rounded-full blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      />
    </div>
  );
};

// Loading Variant
export const LoadingLogo = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <LogoButton animate={false} size="large" />
      </motion.div>
      <motion.div
        className="h-1 w-24 bg-gray-200 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="h-full bg-black"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: 'easeInOut'
          }}
        />
      </motion.div>
    </div>
  );
};

// Error Variant
export const ErrorLogo = () => {
  return (
    <div className="relative">
      <motion.div
        animate={{
          rotate: [-10, 10, -10]
        }}
        transition={{
          duration: 0.5,
          repeat: 3
        }}
      >
        <LogoButton animate={false} size="large" />
      </motion.div>
      <motion.div
        className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 15
        }}
      >
        !
      </motion.div>
    </div>
  );
};

export default LogoButton;
