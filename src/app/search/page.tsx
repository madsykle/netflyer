'use client';

import { SearchSkeleton } from "../../components/Skeleton";
import { useSettings } from "../../hooks/useSettings";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlass, X, Clock, Star, CalendarBlank, Play } from "@phosphor-icons/react";
import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { tmdbService } from "../../lib/tmdb";
import { Movie, TVShow } from "../../types/tmdb";

const RECENT_SEARCHES_KEY = "tarkosi_recent_searches";
const MAX_RECENT_SEARCHES = 10;

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const router = useRouter();
  const { getImageUrl } = useSettings();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

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

  const filteredResults = useMemo(() => {
    return results.filter((result) => result.poster_path);
  }, [results]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pb-12">
      {/* Search Hero Section */}
      <div className="container pt-32 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <label className="t-label block mb-4">Explore Library</label>
          <div className="relative group">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
              placeholder="Title, actor, genre..."
              autoComplete="off"
              suppressHydrationWarning
              className="w-full pl-12 pr-12 py-4 bg-white/[0.01] hover:bg-white/[0.03] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:bg-white/[0.02] rounded-[var(--radius-md)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-lg focus:outline-none focus:shadow-[0_0_15px_var(--accent-glow)] transition-all duration-300"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Recent Searches Dropdown */}
            <AnimatePresence>
              {isInputFocused && !query && recentSearches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-3 glass-strong border border-[var(--border-subtle)] rounded-[var(--radius-md)] shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-2">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-faint)] mb-1">
                      <span className="t-label text-[10px]">Recent Searches</span>
                      <button onClick={clearRecentSearches} className="t-label text-[10px] text-[var(--accent)] hover:underline">Clear</button>
                    </div>
                    {recentSearches.map((s) => (
                      <div
                        key={s}
                        onClick={() => setQuery(s)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-sm)] hover:bg-white/5 cursor-pointer group/item"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          <span className="text-sm font-medium text-[var(--text-secondary)] group-hover/item:text-white">{s}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeRecentSearch(s); }}
                          className="p-1 text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2.5 mt-6">
            {['All', 'Movies', 'TV', 'Anime'].map((f, i) => (
              <button 
                key={f} 
                className={`relative rounded-full text-[10px] font-semibold tracking-widest uppercase transition-all duration-300 px-5 py-2.5 whitespace-nowrap cursor-pointer select-none border ${
                  i === 0 
                    ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-[0_0_12px_var(--accent-glow)] scale-[1.03]" 
                    : "bg-white/[0.02] border-white/[0.05] text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.06] hover:border-white/[0.08]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Results Container */}
      <div className="container pb-20">
        <AnimatePresence mode="wait">
          {loading ? (
            <SearchSkeleton />
          ) : query && filteredResults.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="t-body text-xl">No results found for &quot;{query}&quot;</p>
              <p className="t-meta mt-2">Try checking for typos or searching for something else.</p>
            </motion.div>
          ) : filteredResults.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
            >
              {filteredResults.map((result) => (
                <SearchResultCard
                  key={result.id}
                  result={result}
                  onClick={() => {
                    const type = 'title' in result ? 'movie' : 'tv';
                    router.push(`/info/${type}/${result.id}`);
                  }}
                  getImageUrl={getImageUrl}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center sm:text-left">
              <h2 className="t-title text-4xl mb-2 opacity-20">Begin your search</h2>
              <p className="t-body opacity-40">Find your next favorite film or series.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SearchResultCard = ({ result, onClick, getImageUrl }: any) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const title = result.title || result.name;
  const year = result.release_date?.split("-")[0] || result.first_air_date?.split("-")[0];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      className="cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-poster overflow-hidden bg-[var(--bg-raised)] rounded-[var(--radius-md)] border border-[var(--border-faint)] group-hover:border-[var(--border-subtle)] transition-colors">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        <Image
          src={getImageUrl(result.poster_path, "poster")}
          alt={title}
          fill
          className={`object-cover group-hover:scale-105 transition-transform duration-700 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          sizes="(max-width: 768px) 50vw, 20vw"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
            <p className="text-white text-sm font-bold line-clamp-2 leading-tight mb-1">{title}</p>
            <div className="flex items-center gap-2">
              <span className="t-meta text-white/80">{year}</span>
              {result.vote_average > 0 && (
                <span className="rating-chip text-[10px]">★ {result.vote_average.toFixed(1)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function SearchSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SearchPage />
    </Suspense>
  );
}
