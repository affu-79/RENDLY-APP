'use client';

import React from 'react';
import { motion } from 'framer-motion';
import RendlyLogo from './RendlyLogo';

interface AnimatedLogoProps {
  onAnimationComplete?: () => void;
}

export function AnimatedLogo({ onAnimationComplete }: AnimatedLogoProps) {
  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{
        opacity: 0,
        scale: 0,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.8,
        ease: 'easeOut',
      }}
      onAnimationComplete={onAnimationComplete}
    >
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.8,
        }}
      >
        <RendlyLogo className="w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80" />
      </motion.div>
    </motion.div>
  );
}

export default AnimatedLogo;
