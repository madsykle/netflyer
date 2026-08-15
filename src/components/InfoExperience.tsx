'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CalendarBlank,
  CaretDown,
  Check,
  FilmStrip,
  Play,
  Plus,
  Star,
  X,
} from "@phosphor-icons/react";
import { Textarea } from "./ui";
import type { MovieDetails, TVShowDetails, Cast, Movie, TVShow, Episode, Season } from "../types/tmdb";
import type { ArtworkResult } from "../lib/artwork";

interface Review {
  id: string;
  userName: string;
  text: string;
  rating: number;
  createdAt: any;
}

type ContentDetails = MovieDetails | TVShowDetails;
type Recommendation = Movie | TVShow;

type InfoExperienceProps = {
  type: "movie" | "tv";
  id: string;
  details: ContentDetails;
  cast: Cast[];
  recommendations: Recommendation[];
  similar: Recommendation[];
  artwork?: ArtworkResult;
  title: string;
  releaseDate: string;
  released: boolean;
  runtime: string;
  posterUrl: string;
  fallbackPosterUrl: string;
  backdropUrl: string;
  fallbackBackdropUrl: string;
  setPosterUrl: React.Dispatch<React.SetStateAction<string>>;
  setBackdropUrl: React.Dispatch<React.SetStateAction<string>>;
  imageLoaded: { backdrop: boolean; poster: boolean };
  setImageLoaded: React.Dispatch<React.SetStateAction<{ backdrop: boolean; poster: boolean }>>;
  getImageUrl: (path: string | null | undefined, kind?: "poster" | "backdrop" | "profile" | "still") => string;
  router: { push: (href: string) => void; back: () => void };
  trailerKey: string | null;
  autoPlayActive: boolean;
  showTrailer: boolean;
  setShowTrailer: React.Dispatch<React.SetStateAction<boolean>>;
  settings: { dataSaver?: boolean };
  watchlist: boolean;
  watchlistLoading: boolean;
  handleWatchlistToggle: () => void;
  activeTab: "overview" | "episodes" | "similar" | "reviews";
  setActiveTab: React.Dispatch<React.SetStateAction<"overview" | "episodes" | "similar" | "reviews">>;
  tabs: string[];
  selectedSeason: number;
  setSelectedSeason: React.Dispatch<React.SetStateAction<number>>;
  episodes: Episode[];
  episodesLoading: boolean;
  showSeasonMenu: boolean;
  setShowSeasonMenu: React.Dispatch<React.SetStateAction<boolean>>;
  user: { displayName?: string | null; email?: string | null } | null;
  newReview: string;
  setNewReview: React.Dispatch<React.SetStateAction<string>>;
  reviewRating: number;
  setReviewRating: React.Dispatch<React.SetStateAction<number>>;
  handleAddReview: () => void;
  reviews: Review[];
};

const ease = [0.16, 1, 0.3, 1] as const;

export default function InfoExperience({
  type,
  id,
  details,
  cast,
  recommendations,
  similar,
  title,
  releaseDate,
  released,
  runtime,
  posterUrl,
  fallbackPosterUrl,
  backdropUrl,
  fallbackBackdropUrl,
  setPosterUrl,
  setBackdropUrl,
  imageLoaded,
  setImageLoaded,
  getImageUrl,
  router,
  trailerKey,
  autoPlayActive,
  showTrailer,
  setShowTrailer,
  settings,
  watchlist,
  watchlistLoading,
  handleWatchlistToggle,
  activeTab,
  setActiveTab,
  tabs,
  selectedSeason,
  setSelectedSeason,
  episodes,
  episodesLoading,
  showSeasonMenu,
  setShowSeasonMenu,
  user,
  newReview,
  setNewReview,
  reviewRating,
  setReviewRating,
  handleAddReview,
  reviews,
}: InfoExperienceProps) {
  const isTV = type === "tv";
  const seasons = isTV ? (details as TVShowDetails).seasons?.filter((season) => season.season_number > 0) ?? [] : [];
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const genres = details.genres?.slice(0, 4) ?? [];

  return (
    <main className="info-experience min-h-screen bg-[#08090b] text-[var(--text-primary)] pb-24">
      <section className="relative isolate overflow-hidden border-b border-white/[0.07]">
        <div className="absolute inset-0 -z-20 bg-[#08090b]" />
        <Image
          src={backdropUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-center opacity-0 scale-105 transition-all duration-1000"
          style={{ opacity: imageLoaded.backdrop ? 0.42 : 0, transform: imageLoaded.backdrop ? "scale(1)" : "scale(1.05)" }}
          onLoad={() => setImageLoaded((previous) => ({ ...previous, backdrop: true }))}
          onError={() => setBackdropUrl(fallbackBackdropUrl)}
        />
        {autoPlayActive && trailerKey && (
          <div className="absolute inset-0 -z-10 overflow-hidden bg-black/40">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&rel=0&modestbranding=1`}
              title="Trailer preview"
              className="h-full w-full scale-[1.08] border-0 opacity-35"
              allow="autoplay; encrypted-media"
            />
          </div>
        )}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#08090b_0%,rgba(8,9,11,.88)_35%,rgba(8,9,11,.34)_72%,#08090b_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-[#08090b] via-[#08090b]/80 to-transparent" />

        <div className="container pt-24 sm:pt-28 lg:pt-36 pb-12 lg:pb-16">
          <button
            onClick={() => router.back()}
            className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3.5 py-2 text-xs font-semibold text-white/70 backdrop-blur-xl transition hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to browsing
          </button>

          <div className="grid items-end gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease }} className="relative mx-auto w-44 sm:w-52 lg:mx-0 lg:w-[220px]">
              <div className="relative aspect-[2/3] overflow-hidden rounded-[24px] border border-white/15 bg-[#15171a] shadow-[0_28px_80px_rgba(0,0,0,.55)]">
                {!imageLoaded.poster && <div className="absolute inset-0 skeleton" />}
                <Image
                  src={posterUrl}
                  alt={title}
                  fill
                  priority
                  sizes="220px"
                  className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                  onLoad={() => setImageLoaded((previous) => ({ ...previous, poster: true }))}
                  onError={() => setPosterUrl(fallbackPosterUrl)}
                />
              </div>
              <div className="absolute -bottom-3 left-4 rounded-full border border-white/15 bg-[#121418]/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 shadow-xl backdrop-blur-xl">
                {isTV ? "Series" : "Film"}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.08, ease }} className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                <span>{isTV ? "Television" : "Feature film"}</span>
                {details.status && <><span className="text-white/20">/</span><span className={released ? "text-emerald-300/80" : "text-amber-300/80"}>{details.status}</span></>}
              </div>
              <h1 className="t-hero max-w-5xl text-[clamp(3rem,8vw,7.75rem)] text-white">{title}</h1>
              {details.tagline && <p className="mt-5 max-w-2xl text-lg font-light italic leading-relaxed text-white/65 sm:text-xl">“{details.tagline}”</p>}

              <div className="mt-7 flex flex-wrap items-center gap-2.5 text-sm">
                {year && <span className="rounded-full bg-white/10 px-3 py-1.5 font-mono text-xs text-white/80">{year}</span>}
                {runtime && <span className="rounded-full bg-white/10 px-3 py-1.5 font-mono text-xs text-white/80">{runtime}</span>}
                {details.vote_average > 0 && <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-200/10 px-3 py-1.5 font-mono text-xs text-amber-200"><Star className="h-3.5 w-3.5 fill-current" />{details.vote_average.toFixed(1)}</span>}
                {settings.dataSaver && <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1.5 text-xs text-sky-200">Data saver</span>}
                {genres.map((genre) => <span key={genre.id} className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/60">{genre.name}</span>)}
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                {released ? (
                  <button onClick={() => router.push(isTV ? `/watch/tv/${id}/1/1` : `/watch/movie/${id}`)} className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-black shadow-[0_12px_35px_rgba(255,255,255,.14)] transition hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0">
                    <Play className="h-4 w-4 fill-current" /> Watch now
                  </button>
                ) : (
                  <div>
                    <button disabled className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-6 text-sm font-bold text-white/40"><CalendarBlank className="h-4 w-4" /> Not released</button>
                    {releaseDate && <p className="mt-2 text-xs text-white/45">Expected {new Date(releaseDate).toLocaleDateString(undefined, { dateStyle: "long" })}</p>}
                  </div>
                )}
                <button onClick={handleWatchlistToggle} disabled={watchlistLoading} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.14] active:translate-y-0 disabled:opacity-50">
                  {watchlist ? <Check className="h-4 w-4 text-emerald-300" /> : <Plus className="h-4 w-4" />}{watchlist ? "In watchlist" : "Add to watchlist"}
                </button>
                {trailerKey && <button onClick={() => setShowTrailer(true)} className="inline-flex h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"><FilmStrip className="h-4 w-4" /> Trailer</button>}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container">
        <nav className="sticky top-[68px] z-30 -mx-4 mb-12 border-b border-white/[0.08] bg-[#08090b]/80 px-4 backdrop-blur-2xl sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12" aria-label="Title sections">
          <div className="flex gap-7 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const active = activeTab === tab;
              return <button key={tab} onClick={() => setActiveTab(tab as typeof activeTab)} className={`relative min-h-14 whitespace-nowrap text-xs font-bold uppercase tracking-[0.16em] transition ${active ? "text-white" : "text-white/38 hover:text-white/75"}`}>
                {tab === "overview" ? "Overview" : tab === "episodes" ? "Episodes" : tab === "similar" ? "You may also like" : "Reviews"}
                {active && <motion.span layoutId="info-tab-indicator" className="absolute inset-x-0 bottom-0 h-0.5 bg-white" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              </button>;
            })}
          </div>
        </nav>

        <div className="grid gap-14 pb-16 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-20">
          <section className="min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && <OverviewPanel key="overview" details={details} cast={cast} getImageUrl={getImageUrl} />}
              {activeTab === "episodes" && isTV && <EpisodesPanel key="episodes" episodes={episodes} episodesLoading={episodesLoading} selectedSeason={selectedSeason} setSelectedSeason={setSelectedSeason} seasons={seasons} showSeasonMenu={showSeasonMenu} setShowSeasonMenu={setShowSeasonMenu} type={type} id={id} getImageUrl={getImageUrl} router={router} />}
              {activeTab === "similar" && <RecommendationsPanel key="similar" similar={similar} recommendations={recommendations} type={type} getImageUrl={getImageUrl} router={router} />}
              {activeTab === "reviews" && <ReviewsPanel key="reviews" user={user} newReview={newReview} setNewReview={setNewReview} reviewRating={reviewRating} setReviewRating={setReviewRating} handleAddReview={handleAddReview} reviews={reviews} router={router} />}
            </AnimatePresence>
          </section>

          <aside className="space-y-8 lg:pt-1">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">At a glance</p>
              <dl className="space-y-4">
                <InfoRow label="Status" value={details.status || "Released"} />
                {year && <InfoRow label={isTV ? "First aired" : "Released"} value={String(year)} />}
                {runtime && <InfoRow label={isTV ? "Episode length" : "Runtime"} value={runtime} />}
                {(details as MovieDetails).budget > 0 && <InfoRow label="Budget" value={`$${((details as MovieDetails).budget / 1000000).toFixed(1)}M`} />}
                {(details as MovieDetails).revenue > 0 && <InfoRow label="Box office" value={`$${((details as MovieDetails).revenue / 1000000).toFixed(1)}M`} />}
              </dl>
            </div>
            {details.production_companies?.length > 0 && <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Production</p>
              <div className="space-y-2">
                {details.production_companies.slice(0, 4).map((company: any) => <div key={company.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3"><div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-white/10">{company.logo_path ? <Image src={`https://image.tmdb.org/t/p/w200${company.logo_path}`} alt={company.name} fill className="object-contain p-1" /> : <FilmStrip className="m-auto h-4 w-4 text-white/30" />}</div><span className="truncate text-sm text-white/70">{company.name}</span></div>)}
              </div>
            </div>}
            {(details as any).spoken_languages?.length > 0 && <div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Audio</p><div className="flex flex-wrap gap-2">{(details as any).spoken_languages.map((language: any) => <span key={language.iso_639_1} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/55">{language.english_name}</span>)}</div></div>}
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {showTrailer && trailerKey && <TrailerModal trailerKey={trailerKey} close={() => setShowTrailer(false)} />}
      </AnimatePresence>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.07] pb-3 last:border-0 last:pb-0"><dt className="text-xs text-white/42">{label}</dt><dd className="text-right text-sm font-semibold text-white/80">{value}</dd></div>;
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease }} className={className}>{children}</motion.div>;
}

function OverviewPanel({ details, cast, getImageUrl }: { details: ContentDetails; cast: Cast[]; getImageUrl: InfoExperienceProps["getImageUrl"] }) {
  return <Panel>
    <div className="max-w-3xl"><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">The story</p><p className="text-xl leading-[1.65] text-white/78 sm:text-2xl">{details.overview || "No overview available for this title."}</p></div>
    <div className="mt-16"><div className="mb-6 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Cast</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">The people behind it</h2></div><span className="text-xs text-white/35">{cast.length} credits</span></div><div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4">{cast.slice(0, 10).map((person) => <Link href={`/actor/${person.id}`} key={person.id} className="group min-w-0"><div className="relative mb-3 aspect-square overflow-hidden rounded-[20px] border border-white/[0.08] bg-white/[0.04]"><Image src={person.profile_path ? getImageUrl(person.profile_path, "profile") : "/placeholder-avatar.svg"} alt={person.name} fill sizes="180px" className="object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition group-hover:opacity-100" /></div><p className="truncate text-sm font-semibold text-white/85 group-hover:text-white">{person.name}</p><p className="mt-1 truncate text-xs text-white/38">{person.character}</p></Link>)}</div></div>
  </Panel>;
}

function EpisodesPanel({ episodes, episodesLoading, selectedSeason, setSelectedSeason, seasons, showSeasonMenu, setShowSeasonMenu, type, id, getImageUrl, router }: { episodes: Episode[]; episodesLoading: boolean; selectedSeason: number; setSelectedSeason: React.Dispatch<React.SetStateAction<number>>; seasons: Season[]; showSeasonMenu: boolean; setShowSeasonMenu: React.Dispatch<React.SetStateAction<boolean>>; type: "movie" | "tv"; id: string; getImageUrl: InfoExperienceProps["getImageUrl"]; router: InfoExperienceProps["router"] }) {
  return <Panel><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Season guide</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Choose an episode</h2></div><div className="relative"><button onClick={() => setShowSeasonMenu((open) => !open)} className="inline-flex h-11 items-center gap-3 rounded-full border border-white/12 bg-white/[0.06] px-4 text-sm font-semibold text-white transition hover:bg-white/10"><span>Season {selectedSeason}</span><CaretDown className={`h-4 w-4 text-white/45 transition ${showSeasonMenu ? "rotate-180" : ""}`} /></button><AnimatePresence>{showSeasonMenu && <motion.div initial={{ opacity: 0, y: 8, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .97 }} transition={{ type: "spring", stiffness: 450, damping: 34 }} className="absolute right-0 top-full z-30 mt-2 w-64 rounded-2xl border border-white/12 bg-[#15171b]/95 p-1 shadow-2xl backdrop-blur-2xl"><div className="max-h-72 overflow-y-auto custom-scrollbar">{seasons.map((season) => <button key={season.season_number} onClick={() => { setSelectedSeason(season.season_number); setShowSeasonMenu(false); }} className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${selectedSeason === season.season_number ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/[0.06] hover:text-white"}`}><span><span className="block text-sm font-semibold">Season {season.season_number}</span><span className="mt-0.5 block text-[11px] text-white/35">{season.episode_count} episodes</span></span>{selectedSeason === season.season_number && <Check className="h-4 w-4 text-white" />}</button>)}</div></motion.div>}</AnimatePresence></div></div>{episodesLoading ? <div className="grid gap-3 sm:grid-cols-2"><div className="h-36 rounded-[22px] skeleton" /><div className="h-36 rounded-[22px] skeleton" /></div> : episodes.length ? <div className="grid gap-3 sm:grid-cols-2">{episodes.map((episode, index) => <EpisodeTile key={episode.id} episode={episode} index={index} type={type} id={id} selectedSeason={selectedSeason} getImageUrl={getImageUrl} router={router} />)}</div> : <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-white/45">No episodes available for this season.</div>}</Panel>;
}

function EpisodeTile({ episode, index, type, id, selectedSeason, getImageUrl, router }: { episode: Episode; index: number; type: "movie" | "tv"; id: string; selectedSeason: number; getImageUrl: InfoExperienceProps["getImageUrl"]; router: InfoExperienceProps["router"] }) {
  const aired = !episode.air_date || new Date(episode.air_date) <= new Date();
  const still = episode.still_path ? getImageUrl(episode.still_path, "still") : "/not-found.png";
  return <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: aired ? 1 : .48, y: 0 }} transition={{ delay: Math.min(index, 8) * .025 }} disabled={!aired} onClick={() => router.push(`/watch/${type}/${id}/${selectedSeason}/${episode.episode_number}`)} className="group overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.035] text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-not-allowed"><div className="relative aspect-[16/7] overflow-hidden bg-[#15171a]"><Image src={still} alt={episode.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" /><div className="absolute bottom-3 left-4 right-4 flex items-end justify-between"><span className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/75 backdrop-blur">E{episode.episode_number}</span>{aired ? <Play className="h-4 w-4 fill-current text-white opacity-0 transition group-hover:opacity-100" /> : <CalendarBlank className="h-4 w-4 text-white/50" />}</div></div><div className="p-4"><div className="flex items-start justify-between gap-3"><h3 className="truncate text-sm font-semibold text-white/85 group-hover:text-white">{episode.name}</h3><span className="shrink-0 text-[10px] text-white/35">{episode.air_date ? new Date(episode.air_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "TBA"}</span></div><p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/42">{episode.overview || "No overview available."}</p></div></motion.button>;
}

function RecommendationsPanel({ similar, recommendations, type, getImageUrl, router }: { similar: Recommendation[]; recommendations: Recommendation[]; type: "movie" | "tv"; getImageUrl: InfoExperienceProps["getImageUrl"]; router: InfoExperienceProps["router"] }) {
  return <Panel><RecommendationShelf title="Because you watched this" items={similar} type={type} getImageUrl={getImageUrl} router={router} /><RecommendationShelf title="More to explore" items={recommendations} type={type} getImageUrl={getImageUrl} router={router} /></Panel>;
}

function RecommendationShelf({ title, items, type, getImageUrl, router }: { title: string; items: Recommendation[]; type: "movie" | "tv"; getImageUrl: InfoExperienceProps["getImageUrl"]; router: InfoExperienceProps["router"] }) {
  if (!items?.length) return null;
  return <section className="mb-12 last:mb-0"><div className="mb-5 flex items-end justify-between"><h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2><span className="text-xs text-white/35">{items.length} titles</span></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">{items.map((item) => { const itemTitle = "title" in item ? item.title : item.name; const poster = item.poster_path ? getImageUrl(item.poster_path, "poster") : "/not-found.png"; return <button key={item.id} onClick={() => router.push(`/info/${type}/${item.id}`)} className="group min-w-0 text-left"><div className="relative aspect-[2/3] overflow-hidden rounded-[20px] border border-white/[0.08] bg-white/[0.04] transition group-hover:-translate-y-1 group-hover:border-white/20"><Image src={poster} alt={itemTitle} fill sizes="220px" className="object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-80" /><div className="absolute inset-x-3 bottom-3"><p className="line-clamp-2 text-sm font-semibold text-white">{itemTitle}</p>{item.vote_average > 0 && <span className="mt-2 inline-block font-mono text-[10px] text-amber-200">★ {item.vote_average.toFixed(1)}</span>}</div></div></button>; })}</div></section>;
}

function ReviewsPanel({ user, newReview, setNewReview, reviewRating, setReviewRating, handleAddReview, reviews, router }: { user: InfoExperienceProps["user"]; newReview: string; setNewReview: React.Dispatch<React.SetStateAction<string>>; reviewRating: number; setReviewRating: React.Dispatch<React.SetStateAction<number>>; handleAddReview: () => void; reviews: Review[]; router: InfoExperienceProps["router"] }) {
  return <Panel><div className="mb-10 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Community</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">What people are saying</h2></div><span className="text-xs text-white/35">{reviews.length} reviews</span></div>{user ? <div className="mb-10 rounded-[24px] border border-white/10 bg-white/[0.045] p-5 sm:p-7"><p className="mb-4 text-sm font-semibold text-white">Your take</p><div className="mb-5 flex gap-1">{[1, 2, 3, 4, 5].map((star) => <button key={star} onClick={() => setReviewRating(star)} aria-label={`${star} stars`} className="transition hover:scale-110"><Star className={`h-6 w-6 ${star <= reviewRating ? "fill-amber-300 text-amber-300" : "text-white/15"}`} /></button>)}</div><Textarea value={newReview} onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setNewReview(event.target.value)} placeholder="What stayed with you?" rows={4} className="min-h-32" /><div className="mt-4 flex justify-end"><button onClick={handleAddReview} disabled={!newReview.trim()} className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-40">Publish review</button></div></div> : <div className="mb-10 rounded-[24px] border border-white/10 bg-white/[0.035] p-8 text-center"><p className="text-lg text-white/75">Good stories are better shared.</p><button onClick={() => router.push("/login")} className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black">Sign in to review</button></div>}{reviews.length ? <div className="space-y-3">{reviews.map((review) => <article key={review.id} className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-5"><div className="mb-4 flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-white/85">{review.userName}</p><p className="mt-1 text-xs text-white/35">{review.createdAt ? new Date(review.createdAt.toMillis()).toLocaleDateString("en-US", { dateStyle: "medium" }) : "Just now"}</p></div><span className="font-mono text-xs text-amber-200">★ {review.rating}</span></div><p className="whitespace-pre-wrap text-sm leading-relaxed text-white/58">{review.text}</p></article>)}</div> : <p className="rounded-[22px] border border-dashed border-white/10 p-10 text-center text-sm text-white/38">Be the first to share your thoughts.</p>}</Panel>;
}

function TrailerModal({ trailerKey, close }: { trailerKey: string; close: () => void }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl" onClick={close}><motion.div initial={{ opacity: 0, scale: .96, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .96, y: 14 }} transition={{ type: "spring", damping: 28, stiffness: 360 }} className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-[24px] border border-white/15 bg-black shadow-2xl" onClick={(event) => event.stopPropagation()}><button onClick={close} className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-xl transition hover:bg-white/15" aria-label="Close trailer"><X className="h-5 w-5" /></button><iframe src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`} title="Trailer" className="h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></motion.div></motion.div>;
}
