'use client';

import { useSettings } from "../hooks/useSettings";
import { HeroSkeleton } from "./Skeleton";
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
  const [paused, setPaused] = useState(false);
  const { getImageUrl } = useSettings();
  const router = useRouter();

  useEffect(() => {
    setImageLoaded(false);
  }, [activeIndex]);

  useEffect(() => {
    if (paused || !movies || movies.length <= 1) return;
    // Respect reduced motion: no auto-rotating full-viewport backdrop
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % movies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [movies, paused]);

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
    <div
      className="relative w-full h-[70vh] md:h-[85vh] lg:h-[90vh] overflow-hidden group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Backdrop with Ken Burns */}
      <div className="absolute inset-0 z-0">
        <div
          key={movie.id}
          className="relative w-full h-full animate-fade-in"
          style={{ animationDuration: '1.2s' }}
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
        </div>
      </div>

      {/* Content - Asymmetric 60/40 split, left-aligned */}
      <div className="container relative z-20 h-full flex flex-col justify-end pb-12 md:pb-24">
        <div
          key={movie.id}
          className="max-w-[60%] text-left animate-slide-up"
        >
          {/* Meta Info */}
          <div
            className="flex items-center gap-3 mb-4 flex-wrap animate-fade-in"
            style={{ animationDelay: '0.1s' }}
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
          </div>

          {/* Title */}
          <h1
            className="t-hero mb-5 drop-shadow-[0_2px_30px_rgba(0,0,0,0.8)] animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            {title}
          </h1>

          {/* Overview */}
          <p
            className="t-body text-[var(--text-secondary)] max-w-lg mb-8 line-clamp-3 animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            {(movie as any).overview}
          </p>

          {/* Actions */}
          <div
            className="flex items-center gap-4 animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            <button
              onClick={handlePlay}
              className="btn btn-primary h-13 px-8 text-sm uppercase tracking-widest font-bold inline-flex items-center gap-2.5"
            >
              <Play weight="fill" className="w-5 h-5" />
              {released ? "Play" : "View Details"}
            </button>

            <button
              onClick={handleInfo}
              className="btn btn-secondary h-13 px-8 text-sm uppercase tracking-widest font-bold inline-flex items-center gap-2.5"
            >
              <Info weight="bold" className="w-5 h-5" />
              Info
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <span className="t-meta text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">Scroll</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-[var(--text-muted)] to-transparent" />
      </div>
    </div>
  );
};

export default HeroSection;
