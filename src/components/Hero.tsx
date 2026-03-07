'use client';

import { useSettings } from "../hooks/useSettings";
import { HeroSkeleton } from "./Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { FaPlay } from "react-icons/fa";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Movie, TVShow } from "../types/tmdb";

interface HeroSectionProps {
  movie: Movie | TVShow | null;
  loading?: boolean;
}

const HeroSection = ({ movie, loading = false }: HeroSectionProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();
  const { getImageUrl, prefersReducedMotion } = useSettings();

  if (loading) {
    return (
      <div className="relative w-full h-[80svh] md:h-[100svh]">
        <HeroSkeleton />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="relative w-full h-[80svh] md:h-[100svh] bg-gradient-to-b from-[var(--color-bg-secondary)] to-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-[var(--color-text-secondary)] text-lg mb-2">No featured content available</p>
        </div>
      </div>
    );
  }

  const isTV = 'first_air_date' in movie;
  const title = (movie as Movie).title || (movie as TVShow).name;
  
  // Use high-res for Hero
  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : getImageUrl(movie.backdrop_path, "backdrop");

  const releaseYear = isTV 
    ? (movie as TVShow).first_air_date?.split("-")[0] 
    : (movie as Movie).release_date?.split("-")[0];

  const handlePlay = () => {
    if (isTV) {
      router.push(`/watch/tv/${movie.id}/1/1`);
    } else {
      router.push(`/watch/movie/${movie.id}`);
    }
  };

  const handleInfo = () => {
    if (isTV) {
      router.push(`/info/tv/${movie.id}`);
    } else {
      router.push(`/info/movie/${movie.id}`);
    }
  };

  return (
    <div className="relative w-full h-[80svh] md:h-[100svh] overflow-hidden bg-[var(--color-bg-primary)]">
      <AnimatePresence>
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[var(--color-bg-primary)]" />
          )}
          <Image
            src={backdropUrl}
            alt={title}
            fill
            priority
            className={`object-cover transition-opacity duration-[2000ms] ${
              imageLoaded ? "opacity-75" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            unoptimized
          />
          
          {/* Multi-layered cinematic gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,11,0.6)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/80 to-transparent" />
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/60 to-transparent w-[100%] md:w-[70%]" />
        </motion.div>
      </AnimatePresence>

      <div className="container relative z-10 h-full flex flex-col justify-end md:justify-center pb-20 md:pb-0 md:pt-[20svh] px-6 md:px-12 lg:px-20">
        <AnimatePresence>
          {imageLoaded && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1,
                delay: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="max-w-3xl w-full"
            >
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="heading-display mb-4 drop-shadow-2xl"
              >
                {title}
              </motion.h1>

              {/* Meta row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex items-center gap-3 mb-6 text-sm font-mono text-[var(--color-text-secondary)] tracking-wide"
              >
                <span>{releaseYear}</span>
                {movie.vote_average > 0 && (
                  <>
                    <span className="text-[var(--color-text-tertiary)]">·</span>
                    <span className="flex items-center gap-1 text-[var(--color-text-primary)]">
                      ★ {movie.vote_average.toFixed(1)}
                    </span>
                  </>
                )}
                <span className="text-[var(--color-text-tertiary)]">·</span>
                <span>{isTV ? "TV SERIES" : "MOVIE"}</span>
              </motion.div>

              {/* Overview */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl line-clamp-2 leading-relaxed drop-shadow-md"
              >
                {movie.overview}
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                <button
                  onClick={handlePlay}
                  className="btn btn-primary px-8 py-4 text-base w-full sm:w-auto justify-center"
                >
                  <FaPlay className="text-sm mr-3" />
                  Play Now
                </button>

                <button
                  onClick={handleInfo}
                  className="btn btn-secondary px-8 py-4 text-base w-full sm:w-auto justify-center"
                >
                  More Info
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block text-[var(--color-text-tertiary)]"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <ChevronDown size={24} strokeWidth={1} />
      </motion.div>
    </div>
  );
};

export default HeroSection;