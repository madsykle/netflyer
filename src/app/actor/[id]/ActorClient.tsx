'use client';

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Star,
  Film,
  Tv,
  ChevronRight,
} from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PersonDetails, Movie, TVShow } from "../../../types/tmdb";

interface ActorClientProps {
  actor: PersonDetails;
  credits: { cast: (Movie | TVShow & { media_type: string })[]; crew: any[] };
}

const ActorClient = ({ actor, credits }: ActorClientProps) => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"movies" | "tv">("movies");
  const [imageLoaded, setImageLoaded] = useState(false);

  const profileUrl = actor.profile_path
    ? `https://image.tmdb.org/t/p/h632/${actor.profile_path}`
    : "/placeholder-avatar.svg";

  const movies = credits.cast
    .filter((c) => c.media_type === "movie")
    .sort((a, b) => (b as Movie).popularity - (a as Movie).popularity);
  
  const tvShows = credits.cast
    .filter((c) => c.media_type === "tv")
    .sort((a, b) => (b as TVShow).popularity - (a as TVShow).popularity);

  const displayedCredits = selectedTab === "movies" ? movies : tvShows;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pt-32 pb-20">
      <div className="container">
        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 t-label text-[var(--text-muted)] hover:text-white transition-colors mb-10 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Left Column: Profile */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full aspect-[2/3] rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-subtle)] shadow-[0_20px_50px_rgba(0,0,0,0.7)] bg-[var(--bg-raised)] mb-8"
            >
              <Image
                src={profileUrl}
                alt={actor.name}
                fill
                priority
                className={`object-cover transition-opacity duration-700 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                sizes="(max-width: 1024px) 100vw, 400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
            </motion.div>

            <div className="space-y-6">
              <div>
                <h3 className="t-label text-[10px] mb-2 opacity-50">Known For</h3>
                <p className="t-body text-sm text-white font-medium">{actor.known_for_department}</p>
              </div>
              
              {actor.birthday && (
                <div>
                  <h3 className="t-label text-[10px] mb-2 opacity-50">Born</h3>
                  <p className="t-body text-sm text-white font-medium">
                    {new Date(actor.birthday).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              )}

              {actor.place_of_birth && (
                <div>
                  <h3 className="t-label text-[10px] mb-2 opacity-50">Birthplace</h3>
                  <p className="t-body text-sm text-white font-medium">{actor.place_of_birth}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Bio & Credits */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 
                className="text-white font-bold leading-tight mb-6"
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem, 8vw, 5rem)', letterSpacing: '0.02em' }}
              >
                {actor.name}
              </h1>

              {actor.biography && (
                <div className="mb-12">
                  <h3 className="t-label mb-4">Biography</h3>
                  <p className="t-body text-[var(--text-secondary)] leading-relaxed max-w-4xl">
                    {actor.biography}
                  </p>
                </div>
              )}

              {/* Credits Tabs */}
              <div className="mb-10">
                <div className="flex gap-8 border-b border-[var(--border-faint)] mb-8">
                  <button
                    onClick={() => setSelectedTab("movies")}
                    className={`tab-item ${selectedTab === "movies" ? "active" : ""}`}
                  >
                    Films ({movies.length})
                  </button>
                  <button
                    onClick={() => setSelectedTab("tv")}
                    className={`tab-item ${selectedTab === "tv" ? "active" : ""}`}
                  >
                    Series ({tvShows.length})
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                  <AnimatePresence mode="wait">
                    {displayedCredits.slice(0, 20).map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.03 }}
                        whileHover={{ y: -6 }}
                        className="group cursor-pointer"
                        onClick={() => router.push(`/info/${selectedTab}/${item.id}`)}
                      >
                        <div className="relative aspect-poster rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-faint)] group-hover:border-[var(--border-subtle)] transition-all bg-[var(--bg-raised)] mb-3">
                          <Image
                            src={item.poster_path ? `https://image.tmdb.org/t/p/w342/${item.poster_path}` : "/not-found.png"}
                            alt={""}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 768px) 50vw, 200px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[var(--accent)] transition-colors mb-1">
                          {(item as any).title || (item as any).name}
                        </h4>
                        <p className="t-meta text-[10px] opacity-50 uppercase">
                          {((item as any).release_date || (item as any).first_air_date)?.split('-')[0]}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActorClient;
