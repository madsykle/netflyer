import { motion } from "framer-motion";
import React from "react";

/**
 * Simple Skeleton Block - Basic loading placeholder
 */
export const SkeletonBlock = ({
  className = "",
  width,
  height,
  rounded = "rounded-lg",
}) => {
  return (
    <div
      className={`bg-[var(--color-bg-tertiary)] animate-pulse ${rounded} ${className}`}
      style={{ width, height }}
    />
  );
};

/**
 * Hero Skeleton - Simplified loading state
 */
export const HeroSkeleton = () => {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden bg-[var(--color-bg-secondary)]">
      <div className="absolute inset-0 bg-[var(--color-bg-tertiary)] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/80 to-transparent">
        <div className="w-2/3 h-8 bg-[var(--color-bg-elevated)] rounded-lg mb-3 animate-pulse" />
        <div className="w-full h-4 bg-[var(--color-bg-elevated)] rounded mb-2 animate-pulse" />
        <div className="w-4/5 h-4 bg-[var(--color-bg-elevated)] rounded mb-4 animate-pulse" />
        <div className="flex gap-3">
          <div className="w-28 h-10 bg-[var(--color-bg-elevated)] rounded-xl animate-pulse" />
          <div className="w-28 h-10 bg-[var(--color-bg-elevated)] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
};

/**
 * Movie Card Skeleton - For grids and rows
 */
export const MovieCardSkeleton = () => {
  return (
    <div className="w-full">
      <div className="aspect-[2/3] w-full bg-[var(--color-bg-tertiary)] rounded-xl mb-2 animate-pulse" />
      <div className="h-4 w-4/5 bg-[var(--color-bg-tertiary)] rounded mb-1.5 animate-pulse" />
      <div className="h-3 w-1/2 bg-[var(--color-bg-tertiary)] rounded animate-pulse" />
    </div>
  );
};

/**
 * Movie Row Skeleton - Horizontal row of cards
 */
export const MovieRowSkeleton = ({ title = true, count = 6 }) => {
  return (
    <div className="my-6 md:my-8">
      {title && (
        <div className="h-6 w-40 bg-[var(--color-bg-tertiary)] rounded mb-4 animate-pulse" />
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <MovieCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

/**
 * Info Page Skeleton - For detail pages
 */
export const InfoSkeleton = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Hero */}
      <div className="h-[50vh] bg-[var(--color-bg-tertiary)] animate-pulse" />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 -mt-20 relative z-10">
        <div className="flex gap-4 md:gap-6 mb-8">
          <div className="w-24 md:w-32 lg:w-40 aspect-[2/3] bg-[var(--color-bg-secondary)] rounded-xl animate-pulse flex-shrink-0" />
          <div className="flex-1 pt-4">
            <div className="h-8 w-3/4 bg-[var(--color-bg-tertiary)] rounded mb-3 animate-pulse" />
            <div className="flex gap-2 mb-4">
              <div className="h-6 w-16 bg-[var(--color-bg-tertiary)] rounded-full animate-pulse" />
              <div className="h-6 w-16 bg-[var(--color-bg-tertiary)] rounded-full animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-[var(--color-bg-tertiary)] rounded animate-pulse" />
              <div className="h-4 w-full bg-[var(--color-bg-tertiary)] rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-[var(--color-bg-tertiary)] rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <div className="h-11 w-28 bg-[var(--color-bg-tertiary)] rounded-xl animate-pulse" />
          <div className="h-11 w-28 bg-[var(--color-bg-tertiary)] rounded-xl animate-pulse" />
        </div>

        {/* Cast Row */}
        <MovieRowSkeleton title={true} count={6} />
      </div>
    </div>
  );
};

/**
 * Search Results Skeleton
 */
export const SearchSkeleton = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="h-8 w-48 bg-[var(--color-bg-tertiary)] rounded mb-2 animate-pulse" />
      <div className="h-4 w-24 bg-[var(--color-bg-tertiary)] rounded mb-8 animate-pulse" />
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <MovieCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

/**
 * Page Loading Spinner
 */
export const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center"
      >
        <div className="relative w-12 h-12 mb-4">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[var(--color-accent-primary)]"
            style={{ borderTopColor: "transparent" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <p className="text-[var(--color-text-tertiary)] text-sm">Loading...</p>
      </motion.div>
    </div>
  );
};

/**
 * Actor Info Skeleton
 */
export const ActorInfoSkeleton = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="h-10 w-20 bg-[var(--color-bg-tertiary)] rounded mb-6 animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          {/* Profile Image */}
          <div className="aspect-[3/4] bg-[var(--color-bg-tertiary)] rounded-2xl animate-pulse" />

          {/* Info */}
          <div className="lg:col-span-2">
            <div className="h-10 w-3/4 bg-[var(--color-bg-tertiary)] rounded mb-4 animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              <div className="h-20 bg-[var(--color-bg-tertiary)] rounded-xl animate-pulse" />
              <div className="h-20 bg-[var(--color-bg-tertiary)] rounded-xl animate-pulse" />
              <div className="h-20 bg-[var(--color-bg-tertiary)] rounded-xl animate-pulse" />
            </div>
            <div className="h-32 bg-[var(--color-bg-tertiary)] rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Filmography */}
        <div className="border-t border-[var(--color-border)] pt-8">
          <div className="h-8 w-48 bg-[var(--color-bg-tertiary)] rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <MovieCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Cast Row Skeleton
 */
export const CastRowSkeleton = ({ count = 8 }) => {
  return (
    <div className="my-6 md:my-8">
      <div className="h-6 w-32 bg-[var(--color-bg-tertiary)] rounded mb-4 animate-pulse" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex-shrink-0 w-24 md:w-28">
            <div className="aspect-[2/3] w-full bg-[var(--color-bg-tertiary)] rounded-xl mb-2 animate-pulse" />
            <div className="h-3 w-full bg-[var(--color-bg-tertiary)] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonBlock;
