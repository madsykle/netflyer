'use client';

import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[var(--bg-base)]">
      <div className="flex flex-col items-center animate-fade-in">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-[3px] border-[var(--accent)] border-t-transparent animate-spin" />
        </div>
        <p className="t-meta mt-6 text-[10px] uppercase tracking-[0.3em] text-[var(--text-secondary)] animate-pulse">
          Loading Cinema
        </p>
      </div>
    </div>
  );
};

export default Loading;
