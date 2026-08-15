'use client';

import { useSettings } from "../hooks/useSettings";
import { CaretLeft, CaretRight, Play, Star } from "@phosphor-icons/react";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Movie, TVShow } from "../types/tmdb";
import { MovieRowSkeleton } from "./Skeleton";

interface RowProps {
  items: (Movie | TVShow)[];
  title?: string;
  loading?: boolean;
}

const Row = ({ items, title, loading }: RowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const { settings } = useSettings();
  const showScrollIndicators = settings.showScrollIndicators !== false;

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, items]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (loading) return <MovieRowSkeleton title={!!title} count={6} />;
  if (!items || items.length === 0) return null;

  return (
    <div className="my-10">
      <div className="container">
        {title && (
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="t-label">{title}</h2>
            <button className="t-label text-[var(--accent)] hover:opacity-75 transition-opacity text-[10px]">
              See all
            </button>
          </div>
        )}

        <div className="relative">
          {/* Arrows */}
          {showScrollIndicators && showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white shadow-2xl transition-all hover:bg-[var(--accent)] hover:border-[var(--accent)] group/btn animate-fade-in"
              aria-label="Scroll left"
            >
              <CaretLeft weight="bold" className="w-5 h-5 transition-transform group-hover/btn:-translate-x-0.5" />
            </button>
          )}

          {showScrollIndicators && showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white shadow-2xl transition-all hover:bg-[var(--accent)] hover:border-[var(--accent)] group/btn animate-fade-in"
              aria-label="Scroll right"
            >
              <CaretRight weight="bold" className="w-5 h-5 transition-transform group-hover/btn:translate-x-0.5" />
            </button>
          )}

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-8 scroll-smooth"
          >
            {items.map((item, index) => (
              <RowCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RowCard = ({ item, index }: { item: Movie | TVShow; index: number }) => {
  const router = useRouter();
  const { getImageUrl, prefersReducedMotion } = useSettings();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const isMovie = 'title' in item;
  const title = isMovie ? (item as Movie).title : (item as TVShow).name;
  const releaseDate = isMovie ? (item as Movie).release_date : (item as TVShow).first_air_date;
  const posterUrl = getImageUrl(item.poster_path, "poster");

  const onClick = () => {
    const type = isMovie ? "movie" : "tv";
    router.push(`/info/${type}/${item.id}`);
  };

  useEffect(() => {
    try {
      const id = item.id.toString();
      if (isMovie) {
        const saved = localStorage.getItem(`netflyer_progress_${id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.progress && parsed.progress > 0.02 && parsed.progress < 0.95) {
            setProgress(parsed.progress);
          }
        }
      } else {
        let maxUpdatedAt = 0;
        let latestProgress = null;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`netflyer_progress_${id}_s`)) {
            const saved = localStorage.getItem(key);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed.updatedAt > maxUpdatedAt) {
                maxUpdatedAt = parsed.updatedAt;
                latestProgress = parsed.progress;
              }
            }
          }
        }
        if (latestProgress !== null && latestProgress > 0.02 && latestProgress < 0.95) {
          setProgress(latestProgress);
        }
      }
    } catch (e) {
      console.error("Error reading progress for card", e);
    }
  }, [item.id, isMovie]);

  return (
    <div
      className="flex-shrink-0 cursor-pointer animate-scale-in"
      style={{ animationDelay: `${index * 0.05}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative group/card spotlight-card transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-2">
        {/* Image container */}
        <div className="relative w-40 h-[240px] md:w-48 md:h-[288px] overflow-hidden bg-[var(--bg-raised)] rounded-[var(--radius-md)]">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 skeleton" />
          )}

          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <span className="t-meta opacity-40 mb-2 font-bold tracking-widest text-[9px]">IMAGE ERROR</span>
              <p className="t-meta line-clamp-2 text-xs font-semibold">{title}</p>
            </div>
          ) : (
            <Image
              src={posterUrl}
              alt={title}
              fill
              className={`object-cover transition-all duration-700 ease-[var(--ease-out-expo)] ${
                imageLoaded ? "opacity-100 group-hover/card:scale-105" : "opacity-0"
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 160px, 192px"
            />
          )}

          {/* Progress Bar Overlay */}
          {progress !== null && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 z-10">
              <div
                className="h-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          )}

          {/* Cinematic overlay on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-11 h-11 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-[0_0_15px_var(--accent-glow)] hover:bg-[#ff1a2a] transition-all duration-300 ease-[var(--ease-out-expo)] ${
                  isHovered ? "scale-100" : "scale-75"
                }`}
              >
                <Play weight="fill" className="w-4 h-4 text-white ml-0.5" />
              </div>
            </div>

            <div
              className={`absolute bottom-0 left-0 right-0 p-3.5 transition-all duration-300 ease-[var(--ease-out-expo)] ${
                isHovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              <p className="text-white text-sm font-bold line-clamp-2 leading-tight mb-2 drop-shadow-md tracking-wide">
                {title}
              </p>
              <div className="flex items-center gap-1.5">
                {releaseDate && (
                  <span className="t-meta text-[10px] font-extrabold bg-white/10 text-white/90 px-1.5 py-0.5 rounded border border-white/10 tracking-widest">
                    {new Date(releaseDate).getFullYear()}
                  </span>
                )}
                {item.vote_average > 0 && (
                  <span className="rating-chip text-[10px]">
                    <Star weight="fill" className="w-3 h-3" />
                    {item.vote_average.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Row;
Row.displayName = "MovieRow";
