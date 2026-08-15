'use client';

import { useSettings } from "../../../../hooks/useSettings";
import { auth, db } from "../../../../lib/firebase";
import { filterText } from "../../../../lib/profanity";
import { onAuthStateChanged, User } from "firebase/auth";
import { addDoc, collection, deleteDoc, getDocs, query, where, doc, getDoc, serverTimestamp } from "firebase/firestore";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../components/ToastProvider";
import { MovieDetails, TVShowDetails, Cast, Movie, TVShow, Episode } from "../../../../types/tmdb";
import type { ArtworkResult } from "../../../../lib/artwork";
import { tmdbService } from "../../../../lib/tmdb";
import { isReleased } from "../../../../lib/release";
import InfoExperience from "../../../../components/InfoExperience";

interface InfoClientProps {
  type: "movie" | "tv";
  id: string;
  details: MovieDetails | TVShowDetails;
  cast: Cast[];
  recommendations: (Movie | TVShow)[];
  similar: (Movie | TVShow)[];
  artwork?: ArtworkResult;
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

const InfoClient = ({ type, id, details, cast, recommendations, similar, artwork }: InfoClientProps) => {
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
  const [imageLoaded, setImageLoaded] = useState({ backdrop: false, poster: false });
  const [autoPlayActive, setAutoPlayActive] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "episodes" | "similar" | "reviews">("overview");

  const router = useRouter();
  const { getImageUrl, settings } = useSettings();
  const { createToast } = useToast();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videos = await tmdbService.getVideos(type, parseInt(id));
        const trailer = videos.results?.find((video: { type: string; site: string; key: string }) => video.type === "Trailer" && video.site === "YouTube");
        if (trailer) setTrailerKey(trailer.key);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };
    fetchVideos();
  }, [type, id]);

  useEffect(() => {
    if (!settings.autoplayTrailers || settings.dataSaver || !trailerKey) return;
    const timer = setTimeout(() => setAutoPlayActive(true), 1500);
    return () => clearTimeout(timer);
  }, [trailerKey, settings.autoplayTrailers, settings.dataSaver]);

  const isTV = type === "tv";
  const title = (details as MovieDetails).title || (details as TVShowDetails).name;
  const releaseDate = isTV ? (details as TVShowDetails).first_air_date : (details as MovieDetails).release_date;
  const released = isReleased(releaseDate, details.status);
  const runtime = (details as MovieDetails).runtime
    ? `${Math.floor((details as MovieDetails).runtime / 60)}h ${(details as MovieDetails).runtime % 60}m`
    : (details as TVShowDetails).episode_run_time?.[0]
      ? `${(details as TVShowDetails).episode_run_time[0]}m`
      : "";

  const fetchReviews = useCallback(async () => {
    try {
      const snapshot = await getDocs(query(collection(db, "reviews"), where("itemId", "==", id), where("type", "==", type)));
      const data: Review[] = [];
      snapshot.forEach((reviewDoc) => data.push({ ...(reviewDoc.data() as Omit<Review, "id">), id: reviewDoc.id }));
      data.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    }
  }, [id, type]);

  const checkWatchlist = useCallback(async (userId: string) => {
    try {
      const snapshot = await getDocs(query(collection(db, "watchlist"), where("userID", "==", userId), where("id", "==", id), where("type", "==", type)));
      setWatchlist(!snapshot.empty);
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
          await checkWatchlist(firebaseUser.uid);
        } catch (error: any) {
          if (error.code !== "unavailable" && error.code !== "failed-precondition") console.error("Error fetching user data:", error);
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
      if (type !== "tv") return;
      try {
        setEpisodesLoading(true);
        const data = await tmdbService.getSeasonDetails(parseInt(id), selectedSeason);
        setEpisodes(data.episodes || []);
      } catch (error) {
        console.error("Error fetching episodes:", error);
      } finally {
        setEpisodesLoading(false);
      }
    };
    fetchEpisodes();
  }, [type, id, selectedSeason]);

  const handleAddReview = async () => {
    if (!user || !newReview.trim()) return;
    const filteredReview = filterText(newReview.trim().slice(0, 1000));
    await addDoc(collection(db, "reviews"), {
      userId: user.uid,
      userName: userName || user.displayName || "User",
      itemId: id,
      type,
      text: filteredReview,
      rating: Math.min(5, Math.max(1, Math.floor(reviewRating))),
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
      createToast("You need to be logged in.", { action: { text: "Login", callback(toast) { router.push("/login"); toast.destroy(); } }, timeout: 3000, type: "dark" });
      return;
    }
    setWatchlistLoading(true);
    try {
      const watchlistQuery = query(collection(db, "watchlist"), where("userID", "==", user.uid), where("id", "==", id), where("type", "==", type));
      if (watchlist) {
        const snapshot = await getDocs(watchlistQuery);
        await Promise.all(snapshot.docs.map((watchlistDoc) => deleteDoc(watchlistDoc.ref)));
        setWatchlist(false);
        createToast("Removed from watchlist", { type: "success", timeout: 2000 });
      } else {
        await addDoc(collection(db, "watchlist"), { type, id, userID: user.uid, title, posterPath: details.poster_path, addedAt: serverTimestamp() });
        setWatchlist(true);
        createToast("Added to watchlist", { type: "success", timeout: 2000 });
      }
    } catch (error) {
      console.error("Error updating watchlist:", error);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const posterFallbackUrl = getImageUrl(details.poster_path, "poster");
  const backdropFallbackUrl = details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : getImageUrl(details.poster_path, "backdrop");
  const [posterUrl, setPosterUrl] = useState(artwork?.poster || posterFallbackUrl);
  const [resolvedBackdropUrl, setResolvedBackdropUrl] = useState(artwork?.backdrop || backdropFallbackUrl);
  const tabs = ["overview", ...(isTV ? ["episodes"] : []), "similar", "reviews"];

  return <InfoExperience
    type={type}
    id={id}
    details={details}
    cast={cast}
    recommendations={recommendations}
    similar={similar}
    artwork={artwork}
    title={title}
    releaseDate={releaseDate}
    released={released}
    runtime={runtime}
    posterUrl={posterUrl}
    fallbackPosterUrl={posterFallbackUrl}
    backdropUrl={resolvedBackdropUrl}
    fallbackBackdropUrl={backdropFallbackUrl}
    setPosterUrl={setPosterUrl}
    setBackdropUrl={setResolvedBackdropUrl}
    imageLoaded={imageLoaded}
    setImageLoaded={setImageLoaded}
    getImageUrl={getImageUrl}
    router={router}
    trailerKey={trailerKey}
    autoPlayActive={autoPlayActive}
    showTrailer={showTrailer}
    setShowTrailer={setShowTrailer}
    settings={settings}
    watchlist={watchlist}
    watchlistLoading={watchlistLoading}
    handleWatchlistToggle={handleWatchlistToggle}
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    tabs={tabs}
    selectedSeason={selectedSeason}
    setSelectedSeason={setSelectedSeason}
    episodes={episodes}
    episodesLoading={episodesLoading}
    showSeasonMenu={showSeasonMenu}
    setShowSeasonMenu={setShowSeasonMenu}
    user={user}
    newReview={newReview}
    setNewReview={setNewReview}
    reviewRating={reviewRating}
    setReviewRating={setReviewRating}
    handleAddReview={handleAddReview}
    reviews={reviews}
  />;
};

export default InfoClient;
