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
  const [showFullBio, setShowFullBio] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"movies" | "tv">("movies");
  const [imageLoaded, setImageLoaded] = useState(false);

  const getAge = (birthday: string | null, deathday: string | null) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    return Math.floor((end.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const sortedMovies = credits.cast
    ?.filter((item) => item.media_type === "movie")
    .sort(
      (a, b) => new Date((b as Movie).release_date || 0).getTime() - new Date((a as Movie).release_date || 0).getTime()
    );

  const sortedTvShows = credits.cast
    ?.filter((item) => item.media_type === "tv")
    .sort(
      (a, b) =>
        new Date((b as TVShow).first_air_date || 0).getTime() - new Date((a as TVShow).first_air_date || 0).getTime()
    );

  const profileUrl = actor.profile_path
    ? `https://image.tmdb.org/t/p/w400/${actor.profile_path}`
    : "/placeholder-avatar.svg";

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white pt-24 pb-12">
      <div className="container relative z-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-white transition-colors mb-8 group"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-widest uppercase text-sm">Back</span>
        </motion.button>

        {/* Actor Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 mb-16"
        >
          {/* Profile Image */}
          <div className="lg:col-span-1">
            <div className="relative w-64 md:w-80 lg:w-full mx-auto aspect-[2/3] rounded-xl overflow-hidden glass-panel">
              {!imageLoaded && (
                <div className="absolute inset-0 skeleton" />
              )}
              <Image
                src={profileUrl}
                alt={actor.name}
                fill
                priority
                className={`object-cover transition-opacity duration-700 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                sizes="(max-width: 768px) 256px, (max-width: 1024px) 320px, 400px"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-transparent opacity-80" />

              {/* Popularity Badge */}
              {actor.popularity && (
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 backdrop-blur-md rounded-full shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-bold text-yellow-400">
                    {actor.popularity.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actor Info */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            {/* Name & Department */}
            <div className="mb-8 text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="heading-1 mb-4 drop-shadow-lg"
              >
                {actor.name}
              </motion.h1>

              {actor.known_for_department && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center px-4 py-1.5 bg-[var(--color-accent-primary)]/20 border border-[var(--color-accent-primary)]/50 rounded-full"
                >
                  <span className="text-sm font-bold tracking-widest uppercase text-white drop-shadow-[0_0_8px_rgba(229,9,20,0.8)]">
                    {actor.known_for_department}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
            >
              {actor.birthday && (
                <div className="glass-panel p-5 rounded-xl text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-[var(--color-accent-primary)] mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-text-secondary)]">
                      Born
                    </span>
                  </div>
                  <p className="text-white font-medium text-lg">
                    {new Date(actor.birthday).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {getAge(actor.birthday, actor.deathday) && (
                    <p className="text-sm text-[var(--color-text-tertiary)] mt-1 font-medium">
                      {getAge(actor.birthday, actor.deathday)} years old
                    </p>
                  )}
                </div>
              )}

              {actor.deathday && (
                <div className="glass-panel p-5 rounded-xl text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-[var(--color-accent-primary)] mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-text-secondary)]">
                      Died
                    </span>
                  </div>
                  <p className="text-white font-medium text-lg">
                    {new Date(actor.deathday).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}

              {actor.place_of_birth && (
                <div className="glass-panel p-5 rounded-xl text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-[var(--color-accent-primary)] mb-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-text-secondary)]">
                      From
                    </span>
                  </div>
                  <p className="text-white font-medium text-base line-clamp-2">
                    {actor.place_of_birth}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Biography */}
            {actor.biography && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-panel rounded-xl p-6 md:p-8 flex-grow"
              >
                <h2 className="text-sm font-bold font-display uppercase tracking-widest text-[var(--color-text-tertiary)] mb-4">
                  Biography
                </h2>
                <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed font-medium">
                  {showFullBio || actor.biography.length <= 400
                    ? actor.biography
                    : `${actor.biography.substring(0, 400)}...`}
                </p>
                {actor.biography.length > 400 && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="mt-4 text-[var(--color-accent-primary)] hover:text-white font-bold text-sm uppercase tracking-wider transition-colors"
                  >
                    {showFullBio ? "Show Less" : "Read More"}
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Filmography Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="border-t border-white/10 pt-12"
        >
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
            <h2 className="heading-2 text-white">
              Filmography
            </h2>

            <div className="flex bg-white/5 backdrop-blur-md rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setSelectedTab("movies")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                  selectedTab === "movies"
                    ? "bg-[var(--color-accent-primary)] text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                    : "text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5"
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Movies</span>
                <span className={`text-xs ${selectedTab === "movies" ? "text-white/80" : "text-[var(--color-text-muted)]"}`}>
                  ({sortedMovies?.length || 0})
                </span>
              </button>
              <button
                onClick={() => setSelectedTab("tv")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                  selectedTab === "tv"
                    ? "bg-[var(--color-accent-primary)] text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                    : "text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5"
                }`}
              >
                <Tv className="w-4 h-4" />
                <span>TV</span>
                <span className={`text-xs ${selectedTab === "tv" ? "text-white/80" : "text-[var(--color-text-muted)]"}`}>
                  ({sortedTvShows?.length || 0})
                </span>
              </button>
            </div>
          </div>

          {/* Filmography Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
            >
              {(selectedTab === "movies" ? sortedMovies : sortedTvShows)
                ?.slice(0, 18)
                .map((item, index) => (
                  <motion.div
                    key={`${item.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                    className="group cursor-pointer card"
                    onClick={() =>
                      router.push(`/info/${item.media_type}/${item.id}`)
                    }
                  >
                    {/* Poster */}
                    <div className="relative aspect-[2/3] overflow-hidden bg-[var(--color-bg-tertiary)] vignette">
                      <Image
                        src={
                          item.poster_path
                            ? `https://image.tmdb.org/t/p/w342/${item.poster_path}`
                            : "/not-found.png"
                        }
                        alt={(item as any).title || (item as any).name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                      />

                      {/* Cinematic Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                      {/* Rating Badge */}
                      {item.vote_average > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs font-bold text-white">
                            {item.vote_average.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h4 className="text-sm md:text-base font-bold text-white line-clamp-1 mb-1 group-hover:text-[var(--color-accent-primary)] transition-colors">
                        {(item as any).title || (item as any).name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-tertiary)]">
                        <span>
                          {((item as any).release_date || (item as any).first_air_date)?.split(
                            "-"
                          )[0] || "TBA"}
                        </span>
                        {(item as any).character && (
                          <>
                            <span className="text-[var(--color-text-muted)]">•</span>
                            <span className="line-clamp-1 text-[var(--color-text-secondary)]">
                              {(item as any).character}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          </AnimatePresence>

          {/* Show More Indicator */}
          {((selectedTab === "movies" ? sortedMovies : sortedTvShows) || []).length >
            18 && (
            <div className="text-center mt-12">
              <p className="text-sm font-bold tracking-widest uppercase text-[var(--color-text-tertiary)] border border-white/10 rounded-full px-6 py-3 inline-block">
                Showing 18 of{" "}
                {
                  (selectedTab === "movies" ? sortedMovies : sortedTvShows)
                    ?.length
                }{" "}
                {selectedTab === "movies" ? "movies" : "TV shows"}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ActorClient;
