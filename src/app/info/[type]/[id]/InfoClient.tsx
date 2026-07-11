'use client';

import { useSettings } from "../../../../hooks/useSettings";
import { auth, db } from "../../../../lib/firebase";
import { filterText } from "../../../../lib/profanity";
import {
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Trash,
  Plus,
  Star,
  FilmStrip,
  X,
  Check,
  Spinner,
  CaretDown,
  CalendarBlank
} from "@phosphor-icons/react";
import { isReleased, formatReleaseDate } from "../../../../lib/release";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "../../../../components/ToastProvider";
import { MovieDetails, TVShowDetails, Cast, Movie, TVShow, Episode } from "../../../../types/tmdb";
import { tmdbService } from "../../../../lib/tmdb";
import Link from "next/link";

interface InfoClientProps {
  type: "movie" | "tv";
  id: string;
  details: MovieDetails | TVShowDetails;
  cast: Cast[];
  recommendations: (Movie | TVShow)[];
  similar: (Movie | TVShow)[];
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  itemId: string;
  type: string;
  text: string;
  rating: number;
  likes: string[];
  likeCount: number;
  createdAt: any; 
  updatedAt: any;
}

const InfoClient = ({ type, id, details, cast, recommendations, similar }: InfoClientProps) => {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState("");
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [watchlist, setWatchlist] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showSeasonMenu, setShowSeasonMenu] = useState(false);
  const [imageLoaded, setImageLoaded] = useState({
    backdrop: false,
    poster: false,
  });
  
  const [autoPlayActive, setAutoPlayActive] = useState(false);

  const router = useRouter();
  const { getImageUrl, settings } = useSettings();
  const { createToast } = useToast();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videos = await tmdbService.getVideos(type, parseInt(id));
        const trailer = videos.results?.find((v: { type: string; site: string; key: string }) => v.type === "Trailer" && v.site === "YouTube");
        if (trailer) setTrailerKey(trailer.key);
      } catch (e) {
        console.error("Error fetching videos:", e);
      }
    };
    fetchVideos();
  }, [type, id]);

  useEffect(() => {
    if (!settings.autoplayTrailers || settings.dataSaver || !trailerKey) return;
    const timer = setTimeout(() => {
      setAutoPlayActive(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [trailerKey, settings.autoplayTrailers, settings.dataSaver]);

  const isTV = type === "tv";
  const title = (details as MovieDetails).title || (details as TVShowDetails).name;
  const releaseDate = isTV 
    ? (details as TVShowDetails).first_air_date
    : (details as MovieDetails).release_date;
  const released = isReleased(releaseDate, details.status);
  const runtime = (details as MovieDetails).runtime 
    ? `${Math.floor((details as MovieDetails).runtime / 60)}h ${(details as MovieDetails).runtime % 60}m`
    : (details as TVShowDetails).episode_run_time?.[0]
    ? `${(details as TVShowDetails).episode_run_time[0]}m`
    : "";

  const [activeTab, setActiveTab] = useState<"overview" | "episodes" | "similar" | "reviews">("overview");

  const fetchReviews = useCallback(async () => {
    try {
      const q = query(
        collection(db, "reviews"),
        where("itemId", "==", id),
        where("type", "==", type)
      );
      const querySnapshot = await getDocs(q);
      const reviewsData: Review[] = [];
      querySnapshot.forEach((doc) => {
        const reviewData = doc.data() as Omit<Review, "id">;
        reviewsData.push({ ...reviewData, id: doc.id });
      });
      reviewsData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    }
  }, [id, type]);

  const checkWatchlist = useCallback(async (user_id: string) => {
    try {
      const q = query(
        collection(db, "watchlist"),
        where("userID", "==", user_id),
        where("id", "==", id.toString()),
        where("type", "==", type)
      );
      const querySnapshot = await getDocs(q);
      setWatchlist(!querySnapshot.empty);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    } finally {
      setWatchlistLoading(false);
    }
  }, [id, type]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !firebaseUser.isAnonymous) {
        setUser(firebaseUser);
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) setUserName(userDoc.data().username);
          
          // Only check watchlist if we haven't already or if it's a new user
          await checkWatchlist(firebaseUser.uid);
        } catch (error: any) {
          // Log only if it's not a common "offline" error to reduce noise
          if (error.code !== 'unavailable' && error.code !== 'failed-precondition') {
            console.error("Error fetching user data:", error);
          }
          setWatchlistLoading(false);
        }
      } else {
        setUser(null);
        setWatchlistLoading(false);
      }
    });
    return unsubscribe;
  }, [checkWatchlist]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (type === "tv") {
        try {
          setEpisodesLoading(true);
          const data = await tmdbService.getSeasonDetails(parseInt(id), selectedSeason);
          setEpisodes(data.episodes || []);
        } catch (error) {
          console.error("Error fetching episodes:", error);
        } finally {
          setEpisodesLoading(false);
        }
      }
    };
    fetchEpisodes();
  }, [type, id, selectedSeason]);

  const handleAddReview = async () => {
    if (!user || newReview.trim() === "") return;
    const trimmedReview = newReview.trim().slice(0, 1000);
    const filteredReview = filterText(trimmedReview);
    const validatedRating = Math.min(5, Math.max(1, Math.floor(reviewRating)));

    await addDoc(collection(db, "reviews"), {
      userId: user.uid,
      userName: userName || user.displayName || "User",
      itemId: id,
      type: type,
      text: filteredReview,
      rating: validatedRating,
      likes: [],
      likeCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setNewReview("");
    setReviewRating(5);
    fetchReviews();
    createToast("Review posted successfully", { type: "success", timeout: 2000 });
  };

  const handleWatchlistToggle = async () => {
    if (!user) {
      createToast("You need to be logged in.", {
        action: { text: "Login", callback(toast) { router.push("/login"); toast.destroy(); } },
        timeout: 3000,
        type: "dark",
      });
      return;
    }

    setWatchlistLoading(true);
    if (watchlist) {
      const q = query(
        collection(db, "watchlist"),
        where("userID", "==", user.uid),
        where("id", "==", id.toString()),
        where("type", "==", type)
      );
      try {
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        setWatchlist(false);
        createToast("Removed from watchlist", { type: "success", timeout: 2000 });
      } catch (error) {
        console.error("Error removing:", error);
      }
    } else {
      await addDoc(collection(db, "watchlist"), {
        type: type,
        id: id,
        userID: user.uid,
        title: title,
        posterPath: details.poster_path,
        addedAt: serverTimestamp(),
      });
      setWatchlist(true);
      createToast("Added to watchlist", { type: "success", timeout: 2000 });
    }
    setWatchlistLoading(false);
  };

  const backdropUrl = details.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` 
    : getImageUrl(details.poster_path, "backdrop");
  
  const posterUrl = getImageUrl(details.poster_path, "poster");

  const tabs = ["overview", ...(isTV ? ["episodes"] : []), "similar", "reviews"];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pb-20">
      {/* Hero Section */}
      <div className="relative w-full h-[70vh] md:h-[80vh] min-h-[500px] flex items-end">
        {/* Backdrop */}
        <div className="absolute inset-0 overflow-hidden bg-[#050505]">
          {autoPlayActive && trailerKey ? (
            <div className="absolute inset-0 w-full h-full pointer-events-none scale-105 opacity-55 transition-opacity duration-1000">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&rel=0&modestbranding=1&showinfo=0`}
                title="Trailer Preview"
                className="w-full h-full border-0 object-cover"
                allow="autoplay; encrypted-media"
              />
            </div>
          ) : (
            <Image
              src={backdropUrl}
              alt=""
              fill
              priority
              className="object-cover object-top opacity-50"
              sizes="100vw"
              onLoad={() => setImageLoaded(p => ({...p, backdrop: true}))}
              style={{ opacity: imageLoaded.backdrop ? 0.6 : 0, transition: 'opacity 1.5s ease-in-out' }}
            />
          )}
          {/* Gradients to blend into background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-base)] via-[var(--bg-base)]/40 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 pb-12 md:pb-16 flex flex-col md:flex-row gap-8 items-end">
          {/* Poster - hidden on mobile for cleaner look, visible on tablet+ */}
          <div className="hidden md:block w-48 lg:w-64 flex-shrink-0 relative z-10 group">
            <div className="relative aspect-poster rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-subtle)] shadow-[0_20px_50px_rgba(0,0,0,0.7)] bg-[var(--bg-raised)]">
              {!imageLoaded.poster && <div className="absolute inset-0 skeleton" />}
              <Image
                src={posterUrl}
                alt={title}
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 192px, 256px"
                onLoad={() => setImageLoaded(p => ({...p, poster: true}))}
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 w-full relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="t-hero text-6xl sm:text-7xl lg:text-[8rem] mb-4 leading-[0.9] text-white tracking-normal">
                {title}
              </h1>

              {details.tagline && (
                <p className="text-xl md:text-2xl text-[var(--text-secondary)] italic font-light mb-6 max-w-3xl">
                  &quot;{details.tagline}&quot;
                </p>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-4 flex-wrap mb-10">
                <span className="t-meta text-white/90 bg-white/[0.04] border border-white/[0.08] px-3.5 py-1.5 rounded-[4px] shadow-sm backdrop-blur-md font-bold tracking-widest text-xs">
                  {new Date(releaseDate).getFullYear() || "N/A"}
                </span>
                {runtime && (
                  <span className="t-meta text-white/90 bg-white/[0.04] border border-white/[0.08] px-3.5 py-1.5 rounded-[4px] shadow-sm backdrop-blur-md font-bold tracking-widest text-xs">
                    {runtime}
                  </span>
                )}
                {details.vote_average > 0 && (
                  <span className="text-xs font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3.5 py-1.5 rounded-[4px] shadow-sm backdrop-blur-md flex items-center gap-1.5 tracking-wider">
                    ★ {details.vote_average.toFixed(1)}
                  </span>
                )}
                {settings.dataSaver && (
                  <span className="text-xs font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3.5 py-1.5 rounded-[4px] shadow-sm backdrop-blur-md flex items-center gap-1.5 tracking-wider uppercase">
                    Data Saver Active
                  </span>
                )}
                <div className="flex gap-2 ml-2">
                  {details.genres?.slice(0, 3).map((g: any) => (
                    <span key={g.id} className="genre-chip !rounded-[4px] !px-3 !py-1.5 !text-xs !bg-[var(--accent-dim)] !border-[rgba(229,9,20,0.25)]">{g.name}</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4">
                {released ? (
                  <button
                    onClick={() => router.push(type === 'tv' ? `/watch/tv/${id}/1/1` : `/watch/movie/${id}`)}
                    className="btn btn-primary h-14 px-8 md:px-12 text-xs uppercase tracking-widest font-extrabold shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:scale-105 transition-all duration-300"
                  >
                    <Play className="w-4 h-4 fill-current mr-0.5" />
                    Play Now
                  </button>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <button
                      disabled
                      className="btn bg-white/5 border border-white/10 text-white/40 cursor-not-allowed h-14 px-8 md:px-12 text-xs uppercase tracking-widest font-extrabold flex items-center gap-2"
                    >
                      <CalendarBlank className="w-4 h-4 text-white/40" />
                      Not Yet Released
                    </button>
                    {releaseDate && (
                      <span className="text-[10px] text-[var(--text-secondary)] font-semibold tracking-wider text-center md:text-left">
                        Expected: {formatReleaseDate(releaseDate)}
                      </span>
                    )}
                  </div>
                )}

                <button
                  onClick={handleWatchlistToggle}
                  disabled={watchlistLoading}
                  className="btn bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 h-14 px-6 md:px-8 text-xs uppercase tracking-widest font-extrabold text-white hover:scale-105 transition-all duration-300 min-w-[160px]"
                >
                  {watchlistLoading ? (
                    <Spinner className="w-4 h-4 animate-spin" />
                  ) : watchlist ? (
                    <><Check className="w-4 h-4 text-green-500" /> Saved</>
                  ) : (
                    <><Plus className="w-4 h-4" /> Watchlist</>
                  )}
                </button>

                {trailerKey && (
                  <button 
                    onClick={() => setShowTrailer(true)}
                    className="btn btn-ghost h-14 px-6 text-xs uppercase tracking-widest font-extrabold border border-transparent hover:border-white/10 transition-all hover:bg-white/[0.04]"
                  >
                    <FilmStrip className="w-4 h-4 mr-2" />
                    Trailer
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Desktop */}
      <div className="container mt-12 md:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            
            {/* Tabs Navigation */}
            <div className="flex gap-8 border-b border-[var(--border-faint)] overflow-x-auto scrollbar-hide mb-10">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-4 text-sm font-bold tracking-widest uppercase transition-colors whitespace-nowrap relative ${
                    activeTab === tab ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="t-label text-[var(--accent)] mb-4 tracking-[0.2em]">Synopsis</h3>
                    <p className="t-body text-lg md:text-xl text-[var(--text-primary)] leading-relaxed font-light mb-16 max-w-3xl">
                      {details.overview || "No overview available for this title."}
                    </p>

                    <h3 className="t-label text-[var(--accent)] mb-8 tracking-[0.2em]">Principal Cast</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {cast?.slice(0, 10).map((person) => (
                        <Link
                          href={`/actor/${person.id}`}
                          key={person.id}
                          className="group"
                        >
                          <div className="relative aspect-square mb-3 rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-raised)] border border-[var(--border-faint)] group-hover:border-[var(--accent)] group-hover:shadow-[0_0_12px_var(--accent-glow)] transition-all duration-300 shadow-lg">
                            <Image
                              src={person.profile_path ? getImageUrl(person.profile_path, "profile") : "/placeholder-avatar.svg"}
                              alt={person.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 33vw, 20vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <p className="text-sm font-bold text-white line-clamp-1">{person.name}</p>
                          <p className="t-meta text-[10px] text-[var(--text-muted)] line-clamp-2 mt-1">{person.character}</p>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "episodes" && isTV && (
                  <motion.div
                    key="episodes"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-8 relative">
                      <button 
                        onClick={() => setShowSeasonMenu(!showSeasonMenu)}
                        className="h-14 bg-[var(--bg-surface)] border-[var(--border-subtle)] rounded-[var(--radius-sm)] hover:border-[var(--border-visible)] px-6 flex items-center gap-4 transition-colors group"
                      >
                        <span className="t-label text-[var(--accent)] tracking-[0.2em]">Select Season</span>
                        <div className="w-px h-4 bg-white/10" />
                        <span className="font-bold text-white">Season {selectedSeason}</span>
                         <CaretDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-300 ${showSeasonMenu ? "rotate-180" : ""}`} weight="bold" />
                      </button>

                      <AnimatePresence>
                        {showSeasonMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-0 top-full mt-2 w-64 bg-[#0a0a0c] border border-[var(--border-subtle)] rounded-[var(--radius-md)] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-50 p-1"
                          >
                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                              {(details as TVShowDetails).seasons
                                ?.filter(s => s.season_number > 0)
                                .map(season => (
                                  <button
                                    key={season.season_number}
                                    onClick={() => {
                                      setSelectedSeason(season.season_number);
                                      setShowSeasonMenu(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-[var(--radius-sm)] text-left transition-all ${
                                      selectedSeason === season.season_number 
                                        ? "bg-[var(--accent)]/10 text-white" 
                                        : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-white"
                                    }`}
                                  >
                                    <div>
                                      <p className="text-sm font-bold">Season {season.season_number}</p>
                                      <p className="text-[10px] opacity-50 mt-0.5 uppercase tracking-wider">{season.episode_count} Episodes</p>
                                    </div>
                                    {selectedSeason === season.season_number && (
                                      <Check className="w-4 h-4 text-[var(--accent)]" />
                                    )}
                                  </button>
                                ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {episodes.map((episode, index) => (
                        <EpisodeCard key={episode.id} episode={episode} index={index} type={type} id={id} selectedSeason={selectedSeason} getImageUrl={getImageUrl} router={router} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "similar" && (
                  <motion.div 
                    key="similar" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-12">
                      {similar && similar.length > 0 && (
                        <div>
                          <h3 className="t-label mb-6 opacity-70">Similar Titles</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                            {similar.map((item) => (
                              <SimilarCard key={item.id} item={item} type={type} getImageUrl={getImageUrl} router={router} />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {recommendations && recommendations.length > 0 && (
                        <div>
                          <h3 className="t-label mb-6 opacity-70">Recommendations</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                            {recommendations.map((item) => (
                              <SimilarCard key={item.id} item={item} type={type} getImageUrl={getImageUrl} router={router} />
                            ))}
                          </div>
                        </div>
                      )}

                      {(!similar || similar.length === 0) && (!recommendations || recommendations.length === 0) && (
                        <div className="text-center py-12">
                          <p className="t-body opacity-50">No similar titles or recommendations found.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "reviews" && (
                  <motion.div 
                    key="reviews" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {user ? (
                      <div className="mb-12 surface p-8 rounded-[var(--radius-md)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]" />
                        <h3 className="t-label mb-6 text-white text-sm">Your Perspective</h3>
                        <div className="flex items-center gap-2 mb-6">
                          {[1,2,3,4,5].map(star => (
                            <button key={star} onClick={() => setReviewRating(star)} className="hover:scale-110 transition-transform focus:outline-none">
                              <Star className={`w-8 h-8 ${star <= reviewRating ? "text-[var(--accent)] fill-current drop-shadow-[0_0_8px_var(--accent-glow)]" : "text-white/10"}`} />
                            </button>
                          ))}
                        </div>
                        <div className="space-y-4">
                          <div className="relative group">
                            <Textarea
                              variant="bordered"
                              placeholder="Critique this film..."
                              minRows={4}
                              value={newReview}
                              onChange={(e) => setNewReview(e.target.value)}
                              disableAnimation
                              classNames={{
                                input: "text-base text-white font-['DM_Sans'] placeholder:text-[var(--text-muted)] p-0",
                                inputWrapper: "border-[var(--border-subtle)] group-hover:border-[var(--border-visible)] group-data-[focus=true]:border-[var(--accent)] bg-[#050505] rounded-[var(--radius-sm)] p-5 transition-all shadow-inner group-data-[focus=true]:shadow-[0_0_15px_rgba(229,9,26,0.1)] min-h-[140px]"
                              }}
                            />
                          </div>
                          <div className="flex justify-end pt-2">
                            <button 
                              onClick={handleAddReview} 
                              className="btn btn-primary px-10 h-12 text-sm uppercase tracking-widest font-bold" 
                              disabled={!newReview.trim()}
                            >
                              Publish Review
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-12 p-12 surface border border-[var(--border-faint)] rounded-[var(--radius-md)] text-center shadow-lg">
                        <p className="t-body mb-8 text-xl">Cinema is meant to be discussed.</p>
                        <button onClick={() => router.push("/login")} className="btn btn-primary px-10 h-14 text-sm uppercase tracking-widest font-bold">Sign In to Review</button>
                      </div>
                    )}

                    <div className="space-y-6 mt-8">
                      <div className="flex items-center justify-between border-b border-[var(--border-faint)] pb-4 mb-6">
                        <h3 className="t-label opacity-70">Community Reviews</h3>
                        <span className="t-meta bg-white/5 px-3 py-1 rounded-[var(--radius-sm)]">{reviews.length} Entries</span>
                      </div>
                      
                      {reviews.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="t-body opacity-50">Be the first to share your thoughts.</p>
                        </div>
                      ) : (
                        reviews.map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar Area (Desktop only extra info) */}
          <div className="hidden lg:block lg:col-span-1 border-l border-[var(--border-faint)] pl-12 space-y-12">
            
            {/* Status & Dates */}
            <div className="surface p-6 rounded-[var(--radius-md)] border-[var(--border-faint)] space-y-6">
              <div>
                <h4 className="t-label mb-2 text-[var(--text-muted)]">Status</h4>
                <p className="text-white font-medium">{details.status || "Released"}</p>
              </div>
              
              {(details as MovieDetails).budget > 0 && (
                <div>
                  <h4 className="t-label mb-2 text-[var(--text-muted)]">Budget</h4>
                  <p className="text-white font-medium">${((details as MovieDetails).budget / 1000000).toFixed(1)}M</p>
                </div>
              )}
              
              {(details as MovieDetails).revenue > 0 && (
                <div>
                  <h4 className="t-label mb-2 text-[var(--text-muted)]">Box Office</h4>
                  <p className="text-white font-medium">${((details as MovieDetails).revenue / 1000000).toFixed(1)}M</p>
                </div>
              )}
            </div>

            {/* Production */}
            {details.production_companies && details.production_companies.length > 0 && (
              <div>
                <h4 className="t-label mb-4 text-[var(--text-muted)]">Production</h4>
                <div className="flex flex-col gap-3">
                  {details.production_companies.slice(0, 4).map((company: any) => (
                    <div key={company.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-[var(--radius-sm)] border border-[var(--border-faint)]">
                      <div className="w-8 h-8 relative flex-shrink-0 bg-white/10 rounded overflow-hidden">
                        {company.logo_path ? (
                          <Image src={`https://image.tmdb.org/t/p/w200${company.logo_path}`} alt={company.name} fill className="object-contain p-1" />
                        ) : (
                           <FilmStrip className="absolute inset-0 m-auto w-4 h-4 text-white/30" />
                        )}
                      </div>
                      <span className="text-white/90 text-sm font-medium line-clamp-1">{company.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Languages */}
            {(details as any).spoken_languages && (details as any).spoken_languages.length > 0 && (
              <div>
                <h4 className="t-label mb-4 text-[var(--text-muted)]">Audio</h4>
                <div className="flex flex-wrap gap-2">
                  {(details as any).spoken_languages.map((lang: any) => (
                    <span key={lang.iso_639_1} className="t-meta bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-[var(--radius-sm)]">{lang.english_name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && trailerKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-lg p-4 md:p-10"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-[var(--radius-md)] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-6 right-6 z-10 btn btn-icon rounded-[var(--radius-sm)] bg-black/60 hover:bg-[var(--accent)] border border-white/20 hover:border-transparent text-white transition-all"
                onClick={() => setShowTrailer(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`}
                title="Trailer"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-components

const EpisodeCard = ({ episode, index, type, id, selectedSeason, getImageUrl, router }: any) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const stillUrl = episode.still_path ? getImageUrl(episode.still_path, "still") : "/not-found.png";
  
  const hasAired = !episode.air_date || (new Date(episode.air_date) <= new Date());

  const handleCardClick = () => {
    if (!hasAired) return;
    router.push(`/watch/${type}/${id}/${selectedSeason}/${episode.episode_number}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`surface rounded-[var(--radius-md)] overflow-hidden border-[var(--border-faint)] shadow-lg flex flex-col sm:flex-row h-auto sm:h-32 transition-all ${
        hasAired 
          ? "hover:border-[var(--accent)] hover:shadow-2xl cursor-pointer group" 
          : "opacity-50 cursor-not-allowed"
      }`}
      onClick={handleCardClick}
    >
      <div className="relative w-full sm:w-48 h-40 sm:h-full bg-[var(--bg-raised)] flex-shrink-0">
        {!imageLoaded && <div className="absolute inset-0 skeleton" />}
        <Image
          src={stillUrl}
          alt={episode.name}
          fill
          className={`object-cover transition-transform duration-700 ${hasAired ? "group-hover:scale-105" : ""}`}
          sizes="(max-width: 640px) 100vw, 192px"
          onLoad={() => setImageLoaded(true)}
        />
        {hasAired ? (
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-[var(--radius-sm)] bg-[var(--accent)]/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100 backdrop-blur-sm shadow-[0_0_20px_var(--accent-glow)]">
               <Play className="w-5 h-5 text-white fill-current ml-1" />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-12 h-12 rounded-[var(--radius-sm)] bg-white/5 border border-white/10 flex items-center justify-center text-white/50 backdrop-blur-sm">
               <CalendarBlank className="w-5 h-5" />
            </div>
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col justify-center min-w-0 bg-[var(--bg-surface)]">
        <div className="flex items-center justify-between mb-2">
          <span className="t-label text-[var(--accent)]">E{episode.episode_number}</span>
          <span className="t-meta text-[10px] opacity-50 bg-white/5 px-2 py-0.5 rounded">
            {episode.air_date ? new Date(episode.air_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "TBA"}
          </span>
        </div>
        <h3 className={`font-bold text-white text-sm md:text-base line-clamp-1 mb-1.5 transition-colors ${hasAired ? "group-hover:text-[var(--accent)]" : ""}`}>
          {episode.name}
        </h3>
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
          {episode.overview || "No overview available."}
        </p>
      </div>
    </motion.div>
  );
};

const SimilarCard = ({ item, type, getImageUrl, router }: any) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const posterUrl = item.poster_path ? getImageUrl(item.poster_path, "poster") : "/not-found.png";
  const title = item.title || item.name;

  return (
    <div 
      className="cursor-pointer group relative"
      onClick={() => router.push(`/info/${type}/${item.id}`)}
    >
      <div className="relative aspect-poster overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-faint)] group-hover:border-[var(--accent)] bg-[var(--bg-raised)] shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl">
        {!imageLoaded && <div className="absolute inset-0 skeleton" />}
        <Image
          src={posterUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-sm font-bold text-white line-clamp-2 mb-2 leading-tight">{title}</p>
            {item.vote_average > 0 && (
              <span className="rating-chip bg-black/60 px-2 py-1 rounded backdrop-blur-md border border-white/10 text-[10px]">★ {item.vote_average.toFixed(1)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewCard = ({ review }: any) => (
  <div className="surface p-6 md:p-8 rounded-[var(--radius-md)] border-[var(--border-subtle)] hover:border-[var(--border-visible)] transition-colors">
    <div className="flex items-center justify-between mb-5 border-b border-[var(--border-faint)] pb-5">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[var(--bg-overlay)] flex items-center justify-center text-[var(--text-primary)] font-bold text-lg border border-[var(--border-subtle)] shadow-inner">
          {review.userName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="font-bold text-white text-base tracking-wide">{review.userName}</h4>
          <span className="t-meta text-[11px] opacity-60">
            {review.createdAt ? new Date(review.createdAt.toMillis()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Just now'}
          </span>
        </div>
      </div>
      <div className="rating-chip bg-[var(--bg-overlay)] px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] shadow-inner text-sm">
        ★ {review.rating}
      </div>
    </div>
    <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed font-light whitespace-pre-wrap">{review.text}</p>
  </div>
);

export default InfoClient;