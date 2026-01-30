import { motion } from "framer-motion";
import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[var(--color-bg-primary)]/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        {/* Animated logo/spinner */}
        <div className="relative w-16 h-16 mb-4">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[var(--color-accent-primary)]"
            style={{ borderTopColor: "transparent" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-[var(--color-accent-secondary)]"
            style={{ borderBottomColor: "transparent" }}
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Loading text */}
        <motion.p
          className="text-[var(--color-text-tertiary)] text-sm tracking-wider"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Loading;
