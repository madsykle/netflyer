'use client';

import { motion } from "framer-motion";
import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[var(--color-bg-primary)]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.03%22/%3E%3C/svg%3E')] opacity-50 mix-blend-overlay pointer-events-none"></div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        {/* Cinematic Spinner */}
        <div className="relative w-20 h-20 mb-8">
          <motion.div
            className="absolute inset-0 rounded-full border border-white/5"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-t-2 border-[var(--color-accent-primary)] shadow-[0_0_15px_rgba(229,9,20,0.5)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-4 rounded-full border-b-2 border-white/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Loading text */}
        <motion.div
          className="flex items-center gap-1"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-white font-display font-bold uppercase tracking-[0.3em] text-xs">
            Loading
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Loading;
