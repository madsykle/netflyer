'use client';

import { useSettings } from "../../../../hooks/useSettings";
import { auth, db } from "../../../../lib/firebase";
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
  Calendar,
  MessageSquare,
  ThumbsUp,
  Clock,
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
  createdAt: any; // Firestore Timestamp
  updatedAt: any;
}

const InfoClient = ({ type, id, details, cast, recommendations, similar }: InfoClientProps) => {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [expandedOverview, setExpandedOverview] = useState<Record<number, boolean>>({});
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState("");
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [watchlist, setWatchlist] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
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
        if (trailer) {
          setTrailerKey(trailer.key);
        }
      } catch (e) {
        console.error("Error fetching videos:", e);
      }
    };
    fetchVideos();
  }, [type, id]);

  const isTV = type === "tv";
  const title = (details as MovieDetails).title || (details as TVShowDetails).name;
  const releaseYear = isTV 
    ? (details as TVShowDetails).first_air_date?.split("-")[0] 
    : (details as MovieDetails).release_date?.split("-")[0];
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
      // Sort by newest
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
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().username);
          }
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
    createToast("Review posted successfully", {
      type: "success",
      timeout: 2000,
    });
  };

  const handleLikeReview = async (reviewId: string) => {
    if (!user) return;
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      const reviewSnap = await getDoc(reviewRef);
      if (!reviewSnap.exists()) return;

      const reviewData = reviewSnap.data();
      const currentLikes = Array.isArray(reviewData.likes) ? reviewData.likes : [];

      if (!currentLikes.includes(user.uid)) {
        await updateDoc(reviewRef, {
          likes: [...currentLikes, user.uid],
          likeCount: (reviewData.likeCount || 0) + 1,
          updatedAt: serverTimestamp(),
        });
        fetchReviews();
      }
    } catch (error) {
      console.error("Error liking review:", error);
    }
  };

  const handleUnlikeReview = async (reviewId: string) => {
    if (!user) return;
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      const reviewSnap = await getDoc(reviewRef);
      if (!reviewSnap.exists()) return;

      const reviewData = reviewSnap.data();
      const currentLikes = Array.isArray(reviewData.likes) ? reviewData.likes : [];

      if (currentLikes.includes(user.uid)) {
        await updateDoc(reviewRef, {
          likes: currentLikes.filter((uid: string) => uid !== user.uid),
          likeCount: Math.max((reviewData.likeCount || 1) - 1, 0),
          updatedAt: serverTimestamp(),
        });
        fetchReviews();
      }
    } catch (error) {
      console.error("Error unliking review:", error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      await deleteDoc(doc(db, "reviews", reviewId));
      fetchReviews();
      createToast("Review deleted", { type: "success", timeout: 2000 });
    }
  };

  const addToWatchList = async () => {
    if (!user) {
      createToast("You need to be logged in to use this feature.", {
        action: {
          text: "Login",
          callback(toast) {
            router.push("/login");
            toast.destroy();
          },
        },
        timeout: 3000,
        type: "dark",
      });
      return;
    }
    setWatchlistLoading(true);
    await addDoc(collection(db, "watchlist"), {
      type: type,
      id: id,
      userID: user.uid,
      title: title,
      posterPath: details.poster_path,
      addedAt: serverTimestamp(),
    });
    setWatchlist(true);
    setWatchlistLoading(false);
    createToast("Added to watchlist", { type: "success", timeout: 2000 });
  };

  const removeFromWatchlist = async () => {
    if (!user) return;
    setWatchlistLoading(true);
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
      console.error("Error removing from watchlist:", error);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const toggleOverview = (episodeId: number) => {
    setExpandedOverview((prevState) => ({
      ...prevState,
      [episodeId]: !prevState[episodeId],
    }));
  };

  const backdropUrl = getImageUrl(details.backdrop_path, "backdrop");
  const posterUrl = getImageUrl(details.poster_path, "poster");

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white pb-20">
      {/* Top Section */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden w-full flex justify-center items-end pb-8">
        {!imageLoaded.backdrop && (
          <div className="absolute inset-0 bg-[var(--color-bg-tertiary)] skeleton" />
        )}
        <Image
          src={backdropUrl}
          alt="Backdrop"
          fill
          priority
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            imageLoaded.backdrop ? "opacity-30" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded((prev) => ({ ...prev, backdrop: true }))}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/80 to-transparent"></div>
      </div>

      <div className="container relative z-10 -mt-[15vh] md:-mt-[20vh] px-6">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center md:items-start">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-shrink-0"
          >
            <div className="relative w-48 md:w-64 lg:w-72 aspect-poster rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group bg-[var(--color-bg-tertiary)]">
              {!imageLoaded.poster && (
                <div className="absolute inset-0 skeleton" />
              )}
              <Image
                src={posterUrl}
                alt="Poster"
                fill
                className={`object-cover transition-all duration-700 ${
                  imageLoaded.poster ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded((prev) => ({ ...prev, poster: true }))}
                sizes="(max-width: 768px) 192px, (max-width: 1024px) 256px, 288px"
              />
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 text-center md:text-left pt-2 md:pt-10"
          >
            <h1 className="heading-1 mb-2 drop-shadow-md">{title}</h1>
            
            {details.tagline && (
              <p className="text-[var(--color-text-secondary)] italic text-lg mb-6 font-serif">
                &quot;{details.tagline}&quot;
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
              {releaseYear && (
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono tracking-widest">
                  {releaseYear}
                </span>
              )}
              {details.vote_average > 0 && (
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold tracking-widest">
                  <Star className="w-3 h-3 fill-current" />
                  {details.vote_average.toFixed(1)}
                </span>
              )}
              {runtime && (
                <span className="flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono tracking-widest">
                  <Clock className="w-3 h-3" />
                  {runtime}
                </span>
              )}
              {details.genres?.slice(0,3).map(g => (
                <span key={g.id} className="px-3 py-1 bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20 rounded-full text-xs font-bold tracking-widest uppercase">
                  {g.name}
                </span>
              ))}
            </div>

            <p className="text-base md:text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-3xl mb-8">
              {details.overview}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <button
                onClick={() => {
                  if (type === "tv") {
                    router.push(`/watch/${type}/${id}/${selectedSeason}/1`);
                  } else {
                    router.push(`/watch/${type}/${id}`);
                  }
                }}
                className="btn btn-primary px-8 py-4 text-sm"
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                Play Now
              </button>

              {watchlistLoading ? (
                <div className="w-40 h-[52px] bg-white/5 animate-pulse rounded-lg border border-white/10" />
              ) : watchlist ? (
                <button
                  onClick={removeFromWatchlist}
                  className="btn btn-secondary px-6 py-4 text-sm text-[var(--color-text-secondary)]"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </button>
              ) : (
                <button
                  onClick={addToWatchList}
                  className="btn btn-secondary px-6 py-4 text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Watchlist
                </button>
              )}

              {/* Trailer button */}
              {trailerKey && (
                <button 
                  onClick={() => setShowTrailer(true)}
                  className="btn btn-ghost px-6 py-4 text-sm uppercase tracking-widest"
                >
                  <Film className="w-4 h-4 mr-2" />
                  Trailer
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Tabs Navigation */}
        <div className="mt-20 border-b border-white/10 flex overflow-x-auto scrollbar-hide">
          {["cast", ...(isTV ? ["episodes"] : []), "similar", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-4 text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-colors relative ${
                activeTab === tab ? "text-white" : "text-[var(--color-text-secondary)] hover:text-white"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="infoTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent-primary)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-12 min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {activeTab === "cast" && (
              <motion.div
                key="cast"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide"
              >
                {cast?.length === 0 ? (
                  <p className="text-[var(--color-text-tertiary)]">No cast information available.</p>
                ) : (
                  cast?.map((person) => (
                    <Link
                      href={`/actor/${person.id}`}
                      key={person.id}
                      className="flex-shrink-0 group text-center w-28"
                    >
                      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-3 bg-[var(--color-bg-tertiary)] border border-white/10 group-hover:border-[var(--color-accent-primary)] transition-colors relative">
                        <Image
                          src={person.profile_path ? getImageUrl(person.profile_path, "profile") : "/placeholder-avatar.svg"}
                          alt={person.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="96px"
                        />
                      </div>
                      <p className="text-sm font-bold text-white line-clamp-1">{person.name}</p>
                      <p className="text-xs text-[var(--color-text-tertiary)] line-clamp-2 mt-1">{person.character}</p>
                    </Link>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === "episodes" && isTV && (
              <motion.div
                key="episodes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-8 max-w-xs">
                  <Select
                    selectedKeys={[String(selectedSeason)]}
                    onSelectionChange={(keys) => {
                      const val = Array.from(keys)[0];
                      setSelectedSeason(Number(val));
                    }}
                    className="w-full"
                    variant="bordered"
                    aria-label="Select Season"
                  >
                    {(details as TVShowDetails).seasons
                      ?.filter(s => s.season_number > 0)
                      .map(season => (
                        <SelectItem key={String(season.season_number)}>
                          Season {season.season_number}
                        </SelectItem>
                      )) || []}
                  </Select>
                </div>

                {episodesLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : episodes.length === 0 ? (
                  <p className="text-[var(--color-text-tertiary)]">No episodes found.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {episodes.map((episode, index) => (
                      <EpisodeCard
                        key={episode.id}
                        episode={episode}
                        index={index}
                        type={type}
                        id={id}
                        selectedSeason={selectedSeason}
                        expandedOverview={expandedOverview}
                        toggleOverview={toggleOverview}
                        getImageUrl={getImageUrl}
                        router={router}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "similar" && (
              <motion.div
                key="similar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="-mt-12">
                  <MovieRow items={similar} />
                  {recommendations.length > 0 && (
                    <>
                      <h3 className="heading-3 mt-12 mb-[-30px]">Recommendations</h3>
                      <MovieRow items={recommendations} />
                    </>
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
                className="max-w-4xl"
              >
                {user ? (
                  <div className="mb-12 glass-panel p-6 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none">
                          <Star className={`w-6 h-6 ${star <= reviewRating ? "text-[var(--color-accent-primary)] fill-current" : "text-white/20"}`} />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      variant="bordered"
                      placeholder="Write your review here..."
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      className="mb-4"
                      minRows={3}
                      classNames={{
                        input: "text-base text-white",
                        inputWrapper: "border-white/10 hover:border-white/30 focus-within:!border-[var(--color-accent-primary)]"
                      }}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleAddReview}
                        className="btn btn-primary px-6"
                        disabled={!newReview.trim()}
                      >
                        Post Review
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-12 p-8 border border-white/10 rounded-xl text-center">
                    <MessageSquare className="w-10 h-10 text-[var(--color-text-tertiary)] mx-auto mb-4" />
                    <p className="text-[var(--color-text-secondary)] mb-6">Sign in to write a review.</p>
                    <button onClick={() => router.push("/login")} className="btn btn-secondary px-8">
                      Sign In
                    </button>
                  </div>
                )}

                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <p className="text-[var(--color-text-tertiary)]">No reviews yet. Be the first!</p>
                  ) : (
                    <AnimatePresence>
                      {reviews.map((review) => (
                        <ReviewCard
                          key={review.id}
                          review={review}
                          userUID={user?.uid || ""}
                          user={!!user}
                          onDelete={handleDeleteReview}
                          onLike={handleLikeReview}
                          onUnlike={handleUnlikeReview}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showTrailer && trailerKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-10"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors border border-white/10"
                onClick={() => setShowTrailer(false)}
              >
                <X className="w-5 h-5" />
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

// Episode Card Component
interface EpisodeCardProps {
  episode: Episode;
  index: number;
  type: string;
  id: string;
  selectedSeason: number;
  expandedOverview: Record<number, boolean>;
  toggleOverview: (id: number) => void;
  getImageUrl: (path: string | null, size: "poster" | "backdrop" | "profile" | "still") => string;
  router: any;
}

const EpisodeCard = ({
  episode,
  index,
  type,
  id,
  selectedSeason,
  expandedOverview,
  toggleOverview,
  getImageUrl,
  router
}: EpisodeCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const stillUrl = episode.still_path ? getImageUrl(episode.still_path, "still") : "/not-found.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="card border border-white/5 group cursor-pointer"
      onClick={() => router.push(`/watch/${type}/${id}/${selectedSeason}/${episode.episode_number}`)}
    >
      <div className="relative overflow-hidden aspect-video vignette bg-[var(--color-bg-tertiary)]">
        {!imageLoaded && <div className="absolute inset-0 skeleton" />}
        <Image
          src={stillUrl}
          alt={episode.name}
          fill
          className={`object-cover transition-transform duration-700 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[var(--color-accent-primary)] text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-all duration-300">
             <Play className="w-5 h-5 ml-1 fill-current" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[var(--color-text-tertiary)] font-mono text-xs">E{episode.episode_number}</span>
          <span className="text-[var(--color-text-tertiary)] font-mono text-xs">{episode.air_date?.split("-")[0]}</span>
        </div>
        <h3 className="font-bold text-white line-clamp-1 mb-2 group-hover:text-[var(--color-accent-primary)] transition-colors">
          {episode.name}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">
          {expandedOverview[episode.id] ? episode.overview : `${episode.overview.substring(0, 100)}${episode.overview.length > 100 ? '...' : ''}`}
        </p>
        {episode.overview.length > 100 && (
          <button
            className="text-[var(--color-accent-primary)] text-xs font-bold uppercase tracking-wider mt-2 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toggleOverview(episode.id);
            }}
          >
            {expandedOverview[episode.id] ? "Less" : "More"}
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Review Card Component
interface ReviewCardProps {
  review: Review;
  userUID: string;
  user: boolean;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
  onUnlike: (id: string) => void;
}

const ReviewCard = React.memo(({ review, userUID, user, onDelete, onLike, onUnlike }: ReviewCardProps) => {
  const isLiked = review.likes.includes(userUID);
  const isOwner = review.userId === userUID;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass-panel p-6 rounded-xl border border-white/5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-[var(--color-text-secondary)] font-bold font-display uppercase border border-white/10">
            {review.userName.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">{review.userName}</h4>
            <div className="flex items-center mt-1">
              {[1,2,3,4,5].map(star => (
                <Star key={star} className={`w-3 h-3 ${star <= (review.rating || 5) ? "text-[var(--color-accent-primary)] fill-current" : "text-white/20"}`} />
              ))}
            </div>
          </div>
        </div>
        {isOwner && (
          <button onClick={() => onDelete(review.id)} className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-4">
        {review.text}
      </p>
      <div className="flex items-center">
        <button
          onClick={() => user ? (isLiked ? onUnlike(review.id) : onLike(review.id)) : null}
          disabled={!user}
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${
            isLiked ? "text-[var(--color-accent-primary)]" : "text-[var(--color-text-tertiary)] hover:text-white"
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          {review.likes?.length || 0}
        </button>
      </div>
    </motion.div>
  );
});
ReviewCard.displayName = "ReviewCard";

export default InfoClient;