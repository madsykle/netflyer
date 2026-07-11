'use client';

import { useSettings } from "../hooks/useSettings";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Cast } from "../types/tmdb";

interface CastRowProps {
  items: Cast[];
  title?: string;
}

const CastRow = React.memo(({ items, title }: CastRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { settings } = useSettings();

  const showScrollIndicators = settings.showScrollIndicators !== false;
  const [isMobile, setIsMobile] = useState(false);

  const checkScroll = useCallback(() => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);

      const mediaQuery = window.matchMedia("(max-width: 768px)");
      const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
      mediaQuery.addEventListener("change", handleChange);

      checkScroll();
      const row = rowRef.current;
      if (row) {
        row.addEventListener("scroll", checkScroll);
      }

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
        if (row) {
          row.removeEventListener("scroll", checkScroll);
        }
      };
    }
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  const showLeftArrow = isMounted && showScrollIndicators && canScrollLeft && (isHovering || isMobile);
  const showRightArrow = isMounted && showScrollIndicators && canScrollRight && (isHovering || isMobile);

  return (
    <div
      className="my-10 relative group animate-slide-up"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {title && (
        <div className="container">
          <h2
            className="t-label text-[var(--text-primary)] mb-6 ml-1 animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            {title}
          </h2>
        </div>
      )}

      <div className="relative">
        {/* Left scroll button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-20 w-20 bg-gradient-to-r from-[var(--bg-base)] via-[var(--bg-base)]/80 to-transparent flex items-center justify-start pl-2 animate-fade-in"
            aria-label="Scroll left"
          >
            <div className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all duration-200 hover:scale-110 shadow-lg border border-white/10">
              <CaretLeft weight="bold" className="w-6 h-6 text-white" />
            </div>
          </button>
        )}

        {/* Right scroll button */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-20 w-20 bg-gradient-to-l from-[var(--bg-base)] via-[var(--bg-base)]/80 to-transparent flex items-center justify-end pr-2 animate-fade-in"
            aria-label="Scroll right"
          >
            <div className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all duration-200 hover:scale-110 shadow-lg border border-white/10">
              <CaretRight weight="bold" className="w-6 h-6 text-white" />
            </div>
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={rowRef}
          className="flex items-start overflow-x-auto scrollbar-hide space-x-5 px-2 scroll-smooth pb-6 pt-2"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {items.map((item, index) => (
            <CastCard key={item.id || index} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
});

interface CastCardProps {
  item: Cast;
  index: number;
}

function CastCard({ item, index }: CastCardProps) {
  const router = useRouter();
  const { getImageUrl } = useSettings();

  const onClick = () => {
    router.push(`/actor/${item.id}`);
  };

  const profileUrl = item.profile_path
    ? getImageUrl(item.profile_path, "profile")
    : "/placeholder-avatar.svg";

  return (
    <div
      className="flex-shrink-0 cursor-pointer card animate-scale-in transition-transform duration-300 ease-[var(--ease-out-expo)] hover:scale-105 hover:-translate-y-2"
      style={{ 
        animationDelay: `${index * 0.05}s`,
        scrollSnapAlign: "start"
      }}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`View profile of ${item.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <div className="relative group/card w-32 sm:w-40">
        {/* Image container */}
        <div className="relative aspect-[2/3] overflow-hidden bg-[var(--bg-raised)] vignette">
          <Image
            src={profileUrl}
            alt={item.name}
            fill
            className="object-cover transition-all duration-700 opacity-0 group-hover/card:scale-110 group-hover/card:brightness-110"
            loading="lazy"
            onLoad={(e) => {
              (e.target as HTMLImageElement).classList.add('opacity-100');
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-avatar.svg";
              (e.target as HTMLImageElement).classList.add('opacity-100');
            }}
            sizes="(max-width: 640px) 128px, 160px"
          />

          {/* Cinematic Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-400" />
        </div>

        {/* Name */}
        <div className="mt-3 text-center px-1 pb-2">
          <p className="text-white text-sm font-bold line-clamp-1 group-hover/card:text-[var(--accent)] transition-colors">
            {item.name}
          </p>
          {item.character && (
            <p className="text-[var(--text-secondary)] text-xs line-clamp-1 mt-1 font-medium">
              {item.character}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CastRow;
CastRow.displayName = "CastRow";
