'use client';

import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  RotateCcw,
  ArrowLeft,
  AlertCircle,
  Tv,
  Film,
  Check,
  ChevronDown,
} from "lucide-react";
import React, { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { providers, getEmbedUrl, Provider } from "../../../lib/embed";
import { tmdbService } from "../../../lib/tmdb";
import { ContentType } from "../../../types/tmdb";
import { auth, db } from "../../../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface Props {
  params: Promise<{
    params: string[];
  }>;
}

const WatchClient = ({ params }: Props) => {
  const resolvedParams = use(params);
  const { params: routeParams } = resolvedParams;
  
  const type = routeParams[0] as ContentType;
  const id = routeParams[1];
  const season = routeParams[2];
  const episode = routeParams[3];

  const router = useRouter();

  const [provider, setProvider] = useState<Provider>(providers[0].key as Provider);
  const [embedUrl, setEmbedUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [title, setTitle] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);

  const fetchEmbedUrl = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url = getEmbedUrl(provider, type, parseInt(id), season ? parseInt(season) : undefined, episode ? parseInt(episode) : undefined);
      if (url) {
        setEmbedUrl(url);
        setLoading(false);
      } else {
        throw new Error("No video source available");
      }
    } catch (err) {
      console.error("Failed to fetch embed URL:", err);
      const currentIndex = providers.findIndex((p) => p.key === provider);
      if (currentIndex !== -1 && currentIndex < providers.length - 1) {
        setProvider(providers[currentIndex + 1].key as Provider);
      } else {
        setError("Video source unavailable. Try another provider.");
        setLoading(false);
      }
    }
  }, [provider, type, id, season, episode]);

  // Fetch title info
  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const data = await tmdbService.getContentDetails(type, parseInt(id));
        if (data) {
          const name = (data as any).title || (data as any).name || "Unknown";
          if (type === "tv" && season && episode) {
            setTitle(`${name} - S${season} E${episode}`);
          } else {
            setTitle(name);
          }
        }
      } catch (err) {
        console.error("Failed to fetch title:", err);
      }
    };
    fetchTitle();
  }, [type, id, season, episode]);

  useEffect(() => {
    fetchEmbedUrl();
  }, [fetchEmbedUrl]);

  // Watch history tracking
  useEffect(() => {
    if (!id || !type) return;
    
    let interval: NodeJS.Timeout;
    const updateHistory = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, `watchHistory/${auth.currentUser.uid}/items`, id);
        await setDoc(docRef, {
          contentId: id,
          type: type,
          season: season || null,
          episode: episode || null,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (e) {
        console.error("Error updating watch history", e);
      }
    };

    updateHistory();
    interval = setInterval(updateHistory, 30000);
    
    return () => clearInterval(interval);
  }, [id, type, season, episode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch(e.key.toLowerCase()) {
        case 'f':
          e.preventDefault();
          const iframe = document.querySelector('iframe');
          if (iframe) {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              iframe.requestFullscreen();
            }
          }
          break;
        case 'escape':
          e.preventDefault();
          router.back();
          break;
        case 'r':
          e.preventDefault();
          fetchEmbedUrl();
          break;
        case '?':
          e.preventDefault();
          setShowShortcuts(prev => !prev);
          break;
        default:
          const num = parseInt(e.key);
          if (!isNaN(num) && num >= 1 && num <= providers.length) {
            e.preventDefault();
            setProvider(providers[num - 1].key as Provider);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, fetchEmbedUrl]);

  const currentProvider = providers.find((p) => p.key === provider);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white pt-24 pb-12">
      {/* Header - Sticky with glassmorphism */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-24 z-40 glass-panel border-b border-white/5 py-4 mb-8 mx-auto container rounded-2xl shadow-2xl"
      >
        <div className="px-6 flex items-center justify-between">
          {/* Back & Title */}
          <div className="flex items-center gap-6">
            <motion.button
              onClick={() => router.back()}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-6 h-6 text-white group-hover:text-[var(--color-accent-primary)] transition-colors" />
            </motion.button>

            <div className="hidden sm:block">
              <div className="flex items-center gap-2 text-[var(--color-accent-primary)] text-xs font-bold uppercase tracking-[0.2em] mb-1">
                {type === "movie" ? (
                  <Film className="w-3.5 h-3.5" />
                ) : (
                  <Tv className="w-3.5 h-3.5" />
                )}
                <span>{type === "movie" ? "Movie" : "TV Show"}</span>
              </div>
              <h1 className="text-xl font-bold text-white line-clamp-1 max-w-[400px] md:max-w-[600px] drop-shadow-md">
                {title || "Loading..."}
              </h1>
            </div>
          </div>

          {/* Provider Selector & Reload */}
          <div className="flex items-center gap-4">
            {/* Help Button */}
            <button
              onClick={() => setShowShortcuts(true)}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all font-bold"
              title="Keyboard Shortcuts (?)"
            >
              ?
            </button>
            {/* Provider Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProviderMenu(!showProviderMenu)}
                className="btn btn-secondary px-5 py-3 text-sm flex items-center gap-3"
              >
                <Play className="w-4 h-4 fill-current" />
                <span className="hidden md:inline">{currentProvider?.label}</span>
                <span className="md:hidden">Source</span>
                <ChevronDown
                  className={`w-4 h-4 text-[var(--color-text-tertiary)] transition-transform duration-300 ${
                    showProviderMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showProviderMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-3 w-64 glass-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                  >
                    <div className="px-3 py-2 mb-1 border-b border-white/5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">Select Provider</span>
                    </div>
                    <div className="space-y-1">
                      {providers.map((p) => (
                        <button
                          key={p.key}
                          onClick={() => {
                            setProvider(p.key as Provider);
                            setShowProviderMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                            provider === p.key
                              ? "bg-[var(--color-accent-primary)]/20 text-white"
                              : "hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-white"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-bold">{p.label}</p>
                            <p className="text-[10px] font-medium opacity-60">{p.description}</p>
                          </div>
                          {provider === p.key && (
                            <div className="w-6 h-6 rounded-full bg-[var(--color-accent-primary)] flex items-center justify-center shadow-lg">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reload Button */}
            <button
              onClick={fetchEmbedUrl}
              disabled={loading}
              className="btn btn-primary px-5 py-3 text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <RotateCcw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden md:inline">{loading ? "Loading..." : "Reload"}</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong p-8 rounded-2xl max-w-sm w-full border border-white/10 shadow-2xl relative"
            >
              <h3 className="text-xl font-bold font-display uppercase tracking-widest mb-6">Keyboard Shortcuts</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-secondary)]">Fullscreen</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-sm font-mono font-bold">F</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-secondary)]">Go Back</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-sm font-mono font-bold">Esc</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-secondary)]">Reload Player</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-sm font-mono font-bold">R</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-secondary)]">Switch Provider</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-sm font-mono font-bold">1-8</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-secondary)]">Show/Hide Shortcuts</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-sm font-mono font-bold">?</kbd>
                </div>
              </div>
              <button 
                onClick={() => setShowShortcuts(false)}
                className="mt-8 w-full btn btn-primary py-3"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="container relative z-10">
        {/* Mobile Title */}
        <div className="sm:hidden mb-6 px-4">
          <div className="flex items-center gap-2 text-[var(--color-accent-primary)] text-xs font-bold uppercase tracking-[0.2em] mb-1">
            {type === "movie" ? (
              <Film className="w-3.5 h-3.5" />
            ) : (
              <Tv className="w-3.5 h-3.5" />
            )}
            <span>{type === "movie" ? "Movie" : "TV Show"}</span>
          </div>
          <h1 className="text-2xl font-bold text-white line-clamp-2 drop-shadow-md">
            {title || "Loading..."}
          </h1>
        </div>

        {/* Video Player Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative glass-panel rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5"
        >
          <div className="aspect-video relative bg-black">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center z-10"
                >
                  <div className="w-16 h-16 border-4 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(229,9,20,0.3)]"></div>
                  <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] animate-pulse">
                    Initializing Stream
                  </p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10"
                >
                  <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-wider">
                    Source Error
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-center max-w-md mb-8 font-medium">
                    {error}. Please try switching to a different provider in the top menu.
                  </p>
                  <button
                    onClick={fetchEmbedUrl}
                    className="btn btn-secondary px-8 py-4"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Try Again
                  </button>
                </motion.div>
              ) : embedUrl ? (
                <motion.div
                  key="player"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <iframe
                    src={embedUrl}
                    title="Video Player"
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Player Info Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${embedUrl && !loading ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-[var(--color-accent-primary)] animate-pulse shadow-[0_0_10px_rgba(229,9,20,0.5)]'}`} />
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                {loading ? "Buffering" : error ? "Stream Offline" : "Live Stream"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">Provider:</span>
              <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs font-bold text-white uppercase tracking-wider">
                {currentProvider?.label}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-start gap-5 hover:border-white/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/10 flex items-center justify-center flex-shrink-0 border border-[var(--color-accent-primary)]/20">
              <span className="text-sm font-bold text-[var(--color-accent-primary)]">01</span>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wide">Multi-Source</h4>
              <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-relaxed">
                If the stream fails to load, try switching providers from the source menu above.
              </p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-start gap-5 hover:border-white/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/10 flex items-center justify-center flex-shrink-0 border border-[var(--color-accent-primary)]/20">
              <span className="text-sm font-bold text-[var(--color-accent-primary)]">02</span>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wide">Immersive View</h4>
              <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-relaxed">
                Use the player&apos;s fullscreen toggle for a distraction-free cinematic experience.
              </p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-start gap-5 hover:border-white/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/10 flex items-center justify-center flex-shrink-0 border border-[var(--color-accent-primary)]/20">
              <span className="text-sm font-bold text-[var(--color-accent-primary)]">03</span>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wide">Troubleshoot</h4>
              <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-relaxed">
                Reload the page or use the &quot;Reload&quot; button if you encounter buffering issues.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default WatchClient;
