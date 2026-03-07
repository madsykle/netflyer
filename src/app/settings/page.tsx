'use client';

import { useSettings } from "../../hooks/useSettings";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Wifi,
  Monitor,
  Check,
  Trash2,
  Download,
  ArrowLeft,
  LayoutGrid,
  Zap,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../components/ToastProvider";

const Settings = () => {
  const router = useRouter();
  const { settings, updateSetting, getStorageUsage, clearCache } = useSettings();
  const { createToast } = useToast();

  const [storageUsed, setStorageUsed] = useState("0.00");
  const [expandedQuality, setExpandedQuality] = useState(false);

  useEffect(() => {
    setStorageUsed(getStorageUsage());
  }, [getStorageUsage]);

  const handleClearCache = () => {
    if (confirm("Are you sure you want to clear all cached data?")) {
      clearCache();
      setStorageUsed(getStorageUsage());
      createToast("Cache cleared successfully", {
        type: "success",
        timeout: 3000,
      });
    }
  };

  const handleToggle = (key: any) => {
    const newValue = !((settings as any)[key]);
    updateSetting(key, newValue);

    const label = key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str: string) => str.toUpperCase());

    createToast(`${label} ${newValue ? "enabled" : "disabled"}`, {
      type: "success",
      timeout: 2000,
    });
  };

  const handleQualityChange = (value: any) => {
    updateSetting("imageQuality", value);
    setExpandedQuality(false);
    createToast(`Image quality updated`, { type: "success", timeout: 2000 });
  };

  const imageQualityOptions = [
    { value: "low", label: "Data Saver", description: "Saves ~70% data", icon: Download },
    { value: "medium", label: "Balanced", description: "Good quality balance", icon: Wifi },
    { value: "high", label: "High Quality", description: "Best visuals", icon: ImageIcon },
    { value: "auto", label: "Auto", description: "Adapts to connection", icon: Monitor },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white pt-24 pb-20">
      <div className="container max-w-2xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-white transition-colors mb-10 text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="heading-1 mb-12">Settings</h1>

          <div className="space-y-12">
            
            {/* Display Section */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-6 ml-2">Display</h2>
              <div className="glass-panel rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden divide-y divide-[var(--color-border-subtle)]">
                
                {/* Image Quality */}
                <div className="p-5">
                  <div className="relative">
                    <button
                      onClick={() => setExpandedQuality(!expandedQuality)}
                      className="w-full flex items-center justify-between group"
                    >
                      <div className="text-left">
                        <span className="text-base font-medium text-white block mb-1">Image Quality</span>
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          {imageQualityOptions.find((opt) => opt.value === settings.imageQuality)?.label}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-[var(--color-text-tertiary)] group-hover:text-white transition-transform ${
                          expandedQuality ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedQuality && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 mt-4 border-t border-[var(--color-border-subtle)] space-y-2">
                            {imageQualityOptions.map((option) => {
                              const isSelected = settings.imageQuality === option.value;
                              const Icon = option.icon;
                              return (
                                <button
                                  key={option.value}
                                  onClick={() => handleQualityChange(option.value)}
                                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                                    isSelected ? "bg-white/10" : "hover:bg-white/5"
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <Icon className={`w-5 h-5 ${isSelected ? "text-[var(--color-accent-primary)]" : "text-[var(--color-text-tertiary)]"}`} />
                                    <div className="text-left">
                                      <span className={`block text-sm font-medium ${isSelected ? "text-white" : "text-[var(--color-text-secondary)]"}`}>
                                        {option.label}
                                      </span>
                                    </div>
                                  </div>
                                  {isSelected && <Check className="w-4 h-4 text-[var(--color-accent-primary)]" />}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Compact Mode */}
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-base font-medium text-white block mb-1">Compact Mode</span>
                    <span className="text-sm text-[var(--color-text-secondary)]">Show more content with less spacing</span>
                  </div>
                  <button
                    onClick={() => handleToggle("compactMode")}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                      settings.compactMode ? "bg-[var(--color-accent-primary)]" : "bg-[var(--color-bg-elevated)]"
                    }`}
                  >
                    <motion.div
                      className="w-4 h-4 bg-white rounded-full"
                      animate={{ x: settings.compactMode ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Accessibility Section */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-6 ml-2">Accessibility</h2>
              <div className="glass-panel rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden divide-y divide-[var(--color-border-subtle)]">
                
                {/* Reduce Motion */}
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-base font-medium text-white block mb-1">Reduce Motion</span>
                    <span className="text-sm text-[var(--color-text-secondary)]">Minimize animations across the app</span>
                  </div>
                  <button
                    onClick={() => handleToggle("reduceMotion")}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                      settings.reduceMotion ? "bg-[var(--color-accent-primary)]" : "bg-[var(--color-bg-elevated)]"
                    }`}
                  >
                    <motion.div
                      className="w-4 h-4 bg-white rounded-full"
                      animate={{ x: settings.reduceMotion ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Data Section */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-6 ml-2">Data & Storage</h2>
              <div className="glass-panel rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden divide-y divide-[var(--color-border-subtle)]">
                
                {/* Data Saver Mode */}
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-base font-medium text-white block mb-1">Data Saver Mode</span>
                    <span className="text-sm text-[var(--color-text-secondary)]">Reduce data usage on mobile networks</span>
                  </div>
                  <button
                    onClick={() => handleToggle("dataSaver")}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                      settings.dataSaver ? "bg-[var(--color-accent-primary)]" : "bg-[var(--color-bg-elevated)]"
                    }`}
                  >
                    <motion.div
                      className="w-4 h-4 bg-white rounded-full"
                      animate={{ x: settings.dataSaver ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                <div className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-base font-medium text-white block mb-1">Local Storage Used</span>
                    <span className="text-sm text-[var(--color-text-secondary)]">{storageUsed} MB</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="pt-8">
              <button
                onClick={handleClearCache}
                className="w-full p-5 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 font-bold transition-colors flex items-center justify-center gap-3"
              >
                <Trash2 className="w-5 h-5" />
                Clear All App Cache
              </button>
            </section>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;