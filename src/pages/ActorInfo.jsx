import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import { BACKEND_URL } from "../services/Api";
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
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ActorInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [actor, setActor] = useState(null);
  const [credits, setCredits] = useState({ cast: [], crew: [] });
  const [loading, setLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);
  const [selectedTab, setSelectedTab] = useState("movies");
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchActorDetails = async () => {
      try {
        setLoading(true);

        const actorResponse = await fetch(`${BACKEND_URL}/api/person/${id}`);
        const actorData = await actorResponse.json();
        setActor(actorData);

        const creditsResponse = await fetch(
          `${BACKEND_URL}/api/person/${id}/credits`
        );
        const creditsData = await creditsResponse.json();
        setCredits(creditsData);
      } catch (error) {
        console.error("Error fetching actor details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActorDetails();
  }, [id]);

  const getAge = (birthday, deathday) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    return Math.floor((end - birth) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const sortedMovies = credits.cast
    ?.filter((item) => item.media_type === "movie")
    .sort(
      (a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0)
    );

  const sortedTvShows = credits.cast
    ?.filter((item) => item.media_type === "tv")
    .sort(
      (a, b) =>
        new Date(b.first_air_date || 0) - new Date(a.first_air_date || 0)
    );

  if (loading) {
    return <Loading />;
  }

  const profileUrl = actor.profile_path
    ? `https://image.tmdb.org/t/p/w400/${actor.profile_path}`
    : "/not-found.png";

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-6 md:mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>

        {/* Actor Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12"
        >
          {/* Profile Image */}
          <div className="lg:col-span-1">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--color-bg-tertiary)]">
              {!imageLoaded && <div className="absolute inset-0 skeleton" />}
              <img
                src={profileUrl}
                alt={actor.name}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)]/80 via-transparent to-transparent" />

              {/* Popularity Badge */}
              {actor.popularity && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-accent-primary)]/90 backdrop-blur-sm rounded-full">
                  <Star className="w-3.5 h-3.5 text-[var(--color-bone)] fill-current" />
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {actor.popularity.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actor Info */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Name & Department */}
            <div className="mb-6">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-text-primary)] mb-3"
              >
                {actor.name}
              </motion.h1>

              {actor.known_for_department && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center px-3 py-1.5 bg-[var(--color-accent-primary)]/20 border border-[var(--color-accent-primary)]/30 rounded-full"
                >
                  <span className="text-sm font-medium text-[var(--color-bone)]">
                    {actor.known_for_department}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6"
            >
              {actor.birthday && (
                <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)]">
                  <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">
                      Born
                    </span>
                  </div>
                  <p className="text-[var(--color-text-primary)] font-medium">
                    {new Date(actor.birthday).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {getAge(actor.birthday, actor.deathday) && (
                    <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
                      Age {getAge(actor.birthday, actor.deathday)}
                    </p>
                  )}
                </div>
              )}

              {actor.deathday && (
                <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)]">
                  <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">
                      Died
                    </span>
                  </div>
                  <p className="text-[var(--color-text-primary)] font-medium">
                    {new Date(actor.deathday).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}

              {actor.place_of_birth && (
                <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)]">
                  <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">
                      From
                    </span>
                  </div>
                  <p className="text-[var(--color-text-primary)] font-medium line-clamp-2">
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
                transition={{ delay: 0.4 }}
                className="bg-[var(--color-bg-secondary)] rounded-xl p-5 md:p-6 border border-[var(--color-border)] flex-grow"
              >
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
                  Biography
                </h2>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {showFullBio || actor.biography.length <= 350
                    ? actor.biography
                    : `${actor.biography.substring(0, 350)}...`}
                </p>
                {actor.biography.length > 350 && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="mt-4 text-[var(--color-bone)] hover:text-[var(--color-bone-hover)] font-medium text-sm transition-colors"
                  >
                    {showFullBio ? "Show Less" : "Read More"}
                  </button>
                )}
              </motion.div>
            )}

            {/* Also Known As */}
            {actor.also_known_as && actor.also_known_as.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <h3 className="text-sm font-medium text-[var(--color-text-tertiary)] mb-3 uppercase tracking-wider">
                  Also Known As
                </h3>
                <div className="flex flex-wrap gap-2">
                  {actor.also_known_as.slice(0, 4).map((name, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] text-sm rounded-full border border-[var(--color-border)]"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Filmography Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="border-t border-[var(--color-border)] pt-8"
        >
          {/* Tabs */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Filmography
            </h2>

            <div className="flex bg-[var(--color-bg-secondary)] rounded-xl p-1 border border-[var(--color-border)]">
              <button
                onClick={() => setSelectedTab("movies")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTab === "movies"
                    ? "bg-[var(--color-accent-primary)] text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Film className="w-4 h-4" />
                <span className="hidden sm:inline">Movies</span>
                <span className="sm:hidden">Films</span>
                <span className="text-xs opacity-70">
                  ({sortedMovies?.length || 0})
                </span>
              </button>
              <button
                onClick={() => setSelectedTab("tv")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTab === "tv"
                    ? "bg-[var(--color-accent-primary)] text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Tv className="w-4 h-4" />
                <span>TV</span>
                <span className="text-xs opacity-70">
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
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {(selectedTab === "movies" ? sortedMovies : sortedTvShows)
                ?.slice(0, 18)
                .map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="group cursor-pointer"
                    onClick={() =>
                      navigate(`/info/${item.media_type}/${item.id}`)
                    }
                  >
                    {/* Poster */}
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[var(--color-bg-tertiary)] mb-3">
                      <img
                        src={
                          item.poster_path
                            ? `https://image.tmdb.org/t/p/w342/${item.poster_path}`
                            : "/not-found.png"
                        }
                        alt={item.title || item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Rating Badge */}
                      {item.vote_average > 0 && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-[var(--color-bg-primary)]/80 backdrop-blur-sm rounded-full">
                          <Star className="w-3 h-3 text-[var(--color-bone)] fill-current" />
                          <span className="text-xs font-medium text-[var(--color-text-primary)]">
                            {item.vote_average.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {/* Character Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex items-center gap-1 text-[var(--color-bone)] text-xs">
                          <span>View Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div>
                      <h4 className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2 mb-1 group-hover:text-[var(--color-bone)] transition-colors">
                        {item.title || item.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                        <span>
                          {(item.release_date || item.first_air_date)?.split(
                            "-"
                          )[0] || "TBA"}
                        </span>
                        {item.character && (
                          <>
                            <span>·</span>
                            <span className="line-clamp-1">
                              {item.character}
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
          {(selectedTab === "movies" ? sortedMovies : sortedTvShows)?.length >
            18 && (
            <div className="text-center mt-8">
              <p className="text-sm text-[var(--color-text-tertiary)]">
                Showing 18 of{" "}
                {
                  (selectedTab === "movies" ? sortedMovies : sortedTvShows)
                    .length
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

export default ActorInfo;
