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

  const sections = [
    {
      id: "appearance",
      title: "Appearance",
      icon: Monitor,
      items: [
        {
          id: "imageQuality",
          label: "Image Quality",
          description: "Higher quality looks better but uses more data",
          type: "select",
          options: [
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "auto", label: "Auto" },
          ],
        },
        {
          id: "reduceMotion",
          label: "Reduce Motion",
          description: "Minimize animations throughout the app",
          type: "toggle",
        },
      ],
    },
    {
      id: "playback",
      title: "Playback",
      icon: Wifi,
      items: [
        {
          id: "dataSaver",
          label: "Data Saver",
          description: "Force low quality images and optimize playback",
          type: "toggle",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pt-32 pb-20">
      <div className="container max-w-3xl">
        
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 t-label text-[var(--text-muted)] hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="t-title text-5xl mb-12 uppercase tracking-wider">Settings</h1>

          <div className="space-y-12">
            {sections.map((section) => (
              <section key={section.id} className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[var(--border-faint)] pb-4">
                  <section.icon className="w-4 h-4 text-[var(--accent)]" />
                  <h2 className="t-label text-sm text-white">{section.title}</h2>
                </div>

                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="surface p-5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-white mb-1">{item.label}</h3>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.description}</p>
                      </div>

                      {item.type === "select" ? (
                        <div className="flex gap-1 p-1 bg-[var(--bg-raised)] rounded-[var(--radius-sm)] border border-[var(--border-faint)]">
                          {item.options?.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => updateSetting(item.id as any, opt.value)}
                              className={`px-4 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-widest transition-all ${
                                settings[item.id as keyof typeof settings] === opt.value
                                  ? "bg-white/10 text-white shadow-lg"
                                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => updateSetting(item.id as any, !settings[item.id as keyof typeof settings])}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                            settings[item.id as keyof typeof settings] ? "bg-[var(--accent)]" : "bg-white/10"
                          }`}
                        >
                          <motion.div
                            animate={{ x: settings[item.id as keyof typeof settings] ? 26 : 4 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                          />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <section className="pt-12 border-t border-[var(--border-faint)] space-y-6">
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-red-500" />
                <h2 className="t-label text-sm text-white">Advanced & Data</h2>
              </div>

              <div className="surface p-6 rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Local Storage</h3>
                    <p className="text-xs text-[var(--text-muted)]">Currently using {getStorageUsage()} MB of device storage</p>
                  </div>
                  <button
                    onClick={handleClearCache}
                    className={`btn ${cacheCleared ? "bg-green-500" : "btn-secondary"} text-xs py-2.5 px-6 min-w-[160px]`}
                  >
                    {cacheCleared ? (
                      <><Check className="w-3.5 h-3.5" /> Cleared</>
                    ) : (
                      <><Trash2 className="w-3.5 h-3.5" /> Clear All Cache</>
                    )}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
