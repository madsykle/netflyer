'use client';

import { useSettings } from "../../hooks/useSettings";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  Check,
  Trash2,
  ArrowLeft,
  Settings as SettingsIcon,
  Play,
  Gauge,
} from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Settings = () => {
  const { settings, updateSetting, clearCache, getStorageUsage } = useSettings();
  const router = useRouter();
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    if (confirm("This will reset your local settings and clear search history. Continue?")) {
      clearCache();
      setCacheCleared(true);
      setTimeout(() => {
        setCacheCleared(false);
        window.location.reload();
      }, 1500);
    }
  };

  const qualityOptions = [
    { value: "low", label: "Low", desc: "Save data" },
    { value: "medium", label: "Medium", desc: "Balanced" },
    { value: "high", label: "High", desc: "Best quality" },
    { value: "auto", label: "Auto", desc: "Adaptive" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pt-32 pb-20">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[var(--accent)]/5 rounded-full blur-[150px]" />
      </div>

      <div className="container relative z-10 max-w-3xl">
        
        <motion.button 
          onClick={() => router.back()} 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 t-label text-[var(--text-muted)] hover:text-white transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-[var(--radius-md)] flex items-center justify-center border border-[var(--accent)]/20">
              <SettingsIcon className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <h1 
              className="text-white text-5xl"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
            >
              Settings
            </h1>
          </div>

          <div className="space-y-10">
            {/* Appearance Section */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-faint)]">
                <Monitor className="w-4 h-4 text-[var(--accent)]" />
                <h2 className="t-label text-sm text-white">Appearance</h2>
              </div>

              <div className="space-y-6">
                {/* Image Quality */}
                <div className="surface p-6 rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                      <h3 className="text-white font-semibold mb-1">Image Quality</h3>
                      <p className="text-xs text-[var(--text-muted)]">Higher quality looks better but uses more data</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {qualityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("imageQuality", opt.value)}
                        className={`flex-1 py-3 px-4 rounded-[var(--radius-sm)] text-center transition-all border ${
                          settings.imageQuality === opt.value
                            ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                            : "bg-white/5 border-[var(--border-faint)] text-[var(--text-secondary)] hover:border-[var(--border-subtle)]"
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-wider block">{opt.label}</span>
                        <span className="text-[10px] opacity-50">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reduce Motion */}
                <div className="surface p-5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold mb-1">Reduce Motion</h3>
                    <p className="text-xs text-[var(--text-muted)]">Minimize animations throughout the app</p>
                  </div>
                  <button
                    onClick={() => updateSetting("reduceMotion", !settings.reduceMotion)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                      settings.reduceMotion ? "bg-[var(--accent)]" : "bg-white/10"
                    }`}
                  >
                    <motion.div
                      animate={{ x: settings.reduceMotion ? 28 : 4 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                    />
                  </button>
                </div>
              </div>
            </motion.section>

            {/* Playback Section */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-faint)]">
                <Play className="w-4 h-4 text-[var(--accent)]" />
                <h2 className="t-label text-sm text-white">Playback</h2>
              </div>

              <div className="surface p-5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold mb-1">Data Saver</h3>
                  <p className="text-xs text-[var(--text-muted)]">Force low quality images and optimize playback</p>
                </div>
                <button
                  onClick={() => updateSetting("dataSaver", !settings.dataSaver)}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                    settings.dataSaver ? "bg-[var(--accent)]" : "bg-white/10"
                  }`}
                >
                  <motion.div
                    animate={{ x: settings.dataSaver ? 28 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                  />
                </button>
              </div>
            </motion.section>

            {/* Advanced Section */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-faint)]">
                <Gauge className="w-4 h-4 text-[var(--accent)]" />
                <h2 className="t-label text-sm text-white">Advanced & Data</h2>
              </div>

              <div className="surface p-6 rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold mb-1">Local Storage</h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Currently using <span className="text-white font-semibold">{getStorageUsage()} MB</span> of device storage
                    </p>
                  </div>
                  <button
                    onClick={handleClearCache}
                    className={`btn ${cacheCleared ? "bg-green-500 border-green-500" : "btn-secondary"} py-2.5 px-6`}
                  >
                    {cacheCleared ? (
                      <><Check className="w-4 h-4" /> Cleared</>
                    ) : (
                      <><Trash2 className="w-4 h-4" /> Clear All Cache</>
                    )}
                  </button>
                </div>
              </div>
            </motion.section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
