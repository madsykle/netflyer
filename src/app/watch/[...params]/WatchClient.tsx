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
  MonitorPlay,
  ServerCrash
} from "lucide-react";
import React, { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { providers, getEmbedUrl, Provider } from "../../../lib/embed";
import { tmdbService } from "../../../lib/tmdb";
import { ContentType, MovieDetails, TVShowDetails, Season, Episode } from "../../../types/tmdb";
import { auth, db } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
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
  const currentSeason = routeParams[2] ? parseInt(routeParams[2]) : 1;
  const currentEpisode = routeParams[3] ? parseInt(routeParams[3]) : 1;

  const router = useRouter();

  const [provider, setProvider] = useState<Provider>(providers[0].key as Provider);
  const [embedUrl, setEmbedUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [details, setDetails] = useState<MovieDetails | TVShowDetails | null>(null);
  const [seasonData, setSeasonData] = useState<Season | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAdNotice, setShowAdNotice] = useState(false);
  const [showSeasonMenu, setShowSeasonMenu] = useState(false);

  // Show ad notice once per session
  useEffect(() => {
    const hasSeenNotice = sessionStorage.getItem("netflyer_ad_notice");
    if (!hasSeenNotice) {
      const timer = setTimeout(() => setShowAdNotice(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissAdNotice = () => {
    sessionStorage.setItem("netflyer_ad_notice", "true");
    setShowAdNotice(false);
  };

  // Maintain auth state for history tracking
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Passive check, no redirect
    });
    return () => unsubscribe();
  }, []);

  const fetchEmbedUrl = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url = getEmbedUrl(provider, type, parseInt(id), currentSeason, currentEpisode);
      if (url) {
        setEmbedUrl(url);
        // Artificial delay for smoother transition
        setTimeout(() => setLoading(false), 800);
      } else {
        throw new Error("No video source available");
      }
    } catch (err) {
      console.error("Failed to fetch embed URL:", err);
      setError("Video source unavailable. Try another provider.");
      setLoading(false);
    }
  }, [provider, type, id, currentSeason, currentEpisode]);

  // Fetch title info and episodes if TV
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await tmdbService.getContentDetails(type, parseInt(id));
        setDetails(data);

        if (type === "tv") {
          const sData = await tmdbService.getSeasonDetails(parseInt(id), currentSeason);
          setSeasonData(sData);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, [type, id, currentSeason]);

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
          season: currentSeason || null,
          episode: currentEpisode || null,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (e) {
        console.error("Error updating watch history", e);
      }
    };

    updateHistory();
    interval = setInterval(updateHistory, 30000);
    
    return () => clearInterval(interval);
  }, [id, type, currentSeason, currentEpisode]);

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
        case 'r':
          e.preventDefault();
          fetchEmbedUrl();
          break;
        case '?':
          e.preventDefault();
          setShowShortcuts(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, fetchEmbedUrl]);

  const currentProvider = providers.find((p) => p.key === provider);
  const title = details ? ('title' in details ? details.title : details.name) : "Loading...";
  const fullTitle = type === "tv" ? `${title} - S${currentSeason} E${currentEpisode}` : title;

  return (
    <div className="min-h-screen bg-[#050505] text-[var(--text-primary)] flex flex-col font-['DM_Sans']">
      {/* Cinematic Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/90 via-black/60 to-transparent pt-6 pb-12 px-6 sm:px-10 flex items-start justify-between pointer-events-none transition-opacity duration-300">
        <div className="flex items-center gap-6 pointer-events-auto">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-[var(--radius-sm)] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all group backdrop-blur-md"
          >
            <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div>
            <div className="flex items-center gap-2 text-[var(--accent)] text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5">
              {type === "movie" ? <Film className="w-3.5 h-3.5" /> : <Tv className="w-3.5 h-3.5" />}
              <span>{type === "movie" ? "Feature Film" : "Television Series"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-lg" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
              {fullTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Provider Selector */}
          <div className="relative">
            <button
              onClick={() => setShowProviderMenu(!showProviderMenu)}
              className="h-12 px-5 bg-white/5 border border-white/10 hover:border-white/20 rounded-[var(--radius-sm)] flex items-center gap-3 backdrop-blur-md transition-all text-sm font-medium"
            >
              <MonitorPlay className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="hidden sm:inline text-white">{currentProvider?.label}</span>
              <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-300 ${showProviderMenu ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showProviderMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-[#0a0a0c] border border-[var(--border-subtle)] rounded-[var(--radius-md)] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-[var(--border-faint)] bg-black/20">
                    <span className="t-label text-[10px] opacity-70">Server Selection</span>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                    {providers.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => {
                          setProvider(p.key as Provider);
                          setShowProviderMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-[var(--radius-sm)] text-left transition-all ${
                          provider === p.key
                            ? "bg-[var(--accent)]/10 text-white"
                            : "hover:bg-white/5 text-[var(--text-secondary)] hover:text-white"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold">{p.label}</p>
                          <p className="text-[10px] opacity-60 mt-0.5">{p.description}</p>
                        </div>
                        {provider === p.key && (
                          <Check className="w-4 h-4 text-[var(--accent)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={fetchEmbedUrl}
            disabled={loading}
            className="w-12 h-12 bg-white/5 border border-white/10 hover:border-white/20 rounded-[var(--radius-sm)] flex items-center justify-center backdrop-blur-md transition-all disabled:opacity-50"
            title="Reload Player (R)"
          >
            <RotateCcw className={`w-4 h-4 text-white ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowShortcuts(true)}
            className="hidden sm:flex w-12 h-12 bg-white/5 border border-white/10 hover:border-white/20 rounded-[var(--radius-sm)] items-center justify-center backdrop-blur-md transition-all t-meta text-white"
            title="Keyboard Shortcuts"
          >
            ?
          </button>
        </div>
      </header>

      {/* Main Theater Area */}
      <main className="flex-1 flex flex-col lg:flex-row w-full h-screen pt-24 pb-6 px-6 sm:px-10 gap-6">
        
        {/* Video Player */}
        <div className="flex-1 relative bg-black rounded-[var(--radius-md)] overflow-hidden border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col">
          <div className="flex-1 relative w-full h-full">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-10"
                >
                  <div className="relative w-16 h-16 mb-6">
                    <motion.div className="absolute inset-0 rounded-full border-[3px] border-[var(--accent)] border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                  </div>
                  <p className="t-label tracking-[0.3em] opacity-50 animate-pulse">Establishing Connection</p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] p-8 z-10 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-6 border border-[var(--accent)]/20">
                    <ServerCrash className="w-8 h-8 text-[var(--accent)]" />
                  </div>
                  <h3 className="t-title text-3xl mb-3">Transmission Failed</h3>
                  <p className="t-body text-[var(--text-secondary)] max-w-md mb-8">
                    {error}. Some adblockers or strict browser settings might block the stream. Try disabling them or select a different server.
                  </p>
                  <button onClick={fetchEmbedUrl} className="btn btn-secondary h-12 px-8 uppercase tracking-widest text-xs font-bold">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retry Connection
                  </button>
                </motion.div>
              ) : embedUrl ? (
                <motion.div
                  key="player"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 w-full h-full"
                >
                  {/* Removed the strict sandbox to prevent the 'allow-popups' console error crashes and allow third-party players to function as intended. User is advised to use an adblocker if desired. */}
                  <iframe
                    src={embedUrl}
                    title="Video Player"
                    className="w-full h-full border-0"
                    allowFullScreen
                    scrolling="no"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation allow-popups"
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          
          {/* Player Status Bar */}
          <div className="h-12 bg-[#0a0a0c] border-t border-white/5 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${embedUrl && !loading ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-[var(--accent)] animate-pulse shadow-[0_0_10px_var(--accent-glow)]'}`} />
              <span className="t-meta text-[10px] text-[var(--text-secondary)]">
                {loading ? "BUFFERING" : error ? "OFFLINE" : "LIVE"}
              </span>
            </div>
            <div className="t-meta text-[10px] text-[var(--text-muted)]">
              HOST: <span className="text-white">{currentProvider?.label.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Sidebar for TV Shows (Episodes) */}
        {type === "tv" && (
          <div className="w-full lg:w-80 xl:w-96 flex flex-col bg-[#0a0a0c] border border-white/5 rounded-[var(--radius-md)] overflow-hidden shrink-0 h-[400px] lg:h-auto">
            <div className="p-5 border-b border-white/5 bg-black/20 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-white uppercase tracking-widest text-sm">Episodes</h3>

              {/* Custom Season Selector */}
              {details && 'seasons' in details && (
                <div className="relative">
                  <button 
                    onClick={() => setShowSeasonMenu(!showSeasonMenu)}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-[var(--radius-sm)] px-3 py-1.5 text-[10px] uppercase font-bold text-white transition-all group"
                  >
                    <span>S{currentSeason}</span>
                    <ChevronDown className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-300 ${showSeasonMenu ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {showSeasonMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-36 bg-[#161619] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] shadow-2xl z-50 p-1"
                      >
                        <div className="max-h-[40vh] overflow-y-auto custom-scrollbar">
                          {details.seasons?.filter(s => s.season_number > 0).map(s => (
                            <button
                              key={s.season_number}
                              onClick={() => {
                                router.push(`/watch/tv/${id}/${s.season_number}/1`);
                                setShowSeasonMenu(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase text-left transition-all ${
                                currentSeason === s.season_number 
                                  ? "bg-[var(--accent)]/10 text-[var(--accent)]" 
                                  : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              <span>Season {s.season_number}</span>
                              {currentSeason === s.season_number && <Check className="w-3 h-3" />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {!seasonData ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin opacity-50" />
                </div>
              ) : seasonData.episodes?.length === 0 ? (
                <div className="p-6 text-center text-sm text-[var(--text-muted)]">No episodes available.</div>
              ) : (
                seasonData.episodes?.map((ep) => {
                  const isActive = ep.episode_number === currentEpisode;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => router.push(`/watch/tv/${id}/${currentSeason}/${ep.episode_number}`)}
                      className={`w-full flex items-center gap-3 p-3 rounded-[var(--radius-sm)] transition-all text-left group ${
                        isActive 
                          ? "bg-[var(--accent)]/10 border border-[var(--accent)]/20" 
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${isActive ? "bg-[var(--accent)] text-white" : "bg-black/50 text-[var(--text-muted)] group-hover:text-white"}`}>
                        <span className="font-bold text-xs">{ep.episode_number}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${isActive ? "text-white" : "text-[var(--text-secondary)] group-hover:text-white"}`}>
                          {ep.name}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                          {ep.air_date ? ep.air_date.split('-')[0] : 'TBA'} • {ep.runtime ? `${ep.runtime}m` : 'N/A'}
                        </p>
                      </div>
                      {isActive && <Play className="w-3 h-3 text-[var(--accent)] fill-current shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0c] p-8 rounded-[var(--radius-md)] max-w-sm w-full border border-[var(--border-subtle)] shadow-2xl"
            >
              <h3 className="t-label text-[var(--accent)] mb-6">Keyboard Shortcuts</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="t-body text-sm">Fullscreen</span>
                  <kbd className="px-2.5 py-1 bg-black border border-white/10 rounded text-xs font-mono font-bold text-[var(--text-secondary)]">F</kbd>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="t-body text-sm">Go Back</span>
                  <kbd className="px-2.5 py-1 bg-black border border-white/10 rounded text-xs font-mono font-bold text-[var(--text-secondary)]">ESC</kbd>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="t-body text-sm">Reload Stream</span>
                  <kbd className="px-2.5 py-1 bg-black border border-white/10 rounded text-xs font-mono font-bold text-[var(--text-secondary)]">R</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="t-body text-sm">Toggle Help</span>
                  <kbd className="px-2.5 py-1 bg-black border border-white/10 rounded text-xs font-mono font-bold text-[var(--text-secondary)]">?</kbd>
                </div>
              </div>
              <button 
                onClick={() => setShowShortcuts(false)}
                className="mt-8 w-full btn btn-primary h-12 text-xs uppercase tracking-widest font-bold"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad Notice Modal */}
      <AnimatePresence>
        {showAdNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0a0a0c] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              {/* Cinematic Accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-6 border border-[var(--accent)]/20">
                  <AlertCircle className="w-8 h-8 text-[var(--accent)]" />
                </div>
                
                <h3 className="t-title text-3xl mb-4">Stream Notice</h3>
                
                <div className="space-y-4 mb-8">
                  <p className="t-body text-[var(--text-secondary)] leading-relaxed">
                    Netflyer does not host content. We provide a clean interface for 3rd-party cinematic streams.
                  </p>
                  <p className="t-body text-sm font-bold text-white/90">
                    The player may contain external advertisements which we cannot control.
                  </p>
                  <div className="p-4 bg-white/5 rounded-[var(--radius-sm)] border border-white/5">
                    <p className="t-meta text-[10px] uppercase tracking-wider text-[var(--accent)] mb-1">Recommendation</p>
                    <p className="t-body text-xs text-[var(--text-muted)]">
                      For the best viewing experience, we highly recommend using a modern Ad Blocker extension (like uBlock Origin).
                    </p>
                  </div>
                </div>

                <button 
                  onClick={dismissAdNotice}
                  className="btn btn-primary w-full h-14 text-sm uppercase tracking-widest font-bold"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WatchClient;
