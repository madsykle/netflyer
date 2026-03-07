'use client';

import { useSettings } from "../../../../hooks/useSettings";
import { auth, db } from "../../../../lib/firebase";
import {
  Select,
  SelectItem,
  Textarea,
  Avatar,
} from "@heroui/react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Trash2,
  Plus,
  Star,
  MessageSquare,
  ThumbsUp,
  Film,
  X
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "../../../../components/ToastProvider";
import { MovieDetails, TVShowDetails, Cast, Movie, TVShow, Episode } from "../../../../types/tmdb";
import MovieRow from "../../../../components/MovieRow";
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
  const [showFullText, setShowFullText] = useState(false);
  const [imageLoaded, setImageLoaded] = useState({
    backdrop: false,
    poster: false,
  });
  
  const router = useRouter();
  const { getImageUrl } = useSettings();
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

  const isTV = type === "tv";
  const title = (details as MovieDetails).title || (details as TVShowDetails).name;
  const releaseDate = isTV 
    ? (details as TVShowDetails).first_air_date
    : (details as MovieDetails).release_date;
  const runtime = (details as MovieDetails).runtime 
    ? `${Math.floor((details as MovieDetails).runtime / 60)}h ${(details as MovieDetails).runtime % 60}m`
    : (details as TVShowDetails).episode_run_time?.[0]
    ? `${(details as TVShowDetails).episode_run_time[0]}m`
    : "";

  const [activeTab, setActiveTab] = useState<"cast" | "episodes" | "similar" | "reviews">("cast");

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
          checkWatchlist(firebaseUser.uid);
        } catch (error) {
          console.error("Error fetching user data:", error);
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
    await addDoc(collection(db, "reviews"), {
      userId: user.uid,
      userName: userName || user.displayName || "User",
      itemId: id,
      type: type,
      text: newReview,
      rating: reviewRating,
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

  const backdropUrl = getImageUrl(details.backdrop_path, "backdrop");
  const posterUrl = getImageUrl(details.poster_path, "poster");

  const tabs = ["cast", ...(isTV ? ["episodes"] : []), "similar", "reviews"];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pb-20 pt-14">
      {/* Top Section */}
      <div className="relative">
        {/* Backdrop */}
        <div className="relative w-full h-[45vw] min-h-[220px] max-h-[420px] overflow-hidden">
          <img
            src={backdropUrl}
            alt=""
            className="w-full h-full object-cover object-top transition-opacity duration-1000"
            style={{ opacity: imageLoaded.backdrop ? 0.45 : 0 }}
            onLoad={() => setImageLoaded(p => ({...p, backdrop: true}))}
          />
          {/* Gradient fades */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-base)]/60 to-transparent" />
        </div>

        {/* Content Overlap */}
        <div className="container relative -mt-24 sm:-mt-32 z-10">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-end text-center sm:text-left">
            
            {/* Poster */}
            <div className="flex-shrink-0 w-32 sm:w-40 md:w-48">
              <div className="relative aspect-[2/3] rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-subtle)] shadow-[0_20px_50px_rgba(0,0,0,0.7)] bg-[var(--bg-raised)]">
                {!imageLoaded.poster && <div className="absolute inset-0 skeleton" />}
                <img
                  src={posterUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                  onLoad={() => setImageLoaded(p => ({...p, poster: true}))}
                />
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 pb-2">
              <h1 
                className="text-white font-bold leading-tight mb-2 line-clamp-3"
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 6vw, 4rem)', letterSpacing: '0.02em' }}
              >
                {title}
              </h1>

              {details.tagline && (
                <p className="text-[var(--text-muted)] italic text-sm md:text-base mb-4 line-clamp-1 max-w-xl">
                  &quot;{details.tagline}&quot;
                </p>
              )}

              {/* Meta row */}
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-4">
                <span className="t-meta">{new Date(releaseDate).getFullYear()}</span>
                {runtime && <><span className="t-meta opacity-30">|</span><span className="t-meta">{runtime}</span></>}
                {details.vote_average > 0 && (
                  <><span className="t-meta opacity-30">|</span>
                  <span className="rating-chip">★ {details.vote_average.toFixed(1)}</span></>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {details.genres?.slice(0, 3).map((g: any) => (
                  <span key={g.id} className="genre-chip">{g.name}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="mt-12 text-left">
            <h3 className="t-label mb-4 opacity-50">Overview</h3>
            <p className="t-body max-w-3xl text-[var(--text-secondary)] text-lg leading-relaxed">
              {showFullText ? details.overview : details.overview?.slice(0, 280) + (details.overview?.length > 280 ? '...' : '')}
            </p>
            {details.overview?.length > 280 && (
              <button
                onClick={() => setShowFullText(!showFullText)}
                className="t-label text-[var(--accent)] mt-4 hover:opacity-75 transition-opacity font-bold"
              >
                {showFullText ? '↑ Show Less' : 'Read full overview →'}
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center sm:justify-start gap-4 mt-12 flex-wrap pb-12">
            <button
              onClick={() => router.push(type === 'tv' ? `/watch/tv/${id}/1/1` : `/watch/movie/${id}`)}
              className="btn btn-primary min-w-[160px] h-14 text-base"
            >
              <Play className="w-4 h-4 fill-current" />
              Play Now
            </button>

            {watchlistLoading ? (
              <div className="w-40 h-14 skeleton rounded-[var(--radius-sm)]" />
            ) : (
              <button
                onClick={handleWatchlistToggle}
                className="btn btn-secondary min-w-[160px] h-14 text-base"
              >
                {watchlist ? <><Trash2 className="w-4 h-4" /> Remove</> : <><Plus className="w-4 h-4" /> Watchlist</>}
              </button>
            )}

            {trailerKey && (
              <button 
                onClick={() => setShowTrailer(true)}
                className="btn btn-ghost text-xs uppercase tracking-[0.2em] h-14 px-8"
              >
                <Film className="w-4 h-4 mr-2.5" />
                Trailer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mt-20">
        <div className="flex gap-10 border-b border-[var(--border-faint)] overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`tab-item pb-4 ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mt-12 min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === "cast" && (
            <motion.div
              key="cast"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex overflow-x-auto gap-8 pb-10 scrollbar-hide"
            >
              {cast?.map((person) => (
                <Link
                  href={`/actor/${person.id}`}
                  key={person.id}
                  className="flex-shrink-0 group text-center w-28 sm:w-32"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-24 mx-auto rounded-full overflow-hidden mb-4 bg-[var(--bg-raised)] border border-white/5 group-hover:border-[var(--accent)] transition-colors relative shadow-2xl">
                    <Image
                      src={person.profile_path ? getImageUrl(person.profile_path, "profile") : "/placeholder-avatar.svg"}
                      alt={person.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="112px"
                    />
                  </div>
                  <p className="text-sm font-bold text-white line-clamp-1">{person.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-1.5 uppercase tracking-tighter">{person.character}</p>
                </Link>
              ))}
            </motion.div>
          )}

          {activeTab === "episodes" && isTV && (
            <motion.div
              key="episodes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pb-12"
            >
              <div className="mb-10 max-w-[240px]">
                <Select
                  label="Season"
                  selectedKeys={[String(selectedSeason)]}
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0];
                    if (val) setSelectedSeason(Number(val));
                  }}
                  variant="bordered"
                  classNames={{
                    trigger: "border-[var(--border-subtle)] hover:border-[var(--border-visible)] text-white h-14 px-4 bg-[var(--bg-surface)] rounded-[var(--radius-sm)]",
                    value: "font-bold text-sm",
                    listbox: "bg-[var(--bg-overlay)] p-2",
                    popoverContent: "bg-[var(--bg-overlay)] border border-[var(--border-visible)] shadow-2xl !opacity-100",
                  }}
                >
                  {(details as TVShowDetails).seasons
                    ?.filter(s => s.season_number > 0)
                    .map(season => (
                      <SelectItem 
                        key={String(season.season_number)}
                        textValue={`Season ${season.season_number}`}
                        classNames={{
                          base: "rounded-[var(--radius-sm)] data-[hover=true]:bg-white/5 px-3 py-3",
                          title: "font-bold text-sm text-white"
                        }}
                      >
                        Season {season.season_number}
                      </SelectItem>
                    )) || []}
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {episodes.map((episode, index) => (
                  <EpisodeCard key={episode.id} episode={episode} index={index} type={type} id={id} selectedSeason={selectedSeason} getImageUrl={getImageUrl} router={router} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "similar" && (
            <motion.div key="similar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12">
              <div className="-mx-[var(--container-padding)] space-y-16">
                <MovieRow items={similar} />
                {recommendations.length > 0 && (
                  <MovieRow items={recommendations} title="Recommendations" />
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl pb-12">
              {user ? (
                <div className="mb-12 surface p-8 rounded-[var(--radius-md)] border border-[var(--border-subtle)] shadow-xl">
                  <h3 className="t-label mb-6 text-[var(--text-primary)]">Write a review</h3>
                  <div className="flex items-center gap-2 mb-6">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => setReviewRating(star)} className="hover:scale-110 transition-transform">
                        <Star className={`w-6 h-6 ${star <= reviewRating ? "text-yellow-500 fill-current" : "text-white/10"}`} />
                      </button>
                    ))}
                  </div>
                  <div className="space-y-6">
                    <Textarea
                      variant="bordered"
                      placeholder="Share your thoughts on this title..."
                      minRows={4}
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      classNames={{
                        input: "text-base text-white font-['DM_Sans'] py-2",
                        inputWrapper: "border-[var(--border-subtle)] hover:border-[var(--border-visible)] focus-within:!border-[var(--accent)] bg-white/5 rounded-[var(--radius-sm)] p-4"
                      }}
                    />
                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={handleAddReview} 
                        className="btn btn-primary px-10 h-12 text-sm shadow-xl" 
                        disabled={!newReview.trim()}
                      >
                        Post Review
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-12 p-12 border border-[var(--border-faint)] rounded-[var(--radius-md)] text-center bg-white/2">
                  <p className="t-body mb-8 text-lg">Sign in to join the conversation.</p>
                  <button onClick={() => router.push("/login")} className="btn btn-primary px-12 h-12">Sign In</button>
                </div>
              )}

              <div className="space-y-8 mt-12">
                <h3 className="t-label mb-8 opacity-50">{reviews.length} Reviews</h3>
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && trailerKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-10"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-[var(--radius-md)] overflow-hidden shadow-2xl border border-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 z-10 btn btn-icon rounded-full bg-black/50"
                onClick={() => setShowTrailer(false)}
              >
                <X className="w-4 h-4" />
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0&controls=1`}
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

// Simple Episode Card
const EpisodeCard = ({ episode, index, type, id, selectedSeason, getImageUrl, router }: any) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const stillUrl = episode.still_path ? getImageUrl(episode.still_path, "still") : "/not-found.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="card cursor-pointer group"
      onClick={() => router.push(`/watch/${type}/${id}/${selectedSeason}/${episode.episode_number}`)}
    >
      <div className="relative aspect-video overflow-hidden bg-[var(--bg-raised)]">
        {!imageLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={stillUrl}
          alt=""
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
             <Play className="w-4 h-4 text-white fill-current ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="t-meta opacity-50">EP {episode.episode_number}</span>
          <span className="t-meta opacity-50">{episode.air_date?.split("-")[0]}</span>
        </div>
        <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
          {episode.name}
        </h3>
      </div>
    </motion.div>
  );
};

// Simple Review Card
const ReviewCard = ({ review, userUID, user }: any) => (
  <div className="surface p-6 rounded-[var(--radius-md)] border-[var(--border-subtle)]">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-full bg-[var(--bg-raised)] flex items-center justify-center text-[var(--text-muted)] font-bold text-xs border border-[var(--border-faint)] uppercase">
        {review.userName.charAt(0)}
      </div>
      <div>
        <h4 className="font-bold text-white text-xs">{review.userName}</h4>
        <div className="rating-chip text-[10px] mt-0.5">★ {review.rating}</div>
      </div>
    </div>
    <p className="t-body text-sm leading-relaxed">{review.text}</p>
  </div>
);

export default InfoClient;
