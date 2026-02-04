import { BACKEND_URL } from "../services/Api";
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
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Watch = () => {
  const { type, id, season, episode } = useParams();
  const navigate = useNavigate();

  const providers = [
    { key: "vidsrc-icu", label: "VidSrc ICU", description: "Default - Stable" },
    { key: "vidplus", label: "VidPlus", description: "HD Quality" },
    { key: "vidsrc-pk", label: "VidSrc PK", description: "Fast Loading" },
    { key: "vidsrc-ru", label: "Vidsrc RU", description: "Backup Source" },
    { key: "vidsrc-su", label: "Vidsrc SU", description: "Backup Source" },
    { key: "vidsrcme-su", label: "VidsrcMe", description: "Backup Source" },
    { key: "vsrc-su", label: "Vsrc SU", description: "Backup Source" },
    { key: "embed-su", label: "Embed SU", description: "Backup Source" },
  ];

  const [provider, setProvider] = useState(providers[0].key);
  const [embedUrl, setEmbedUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [title, setTitle] = useState("");

  const fetchEmbedUrl = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `${BACKEND_URL}/api/embed/${type}/${id}?provider=${provider}`;
      if (type === "tv" && season && episode) {
        url += `&s=${season}&e=${episode}`;
      }
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Provider ${provider} unavailable (${res.status})`);
      }

      const data = await res.json();

      if (data.url) {
        setEmbedUrl(data.url);
        setLoading(false);
      } else {
        throw new Error("No video source available for this provider");
      }
    } catch (err) {
      console.error("Failed to fetch embed URL:", err);
      
      const currentIndex = providers.findIndex((p) => p.key === provider);
      if (currentIndex !== -1 && currentIndex < providers.length - 1) {
        const nextProvider = providers[currentIndex + 1];
        setProvider(nextProvider.key);
      } else {
        setError("Video source unavailable. Try another provider.");
        setLoading(false);
      }
    }
  };

  // Fetch title info
  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/${type}/${id}`);
        const data = await res.json();
        if (data) {
          const name = data.title || data.name || "Unknown";
          if (type === "tv" && season && episode) {
            setTitle(`${name} - S${season}E${episode}`);
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
  }, [type, id, season, episode, provider]);

  const currentProvider = providers.find((p) => p.key === provider);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Header - Sticky */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-[var(--color-bg-primary)]/95 backdrop-blur-xl border-b border-[var(--color-border)]"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Back & Title */}
            <div className="flex items-center gap-3 md:gap-4">
              <motion.button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-[var(--color-text-primary)]" />
              </motion.button>

              <div className="hidden sm:block">
                <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] text-sm mb-0.5">
                  {type === "movie" ? (
                    <Film className="w-3.5 h-3.5" />
                  ) : (
                    <Tv className="w-3.5 h-3.5" />
                  )}
                  <span className="uppercase tracking-wider text-xs">
                    {type === "movie" ? "Movie" : "TV Show"}
                  </span>
                </div>
                <h1 className="text-base md:text-lg font-semibold text-[var(--color-text-primary)] line-clamp-1 max-w-[300px] md:max-w-[400px]">
                  {title || "Loading..."}
                </h1>
              </div>
            </div>

            {/* Provider Selector & Reload */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Provider Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProviderMenu(!showProviderMenu)}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl transition-colors"
                >
                  <Play className="w-4 h-4 text-[var(--color-bone)]" />
                  <span className="hidden md:inline text-sm font-medium text-[var(--color-text-primary)]">
                    {currentProvider?.label}
                  </span>
                  <span className="md:hidden text-sm font-medium text-[var(--color-text-primary)]">
                    Source
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--color-text-tertiary)] transition-transform ${
                      showProviderMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showProviderMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      {providers.map((p) => (
                        <button
                          key={p.key}
                          onClick={() => {
                            setProvider(p.key);
                            setShowProviderMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                            provider === p.key
                              ? "bg-[var(--color-accent-primary)]/20"
                              : "hover:bg-[var(--color-bg-tertiary)]"
                          }`}
                        >
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                provider === p.key
                                  ? "text-[var(--color-text-primary)]"
                                  : "text-[var(--color-text-secondary)]"
                              }`}
                            >
                              {p.label}
                            </p>
                            <p className="text-xs text-[var(--color-text-tertiary)]">
                              {p.description}
                            </p>
                          </div>
                          {provider === p.key && (
                            <Check className="w-4 h-4 text-[var(--color-bone)]" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reload Button */}
              <motion.button
                onClick={fetchEmbedUrl}
                disabled={loading}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] rounded-xl transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw
                  className={`w-4 h-4 text-[var(--color-text-primary)] ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                <span className="hidden md:inline text-sm font-medium text-[var(--color-text-primary)]">
                  {loading ? "Loading..." : "Reload"}
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Mobile Title */}
        <div className="sm:hidden mb-4">
          <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] text-sm mb-1">
            {type === "movie" ? (
              <Film className="w-3.5 h-3.5" />
            ) : (
              <Tv className="w-3.5 h-3.5" />
            )}
            <span className="uppercase tracking-wider text-xs">
              {type === "movie" ? "Movie" : "TV Show"}
            </span>
          </div>
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)] line-clamp-2">
            {title || "Loading..."}
          </h1>
        </div>

        {/* Video Player Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative bg-[var(--color-bg-secondary)] rounded-2xl overflow-hidden border border-[var(--color-border)]"
        >
          <div className="aspect-video">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-secondary)]"
                >
                  {/* Loading Animation */}
                  <div className="relative w-16 h-16 mb-4">
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[var(--color-accent-primary)]"
                      style={{ borderTopColor: "transparent" }}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <motion.div
                      className="absolute inset-2 rounded-full border-2 border-[var(--color-bone)]"
                      style={{ borderBottomColor: "transparent" }}
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </div>
                  <p className="text-[var(--color-text-secondary)]">
                    Loading video...
                  </p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-secondary)] p-6"
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-[var(--color-error)]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                    Failed to Load Video
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-center max-w-md mb-6">
                    {error}. Try switching to a different provider or reload.
                  </p>
                  <motion.button
                    onClick={fetchEmbedUrl}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] rounded-xl transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="font-medium">Try Again</span>
                  </motion.button>
                </motion.div>
              ) : embedUrl ? (
                <motion.div
                  key="player"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
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
              ) : (
                <motion.div
                  key="no-source"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-secondary)] p-6"
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4">
                    <Play className="w-8 h-8 text-[var(--color-text-muted)]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--color-text-secondary)] mb-2">
                    No Video Available
                  </h3>
                  <p className="text-[var(--color-text-tertiary)] text-center max-w-md">
                    Unable to load video from the current provider. Please try a
                    different provider.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Player Info Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg-tertiary)] border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] animate-pulse" />
              <span className="text-sm text-[var(--color-text-secondary)]">
                {loading
                  ? "Loading..."
                  : error
                  ? "Error"
                  : embedUrl
                  ? "Playing"
                  : "No Source"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-tertiary)]">
              <span className="hidden sm:inline">Source:</span>
              <span className="text-[var(--color-text-secondary)]">
                {currentProvider?.label}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-primary)]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-[var(--color-bone)]">
                1
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              If video doesn&apos;t load, try a different provider
            </p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-primary)]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-[var(--color-bone)]">
                2
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Use fullscreen mode for the best viewing experience
            </p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-primary)]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-[var(--color-bone)]">
                3
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Reload if you experience buffering issues
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Watch;
