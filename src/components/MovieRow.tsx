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

const Row = React.memo(({ items, title, loading = false }: RowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const checkScroll = useCallback(() => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    checkScroll();
    const row = rowRef.current;
    if (row) {
      row.addEventListener("scroll", checkScroll);
      return () => row.removeEventListener("scroll", checkScroll);
    }
  }, [items, checkScroll]);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const scrollAmount = direction === "left" ? -600 : 600;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (loading) {
    return <MovieRowSkeleton title={!!title} count={8} />;
  }

  if (!items || items.length === 0) {
    return null;
  }

  // Always visible on desktop if scrollable, always visible on mobile if scrollable
  const showLeftArrow = isMounted && canScrollLeft;
  const showRightArrow = isMounted && canScrollRight;

  return (
    <motion.div
      className="my-12 relative group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {title && (
        <div className="flex items-center gap-4 mb-6 px-2 md:px-0">
          <h2 className="heading-3 whitespace-nowrap">
            {title} <span className="text-[var(--color-text-tertiary)] font-normal text-sm ml-2">({items.length})</span>
          </h2>
          <div className="flex-grow h-px bg-[var(--color-border-subtle)]"></div>
          <Link 
            href="/discover" 
            className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors whitespace-nowrap"
          >
            See All
          </Link>
        </div>
      )}

      <div className="relative group/carousel">
        {/* Left scroll button */}
        <AnimatePresence>
          {showLeftArrow && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => scroll("left")}
              className="absolute left-0 top-0 bottom-0 z-20 w-16 flex items-center justify-start pointer-events-none"
              aria-label="Scroll left"
            >
              <div className="w-12 h-20 bg-[var(--color-bg-elevated)]/90 backdrop-blur-md flex items-center justify-center pointer-events-auto rounded-r-2xl border-y border-r border-[var(--color-border-subtle)] hover:bg-[var(--color-border-strong)] transition-all cursor-pointer shadow-2xl opacity-0 group-hover/carousel:opacity-100 md:opacity-100">
                <ChevronLeft className="w-8 h-8 text-white" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right scroll button */}
        <AnimatePresence>
          {showRightArrow && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => scroll("right")}
              className="absolute right-0 top-0 bottom-0 z-20 w-16 flex items-center justify-end pointer-events-none"
              aria-label="Scroll right"
            >
              <div className="w-12 h-20 bg-[var(--color-bg-elevated)]/90 backdrop-blur-md flex items-center justify-center pointer-events-auto rounded-l-2xl border-y border-l border-[var(--color-border-subtle)] hover:bg-[var(--color-border-strong)] transition-all cursor-pointer shadow-2xl opacity-0 group-hover/carousel:opacity-100 md:opacity-100">
                <ChevronRight className="w-8 h-8 text-white" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Scrollable container */}
        <div
          ref={rowRef}
          className="flex items-center overflow-x-auto scrollbar-hide space-x-4 md:space-x-5 px-2 pb-8 pt-4 scroll-smooth"
        >
          {items.map((item, index) => (
            <RowCard key={item.id || index} item={item} index={index} />
          ))}
        </div>
      </div>
    </motion.div>
  );
});

interface RowCardProps {
  item: Movie | TVShow;
  index: number;
}

function RowCard({ item, index }: RowCardProps) {
  const router = useRouter();
  const { getImageUrl, prefersReducedMotion } = useSettings();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isTV = 'first_air_date' in item;
  const title = (item as Movie).title || (item as TVShow).name;
  const releaseDate = (item as Movie).release_date || (item as TVShow).first_air_date;

  const onClick = () => {
    const path = isTV
      ? `/info/tv/${item.id}`
      : `/info/movie/${item.id}`;
    router.push(path);
  };

  const posterUrl = getImageUrl(item.poster_path, "poster");

  return (
    <motion.div
      className="flex-shrink-0 cursor-pointer card relative bg-transparent border-0 overflow-visible"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        scale: prefersReducedMotion() ? 1 : 1.04,
        y: prefersReducedMotion() ? 0 : -12,
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <div className="relative group/card hover:shadow-[0_20px_40px_rgba(229,9,20,0.15)] rounded-xl transition-shadow duration-300">
        {/* Image container with aspect ratio */}
        <div className="relative w-36 h-[216px] md:w-52 md:h-[312px] overflow-hidden bg-[var(--color-bg-tertiary)] vignette rounded-xl border border-[var(--color-border-subtle)] group-hover/card:border-[var(--color-border-strong)] transition-colors">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 skeleton" />
          )}
          
          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <svg className="w-10 h-10 text-[var(--color-text-tertiary)] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-[var(--color-text-tertiary)] line-clamp-2 font-medium">{title}</p>
            </div>
          ) : (
            <Image
              src={posterUrl}
              alt={title}
              fill
              className={`object-cover transition-all duration-700 ${
                imageLoaded ? "opacity-100 group-hover/card:scale-[1.03]" : "opacity-0"
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 144px, 208px"
            />
          )}

          {/* Cinematic overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 delay-100">
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent-primary)]/90 backdrop-blur-sm flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.5)] transform scale-75 group-hover/card:scale-100 transition-transform duration-300">
                <Play className="w-5 h-5 text-white ml-1 fill-current" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300">
              <p className="text-white text-sm md:text-base font-bold line-clamp-2 leading-snug drop-shadow-md">
                {title}
              </p>
              <p className="text-[var(--color-accent-primary)] font-bold text-xs mt-1 drop-shadow-md tracking-wider">
                {releaseDate
                  ? new Date(releaseDate).getFullYear()
                  : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Row;
Row.displayName = "MovieRow";