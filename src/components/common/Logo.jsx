import React from 'react';
import { Box } from '@mui/material';
import markSrc from '../../assets/locoto-mark.svg';
import wordmarkSrc from '../../assets/locoto-wordmark.svg';

/**
 * Logo component
 * Props:
 * - variant: 'mark' | 'full' (default: 'mark')
 * - height: number (px) - defaults 28 for mark, 36 for full
 * - onClick: function
 * - sx: MUI sx overrides
 */
const Logo = ({ variant = 'mark', height, onClick, hoverGlow = false, sx }) => {
  const computedHeight = height || (variant === 'full' ? 36 : 28);
  const src = variant === 'full' ? wordmarkSrc : markSrc;

  return (
    <Box
      component="img"
      src={src}
      alt={variant === 'full' ? 'Locoto' : 'Locoto mark'}
      sx={{
        height: computedHeight,
        width: 'auto',
        display: 'block',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        transition: hoverGlow ? 'filter 0.25s ease, transform 0.25s ease' : undefined,
        '&:hover': hoverGlow
          ? {
              filter:
                'drop-shadow(0 0 8px rgba(108, 99, 255, 0.45)) drop-shadow(0 0 14px rgba(0, 217, 192, 0.25))',
              transform: 'translateY(-1px)'
            }
          : undefined,
        ...sx,
      }}
      onClick={onClick}
    />
  );
};

export default Logo;
