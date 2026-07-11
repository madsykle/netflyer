'use client';

import { useSettings } from "../../hooks/useSettings";
import {
  Monitor,
  Check,
  Trash,
  ArrowLeft,
  Gear,
  Play,
  Gauge,
} from "@phosphor-icons/react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { tmdbService } from "../../lib/tmdb";
import Image from "next/image";

const CURATED_FILMS = [
  503919, // The Lighthouse
  531428, // Portrait of a Lady on Fire
  335984, // Blade Runner 2049
  120467, // The Grand Budapest Hotel
  70608,  // Drive
  1398,   // Stalker
  490,    // The Seventh Seal
  13475,  // Mulholland Drive
  290098, // The Handmaiden
  329865, // Arrival
  376867, // Moonlight
  496243, // Parasite
  152601, // Her
  97370,  // Under the Skin
  373023, // Burning
  11059,  // Memories of Murder
  361292, // Suspiria (2018)
];

const Settings = () => {
  const { settings, updateSetting, clearCache, getStorageUsage } = useSettings();
  const router = useRouter();
  const [cacheCleared, setCacheCleared] = useState(false);
  const [backdropUrl, setBackdropUrl] = useState("");
  const [storageUsage, setStorageUsage] = useState("0.00");

  useEffect(() => {
    setStorageUsage(getStorageUsage());
  }, [getStorageUsage]);

  useEffect(() => {
    const fetchBackdrop = async () => {
      try {
        const randomId = CURATED_FILMS[Math.floor(Math.random() * CURATED_FILMS.length)];
        const movie = await tmdbService.getMovieDetails(randomId);
        if (movie.backdrop_path) {
          setBackdropUrl(`https://image.tmdb.org/t/p/original${movie.backdrop_path}`);
        }
      } catch (error) {
        console.error("Error fetching settings backdrop:", error);
        setBackdropUrl("https://image.tmdb.org/t/p/original/s3TGo9h36S9DYpv7r0kvUrMwtZ4.jpg");
      }
    };
    fetchBackdrop();
  }, []);

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
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pt-32 pb-20 relative overflow-hidden">
      {/* High Quality Cinematic Blurred Backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#050508]">
        {backdropUrl && (
          <Image 
            src={backdropUrl.replace('/original/', '/w1280/')} 
            alt="" 
            fill
            priority
            className="object-cover opacity-15 blur-lg scale-105 transition-opacity duration-1000 animate-kenburns"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/80 to-[var(--bg-base)]/60 z-10" />
      </div>

      <div className="container relative z-10 max-w-3xl">
        
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 t-label text-[var(--text-muted)] hover:text-white transition-colors mb-10 group animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" weight="bold" />
          <span>Back</span>
        </button>

        <div className="animate-slide-up">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-[var(--radius-md)] flex items-center justify-center border border-[var(--accent)]/20">
              <Gear className="w-6 h-6 text-[var(--accent)]" weight="fill" />
            </div>
            <h1 
              className="text-white text-5xl"
              style={{ fontFamily: "'Clash Display', sans-serif", letterSpacing: '0.02em' }}
            >
              Settings
            </h1>
          </div>

          <div className="space-y-10">
            {/* Appearance Section */}
            <section 
              className="space-y-6 animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-faint)]">
                <Monitor className="w-4 h-4 text-[var(--accent)]" />
                <h2 className="t-label text-sm text-white">Appearance</h2>
              </div>

              <div className="space-y-6">
                {/* Image Quality */}
                <div className="glass-premium p-6 rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                      <h3 className="text-white font-semibold mb-1">Image Quality</h3>
                      <p className="text-xs text-[var(--text-muted)]">Higher quality looks better but uses more data</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {qualityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("imageQuality", opt.value)}
                        className={`py-3 px-4 rounded-[var(--radius-sm)] text-center transition-all border ${
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
                <div className="glass-premium p-5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] flex items-center justify-between">
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
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ease-[var(--ease-out-expo)]`}
                      style={{ transform: `translateX(${settings.reduceMotion ? 28 : 4}px)` }}
                    />
                  </button>
                </div>

                {/* Compact Mode */}
                <div className="glass-premium p-5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold mb-1">Compact Mode</h3>
                    <p className="text-xs text-[var(--text-muted)]">Reduce layout padding and sizes for denser presentation</p>
                  </div>
                  <button
                    onClick={() => updateSetting("compactMode", !settings.compactMode)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                      settings.compactMode ? "bg-[var(--accent)]" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ease-[var(--ease-out-expo)]`}
                      style={{ transform: `translateX(${settings.compactMode ? 28 : 4}px)` }}
                    />
                  </button>
                </div>

                {/* Row Navigation Arrows */}
                <div className="glass-premium p-5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold mb-1">Row Navigation Arrows</h3>
                    <p className="text-xs text-[var(--text-muted)]">Show side scroll arrows on movie and cast rows</p>
                  </div>
                  <button
                    onClick={() => updateSetting("showScrollIndicators", !settings.showScrollIndicators)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                      settings.showScrollIndicators ? "bg-[var(--accent)]" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ease-[var(--ease-out-expo)]`}
                      style={{ transform: `translateX(${settings.showScrollIndicators ? 28 : 4}px)` }}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Playback Section */}
            <section 
              className="space-y-6 animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-faint)]">
                <Play className="w-4 h-4 text-[var(--accent)]" />
                <h2 className="t-label text-sm text-white">Playback & Trailers</h2>
              </div>

              <div className="space-y-6">
                {/* Data Saver */}
                <div className="glass-premium p-5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] flex items-center justify-between">
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
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ease-[var(--ease-out-expo)]`}
                      style={{ transform: `translateX(${settings.dataSaver ? 28 : 4}px)` }}
                    />
                  </button>
                </div>

                {/* Autoplay Trailers */}
                <div className="glass-premium p-5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold mb-1">Autoplay Trailers</h3>
                    <p className="text-xs text-[var(--text-muted)]">Automatically play trailers on info pages when available</p>
                  </div>
                  <button
                    onClick={() => updateSetting("autoplayTrailers", !settings.autoplayTrailers)}
                    disabled={settings.dataSaver}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                      settings.dataSaver ? "opacity-50 cursor-not-allowed bg-white/5" : settings.autoplayTrailers ? "bg-[var(--accent)]" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ease-[var(--ease-out-expo)]`}
                      style={{ transform: `translateX(${settings.dataSaver ? 4 : settings.autoplayTrailers ? 28 : 4}px)` }}
                    />
                  </button>
                </div>

                {/* Default Video Quality */}
                <div className="glass-premium p-6 rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                      <h3 className="text-white font-semibold mb-1">Default Stream Quality</h3>
                      <p className="text-xs text-[var(--text-muted)]">Pre-select preferred stream quality (if supported by provider)</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { value: "360p", label: "360p", desc: "Low" },
                      { value: "480p", label: "480p", desc: "SD" },
                      { value: "720p", label: "720p", desc: "HD" },
                      { value: "1080p", label: "1080p", desc: "FHD" },
                      { value: "auto", label: "Auto", desc: "Adaptive" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("defaultVideoQuality", opt.value)}
                        className={`py-3 px-3 rounded-[var(--radius-sm)] text-center transition-all border ${
                          settings.defaultVideoQuality === opt.value
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
              </div>
            </section>

            {/* Advanced Section */}
            <section 
              className="space-y-6 animate-slide-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-faint)]">
                <Gauge className="w-4 h-4 text-[var(--accent)]" />
                <h2 className="t-label text-sm text-white">Advanced & Data</h2>
              </div>

              <div className="glass-premium p-6 rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold mb-1">Local Storage</h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Currently using <span className="text-white font-semibold">{storageUsage} MB</span> of device storage
                    </p>
                  </div>
                  <button
                    onClick={handleClearCache}
                    className={`btn ${cacheCleared ? "bg-green-500 border-green-500" : "btn-secondary"} py-2.5 px-6`}
                  >
                    {cacheCleared ? (
                      <><Check className="w-4 h-4" weight="bold" /> Cleared</>
                    ) : (
                      <><Trash className="w-4 h-4" weight="bold" /> Clear All Cache</>
                    )}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
