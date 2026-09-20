import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

export interface AnimatedViewProps {
  viewKey: string;
  children: React.ReactNode;
  className?: string;
}

export const AnimatedView: React.FC<AnimatedViewProps> = ({
  viewKey,
  children,
  className = 'w-full min-w-0',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const variants: Variants = shouldReduceMotion
    ? {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 1, y: 0 },
      }
    : {
        initial: { opacity: 0, y: 8 },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.26,
            ease: [0.22, 1, 0.36, 1],
          },
        },
        exit: {
          opacity: 0,
          transition: {
            duration: 0.16,
            ease: [0.4, 0, 1, 1],
          },
        },
      };

  return (
    <motion.div
      key={viewKey}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};
