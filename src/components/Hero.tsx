'use client';

import { useSettings } from "../hooks/useSettings";
import { HeroSkeleton } from "./Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { FaPlay } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Movie, TVShow } from "../types/tmdb";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { isReleased } from "../lib/release";

interface HeroSectionProps {
  movies?: (Movie | TVShow)[] | null;
}

const HeroSection = ({ movies }: HeroSectionProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { getImageUrl } = useSettings();
  const router = useRouter();

  // Reset image loaded state on slide change to trigger nice transitions
  useEffect(() => {
    setImageLoaded(false);
  }, [activeIndex]);

  // Automatic slideshow cycle
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

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % movies.length);
  };

  return (
    <div className="relative w-full h-[70vh] md:h-[85vh] lg:h-[90vh] overflow-hidden group">
      {/* Backdrop with layered cinematic fades */}
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
              className={`object-cover transition-opacity duration-1000 ${
                imageLoaded ? "opacity-60" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              sizes="100vw"
            />
            
            {/* Multi-layered cinematic gradient */}
            {/* Bottom fade — heavy */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/40 to-transparent z-10" />
            {/* Left fade — moderate for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-base)]/60 via-transparent to-transparent z-10" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {movies.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all duration-300 pointer-events-auto"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all duration-300 pointer-events-auto"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="container relative z-20 h-full flex flex-col justify-end pb-12 md:pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl text-left"
          >
            {/* Meta Info */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {releaseYear && <span className="t-meta">{releaseYear}</span>}
              <span className="t-meta text-[var(--border-visible)]">|</span>
              {movie.vote_average > 0 && (
                <span className="rating-chip">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
              <span className="t-meta text-[var(--border-visible)]">|</span>
              <span className="meta-chip">{isTV ? "Series" : "Film"}</span>
            </div>

            <h1 className="t-hero mb-6 drop-shadow-[0_2px_30px_rgba(0,0,0,0.8)]">
              {title}
            </h1>

            <p className="t-body text-base md:text-lg mb-8 line-clamp-2 md:line-clamp-3 max-w-2xl drop-shadow-md opacity-90 leading-relaxed">
              {movie.overview}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {released ? (
                <button
                  onClick={handlePlay}
                  className="btn btn-primary w-full sm:w-auto sm:min-w-[140px] py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <FaPlay className="text-[10px]" />
                  Play Now
                </button>
              ) : (
                <button
                  onClick={handleInfo}
                  className="btn bg-white/5 border border-white/10 text-white/40 hover:text-white/60 hover:bg-white/8 w-full sm:w-auto sm:min-w-[140px] py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors duration-200"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Coming Soon
                </button>
              )}
              <button
                onClick={handleInfo}
                className="btn btn-secondary w-full sm:w-auto sm:min-w-[140px] py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                More Info
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicator Dots - positioned under text for layout isolation */}
        {movies.length > 1 && (
          <div className="flex items-center gap-2 mt-8 z-30 select-none">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(index);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === index 
                    ? "bg-[var(--accent)] w-6 shadow-[0_0_8px_var(--accent)]" 
                    : "bg-white/30 hover:bg-white/50 w-1.5"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
