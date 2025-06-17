import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ImagemLazyLoad = ({
  src,
  alt,
  className = '',
  placeholderClassName = '',
  containerClassName = '',
  aspectRatio = '16/9',
  loadingColor = 'bg-gray-200',
  errorColor = 'bg-red-100',
  errorIcon = '⚠️',
  errorMessage = 'Erro ao carregar imagem',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px'
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    setError(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
    if (onError) onError();
  };

  return (
    <div
      ref={imageRef}
      className={`relative overflow-hidden ${containerClassName}`}
      style={{ aspectRatio }}
    >
      {/* Loading Placeholder */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 ${loadingColor} ${placeholderClassName}`}
          >
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute inset-0 ${errorColor} flex flex-col items-center justify-center text-center p-4`}
          >
            <span className="text-2xl mb-2">{errorIcon}</span>
            <p className="text-sm text-gray-600">{errorMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image */}
      {isInView && (
        <motion.img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${className} ${
            !isLoaded ? 'invisible' : ''
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

// Preload Component
export const ImagePreload = ({ src }) => {
  useEffect(() => {
    const img = new Image();
    img.src = src;
  }, [src]);

  return null;
};

// Gallery Component
export const ImageGallery = ({ images, className = '', imageClassName = '' }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={className}>
      {/* Main Image */}
      <div className="relative mb-4">
        <ImagemLazyLoad
          src={images[activeIndex].url}
          alt={images[activeIndex].alt}
          className={imageClassName}
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={image.url}
            onClick={() => setActiveIndex(index)}
            className={`relative aspect-square overflow-hidden rounded-lg ${
              index === activeIndex ? 'ring-2 ring-black' : ''
            }`}
          >
            <ImagemLazyLoad
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
              aspectRatio="1"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

// Background Image Component
export const BackgroundImage = ({
  src,
  className = '',
  children,
  overlay = false,
  overlayColor = 'bg-black/50'
}) => {
  return (
    <div className={`relative ${className}`}>
      <ImagemLazyLoad
        src={src}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {overlay && <div className={`absolute inset-0 ${overlayColor}`} />}
      <div className="relative">{children}</div>
    </div>
  );
};

export default ImagemLazyLoad;
