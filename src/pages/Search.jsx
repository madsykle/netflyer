import Navbar from "../components/Navbar";
import { SearchSkeleton } from "../components/Skeleton";
import { useSettings } from "../hooks/useSettings";
import { BACKEND_URL } from "../services/Api";
import { Card, CardBody, Input } from "@heroui/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const RECENT_SEARCHES_KEY = "netflyer_recent_searches";
const MAX_RECENT_SEARCHES = 10;

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const navigate = useNavigate();
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
  const saveRecentSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;
    const updated = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Remove single recent search
  const removeRecentSearch = (searchToRemove) => {
    const updated = recentSearches.filter((s) => s !== searchToRemove);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const debounceTimer = setTimeout(() => {
      axios
        .get(`${BACKEND_URL}/api/search/${query}`)
        .then((res) => {
          setResults(res.data.results || []);
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

  const getDate = (date) => {
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

  const handleResultClick = (result) => {
    const path = result.first_air_date
      ? `/info/tv/${result.id}`
      : `/info/movie/${result.id}`;
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center text-white">
            Search
          </h1>
          <div className="max-w-2xl mx-auto relative">
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
                <Search className="text-[var(--color-text-tertiary)] pointer-events-none flex-shrink-0 w-5 h-5" />
              }
              endContent={
                query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-[var(--color-text-tertiary)] hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )
              }
              className="text-white bg-[var(--color-bg-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-hover)] focus:border-[var(--color-accent-primary)]"
              classNames={{
                input: "text-white",
                inputWrapper:
                  "bg-[var(--color-bg-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]",
              }}
            />

            {/* Recent searches dropdown */}
            <AnimatePresence>
              {isInputFocused && !query && recentSearches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2 px-2">
                      <span className="text-sm text-[var(--color-text-tertiary)]">
                        Recent Searches
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-[var(--color-accent-primary)] hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                    {recentSearches.map((search, index) => (
                      <motion.div
                        key={search}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setQuery(search)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setQuery(search);
                          }
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors text-left cursor-pointer"
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-[var(--color-text-muted)]" />
                          <span className="text-[var(--color-text-secondary)]">
                            {search}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentSearch(search);
                          }}
                          className="text-[var(--color-text-muted)] hover:text-white p-1"
                          aria-label={`Remove ${search} from recent searches`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
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
              className="text-center py-16"
            >
              <Search className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4" />
              <p className="text-xl text-[var(--color-text-secondary)]">
                No results found for &quot;{query}&quot;
              </p>
              <p className="text-[var(--color-text-tertiary)] mt-2">
                Try a different search term
              </p>
            </motion.div>
          ) : filteredResults.length > 0 ? (
            <motion.div
              key="results"
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
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
          ) : null}
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
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const posterUrl = getImageUrl(result.poster_path, "poster");

  return (
    <motion.div variants={cardVariants}>
      <Card
        className="cursor-pointer group bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-all duration-300 border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
        isPressable
        onPress={onClick}
      >
        <div className="relative overflow-hidden rounded-lg">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[var(--color-bg-tertiary)] aspect-[2/3]" />
          )}
          <img
            src={posterUrl}
            alt={result.title || result.name}
            className={`w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.src = "/not-found.png";
              setImageLoaded(true);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardBody className="p-3">
          <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-[var(--color-accent-primary)] transition-colors">
            {result.title || result.name}
          </h3>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
            {getDate(result.release_date || result.first_air_date)}
          </p>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default SearchPage;
