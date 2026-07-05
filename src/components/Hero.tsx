'use client';

import { useSettings } from "../hooks/useSettings";
import { HeroSkeleton } from "./Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { Play, Info, Calendar } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Movie, TVShow } from "../types/tmdb";
import { isReleased } from "../lib/release";

interface HeroSectionProps {
  movies?: (Movie | TVShow)[] | null;
}

const HeroSection = ({ movies }: HeroSectionProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { getImageUrl } = useSettings();
  const router = useRouter();

  useEffect(() => {
    setImageLoaded(false);
  }, [activeIndex]);

  useEffect(() => {
    if (!movies || movies.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % movies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return <HeroSkeleton />;

  const movie = movies[activeIndex];
  const isTV = 'first_air_date' in movie;
  const title = (movie as any).title || (movie as any).name;
  const backdropUrl = getImageUrl(movie.backdrop_path, "backdrop");

  const releaseDateStr = isTV
    ? (movie as TVShow).first_air_date
    : (movie as Movie).release_date;

  const released = isReleased(releaseDateStr);
  const releaseYear = releaseDateStr?.split("-")[0];

  const handlePlay = () => {
    if (!released) {
      const path = isTV ? `/info/tv/${movie.id}` : `/info/movie/${movie.id}`;
      router.push(path);
      return;
    }
    const path = isTV
      ? `/watch/tv/${movie.id}/1/1`
      : `/watch/movie/${movie.id}`;
    router.push(path);
  };

  const handleInfo = () => {
    const path = isTV
      ? `/info/tv/${movie.id}`
      : `/info/movie/${movie.id}`;
    router.push(path);
  };

  return (
    <div className="relative w-full h-[70vh] md:h-[85vh] lg:h-[90vh] overflow-hidden group">
      {/* Backdrop with Ken Burns */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            <Image
              src={backdropUrl}
              alt={title}
              fill
              priority
              className={`object-cover transition-opacity duration-1000 animate-kenburns ${
                imageLoaded ? "opacity-50" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              sizes="100vw"
            />

            {/* Cinematic gradient layers */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/50 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-base)]/80 via-[var(--bg-base)]/30 to-transparent z-10" />
            {/* Right side fade for asymmetric feel */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[var(--bg-base)]/60 z-10" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content - Asymmetric 60/40 split, left-aligned */}
      <div className="container relative z-20 h-full flex flex-col justify-end pb-12 md:pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[60%] text-left"
          >
            {/* Meta Info */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex items-center gap-3 mb-4 flex-wrap"
            >
              {releaseYear && (
                <span className="t-meta text-[var(--text-muted)]">{releaseYear}</span>
              )}
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
              {movie.vote_average > 0 && (
                <span className="rating-chip">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
              <span className="meta-chip">{isTV ? "Series" : "Film"}</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="t-hero mb-5 drop-shadow-[0_2px_30px_rgba(0,0,0,0.8)]"
            >
              {title}
            </motion.h1>

            {/* Overview */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="t-body text-base md:text-lg mb-8 line-clamp-2 md:line-clamp-3 max-w-2xl drop-shadow-md opacity-80 leading-relaxed"
            >
              {movie.overview}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto"
            >
              {released ? (
                <button
                  onClick={handlePlay}
                  className="btn btn-primary w-full sm:w-auto sm:min-w-[140px] py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Play weight="fill" className="text-[10px]" />
                  Play Now
                </button>
              ) : (
                <button
                  onClick={handleInfo}
                  className="btn bg-white/5 border border-white/10 text-white/40 hover:text-white/60 hover:bg-white/8 w-full sm:w-auto sm:min-w-[140px] py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors duration-200"
                >
                  <Calendar weight="bold" className="w-3.5 h-3.5" />
                  Coming Soon
                </button>
              )}
              <button
                onClick={handleInfo}
                className="btn btn-secondary w-full sm:w-auto sm:min-w-[140px] py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Info weight="bold" className="w-3.5 h-3.5" />
                More Info
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Custom accent line indicators */}
        {movies.length > 1 && (
          <div className="flex items-center gap-2 mt-10 z-30 select-none">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className="relative h-[3px] rounded-full overflow-hidden transition-all duration-500 cursor-pointer bg-white/10"
                style={{ width: activeIndex === index ? '48px' : '16px' }}
                aria-label={`Go to slide ${index + 1}`}
              >
                {activeIndex === index && (
                  <motion.div
                    layoutId="hero-indicator"
                    className="absolute inset-0 bg-[var(--accent)] rounded-full shadow-[0_0_8px_var(--accent)]"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
