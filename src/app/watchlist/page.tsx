'use client';

import { useSettings } from "../../hooks/useSettings";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Calendar,
  Play,
  BookmarkX,
  Grid,
  List,
  Star
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "../../components/ToastProvider";
import { tmdbService } from "../../lib/tmdb";
import { Movie, TVShow } from "../../types/tmdb";

const WatchlistPage = () => {
  const [watchlistData, setWatchlistData] = useState<(Movie | TVShow)[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userID, setUserID] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const router = useRouter();
  const { getImageUrl } = useSettings();
  const { createToast } = useToast();

  const fetchWatchlistData = async (uid: string) => {
    try {
      setWatchlistLoading(true);
      const q = query(
        collection(db, "watchlist"),
        where("userID", "==", uid)
      );
      const querySnapshot = await getDocs(q);
      const userWatchlist: any[] = [];

      querySnapshot.forEach((doc) => {
        userWatchlist.push({ ...doc.data(), docId: doc.id });
      });

      const promises = userWatchlist.map(async (item) => {
        try {
          const data = await tmdbService.getContentDetails(item.type, parseInt(item.id));
          return { ...data, mediaType: item.type, addedAt: item.addedAt?.toDate() };
        } catch (e) {
          console.error(`Error fetching detail for ${item.type}/${item.id}`, e);
          return null;
        }
      });

      const watchlistDetails = (await Promise.all(promises)).filter(item => item !== null) as any[];
      watchlistDetails.sort((a, b) => {
        if (!a.addedAt || !b.addedAt) return 0;
        return b.addedAt.getTime() - a.addedAt.getTime();
      });
      setWatchlistData(watchlistDetails);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    } finally {
      setWatchlistLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserID(user.uid);
        fetchWatchlistData(user.uid).then(() => {
          setLoading(false);
        });
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const removeFromWatchlist = async (id: number, type: string) => {
    if (!userID) return;
    setRemovingId(id);
    try {
      const q = query(
        collection(db, "watchlist"),
        where("userID", "==", userID),
        where("id", "==", id.toString()),
        where("type", "==", type)
      );
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      createToast("Removed from watchlist", { type: "success", timeout: 2000 });
      fetchWatchlistData(userID);
    } catch (error) {
      console.error("Error removing:", error);
      createToast("Failed to remove", { type: "error", timeout: 2000 });
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pt-32 pb-12">
      <div className="container relative z-10">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-[var(--border-faint)] pb-8"
        >
          <div>
            <h1 className="t-title text-5xl mb-1 uppercase tracking-wider">My Watchlist</h1>
            <p className="t-meta uppercase opacity-50 tracking-widest">
              {watchlistData.length} {watchlistData.length === 1 ? "title" : "titles"} saved
            </p>
          </div>

          {watchlistData.length > 0 && (
            <div className="flex gap-1 p-1 bg-white/5 rounded-[var(--radius-md)] border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-[var(--radius-sm)] transition-all ${
                  viewMode === "grid"
                    ? "bg-[var(--accent)] text-white shadow-lg"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                <Grid className="w-4 h-4" />
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
          )}
        </motion.div>

        {watchlistLoading ? (
          <div className="flex justify-center py-32">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : watchlistData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-center py-32 glass-premium rounded-[var(--radius-lg)] max-w-lg mx-auto"
          >
            {/* Decorative circle */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-[var(--accent)]/10 rounded-full animate-pulse" />
              <div className="absolute inset-4 bg-[var(--accent)]/20 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BookmarkX className="w-10 h-10 text-[var(--accent)]" />
              </div>
            </div>
            
            <h2 
              className="text-white text-4xl mb-3"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
            >
              Your Watchlist is Empty
            </h2>
            <p className="t-body mb-10 max-w-sm mx-auto">
              Start building your collection by adding films and series you want to track.
            </p>
            <button
              className="btn btn-primary px-10 h-12 text-sm"
              onClick={() => router.push("/discover")}
            >
              Explore Discover
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                <AnimatePresence mode="popLayout">
                  {watchlistData.map((item: any) => {
                    const isMovie = item.mediaType === "movie";
                    const title = isMovie ? item.title : item.name;
                    const year = isMovie 
                      ? item.release_date?.split("-")[0] 
                      : item.first_air_date?.split("-")[0];

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -8 }}
                        className="group relative cursor-pointer"
                      >
                        <div className="relative aspect-poster overflow-hidden bg-[var(--bg-raised)] rounded-[var(--radius-md)] border border-[var(--border-faint)] group-hover:border-[var(--border-subtle)] transition-colors vignette">
                          <Image
                            src={getImageUrl(item.poster_path, "poster")}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            onClick={() => router.push(`/info/${item.mediaType}/${item.id}`)}
                            sizes="(max-width: 768px) 50vw, 20vw"
                          />
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <button
                                className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform"
                                onClick={() => router.push(`/watch/${item.mediaType}/${item.id}${!isMovie ? '/1/1' : ''}`)}
                              >
                                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                              </button>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromWatchlist(item.id, item.mediaType);
                              }}
                              disabled={removingId === item.id}
                              className="absolute top-2 right-2 w-8 h-8 rounded-[var(--radius-sm)] bg-black/60 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-red-500 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                            >
                              {removingId === item.id ? (
                                <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="pt-3 px-1 text-left">
                          <h3 className="text-xs font-bold line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
                            {title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="t-meta text-[10px] opacity-50">{year}</span>
                            <span className="t-meta text-[10px] opacity-20">|</span>
                            <span className="t-meta text-[10px] opacity-50 uppercase tracking-tighter">{isMovie ? "Film" : "Series"}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <AnimatePresence mode="popLayout">
                  {watchlistData.map((item: any) => {
                    const isMovie = item.mediaType === "movie";
                    const title = isMovie ? item.title : item.name;
                    const year = isMovie 
                      ? item.release_date?.split("-")[0] 
                      : item.first_air_date?.split("-")[0];

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="surface p-3 sm:p-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] hover:bg-white/5 transition-all group"
                      >
                        <div className="flex gap-4 sm:gap-6 items-center">
                          <div 
                            className="relative w-14 sm:w-20 aspect-poster rounded-[var(--radius-sm)] overflow-hidden cursor-pointer bg-[var(--bg-raised)] border border-[var(--border-faint)] flex-shrink-0"
                            onClick={() => router.push(`/info/${item.mediaType}/${item.id}`)}
                          >
                            <Image
                              src={getImageUrl(item.poster_path, "poster")}
                              alt={title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 56px, 80px"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 
                              className="text-base sm:text-lg font-bold truncate cursor-pointer hover:text-[var(--accent)] transition-colors text-white"
                              onClick={() => router.push(`/info/${item.mediaType}/${item.id}`)}
                            >
                              {title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                              <span className="t-meta text-[10px] sm:text-xs">{year}</span>
                              <span className="meta-chip py-0 text-[9px] sm:text-[10px]">{isMovie ? "Film" : "Series"}</span>
                              {item.vote_average > 0 && (
                                <span className="rating-chip text-[9px] sm:text-[10px]">★ {item.vote_average.toFixed(1)}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <button
                              onClick={() => router.push(`/watch/${item.mediaType}/${item.id}${!isMovie ? '/1/1' : ''}`)}
                              className="btn btn-icon rounded-full w-9 h-9 sm:w-10 sm:h-10"
                              aria-label="Play"
                            >
                              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
                            </button>
                            <button
                              onClick={() => removeFromWatchlist(item.id, item.mediaType)}
                              disabled={removingId === item.id}
                              className="btn btn-icon rounded-full w-9 h-9 sm:w-10 sm:h-10 hover:text-red-500 hover:bg-red-500/10"
                              aria-label="Remove"
                            >
                              {removingId === item.id ? (
                                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
