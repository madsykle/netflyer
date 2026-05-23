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
  ServerCrash,
  Shield,
  ShieldAlert,
  Zap
} from "lucide-react";
import React, { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { providers, getEmbedUrl, decodeBase64Url, Provider, StreamInfo } from "../../../lib/embed";
import { tmdbService } from "../../../lib/tmdb";
import { ContentType, MovieDetails, TVShowDetails, Season } from "../../../types/tmdb";
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
  
  const rawType = routeParams[0];
  const rawId = routeParams[1];
  const rawSeason = routeParams[2];
  const rawEpisode = routeParams[3];

  // Validate route parameters to prevent injection into embed URLs
  const isValidType = rawType === 'movie' || rawType === 'tv';
  const isValidId = /^\d{1,10}$/.test(rawId || '');
  const parsedSeason = rawSeason ? parseInt(rawSeason) : 1;
  const parsedEpisode = rawEpisode ? parseInt(rawEpisode) : 1;
  const isValidSeason = !rawSeason || (Number.isInteger(parsedSeason) && parsedSeason > 0 && parsedSeason <= 100);
  const isValidEpisode = !rawEpisode || (Number.isInteger(parsedEpisode) && parsedEpisode > 0 && parsedEpisode <= 2000);
  const isValidParams = isValidType && isValidId && isValidSeason && isValidEpisode;

  const type = (isValidType ? rawType : 'movie') as ContentType;
  const id = isValidId ? rawId : '0';
  const currentSeason = isValidSeason ? parsedSeason : 1;
  const currentEpisode = isValidEpisode ? parsedEpisode : 1;

  const router = useRouter();

  const [provider, setProvider] = useState<Provider>(providers[0].key as Provider);
  const [embedUrl, setEmbedUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(isValidParams ? "" : "Invalid content URL. Please check the link and try again.");
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [details, setDetails] = useState<MovieDetails | TVShowDetails | null>(null);
  const [seasonData, setSeasonData] = useState<Season | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAdNotice, setShowAdNotice] = useState(false);
  const [showSeasonMenu, setShowSeasonMenu] = useState(false);
  const [streams, setStreams] = useState<StreamInfo[]>([]);
  const [selectedStream, setSelectedStream] = useState<StreamInfo | null>(null);
  const [showStreamMenu, setShowStreamMenu] = useState(false);

  const [strictShield, setStrictShield] = useState(true);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [nextEpisodeInfo, setNextEpisodeInfo] = useState<{ season: number; episode: number; title: string } | null>(null);
  const countdownActive = React.useRef(false);

  useEffect(() => {
    const savedShield = localStorage.getItem("netflyer_strict_shield");
    if (savedShield !== null) {
      setStrictShield(savedShield === "true");
    }
    const savedAutoPlay = localStorage.getItem("netflyer_autoplay_next");
    if (savedAutoPlay !== null) {
      setAutoPlayNext(savedAutoPlay === "true");
    }
  }, []);

  const toggleStrictShield = () => {
    const nextVal = !strictShield;
    setStrictShield(nextVal);
    localStorage.setItem("netflyer_strict_shield", String(nextVal));
  };

  const toggleAutoPlayNext = () => {
    const nextVal = !autoPlayNext;
    setAutoPlayNext(nextVal);
    localStorage.setItem("netflyer_autoplay_next", String(nextVal));
  };

  const getNextEpisodeInfo = useCallback(() => {
    if (type !== "tv" || !details || !seasonData) return null;
    const currentEpisodeIndex = seasonData.episodes?.findIndex(ep => ep.episode_number === currentEpisode) ?? -1;
    if (currentEpisodeIndex !== -1 && currentEpisodeIndex < (seasonData.episodes?.length ?? 0) - 1) {
      const nextEp = seasonData.episodes![currentEpisodeIndex + 1];
      return {
        season: currentSeason,
        episode: nextEp.episode_number,
        title: nextEp.name
      };
    }
    if ('seasons' in details) {
      const nextSeasonNumber = currentSeason + 1;
      const nextSeasonExists = details.seasons?.some(s => s.season_number === nextSeasonNumber && s.episode_count > 0);
      if (nextSeasonExists) {
        return {
          season: nextSeasonNumber,
          episode: 1,
          title: `Season ${nextSeasonNumber} Episode 1`
        };
      }
    }
    return null;
  }, [type, details, seasonData, currentSeason, currentEpisode]);

  useEffect(() => {
    countdownActive.current = false;
    setCountdown(null);
    setNextEpisodeInfo(null);
  }, [id, currentSeason, currentEpisode]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      if (nextEpisodeInfo) {
        router.push(`/watch/tv/${id}/${nextEpisodeInfo.season}/${nextEpisodeInfo.episode}`);
      }
      setCountdown(null);
      setNextEpisodeInfo(null);
      countdownActive.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, nextEpisodeInfo, id, router]);

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
    setStreams([]);
    setSelectedStream(null);
    
    try {
      let url = getEmbedUrl(provider, type, parseInt(id), currentSeason, currentEpisode);
      if (url) {
        if (provider === 'vidking') {
          const storageKey = type === "tv"
            ? `netflyer_progress_${id}_s${currentSeason}_e${currentEpisode}`
            : `netflyer_progress_${id}`;
          try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed && typeof parsed === 'object') {
                const currentTime = Number(parsed.currentTime);
                const duration = Number(parsed.duration);
                if (Number.isFinite(currentTime) && currentTime > 10 && (!Number.isFinite(duration) || currentTime < duration - 30)) {
                  url += `&progress=${Math.floor(currentTime)}`;
                }
              }
            }
          } catch (e) {
            console.error("Error reading saved progress:", e);
          }
        }
        setEmbedUrl(url);
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

  // Listen to iframe player events (e.g. from VidKing)
  useEffect(() => {
    const handlePlayerMessage = async (event: MessageEvent) => {
      // Prevent event spoofing by verifying origin against trusted provider domains
      const ALLOWED_MESSAGE_ORIGINS = [
        'https://www.vidking.net',
        'https://vidking.net',
        'https://vidsrc.pk',
        'https://vidlink.pro',
        'https://vidsrc-embed.ru',
        'https://vidsrc-embed.su',
        'https://vsrc.su',
        'https://vixsrc.to',
        'https://vixsrc.io',
      ];
      if (!ALLOWED_MESSAGE_ORIGINS.includes(event.origin) && event.origin !== window.location.origin) {
        return;
      }

      let parsed;
      try {
        parsed = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch (e) {
        return; // Ignore non-JSON messages
      }

      if (parsed && parsed.type === "PLAYER_EVENT") {
        const payload = parsed.data;
        if (!payload || !payload.id) return;

        // Ensure the event belongs to the current media we are watching
        if (payload.id.toString() !== id.toString()) return;

        const mediaType = payload.mediaType === "tv" || payload.mediaType === "movie" ? payload.mediaType : type;
        const currentTime = Number(payload.currentTime);
        const duration = Number(payload.duration);
        const progress = Number(payload.progress);

        if (!Number.isFinite(currentTime) || !Number.isFinite(duration)) return;

        const season = payload.season ? parseInt(payload.season) : (currentSeason || null);
        const episode = payload.episode ? parseInt(payload.episode) : (currentEpisode || null);

        // Save to localStorage
        const storageKey = mediaType === "tv"
          ? `netflyer_progress_${id}_s${season}_e${episode}`
          : `netflyer_progress_${id}`;

        const calculatedProgress = Number.isFinite(progress) ? progress : (currentTime / (duration || 1));

        localStorage.setItem(storageKey, JSON.stringify({
          currentTime,
          duration,
          progress: calculatedProgress,
          updatedAt: Date.now()
        }));

        // Trigger auto-play countdown if conditions are met
        if (
          autoPlayNext &&
          mediaType === "tv" &&
          (calculatedProgress > 0.95 || currentTime > duration - 15) &&
          !countdownActive.current
        ) {
          const nextEp = getNextEpisodeInfo();
          if (nextEp) {
            countdownActive.current = true;
            setNextEpisodeInfo(nextEp);
            setCountdown(10);
          }
        }

        // If user is logged in, also update watch history in Firestore
        if (auth.currentUser) {
          try {
            const docRef = doc(db, `watchHistory/${auth.currentUser.uid}/items`, id);
            await setDoc(docRef, {
              contentId: id,
              type: mediaType,
              season,
              episode,
              progress: calculatedProgress,
              currentTime,
              duration,
              updatedAt: serverTimestamp(),
            }, { merge: true });
          } catch (err) {
            console.error("Error saving progress to Firestore:", err);
          }
        }
      }
    };

    window.addEventListener("message", handlePlayerMessage);
    return () => {
      window.removeEventListener("message", handlePlayerMessage);
    };
  }, [id, type, currentSeason, currentEpisode, autoPlayNext, getNextEpisodeInfo]);

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
  }, [fetchEmbedUrl]);

  const currentProvider = providers.find((p) => p.key === provider);
  const title = details ? ('title' in details ? details.title : details.name) : "Loading...";
  const fullTitle = type === "tv" ? `${title} - S${currentSeason} E${currentEpisode}` : title;
  const posterUrl = details?.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : undefined;

  return (
    <div className="min-h-screen bg-[#050505] text-[var(--text-primary)] flex flex-col font-['DM_Sans']">
      {/* Cinematic Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/90 via-black/60 to-transparent pt-4 pb-10 px-4 sm:px-10 flex items-start justify-between pointer-events-none transition-opacity duration-300">
        <div className="flex items-center gap-3 sm:gap-6 pointer-events-auto">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-[var(--radius-sm)] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all group backdrop-blur-md"
          >
            <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div>
            <div className="flex items-center gap-2 text-[var(--accent)] text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
              {type === "movie" ? <Film className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Tv className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              <span>{type === "movie" ? "Feature Film" : "Television Series"}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-lg" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
              {fullTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Provider Selector */}
          <div className="relative">
            <button
              onClick={() => setShowProviderMenu(!showProviderMenu)}
              className="h-10 sm:h-12 px-3 sm:px-5 bg-white/5 border border-white/10 hover:border-white/20 rounded-[var(--radius-sm)] flex items-center gap-2 sm:gap-3 backdrop-blur-md transition-all text-xs sm:text-sm font-medium"
            >
              <MonitorPlay className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span className="hidden sm:inline text-white">{currentProvider?.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-300 ${showProviderMenu ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showProviderMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-64 glass-premium rounded-[var(--radius-md)] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-50"
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
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 border border-white/10 hover:border-white/20 rounded-[var(--radius-sm)] flex items-center justify-center backdrop-blur-md transition-all disabled:opacity-50"
            title="Reload Player (R)"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-white ${loading ? "animate-spin" : ""}`} />
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
      <main className="flex-1 flex flex-col lg:flex-row w-full h-auto lg:h-[calc(100vh-2.5rem)] pt-20 lg:pt-24 pb-6 px-4 sm:px-10 gap-4 lg:gap-6 lg:overflow-hidden">
        
        {/* Video Player */}
        <div className="w-full aspect-video lg:h-full lg:flex-1 relative bg-black rounded-[var(--radius-md)] overflow-hidden border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col">
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
                    <iframe
                      src={embedUrl}
                      title="Video Player"
                      className="w-full h-full border-0"
                      scrolling="no"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      sandbox={
                        strictShield
                          ? "allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
                          : undefined
                      }
                      loading="eager"
                    />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Auto-Play Countdown Overlay */}
            <AnimatePresence>
              {countdown !== null && nextEpisodeInfo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="absolute bottom-6 right-6 z-30 max-w-sm bg-[#0a0a0c]/95 border border-white/10 rounded-[var(--radius-md)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md"
                >
                  <p className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-[0.2em] mb-1">Up Next</p>
                  <h4 className="text-sm font-bold text-white mb-0.5 truncate">{nextEpisodeInfo.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)] mb-4">Starts in {countdown} seconds...</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        router.push(`/watch/tv/${id}/${nextEpisodeInfo.season}/${nextEpisodeInfo.episode}`);
                      }}
                      className="btn btn-primary text-xs py-2 px-4 flex-1"
                    >
                      Play Now
                    </button>
                    <button
                      onClick={() => {
                        setCountdown(null);
                        setNextEpisodeInfo(null);
                        countdownActive.current = false;
                      }}
                      className="btn btn-secondary text-xs py-2 px-4 flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Player Status Bar */}
          <div className="py-2.5 sm:h-12 bg-[#0a0a0c] border-t border-white/5 flex items-center justify-between px-4 sm:px-6 shrink-0 flex-wrap gap-2.5">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${embedUrl && !loading ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-[var(--accent)] animate-pulse shadow-[0_0_10px_var(--accent-glow)]'}`} />
              <span className="t-meta text-[10px] text-[var(--text-secondary)]">
                {loading ? "BUFFERING" : error ? "OFFLINE" : "LIVE"}
              </span>
            </div>

            {/* Player Toolbar Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Ad Shield Toggle */}
              <button
                onClick={toggleStrictShield}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] border text-[9px] uppercase font-bold transition-all cursor-pointer ${
                  strictShield
                    ? "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                }`}
                title={strictShield ? "Strict Ad Shield Active (Blocks Popups)" : "Ad Shield Warning (Popups Allowed)"}
              >
                {strictShield ? (
                  <>
                    <Shield className="w-3 h-3" />
                    <span>Ad Shield: On</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3 h-3" />
                    <span>Ad Shield: Off</span>
                  </>
                )}
              </button>

              {/* Auto Play Toggle */}
              {type === "tv" && (
                <button
                  onClick={toggleAutoPlayNext}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] border text-[9px] uppercase font-bold transition-all cursor-pointer ${
                    autoPlayNext
                      ? "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/20"
                      : "bg-white/5 border-white/10 text-[var(--text-muted)] hover:bg-white/10"
                  }`}
                  title={autoPlayNext ? "Auto-Play Next Episode Enabled" : "Auto-Play Next Episode Disabled"}
                >
                  <Zap className={`w-3 h-3 ${autoPlayNext ? "fill-current" : ""}`} />
                  <span>Auto-Play: {autoPlayNext ? "On" : "Off"}</span>
                </button>
              )}
            </div>

            <div className="hidden md:block t-meta text-[10px] text-[var(--text-muted)]">
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
                        className="absolute right-0 top-full mt-2 w-36 glass-premium rounded-[var(--radius-sm)] shadow-2xl z-50 p-1"
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
