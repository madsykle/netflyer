'use client';

import { useSettings } from "../hooks/useSettings";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const { prefersReducedMotion } = useSettings();

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
    <div className="my-10 relative group/row">
      <div className="container">
        {title && (
          <div className="flex items-center justify-between mb-5 ml-1">
            <div className="flex items-center gap-3">
              <span className="t-label text-[var(--text-primary)]">{title}</span>
              {items?.length > 0 && (
                <span className="t-meta text-[var(--text-muted)]">({items.length})</span>
              )}
            </div>
            <button className="t-label text-[var(--accent)] hover:opacity-75 transition-opacity text-[10px]">
              See all →
            </button>
          </div>
        )}

        <div className="relative">
          {/* Arrows */}
          <AnimatePresence>
            {showLeftArrow && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => scroll("left")}
                className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white shadow-2xl transition-all hover:bg-[var(--accent)] hover:border-[var(--accent)] group/btn"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6 transition-transform group-hover/btn:-translate-x-0.5" />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showRightArrow && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={() => scroll("right")}
                className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white shadow-2xl transition-all hover:bg-[var(--accent)] hover:border-[var(--accent)] group/btn"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6 transition-transform group-hover/btn:translate-x-0.5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-8 scroll-smooth"
          >
            {items.map((item) => (
              <RowCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RowCard = ({ item }: { item: Movie | TVShow }) => {
  const router = useRouter();
  const { getImageUrl, prefersReducedMotion } = useSettings();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isMovie = 'title' in item;
  const title = isMovie ? (item as Movie).title : (item as TVShow).name;
  const releaseDate = isMovie ? (item as Movie).release_date : (item as TVShow).first_air_date;
  const posterUrl = getImageUrl(item.poster_path, "poster");

  const onClick = () => {
    const type = isMovie ? "movie" : "tv";
    router.push(`/info/${type}/${item.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: prefersReducedMotion() ? 0 : -8,
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-shrink-0 cursor-pointer"
    >
      <div className="relative group/card">
        {/* Image container */}
        <div className="relative w-40 h-[240px] md:w-48 md:h-[288px] overflow-hidden bg-[var(--bg-raised)] rounded-[var(--radius-md)] border border-[var(--border-faint)] group-hover/card:border-[var(--border-subtle)] transition-colors">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 skeleton" />
          )}
          
          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <span className="t-meta opacity-40 mb-2">IMAGE ERROR</span>
              <p className="t-meta line-clamp-2">{title}</p>
            </div>
          ) : (
            <Image
              src={posterUrl}
              alt={title}
              fill
              className={`object-cover transition-all duration-700 ${
                imageLoaded ? "opacity-100 group-hover/card:scale-105" : "opacity-0"
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 160px, 192px"
            />
          )}

          {/* Cinematic overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-2xl transform scale-75 group-hover/card:scale-100 transition-transform duration-300">
                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-sm font-bold line-clamp-2 leading-tight mb-1 drop-shadow-md">
                {title}
              </p>
              <div className="flex items-center gap-2">
                {releaseDate && (
                  <span className="t-meta text-white/80">{new Date(releaseDate).getFullYear()}</span>
                )}
                {item.vote_average > 0 && (
                  <span className="rating-chip text-[10px]">★ {item.vote_average.toFixed(1)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Row;
Row.displayName = "MovieRow";
