'use client';
import React, { useEffect, useState, ComponentType } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion, MotionProps } from 'framer-motion';

interface PageWrapperProps {
  children: React.ReactNode;
}

interface MotionMainProps extends MotionProps {
  children: React.ReactNode;
}

const DefaultMotionMain: React.FC<MotionMainProps> = ({ children }) => (
  <main className="container mx-auto px-6 py-8 sm:py-12">{children}</main>
);
DefaultMotionMain.displayName = 'DefaultMotionMain';

export default function PageWrapper({ children }: PageWrapperProps) {
  const [MotionMain, setMotionMain] = useState<ComponentType<MotionMainProps>>(() => DefaultMotionMain);

  useEffect(() => {
    import('framer-motion').then(({ motion }) => {
      const AnimatedMain: React.FC<MotionMainProps> = ({ children }) => (
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-6 py-8 sm:py-12"
        >
          {children}
        </motion.main>
      );
      AnimatedMain.displayName = 'AnimatedMain';
      setMotionMain(() => AnimatedMain);
    });
  }, []);

  return <MotionMain>{children}</MotionMain>;
}
