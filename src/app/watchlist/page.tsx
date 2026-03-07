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
  List
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
      // sort by recently added
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
      
      createToast("Removed from watchlist", {
        type: "success",
        timeout: 2000,
      });
      fetchWatchlistData(userID);
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      createToast("Failed to remove", { type: "error", timeout: 2000 });
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] text-white pt-24">
        <div className="container px-6 py-12">
          <div className="w-12 h-12 border-4 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white pt-24 pb-12">
      <div className="container relative z-10 max-w-7xl mx-auto px-4">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/10 pb-6"
        >
          <div>
            <h1 className="heading-1 mb-2">My Watchlist</h1>
            <p className="text-[var(--color-text-secondary)] font-medium">
              {watchlistData.length} {watchlistData.length === 1 ? "title" : "titles"} saved
            </p>
          </div>

          {watchlistData.length > 0 && (
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-[var(--color-accent-primary)] text-white shadow-lg"
                    : "text-[var(--color-text-tertiary)] hover:text-white"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-[var(--color-accent-primary)] text-white shadow-lg"
                    : "text-[var(--color-text-tertiary)] hover:text-white"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          )}
        </motion.div>

        {watchlistLoading ? (
          <div className="flex justify-center py-32">
            <div className="w-12 h-12 border-4 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : watchlistData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 glass-panel rounded-2xl max-w-2xl mx-auto border-white/5"
          >
            <BookmarkX className="w-16 h-16 text-[var(--color-text-tertiary)] mx-auto mb-6" />
            <h2 className="heading-2 mb-3">Your watchlist is empty</h2>
            <p className="text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto text-lg">
              Start adding movies and TV shows to your watchlist to keep track of what you want to watch.
            </p>
            <button
              className="btn btn-primary px-8 py-4"
              onClick={() => router.push("/discover")}
            >
              Discover Content
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
                    const releaseYear = isMovie 
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
                        <div className="relative aspect-poster overflow-hidden bg-[var(--color-bg-tertiary)] rounded-xl border border-[var(--color-border-subtle)] group-hover:border-[var(--color-border-strong)] transition-colors vignette">
                          <Image
                            src={getImageUrl(item.poster_path, "poster")}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            onClick={() => router.push(`/info/${item.mediaType}/${item.id}`)}
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <button
                              className="w-12 h-12 rounded-full bg-[var(--color-accent-primary)] flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-all duration-300"
                              onClick={() => router.push(`/watch/${item.mediaType}/${item.id}${!isMovie ? '/1/1' : ''}`)}
                            >
                              <Play className="w-5 h-5 text-white ml-1 fill-current" />
                            </button>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromWatchlist(item.id, item.mediaType);
                            }}
                            disabled={removingId === item.id}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-red-500 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="pt-3 px-1">
                          <h3 className="text-sm font-bold line-clamp-1 group-hover:text-[var(--color-accent-primary)] transition-colors">
                            {title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs font-mono text-[var(--color-text-tertiary)]">
                            <span>{releaseYear}</span>
                            <span>·</span>
                            <span>{isMovie ? "Movie" : "TV"}</span>
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
                    const releaseYear = isMovie 
                      ? item.release_date?.split("-")[0] 
                      : item.first_air_date?.split("-")[0];

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-row gap-6 p-4 rounded-xl glass-panel border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] transition-all group"
                      >
                        <div 
                          className="w-20 md:w-28 flex-shrink-0 aspect-poster rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => router.push(`/info/${item.mediaType}/${item.id}`)}
                        >
                          <Image
                            src={getImageUrl(item.poster_path, "poster")}
                            alt={title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 80px, 112px"
                          />
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 
                            className="text-lg md:text-xl font-bold mb-2 cursor-pointer hover:text-[var(--color-accent-primary)] transition-colors"
                            onClick={() => router.push(`/info/${item.mediaType}/${item.id}`)}
                          >
                            {title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)] mb-2">
                            <span className="font-mono">{releaseYear}</span>
                            <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-bold tracking-widest uppercase">
                              {isMovie ? "Movie" : "TV Series"}
                            </span>
                          </div>
                          {item.addedAt && (
                            <p className="text-xs text-[var(--color-text-tertiary)]">
                              Added: {item.addedAt.toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col justify-center gap-3 pr-2">
                          <button
                            onClick={() => router.push(`/watch/${item.mediaType}/${item.id}${!isMovie ? '/1/1' : ''}`)}
                            className="w-10 h-10 rounded-full bg-[var(--color-accent-primary)] flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg"
                          >
                            <Play className="w-4 h-4 fill-current ml-1" />
                          </button>
                          <button
                            onClick={() => removeFromWatchlist(item.id, item.mediaType)}
                            disabled={removingId === item.id}
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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