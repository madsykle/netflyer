import { useSettings } from "../hooks/useSettings";
import { BACKEND_URL } from "../services/Api";
import { HeroSkeleton } from "./Skeleton";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { FaPlay, FaInfo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [randomMovie, setRandomMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();
  const { getImageUrl, prefersReducedMotion } = useSettings();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${BACKEND_URL}/api/weekly_trending`);
        const movies = response.data.results;

        if (movies && movies.length > 0) {
          movies.sort((a, b) => {
            const dateA = new Date(a.release_date || a.first_air_date);
            const dateB = new Date(b.release_date || b.first_air_date);
            return dateB.getTime() - dateA.getTime();
          });
          const randomIndex = Math.floor(
            Math.random() * Math.min(movies.length, 10)
          );
          setRandomMovie(movies[randomIndex]);
        }
      } catch (error) {
        console.error("Error fetching hero data:", error);
        setError("Failed to load featured content");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="relative px-4 sm:px-6 lg:px-8">
        <HeroSkeleton />
      </div>
    );
  }

  if (error || !randomMovie) {
    return (
      <div className="relative h-[400px] md:h-[600px] rounded-3xl overflow-hidden bg-[var(--color-bg-secondary)] flex items-center justify-center mx-4 sm:mx-6 lg:mx-8">
        <div className="text-center">
          <p className="text-[var(--color-text-secondary)] mb-4">
            {error || "No content available"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[var(--color-accent-primary)] text-white rounded-full hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isTV = !!randomMovie.first_air_date;
  const title = randomMovie.title || randomMovie.name;
  const backdropUrl = getImageUrl(randomMovie.backdrop_path, "backdrop");

  const handlePlay = () => {
    if (isTV) {
      navigate(`/watch/tv/${randomMovie.id}/1/1`);
    } else {
      navigate(`/watch/movie/${randomMovie.id}`);
    }
  };

  const handleInfo = () => {
    if (isTV) {
      navigate(`/info/tv/${randomMovie.id}`);
    } else {
      navigate(`/info/movie/${randomMovie.id}`);
    }
  };

  const springTransition = prefersReducedMotion()
    ? { duration: 0 }
    : { type: "spring", stiffness: 300, damping: 30 };

  return (
    <div className="relative px-4 sm:px-6 lg:px-8">
      <motion.div
        className="relative overflow-hidden rounded-3xl shadow-2xl"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {/* Background Image with lazy loading */}
        <div className="relative w-full h-[400px] md:h-[600px]">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[var(--color-bg-tertiary)] skeleton" />
          )}
          <img
            src={backdropUrl}
            alt={title}
            className={`w-full h-full object-cover transition-opacity duration-700 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-primary)]/80 via-transparent to-transparent" />

        {/* Content */}
        <AnimatePresence>
          {imageLoaded && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.2,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              className="absolute bottom-0 left-0 w-full p-6 md:p-8 lg:p-12 z-10"
            >
              {/* Meta badges */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-3 mb-4"
              >
                <span className="px-3 py-1 text-xs font-medium bg-[var(--color-accent-primary)] text-white rounded-full">
                  Featured
                </span>
                {isTV ? (
                  <span className="px-3 py-1 text-xs font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] rounded-full border border-[var(--color-border)]">
                    TV Series
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] rounded-full border border-[var(--color-border)]">
                    Movie
                  </span>
                )}
                {randomMovie.vote_average > 0 && (
                  <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {randomMovie.vote_average.toFixed(1)}
                  </span>
                )}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 max-w-3xl line-clamp-2"
              >
                {title}
              </motion.h1>

              {/* Overview */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-base md:text-lg text-[var(--color-text-secondary)] mb-6 max-w-2xl line-clamp-3"
              >
                {randomMovie.overview}
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <motion.button
                  onClick={handlePlay}
                  className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/90 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[var(--color-accent-primary)]/25"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springTransition}
                >
                  <FaPlay className="text-sm" />
                  <span>Play Now</span>
                </motion.button>

                <motion.button
                  onClick={handleInfo}
                  className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-[var(--color-bg-tertiary)]/80 backdrop-blur-sm hover:bg-[var(--color-bg-tertiary)] text-white font-semibold rounded-xl border border-[var(--color-border)] transition-all duration-200"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springTransition}
                >
                  <FaInfo className="text-sm" />
                  <span>More Info</span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent pointer-events-none" />
      </motion.div>
    </div>
  );
};

export default HeroSection;
