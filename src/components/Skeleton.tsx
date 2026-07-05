'use client';

import { motion } from "framer-motion";
import React from "react";

interface SkeletonBlockProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string;
}

export const SkeletonBlock = ({
  className = "",
  width,
  height,
  rounded = "rounded-[var(--radius-sm)]",
}: SkeletonBlockProps) => {
  return (
    <div
      className={`skeleton ${rounded} ${className}`}
      style={{ width, height }}
    />
  );
};

export const HeroSkeleton = () => {
  return (
    <div className="relative w-full h-[70vh] md:h-[85vh] lg:h-[90vh] bg-[var(--bg-base)] overflow-hidden">
      <div className="absolute inset-0 skeleton opacity-20" />
      <div className="container h-full flex flex-col justify-end pb-12 md:pb-24 relative z-10">
        <div className="w-24 h-4 skeleton rounded-[var(--radius-sm)] mb-4" />
        <div className="w-2/3 h-16 md:h-24 skeleton rounded-[var(--radius-sm)] mb-6" />
        <div className="w-full max-w-xl h-4 skeleton rounded-[var(--radius-sm)] mb-2 opacity-60" />
        <div className="w-4/5 max-w-lg h-4 skeleton rounded-[var(--radius-sm)] mb-8 opacity-60" />
        <div className="flex gap-3">
          <div className="w-36 h-12 skeleton rounded-[var(--radius-sm)]" />
          <div className="w-36 h-12 skeleton rounded-[var(--radius-sm)]" />
        </div>
      </div>
    </div>
  );
};

export const MovieCardSkeleton = () => {
  return (
    <div className="w-full">
      <div className="aspect-poster w-full skeleton rounded-[var(--radius-md)] mb-3 border border-[var(--border-faint)]" />
      <div className="h-3 w-4/5 skeleton rounded-[var(--radius-sm)] mb-2" />
      <div className="h-2 w-1/3 skeleton rounded-[var(--radius-sm)] opacity-40" />
    </div>
  );
};

export const MovieRowSkeleton = ({ title = true, count = 6 }: { title?: boolean; count?: number }) => {
  return (
    <div className="my-10">
      <div className="container">
        {title && (
          <div className="h-4 w-32 skeleton rounded-[var(--radius-sm)] mb-6" />
        )}
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-40 md:w-48">
              <MovieCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const InfoSkeleton = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="h-[45vw] min-h-[220px] max-h-[420px] skeleton opacity-20" />
      <div className="container relative -mt-24 sm:-mt-32 z-10 pb-20">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-end">
          <div className="w-32 sm:w-40 md:w-48 aspect-poster skeleton rounded-[var(--radius-md)] border border-[var(--border-subtle)] shadow-2xl" />
          <div className="flex-1 w-full space-y-4 pt-4">
            <div className="h-12 w-2/3 skeleton rounded-[var(--radius-sm)] mx-auto sm:mx-0" />
            <div className="h-4 w-1/3 skeleton rounded-[var(--radius-sm)] mx-auto sm:mx-0 opacity-40" />
            <div className="flex gap-2 justify-center sm:justify-start">
              <div className="h-6 w-16 skeleton rounded-[var(--radius-sm)]" />
              <div className="h-6 w-16 skeleton rounded-[var(--radius-sm)]" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-10 justify-center sm:justify-start">
          <div className="h-11 w-36 skeleton rounded-[var(--radius-sm)]" />
          <div className="h-11 w-36 skeleton rounded-[var(--radius-sm)]" />
        </div>
        <div className="mt-16">
          <div className="h-4 w-24 skeleton rounded-[var(--radius-sm)] mb-8" />
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-24 text-center">
                <div className="w-20 h-20 mx-auto rounded-full skeleton mb-3" />
                <div className="h-2 w-full skeleton rounded-[var(--radius-sm)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SearchSkeleton = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center"
      >
        <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="t-meta uppercase tracking-widest opacity-40">Loading</p>
      </motion.div>
    </div>
  );
};

export const ActorInfoSkeleton = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] pt-32 pb-20">
      <div className="container">
        <div className="h-4 w-20 skeleton rounded-[var(--radius-sm)] mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16">
          <div className="lg:col-span-1">
            <div className="aspect-[2/3] skeleton rounded-[var(--radius-md)] border border-[var(--border-subtle)] mb-8" />
            <div className="space-y-6">
              <div className="h-10 skeleton rounded-[var(--radius-sm)] w-2/3" />
              <div className="h-10 skeleton rounded-[var(--radius-sm)] w-3/4" />
            </div>
          </div>
          <div className="lg:col-span-3 space-y-8">
            <div className="h-20 w-2/3 skeleton rounded-[var(--radius-sm)]" />
            <div className="h-32 w-full skeleton rounded-[var(--radius-sm)]" />
            <div className="pt-8 border-t border-[var(--border-faint)]">
              <div className="h-8 w-48 skeleton rounded-[var(--radius-sm)] mb-8" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, index) => (
                  <MovieCardSkeleton key={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CastRowSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="my-10">
      <div className="h-4 w-24 skeleton rounded-[var(--radius-sm)] mb-8 ml-1" />
      <div className="flex gap-6 overflow-hidden px-1">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex-shrink-0 w-24 sm:w-28 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full skeleton mb-3" />
            <div className="h-2 w-full skeleton rounded-[var(--radius-sm)]" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonBlock;
