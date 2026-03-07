'use client';

import { SearchSkeleton } from "../../components/Skeleton";
import { useSettings } from "../../hooks/useSettings";
import { Card, CardBody, Input } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock } from "lucide-react";
import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { tmdbService } from "../../lib/tmdb";
import { Movie, TVShow } from "../../types/tmdb";

const RECENT_SEARCHES_KEY = "netflyer_recent_searches";
const MAX_RECENT_SEARCHES = 10;

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const router = useRouter();
  const { getImageUrl } = useSettings();

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches:", e);
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setRecentSearches(prev => {
      const updated = [
        searchQuery,
        ...prev.filter((s) => s !== searchQuery),
      ].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Remove single recent search
  const removeRecentSearch = (searchToRemove: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter((s) => s !== searchToRemove);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const debounceTimer = setTimeout(() => {
      tmdbService.search(query)
        .then((res) => {
          setResults(res.results || []);
          saveRecentSearch(query);
        })
        .catch((error) => {
          console.error("Search error:", error);
          setResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const getDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    const dateObject = new Date(date);
    return dateObject.getFullYear();
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const filteredResults = useMemo(() => {
    return results.filter((result) => result.poster_path);
  }, [results]);

  const handleResultClick = (result: Movie | TVShow) => {
    const isTV = 'first_air_date' in result;
    const path = isTV
      ? `/info/tv/${result.id}`
      : `/info/movie/${result.id}`;
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white pt-24 pb-12">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="heading-1 mb-10 text-center uppercase tracking-widest">
            Search
          </h1>
          <div className="max-w-3xl mx-auto relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
              placeholder="Search for movies, TV shows, or anime..."
              variant="bordered"
              size="lg"
              radius="lg"
              startContent={
                <Search className="text-[var(--color-text-tertiary)] pointer-events-none flex-shrink-0 w-6 h-6 mr-2" />
              }
              endContent={
                query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-[var(--color-text-tertiary)] hover:text-white transition-colors p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )
              }
              className="text-white"
              classNames={{
                input: "text-white text-lg font-medium",
                inputWrapper:
                  "bg-white/5 border-white/10 hover:border-white/30 focus-within:!border-[var(--color-accent-primary)] h-16 transition-all shadow-xl",
              }}
            />

            {/* Filter Chips */}
            <div className="flex overflow-x-auto scrollbar-hide gap-3.5 mt-8 justify-center">
              {['All', 'Movies', 'TV', 'Anime'].map((filter, idx) => (
                <button 
                  key={filter}
                  className={`chip-base ${idx === 0 ? 'chip-primary' : 'chip-secondary'} !text-xs !py-2.5 !px-7 whitespace-nowrap h-10`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Recent searches dropdown */}
            <AnimatePresence>
              {isInputFocused && !query && recentSearches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-4 glass-panel rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4 px-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">
                        Recent Searches
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent-primary)] hover:text-white transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <motion.div
                          key={search}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setQuery(search)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left cursor-pointer group"
                          role="button"
                          tabIndex={0}
                        >
                          <div className="flex items-center gap-4">
                            <Clock className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-primary)]" />
                            <span className="text-[var(--color-text-secondary)] font-medium group-hover:text-white transition-colors">
                              {search}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentSearch(search);
                            }}
                            className="text-[var(--color-text-muted)] hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                            aria-label={`Remove ${search} from recent searches`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <SearchSkeleton />
          ) : query && filteredResults.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-[var(--color-text-muted)]" />
              </div>
              <p className="text-2xl font-bold text-white mb-2">
                No results found for &quot;{query}&quot;
              </p>
              <p className="text-[var(--color-text-tertiary)] font-medium">
                Try a different search term or check for typos
              </p>
            </motion.div>
          ) : filteredResults.length > 0 ? (
            <motion.div
              key="results"
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8"
            >
              {filteredResults.map((result) => (
                <SearchResultCard
                  key={result.id}
                  result={result}
                  onClick={() => handleResultClick(result)}
                  getImageUrl={getImageUrl}
                  cardVariants={cardVariants}
                  getDate={getDate}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <h2 className="heading-2 mb-2">Search for anything</h2>
              <p className="text-[var(--color-text-secondary)] font-medium text-lg">
                Movies, TV shows, anime...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Search Result Card Component
const SearchResultCard = ({
  result,
  onClick,
  getImageUrl,
  cardVariants,
  getDate,
}: any) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const posterUrl = getImageUrl(result.poster_path, "poster");

  return (
    <motion.div 
      variants={cardVariants}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer group card"
      onClick={onClick}
    >
      <div className="relative aspect-poster overflow-hidden bg-[var(--color-bg-tertiary)] vignette">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        <Image
          src={posterUrl}
          alt={result.title || result.name}
          fill
          className={`object-cover group-hover:scale-110 transition-transform duration-700 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/not-found.png";
            setImageLoaded(true);
          }}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      </div>
      <div className="card-padding">
        <h3 className="font-bold text-sm md:text-base mb-1 line-clamp-1 group-hover:text-[var(--color-accent-primary)] transition-colors text-white">
          {result.title || result.name}
        </h3>
        <p className="text-[var(--color-text-tertiary)] text-xs font-bold uppercase tracking-wider mt-1">
          {getDate(result.release_date || result.first_air_date)}
        </p>
      </div>
    </motion.div>
  );
};

export default function SearchSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SearchPage />
    </Suspense>
  );
}
