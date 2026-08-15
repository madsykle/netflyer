'use client';

import { useSettings } from "../../hooks/useSettings";
import {
  Select,
  SelectItem,
  Pagination,
  Slider,
} from "../../components/ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  SquaresFour,
  List,
  Star,
  CalendarBlank,
  X,
  SlidersHorizontal,
  Play,
} from "@phosphor-icons/react";
import { useState, useEffect, useCallback, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { tmdbService } from "../../lib/tmdb";
import { Movie, TVShow, Genre, DiscoverType } from "../../types/tmdb";

const Discover = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [genres, setGenres] = useState<{ movie: Genre[]; tv: Genre[] }>({ movie: [], tv: [] });
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { getImageUrl } = useSettings();

  const [filters, setFilters] = useState({
    type: searchParams?.get("type") || "all",
    genre: searchParams?.get("genre") || "",
    year: searchParams?.get("year") || "",
    rating: [
      parseFloat(searchParams?.get("rating_min") || "0"),
      parseFloat(searchParams?.get("rating_max") || "10"),
    ],
    sort_by: searchParams?.get("sort_by") || "popularity.desc",
    page: parseInt(searchParams?.get("page") || "1"),
  });

  const sortOptions = [
    { key: "popularity.desc", label: "Most Popular" },
    { key: "popularity.asc", label: "Least Popular" },
    { key: "vote_average.desc", label: "Highest Rated" },
    { key: "vote_average.asc", label: "Lowest Rated" },
    { key: "release_date.desc", label: "Newest First" },
    { key: "release_date.asc", label: "Oldest First" },
    { key: "title.asc", label: "A-Z" },
    { key: "title.desc", label: "Z-A" },
  ];

  const typeOptions = [
    { key: "all", label: "All Content" },
    { key: "movie", label: "Movies" },
    { key: "tv", label: "TV Series" },
  ];

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await tmdbService.getGenres();
        setGenres(data);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tmdbService.discover({
        type: filters.type as DiscoverType,
        genre: filters.genre,
        year: filters.year ? parseInt(filters.year) : undefined,
        rating_min: filters.rating[0],
        rating_max: filters.rating[1],
        sort_by: filters.sort_by,
        page: filters.page,
      });

      setResults(data.results || []);
      setTotalPages(data.total_pages || 1);
      setTotalResults(data.total_results || 0);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching results:", error);
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchResults();

    // Update URL
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (key === "rating") {
        const rating = value as number[];
        if (rating[0] > 0) params.set("rating_min", rating[0].toString());
        if (rating[1] < 10) params.set("rating_max", rating[1].toString());
      } else if (value && value !== "all" && value !== "") {
        params.set(key, value.toString());
      }
    });
    router.replace(`${pathname}?${params.toString()}`);
  }, [filters, fetchResults, pathname, router]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: "all",
      genre: "",
      year: "",
      rating: [0, 10],
      sort_by: "popularity.desc",
      page: 1,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.type !== "all") count++;
    if (filters.genre) count++;
    if (filters.year) count++;
    if (filters.rating[0] > 0 || filters.rating[1] < 10) count++;
    return count;
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push({ key: year.toString(), label: year.toString() });
    }
    return years;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pt-24 pb-12">
      <div className="container relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12"
        >
          <div>
            <h1 className="t-title mb-2 text-5xl">
              Discover
            </h1>
            {totalResults > 0 && (
              <p className="t-meta uppercase opacity-50">
                {totalResults.toLocaleString()} results found
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-1 p-1 bg-white/5 rounded-[var(--radius-md)] border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-[var(--radius-sm)] transition-all ${
                  viewMode === "grid"
                    ? "bg-[var(--accent)] text-white shadow-lg"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                <SquaresFour className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-[var(--radius-sm)] transition-all ${
                  viewMode === "list"
                    ? "bg-[var(--accent)] text-white shadow-lg"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn btn-secondary !px-8 !py-3 relative h-12 ${showFilters ? 'bg-white/10 border-white/30 text-white' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2.5" />
              <span className="font-bold uppercase tracking-widest text-xs text-white">Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--accent)] text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xl border-2 border-[var(--bg-base)]">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12"
            >
              <div className="glass-panel p-8 rounded-[var(--radius-md)] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"></div>

                <div className="flex justify-between items-center mb-8">
                  <h2 style={{ fontFamily: "'Clash Display', sans-serif", letterSpacing: '0.05em', fontSize: '1.5rem' }} className="text-white uppercase">
                    Advanced Filters
                  </h2>
                  <button
                    onClick={clearFilters}
                    className="t-label text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors flex items-center gap-2 text-[10px]"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-3">
                    <Select
                      label="Content Type"
                      selectedKeys={[filters.type]}
                      onSelectionChange={(keys: Set<React.Key>) =>
                        handleFilterChange("type", Array.from(keys)[0])
                      }
                      className="w-full"

                    >
                      {typeOptions.map((option) => (
                        <SelectItem key={option.key} textValue={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Select
                      label="Genre"
                      selectedKeys={filters.genre ? [filters.genre] : []}
                      onSelectionChange={(keys: Set<React.Key>) =>
                        handleFilterChange("genre", Array.from(keys)[0] || "")
                      }
                      placeholder="All Genres"
                      className="w-full"

                    >
                      {(filters.type === "movie" ? genres.movie : filters.type === "tv" ? genres.tv : [...genres.movie, ...genres.tv]).map((genre) => (
                        <SelectItem key={genre.id.toString()} textValue={genre.name}>
                          {genre.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Select
                      label="Year"
                      selectedKeys={filters.year ? [filters.year] : []}
                      onSelectionChange={(keys: Set<React.Key>) =>
                        handleFilterChange("year", Array.from(keys)[0] || "")
                      }
                      placeholder="Any Year"
                      className="w-full"

                    >
                      {generateYearOptions().slice(0, 50).map((year) => (
                        <SelectItem key={year.key} textValue={year.label}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Select
                      label="Sort By"
                      selectedKeys={[filters.sort_by]}
                      onSelectionChange={(keys: Set<React.Key>) =>
                        handleFilterChange("sort_by", Array.from(keys)[0])
                      }
                      className="w-full"

                    >
                      {sortOptions.map((option) => (
                        <SelectItem key={option.key} textValue={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <label className="t-label text-[10px]">
                      Rating Range
                    </label>
                    <span className="rating-chip">
                      {filters.rating[0]} - {filters.rating[1]} ★
                    </span>
                  </div>
                  <Slider
                    step={0.1}
                    minValue={0}
                    maxValue={10}
                    value={filters.rating}
                    onChange={(value) => handleFilterChange("rating", value)}
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-16">
                {results.map((item) => (
                  <motion.div key={item.id} variants={itemVariants}>
                    <ResultCard
                      item={item}
                      router={router}
                      getImageUrl={getImageUrl}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-16">
                {results.map((item) => (
                  <motion.div key={item.id} variants={itemVariants}>
                    <ResultListItem
                      item={item}
                      router={router}
                      getImageUrl={getImageUrl}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <motion.div variants={itemVariants} className="flex justify-center mt-12">
                <Pagination
                  total={totalPages}
                  page={filters.page}
                  onChange={(page) => handleFilterChange("page", page)}
                  showControls

                />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const ResultCard = ({ item, router, getImageUrl }: any) => {
  const mediaType = 'title' in item ? "movie" : "tv";
  const [imageLoaded, setImageLoaded] = useState(false);
  const title = item.title || item.name;
  const year = item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      className="cursor-pointer group"
      onClick={() => router.push(`/info/${mediaType}/${item.id}`)}
    >
      <div className="relative aspect-poster overflow-hidden bg-[var(--bg-raised)] rounded-[var(--radius-md)] border border-[var(--border-faint)] group-hover:border-[var(--border-subtle)] transition-colors vignette">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        <Image
          src={getImageUrl(item.poster_path, "poster")}
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
              {item.vote_average > 0 && (
                <span className="rating-chip text-[10px]">★ {item.vote_average.toFixed(1)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ResultListItem = ({ item, router, getImageUrl }: any) => {
  const mediaType = 'title' in item ? "movie" : "tv";
  const [imageLoaded, setImageLoaded] = useState(false);
  const title = item.title || item.name;
  const year = item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0];

  return (
    <motion.div
      whileHover={{ x: 8 }}
      className="surface p-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] cursor-pointer hover:bg-white/5 transition-all duration-300 group"
      onClick={() => router.push(`/info/${mediaType}/${item.id}`)}
    >
      <div className="flex gap-6">
        <div className="relative w-20 md:w-24 aspect-poster flex-shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--bg-raised)] border border-[var(--border-faint)]">
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton" />
          )}
          <Image
            src={getImageUrl(item.poster_path, "poster")}
            alt={title}
            fill
            className={`object-cover ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            sizes="96px"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg md:text-xl font-bold line-clamp-1 group-hover:text-[var(--accent)] transition-colors text-white">
              {title}
            </h3>
            <div className="rating-chip">
              <Star className="w-3 h-3 fill-current" />
              <span>{item.vote_average?.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
               <CalendarBlank className="w-3 h-3" />
              <span className="t-meta">{year}</span>
            </div>
            <span className="meta-chip py-0.5">{mediaType === "movie" ? "Film" : "Series"}</span>
          </div>
          <p className="t-body text-xs md:text-sm line-clamp-2 leading-relaxed opacity-70 max-w-3xl">
            {item.overview}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <Discover />
    </Suspense>
  );
}
