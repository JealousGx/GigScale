"use client";

import { AnimatePresence, motion } from "motion/react";

interface ModalTransitionProps {
  activeKey: string;
  direction?: number;
  children: React.ReactNode;
}

export function ModalTransition({
  activeKey,
  direction = 1,
  children,
}: ModalTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <motion.div
        key={activeKey}
        custom={direction}
        initial={{ opacity: 0, x: direction * 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -20 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
