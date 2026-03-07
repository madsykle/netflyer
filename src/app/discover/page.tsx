'use client';

import { useSettings } from "../../hooks/useSettings";
import {
  Spinner,
  Select,
  SelectItem,
  Button,
  Chip,
  Card,
  CardBody,
  Pagination,
  Slider,
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid,
  List,
  Star,
  Calendar,
  X,
  SlidersHorizontal,
  Play,
} from "lucide-react";
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
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white pt-24 pb-12">
      <div className="container relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12"
        >
          <div>
            <h1 className="heading-1 mb-2">
              Discover
            </h1>
            <p className="text-[var(--color-text-tertiary)] font-bold tracking-widest uppercase text-sm">
              {totalResults.toLocaleString()} results found
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-[var(--color-accent-primary)] text-white shadow-lg"
                    : "text-[var(--color-text-tertiary)] hover:text-white"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-[var(--color-accent-primary)] text-white shadow-lg"
                    : "text-[var(--color-text-tertiary)] hover:text-white"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn btn-secondary !px-8 !py-3 relative h-12 ${showFilters ? 'bg-white/10 border-white/30 text-white' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2.5" />
              <span className="font-bold uppercase tracking-widest text-xs">Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--color-accent-primary)] text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xl border-2 border-[var(--color-bg-primary)]">
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
              <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-accent-primary)] to-transparent"></div>
                
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold font-display uppercase tracking-widest text-white">
                    Advanced Filters
                  </h3>
                  <div className="flex gap-3">
                    <button
                      onClick={clearFilters}
                      className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-primary)] transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-3">
                    <Select
                      label="Content Type"
                      selectedKeys={[filters.type]}
                      onSelectionChange={(keys) =>
                        handleFilterChange("type", Array.from(keys)[0])
                      }
                      className="w-full"
                      variant="bordered"
                      classNames={{
                        label: "text-[var(--color-text-tertiary)] font-bold uppercase tracking-widest text-[10px]",
                        trigger: "border-white/10 hover:border-white/30 text-white h-14 px-4 bg-white/5",
                        value: "font-bold text-white text-sm",
                        listbox: "bg-[#1a1a1e] p-2",
                        popoverContent: "bg-[#1a1a1e] border border-white/10 shadow-2xl !opacity-100",
                      }}
                    >
                      {typeOptions.map((option) => (
                        <SelectItem 
                          key={option.key}
                          textValue={option.label}
                          classNames={{
                            base: "rounded-lg data-[hover=true]:bg-white/10 px-3 py-2.5",
                            title: "font-bold text-sm text-white"
                          }}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Select
                      label="Genre"
                      selectedKeys={filters.genre ? [filters.genre] : []}
                      onSelectionChange={(keys) =>
                        handleFilterChange("genre", Array.from(keys)[0] || "")
                      }
                      placeholder="All Genres"
                      className="w-full"
                      variant="bordered"
                      classNames={{
                        label: "text-[var(--color-text-tertiary)] font-bold uppercase tracking-widest text-[10px]",
                        trigger: "border-white/10 hover:border-white/30 text-white h-14 px-4 bg-white/5",
                        value: "font-bold text-white text-sm",
                        listbox: "bg-[#1a1a1e] p-2",
                        popoverContent: "bg-[#1a1a1e] border border-white/10 shadow-2xl !opacity-100",
                      }}
                    >
                      {(filters.type === "movie"
                        ? genres.movie
                        : filters.type === "tv"
                        ? genres.tv
                        : [...genres.movie, ...genres.tv]
                      ).map((genre) => (
                        <SelectItem 
                          key={genre.id.toString()}
                          textValue={genre.name}
                          classNames={{
                            base: "rounded-lg data-[hover=true]:bg-white/10 px-3 py-2.5",
                            title: "font-bold text-sm text-white"
                          }}
                        >
                          {genre.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Select
                      label="Year"
                      selectedKeys={filters.year ? [filters.year] : []}
                      onSelectionChange={(keys) =>
                        handleFilterChange("year", Array.from(keys)[0] || "")
                      }
                      placeholder="Any Year"
                      className="w-full"
                      variant="bordered"
                      classNames={{
                        label: "text-[var(--color-text-tertiary)] font-bold uppercase tracking-widest text-[10px]",
                        trigger: "border-white/10 hover:border-white/30 text-white h-14 px-4 bg-white/5",
                        value: "font-bold text-white text-sm",
                        listbox: "bg-[#1a1a1e] p-2",
                        popoverContent: "bg-[#1a1a1e] border border-white/10 shadow-2xl !opacity-100",
                      }}
                    >
                      {generateYearOptions()
                        .slice(0, 50)
                        .map((year) => (
                          <SelectItem 
                            key={year.key}
                            textValue={year.label}
                            classNames={{
                              base: "rounded-lg data-[hover=true]:bg-white/10 px-3 py-2.5",
                              title: "font-bold text-sm text-white"
                            }}
                          >
                            {year.label}
                          </SelectItem>
                        ))}
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Select
                      label="Sort By"
                      selectedKeys={[filters.sort_by]}
                      onSelectionChange={(keys) =>
                        handleFilterChange("sort_by", Array.from(keys)[0])
                      }
                      className="w-full"
                      variant="bordered"
                      classNames={{
                        label: "text-[var(--color-text-tertiary)] font-bold uppercase tracking-widest text-[10px]",
                        trigger: "border-white/10 hover:border-white/30 text-white h-14 px-4 bg-white/5",
                        value: "font-bold text-white text-sm",
                        listbox: "bg-[#1a1a1e] p-2",
                        popoverContent: "bg-[#1a1a1e] border border-white/10 shadow-2xl !opacity-100",
                      }}
                    >
                      {sortOptions.map((option) => (
                        <SelectItem 
                          key={option.key}
                          textValue={option.label}
                          classNames={{
                            base: "rounded-lg data-[hover=true]:bg-white/10 px-3 py-2.5",
                            title: "font-bold text-sm text-white"
                          }}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">
                      Rating Range
                    </label>
                    <span className="px-3 py-1 bg-white/5 rounded text-sm font-bold text-[var(--color-accent-primary)]">
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
                    classNames={{
                      track: "bg-white/5 h-1.5",
                      filler: "bg-[var(--color-accent-primary)]",
                      thumb: "bg-white border-2 border-[var(--color-accent-primary)] shadow-lg"
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 mb-16">
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
              <div className="space-y-6 mb-16">
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
              <motion.div
                variants={itemVariants}
                className="flex justify-center"
              >
                <Pagination
                  total={totalPages}
                  page={filters.page}
                  onChange={(page) => handleFilterChange("page", page)}
                  showControls
                  classNames={{
                    wrapper: "gap-2",
                    item: "bg-transparent border border-transparent hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-white font-bold",
                    cursor: "bg-white/10 border border-white/20 text-white",
                    next: "bg-transparent text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5",
                    prev: "bg-transparent text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5",
                  }}
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

  return (
    <motion.div
      className="cursor-pointer group card"
      whileHover={{ y: -8 }}
      onTap={() => router.push(`/info/${mediaType}/${item.id}`)}
    >
      <div className="relative aspect-poster overflow-hidden bg-[var(--color-bg-tertiary)] vignette">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        <Image
          src={getImageUrl(item.poster_path, "poster")}
          alt={item.title || item.name}
          fill
          className={`object-cover group-hover:scale-110 transition-transform duration-700 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400">
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-md rounded border border-yellow-500/30 px-2 py-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-[10px] font-bold text-white">
                  {item.vote_average?.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card-padding">
        <h3 className="font-bold text-sm md:text-base mb-1 line-clamp-1 group-hover:text-[var(--color-accent-primary)] transition-colors text-white">
          {item.title || item.name}
        </h3>
        <p className="text-[var(--color-text-tertiary)] text-xs font-bold uppercase tracking-wider">
          {item.release_date?.split("-")[0] ||
            item.first_air_date?.split("-")[0]}
        </p>
      </div>
    </motion.div>
  );
};

const ResultListItem = ({ item, router, getImageUrl }: any) => {
  const mediaType = 'title' in item ? "movie" : "tv";
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      whileHover={{ x: 10 }}
      className="glass-panel p-5 rounded-xl cursor-pointer border border-white/5 hover:border-[var(--color-accent-primary)]/30 hover:bg-white/5 transition-all duration-300"
      onClick={() => router.push(`/info/${mediaType}/${item.id}`)}
    >
      <div className="flex gap-6">
        <div className="relative overflow-hidden rounded-lg w-24 md:w-32 aspect-poster flex-shrink-0 vignette">
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton" />
          )}
          <Image
            src={getImageUrl(item.poster_path, "poster")}
            alt={item.title || item.name}
            fill
            className={`object-cover ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 768px) 96px, 128px"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl md:text-2xl font-bold line-clamp-1 group-hover:text-[var(--color-accent-primary)] transition-colors text-white">
              {item.title || item.name}
            </h3>
            <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded px-2.5 py-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-bold text-yellow-400">
                {item.vote_average?.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-4 text-sm font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>
                {item.release_date?.split("-")[0] ||
                  item.first_air_date?.split("-")[0]}
              </span>
            </div>
            <span className="px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px]">
              {mediaType === "movie" ? "Movie" : "TV Series"}
            </span>
          </div>
          <p className="text-[var(--color-text-secondary)] text-base line-clamp-2 leading-relaxed font-medium max-w-4xl">
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
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <Discover />
    </Suspense>
  );
}
