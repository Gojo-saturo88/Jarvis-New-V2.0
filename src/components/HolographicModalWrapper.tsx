import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type HologramAccent = 'cyan' | 'amber' | 'red';

export interface HolographicModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  maxWidth?: string;
  maxHeight?: string;
  className?: string;
  accentColor?: HologramAccent;
  children: React.ReactNode;
}

export const HolographicModalWrapper: React.FC<HolographicModalWrapperProps> = ({
  isOpen,
  onClose,
  maxWidth = 'max-w-2xl',
  maxHeight = 'max-h-[90vh]',
  className = '',
  accentColor = 'cyan',
  children,
}) => {
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'amber':
        return {
          beamGradient:
            'linear-gradient(180deg, rgba(245,158,11,0) 0%, rgba(251,191,36,0.18) 50%, rgba(255,255,255,0.8) 95%, rgba(245,158,11,0.95) 100%)',
          beamShadow: '0 0 16px rgba(245,158,11,0.85), 0 0 30px rgba(245,158,11,0.4)',
          topGlare: 'from-transparent via-amber-300 to-transparent',
          topGlareShadow: 'shadow-[0_0_14px_rgba(245,158,11,0.85)]',
          bottomGlare: 'from-transparent via-amber-500/40 to-transparent',
          reticle: 'border-amber-400/85 shadow-[0_0_10px_rgba(245,158,11,0.6)]',
          scanlinePattern:
            'bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(245,158,11,0.22)_50%)]',
        };
      case 'red':
        return {
          beamGradient:
            'linear-gradient(180deg, rgba(239,68,68,0) 0%, rgba(248,113,113,0.18) 50%, rgba(255,255,255,0.8) 95%, rgba(239,68,68,0.95) 100%)',
          beamShadow: '0 0 16px rgba(239,68,68,0.85), 0 0 30px rgba(239,68,68,0.4)',
          topGlare: 'from-transparent via-red-300 to-transparent',
          topGlareShadow: 'shadow-[0_0_14px_rgba(239,68,68,0.85)]',
          bottomGlare: 'from-transparent via-red-500/40 to-transparent',
          reticle: 'border-red-400/85 shadow-[0_0_10px_rgba(239,68,68,0.6)]',
          scanlinePattern:
            'bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(239,68,68,0.22)_50%)]',
        };
      case 'cyan':
      default:
        return {
          beamGradient:
            'linear-gradient(180deg, rgba(6,182,212,0) 0%, rgba(56,189,248,0.18) 50%, rgba(255,255,255,0.8) 95%, rgba(6,182,212,0.95) 100%)',
          beamShadow: '0 0 16px rgba(6,182,212,0.85), 0 0 30px rgba(6,182,212,0.4)',
          topGlare: 'from-transparent via-cyan-300 to-transparent',
          topGlareShadow: 'shadow-[0_0_14px_rgba(6,182,212,0.85)]',
          bottomGlare: 'from-transparent via-cyan-500/40 to-transparent',
          reticle: 'border-cyan-400/85 shadow-[0_0_10px_rgba(34,211,238,0.6)]',
          scanlinePattern:
            'bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(6,182,212,0.22)_50%)]',
        };
    }
  };

  const styles = getAccentStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="hologram-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            key="hologram-modal-card"
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 27,
              mass: 0.85,
            }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${maxWidth} ${maxHeight} ${className} relative overflow-hidden`}
          >
            {/* Metallic Holographic Scanline Sweeper */}
            <motion.div
              key="hologram-scanline-beam"
              className="pointer-events-none absolute inset-x-0 h-28 -top-28 z-30 opacity-75"
              style={{
                background: styles.beamGradient,
                filter: `drop-shadow(${styles.beamShadow})`,
              }}
              initial={{ top: '-25%' }}
              animate={{ top: '120%' }}
              transition={{
                duration: 1.45,
                ease: [0.16, 1, 0.3, 1],
              }}
            />

            {/* Repeating Holographic CRT scanline texture */}
            <div
              className={`pointer-events-none absolute inset-0 z-20 opacity-[0.06] ${styles.scanlinePattern} bg-[length:100%_4px]`}
            />

            {/* Metallic Top Edge Light Reflection */}
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r ${styles.topGlare} z-30 opacity-90 ${styles.topGlareShadow}`}
            />
            {/* Subtle Metallic Bottom Glow */}
            <div
              className={`pointer-events-none absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r ${styles.bottomGlare} z-30 opacity-60`}
            />

            {/* Stark Holographic Corner Reticles */}
            <div
              className={`pointer-events-none absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 ${styles.reticle} rounded-tl-lg z-30`}
            />
            <div
              className={`pointer-events-none absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 ${styles.reticle} rounded-tr-lg z-30`}
            />
            <div
              className={`pointer-events-none absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 ${styles.reticle} rounded-bl-lg z-30`}
            />
            <div
              className={`pointer-events-none absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 ${styles.reticle} rounded-br-lg z-30`}
            />

            {/* Modal Inner Content */}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
