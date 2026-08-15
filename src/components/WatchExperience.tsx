'use client';

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowUUpLeft,
  CaretDown,
  Check,
  FilmStrip,
  HardDrives,
  Lightning,
  MonitorPlay,
  Play,
  Television,
  Warning,
  WarningCircle,
} from "@phosphor-icons/react";
import VideoPlayer from "./VideoPlayer";
import type { Provider, StreamInfo } from "../lib/embed";
import type { ContentType, MovieDetails, Season, TVShowDetails } from "../types/tmdb";

interface WatchExperienceProps {
  type: ContentType;
  id: string;
  currentSeason: number;
  currentEpisode: number;
  fullTitle: string;
  posterUrl?: string;
  details: MovieDetails | TVShowDetails | null;
  seasonData: Season | null;
  providers: Array<{ key: string; label: string; description?: string }>;
  provider: Provider;
  setProvider: React.Dispatch<React.SetStateAction<Provider>>;
  currentProvider?: { key: string; label: string; description?: string };
  showProviderMenu: boolean;
  setShowProviderMenu: React.Dispatch<React.SetStateAction<boolean>>;
  fetchEmbedUrl: () => void;
  loading: boolean;
  error: string;
  isSecure: boolean;
  setIsSecure: React.Dispatch<React.SetStateAction<boolean>>;
  selectedStream: StreamInfo | null;
  embedUrl: string;
  countdown: number | null;
  nextEpisodeInfo: { season: number; episode: number; title: string } | null;
  setCountdown: React.Dispatch<React.SetStateAction<number | null>>;
  setNextEpisodeInfo: React.Dispatch<React.SetStateAction<{ season: number; episode: number; title: string } | null>>;
  countdownActive: React.MutableRefObject<boolean>;
  autoPlayNext: boolean;
  toggleAutoPlayNext: () => void;
  settings: { defaultVideoQuality: string };
  showSeasonMenu: boolean;
  setShowSeasonMenu: React.Dispatch<React.SetStateAction<boolean>>;
  showShortcuts: boolean;
  setShowShortcuts: React.Dispatch<React.SetStateAction<boolean>>;
  showAdNotice: boolean;
  dismissAdNotice: () => void;
  router: { push: (href: string) => void; back: () => void };
}

export default function WatchExperience({
  type,
  id,
  currentSeason,
  currentEpisode,
  fullTitle,
  posterUrl,
  details,
  seasonData,
  providers,
  provider,
  setProvider,
  currentProvider,
  showProviderMenu,
  setShowProviderMenu,
  fetchEmbedUrl,
  loading,
  error,
  isSecure,
  setIsSecure,
  selectedStream,
  embedUrl,
  countdown,
  nextEpisodeInfo,
  setCountdown,
  setNextEpisodeInfo,
  countdownActive,
  autoPlayNext,
  toggleAutoPlayNext,
  settings,
  showSeasonMenu,
  setShowSeasonMenu,
  showShortcuts,
  setShowShortcuts,
  showAdNotice,
  dismissAdNotice,
  router,
}: WatchExperienceProps) {
  const isTV = type === "tv";
  const active = Boolean(selectedStream || embedUrl);

  return (
    <main className="watch-experience min-h-screen bg-[#070809] text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#090a0c]/72 backdrop-blur-2xl">
        <div className="mx-auto flex h-[68px] max-w-[1800px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <button onClick={() => router.back()} aria-label="Go back" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/75 transition hover:border-white/25 hover:bg-white/12 hover:text-white active:scale-95"><ArrowLeft className="h-4 w-4" /></button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40"><span className="text-white/70">{isTV ? <Television className="h-3.5 w-3.5" /> : <FilmStrip className="h-3.5 w-3.5" />}</span>{isTV ? `Season ${currentSeason} · Episode ${currentEpisode}` : "Feature film"}</div>
              <h1 className="truncate text-sm font-semibold text-white sm:text-base">{fullTitle}</h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowProviderMenu((open) => !open)} className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 text-xs font-semibold text-white/75 transition hover:border-white/25 hover:bg-white/10 hover:text-white sm:px-4"><MonitorPlay className="h-3.5 w-3.5 text-white/45" /><span className="hidden sm:inline">{selectedStream ? "Direct stream" : currentProvider?.label}</span><CaretDown className={`h-3.5 w-3.5 text-white/35 transition ${showProviderMenu ? "rotate-180" : ""}`} /></button>
              <AnimatePresence>{showProviderMenu && <motion.div initial={{ opacity: 0, y: 8, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .97 }} transition={{ type: "spring", stiffness: 450, damping: 34 }} className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-white/12 bg-[#15171b]/95 p-1 shadow-2xl backdrop-blur-2xl"><div className="border-b border-white/[0.07] px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Playback source</p><p className="mt-1 text-xs text-white/55">Direct first, iframe fallback</p></div>{providers.map((item) => <button key={item.key} onClick={() => { setProvider(item.key as Provider); setShowProviderMenu(false); }} className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${provider === item.key ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/[0.06] hover:text-white"}`}><span><span className="block text-sm font-semibold">{item.label}</span><span className="mt-1 block text-[11px] text-white/35">{item.description}</span></span>{provider === item.key && <Check className="h-4 w-4" />}</button>)}</motion.div>}</AnimatePresence>
            </div>
            <button onClick={fetchEmbedUrl} disabled={loading} aria-label="Reload stream" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-40"><ArrowUUpLeft className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>
            <button onClick={() => setShowShortcuts(true)} aria-label="Keyboard shortcuts" className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] font-mono text-xs text-white/60 transition hover:border-white/25 hover:bg-white/10 hover:text-white sm:inline-flex">?</button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1800px] flex-col gap-5 px-3 pb-8 pt-[84px] sm:px-6 lg:flex-row lg:gap-6 lg:px-8 lg:pt-[92px]">
        <section className="min-w-0 flex-1">
          <div className="relative aspect-video overflow-hidden rounded-[24px] border border-white/[0.1] bg-black shadow-[0_30px_100px_rgba(0,0,0,.42)] sm:rounded-[30px]">
            <AnimatePresence mode="wait">
              {loading ? <StatusPanel key="loading" kind="loading" /> : error ? <StatusPanel key="error" kind={error === "unreleased" ? "unreleased" : "error"} details={details} router={router} type={type} id={id} retry={fetchEmbedUrl} /> : selectedStream ? <motion.div key="direct" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0"><VideoPlayer url={selectedStream.url} title={fullTitle} poster={posterUrl} /></motion.div> : embedUrl ? <motion.div key="embed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0"><iframe src={embedUrl} title="Video player" className="h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" loading="eager" /></motion.div> : null}
            </AnimatePresence>
            {!isSecure && <div className="absolute inset-x-3 top-3 z-30 flex items-start justify-between gap-3 rounded-2xl border border-amber-300/20 bg-amber-200/10 p-3 text-xs text-amber-100 backdrop-blur-xl sm:inset-x-5 sm:top-5"><div className="flex gap-2"><Warning className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><span>This player requires HTTPS or localhost to decrypt streams.</span></div><button onClick={() => setIsSecure(true)} className="text-[10px] font-bold uppercase tracking-wider text-amber-200">Dismiss</button></div>}
            <AnimatePresence>{countdown !== null && nextEpisodeInfo && <motion.div initial={{ opacity: 0, y: 16, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .97 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="absolute bottom-4 right-4 z-30 w-[min(360px,calc(100%-2rem))] rounded-[22px] border border-white/15 bg-[#111317]/92 p-5 shadow-2xl backdrop-blur-2xl sm:bottom-6 sm:right-6"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Up next</p><h2 className="mt-2 truncate text-base font-semibold text-white">{nextEpisodeInfo.title}</h2><p className="mt-1 text-xs text-white/45">Starts in {countdown} seconds</p><div className="mt-5 flex gap-2"><button onClick={() => router.push(`/watch/tv/${id}/${nextEpisodeInfo.season}/${nextEpisodeInfo.episode}`)} className="flex-1 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-black">Play now</button><button onClick={() => { setCountdown(null); setNextEpisodeInfo(null); countdownActive.current = false; }} className="flex-1 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 text-xs font-bold text-white">Cancel</button></div></motion.div>}</AnimatePresence>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.035] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2.5"><span className={`h-2 w-2 rounded-full ${active && !loading ? "bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.8)]" : "bg-white/25 animate-pulse"}`} /><span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">{loading ? "Connecting" : error ? "Unavailable" : "Ready to watch"}</span>{selectedStream && <span className="hidden rounded-full bg-emerald-300/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-200 sm:inline">Direct</span>}</div>
            <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35"><span>{selectedStream ? "Tarkosi relay" : currentProvider?.label}</span>{settings.defaultVideoQuality !== "auto" && <span className="hidden sm:inline">{settings.defaultVideoQuality}</span>}{isTV && <button onClick={toggleAutoPlayNext} className={`rounded-full border px-3 py-1.5 transition ${autoPlayNext ? "border-white/20 bg-white/10 text-white" : "border-white/10 text-white/35"}`}><Lightning className="mr-1 inline h-3 w-3" />Next {autoPlayNext ? "on" : "off"}</button>}</div>
          </div>
        </section>

        {isTV && <EpisodeRail details={details as TVShowDetails | null} seasonData={seasonData} currentSeason={currentSeason} currentEpisode={currentEpisode} id={id} showSeasonMenu={showSeasonMenu} setShowSeasonMenu={setShowSeasonMenu} router={router} />}
      </div>

      <AnimatePresence>{showShortcuts && <ShortcutsModal close={() => setShowShortcuts(false)} />}</AnimatePresence>
      <AnimatePresence>{showAdNotice && <NoticeModal close={dismissAdNotice} />}</AnimatePresence>
    </main>
  );
}

function StatusPanel({ kind, details, router, type, id, retry }: { kind: "loading" | "unreleased" | "error"; details?: MovieDetails | TVShowDetails | null; router?: WatchExperienceProps["router"]; type?: ContentType; id?: string; retry?: () => void }) {
  if (kind === "loading") return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0b0d]"><div className="mb-5 h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-white" /><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">Preparing your screening</p></motion.div>;
  const unreleased = kind === "unreleased";
  const date = details ? ("release_date" in details ? details.release_date : details.first_air_date) : null;
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0b0d] px-6 text-center"><div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full border ${unreleased ? "border-amber-200/20 bg-amber-200/10 text-amber-200" : "border-white/10 bg-white/[0.06] text-white/60"}`}>{unreleased ? <Warning className="h-7 w-7" /> : <HardDrives className="h-7 w-7" />}</div><h2 className="text-2xl font-semibold tracking-tight text-white">{unreleased ? "Not released yet" : "We lost the signal"}</h2><p className="mt-3 max-w-md text-sm leading-relaxed text-white/45">{unreleased ? "This title is not available to play until its official release." : "The selected source did not respond. Try the connection again or return to the title page."}</p>{date && unreleased && <p className="mt-4 text-xs font-semibold text-amber-200/70">Expected {new Date(date).toLocaleDateString(undefined, { dateStyle: "long" })}</p>}<div className="mt-7 flex flex-wrap justify-center gap-2"><button onClick={unreleased ? () => type && id && router?.push(`/info/${type}/${id}`) : () => retry?.()} className="rounded-full bg-white px-5 py-2.5 text-xs font-bold text-black">{unreleased ? "View title" : "Retry"}</button>{!unreleased && type && id && <button onClick={() => router?.push(`/info/${type}/${id}`)} className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-xs font-bold text-white">View info</button>}</div></motion.div>;
}

function EpisodeRail({ details, seasonData, currentSeason, currentEpisode, id, showSeasonMenu, setShowSeasonMenu, router }: { details: TVShowDetails | null; seasonData: Season | null; currentSeason: number; currentEpisode: number; id: string; showSeasonMenu: boolean; setShowSeasonMenu: React.Dispatch<React.SetStateAction<boolean>>; router: WatchExperienceProps["router"] }) {
  const seasons = details?.seasons?.filter((season) => season.season_number > 0) ?? [];
  return <aside className="flex h-[420px] w-full shrink-0 flex-col overflow-hidden rounded-[24px] border border-white/[0.1] bg-white/[0.035] lg:h-auto lg:w-[340px] xl:w-[380px]"><div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Continue watching</p><h2 className="mt-1 text-base font-semibold text-white">Episodes</h2></div><div className="relative"><button onClick={() => setShowSeasonMenu((open) => !open)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/75">S{currentSeason}<CaretDown className={`h-3.5 w-3.5 text-white/35 transition ${showSeasonMenu ? "rotate-180" : ""}`} /></button><AnimatePresence>{showSeasonMenu && <motion.div initial={{ opacity: 0, y: 8, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .97 }} className="absolute right-0 top-full z-50 mt-2 w-44 rounded-2xl border border-white/12 bg-[#15171b]/95 p-1 shadow-2xl backdrop-blur-2xl">{seasons.map((season) => <button key={season.season_number} onClick={() => { router.push(`/watch/tv/${id}/${season.season_number}/1`); setShowSeasonMenu(false); }} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition ${currentSeason === season.season_number ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/[0.06] hover:text-white"}`}>Season {season.season_number}{currentSeason === season.season_number && <Check className="h-3.5 w-3.5" />}</button>)}</motion.div>}</AnimatePresence></div></div><div className="custom-scrollbar flex-1 overflow-y-auto p-2">{seasonData?.episodes?.length ? seasonData.episodes.map((episode) => { const active = episode.episode_number === currentEpisode; return <button key={episode.id} onClick={() => router.push(`/watch/tv/${id}/${currentSeason}/${episode.episode_number}`)} className={`group flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition ${active ? "bg-white/10" : "hover:bg-white/[0.06]"}`}><div className={`flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl ${active ? "ring-2 ring-white/80" : "bg-black/30"}`}>{episode.still_path ? <Image src={`https://image.tmdb.org/t/p/w300${episode.still_path}`} alt="" fill sizes="80px" className="object-cover transition group-hover:scale-105" /> : <span className="text-sm text-white/35">{episode.episode_number}</span>}</div><div className="min-w-0 flex-1"><p className={`truncate text-sm font-semibold ${active ? "text-white" : "text-white/65 group-hover:text-white"}`}>{episode.episode_number}. {episode.name}</p><p className="mt-1 truncate text-[11px] text-white/35">{episode.air_date?.split("-")[0] || "TBA"}{episode.runtime ? ` · ${episode.runtime}m` : ""}</p></div>{active && <Play className="h-3.5 w-3.5 shrink-0 fill-current text-white" />}</button>; }) : <div className="flex h-full items-center justify-center px-8 text-center text-sm text-white/35">Loading episodes…</div>}</div></aside>;
}

function ShortcutsModal({ close }: { close: () => void }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl" onClick={close}><motion.div initial={{ opacity: 0, y: 16, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .97 }} transition={{ type: "spring", stiffness: 360, damping: 28 }} onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-[26px] border border-white/12 bg-[#15171b]/95 p-6 shadow-2xl backdrop-blur-2xl"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Keyboard</p><h2 className="mt-2 text-2xl font-semibold text-white">Playback shortcuts</h2><div className="mt-6 space-y-3">{[["F", "Fullscreen"], ["R", "Reload stream"], ["?", "Show shortcuts"]].map(([key, label]) => <div key={key} className="flex items-center justify-between border-b border-white/[0.07] pb-3 text-sm text-white/65"><span>{label}</span><kbd className="rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1 font-mono text-xs text-white">{key}</kbd></div>)}</div><button onClick={close} className="mt-7 w-full rounded-full bg-white py-3 text-sm font-bold text-black">Done</button></motion.div></motion.div>;
}

function NoticeModal({ close }: { close: () => void }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl"><motion.div initial={{ opacity: 0, y: 16, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .97 }} transition={{ type: "spring", stiffness: 360, damping: 28 }} className="relative w-full max-w-md rounded-[26px] border border-white/12 bg-[#15171b]/95 p-7 text-center shadow-2xl backdrop-blur-2xl"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/75"><WarningCircle className="h-7 w-7" /></div><h2 className="mt-5 text-2xl font-semibold text-white">A quick note before you watch</h2><p className="mt-3 text-sm leading-relaxed text-white/50">Tarkosi does not host content. Playback comes from third-party sources and may include external advertising we cannot control.</p><div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 text-left"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Recommendation</p><p className="mt-2 text-xs leading-relaxed text-white/45">A modern content blocker can improve the viewing experience.</p></div><button onClick={close} className="mt-6 w-full rounded-full bg-white py-3 text-sm font-bold text-black">I understand</button></motion.div></motion.div>;
}
