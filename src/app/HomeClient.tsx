'use client';

import React, { useState, useEffect } from "react";
import Row from "../components/MovieRow";
import { auth, db } from "../lib/firebase";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { tmdbService } from "../lib/tmdb";
import { Movie, TVShow } from "../types/tmdb";

interface HomeClientProps {
  trendingMovies: { results: any[] };
  trendingTV: { results: any[] };
  anime: { results: any[] };
  popular: { results: any[] };
  airingToday: { results: any[] };
}

export default function HomeClient({ 
  trendingMovies, 
  trendingTV, 
  anime, 
  popular, 
  airingToday 
}: HomeClientProps) {
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeGenre, setActiveGenre] = useState<string>("All");

  const genres = ["All", "Action", "Comedy", "Drama", "Sci-Fi", "Animation"];

  const genreMap: Record<string, number> = {
    "Action": 28,
    "Comedy": 35,
    "Drama": 18,
    "Sci-Fi": 878,
    "Animation": 16,
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, `watchHistory/${user.uid}/items`),
            orderBy("updatedAt", "desc"),
            limit(10)
          );
          const querySnapshot = await getDocs(q);
          const historyItems: any[] = [];
          
          querySnapshot.forEach((doc) => {
            historyItems.push({ ...doc.data(), docId: doc.id });
          });

          const promises = historyItems.map(async (item) => {
            try {
              const data = await tmdbService.getContentDetails(item.type, parseInt(item.contentId));
              return { ...data, mediaType: item.type, progress: item.progress };
            } catch (e) {
              return null;
            }
          });

          const results = (await Promise.all(promises)).filter(Boolean);
          setContinueWatching(results);
        } catch (error: any) {
          if (error?.code !== 'permission-denied') {
            console.error("Error fetching watch history:", error);
          }
        }
      }
      setLoadingHistory(false);
    });

    return () => unsubscribe();
  }, []);

  const filterByGenre = (items: any[]) => {
    if (!items) return [];
    if (activeGenre === "All") return items;
    const genreId = genreMap[activeGenre];
    if (!genreId) return items;
    return items.filter(item => item.genre_ids?.includes(genreId) || item.genres?.some((g: { id: number; name: string }) => g.id === genreId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
      {/* Genre Tags */}
      <div className="flex overflow-x-auto scrollbar-hide gap-3.5 mb-10 py-4 -mx-4 px-4">
        {genres.map(genre => (
          <button 
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={`chip-base ${
              activeGenre === genre 
                ? "chip-primary" 
                : "chip-secondary"
            } !text-xs !py-2.5 !px-7 whitespace-nowrap h-10`}
          >
            {genre}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {!loadingHistory && continueWatching.length > 0 && activeGenre === "All" && (
          <Row items={continueWatching} title="Continue Watching" />
        )}
        
        {filterByGenre(trendingMovies.results)?.length > 0 && (
          <Row items={filterByGenre(trendingMovies.results)} title="Trending Movies" />
        )}
        {filterByGenre(trendingTV.results)?.length > 0 && (
          <Row items={filterByGenre(trendingTV.results)} title="Trending TV" />
        )}
        {filterByGenre(anime.results)?.length > 0 && (
          <Row items={filterByGenre(anime.results)} title="Anime" />
        )}
        {filterByGenre(popular.results)?.length > 0 && (
          <Row items={filterByGenre(popular.results)} title="Popular" />
        )}
        {filterByGenre(airingToday.results)?.length > 0 && (
          <Row items={filterByGenre(airingToday.results)} title="Airing Today" />
        )}
      </div>
    </div>
  );
}