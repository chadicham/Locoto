import { useState, useEffect, useRef } from 'react';
import { Box, Skeleton } from '@mui/material';

/**
 * Composant pour le chargement lazy des images
 * Améliore les performances en chargeant les images uniquement quand elles sont visibles
 */
const LazyImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  style = {},
  placeholder,
  objectFit = 'cover',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Commencer à charger 50px avant que l'image soit visible
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <Box
      ref={imgRef}
      sx={{
        width: width || '100%',
        height: height || 'auto',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      {...props}
    >
      {!isLoaded && (
        placeholder || (
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            animation="wave"
            sx={{ position: 'absolute', top: 0, left: 0 }}
          />
        )
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          loading="lazy"
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            objectFit,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}
    </Box>
  );
};

export default LazyImage;
