'use client';

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CalendarBlank, FilmStrip, MapPin, Star, Television } from "@phosphor-icons/react";
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

  const profileUrl = actor.profile_path ? `https://image.tmdb.org/t/p/h632/${actor.profile_path}` : "/placeholder-avatar.svg";
  const movies = credits.cast.filter((credit) => credit.media_type === "movie").sort((a, b) => (b as Movie).popularity - (a as Movie).popularity);
  const tvShows = credits.cast.filter((credit) => credit.media_type === "tv").sort((a, b) => (b as TVShow).popularity - (a as TVShow).popularity);
  const displayedCredits = selectedTab === "movies" ? movies : tvShows;
  const biography = actor.biography?.trim() || "No biography is available for this performer yet.";
  const born = actor.birthday ? new Date(actor.birthday).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;

  return (
    <main className="actor-experience min-h-screen bg-[#08090b] pb-24 pt-20 text-white sm:pt-24">
      <div className="container">
        <button onClick={() => router.back()} className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white/60 transition hover:border-white/25 hover:bg-white/10 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to browsing</button>

        <section className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-white/[0.035] p-5 shadow-[0_28px_90px_rgba(0,0,0,.28)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-white/[0.04] blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-48 sm:w-56 lg:mx-0 lg:w-[240px]">
              <div className="relative aspect-[2/3] overflow-hidden rounded-[24px] border border-white/15 bg-[#15171a] shadow-2xl">
                <Image src={profileUrl} alt={actor.name} fill priority sizes="240px" className={`object-cover transition duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"}`} onLoad={() => setImageLoaded(true)} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="flex min-w-0 flex-col justify-end">
              <div className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40"><FilmStrip className="h-3.5 w-3.5 text-white/65" /> Performer profile</div>
              <h1 className="text-[clamp(3rem,8vw,7rem)] font-semibold leading-[.92] tracking-[-.05em] text-white">{actor.name}</h1>
              <div className="mt-7 flex flex-wrap gap-2"><span className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs text-white/65">{actor.known_for_department || "Acting"}</span><span className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs text-white/65">{movies.length} films</span><span className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs text-white/65">{tvShows.length} series</span></div>
              <div className="mt-8 grid gap-4 border-t border-white/[0.08] pt-6 sm:grid-cols-2 lg:max-w-xl"><MetaItem icon={<CalendarBlank className="h-4 w-4" />} label="Born" value={born || "Not listed"} /><MetaItem icon={<MapPin className="h-4 w-4" />} label="From" value={actor.place_of_birth || "Not listed"} /></div>
            </motion.div>
          </div>
        </section>

        <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-20">
          <section className="min-w-0">
            <div className="mb-12 max-w-3xl"><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/38">The person</p><h2 className="mb-5 text-2xl font-semibold tracking-tight text-white">A life in frames</h2><p className="whitespace-pre-line text-base leading-[1.8] text-white/58 sm:text-lg">{biography}</p></div>

            <div className="sticky top-[68px] z-20 -mx-4 mb-8 border-b border-white/[0.08] bg-[#08090b]/85 px-4 backdrop-blur-2xl sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10"><div className="flex gap-7"><TabButton active={selectedTab === "movies"} onClick={() => setSelectedTab("movies")} icon={<FilmStrip className="h-4 w-4" />}>Films <span className="text-white/35">{movies.length}</span></TabButton><TabButton active={selectedTab === "tv"} onClick={() => setSelectedTab("tv")} icon={<Television className="h-4 w-4" />}>Series <span className="text-white/35">{tvShows.length}</span></TabButton></div></div>

            <AnimatePresence mode="wait"><motion.div key={selectedTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .25 }} className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4">{displayedCredits.slice(0, 20).map((item, index) => <CreditCard key={item.id} item={item} index={index} onOpen={() => router.push(`/info/${selectedTab}/${item.id}`)} />)}</motion.div></AnimatePresence>
          </section>

          <aside className="space-y-6 lg:pt-1"><div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl"><p className="mb-5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/38">Career snapshot</p><div className="space-y-4"><Stat label="Film credits" value={movies.length} /><Stat label="Series credits" value={tvShows.length} /><Stat label="Total appearances" value={movies.length + tvShows.length} /></div></div><div className="rounded-[24px] border border-dashed border-white/10 p-5"><p className="text-sm font-semibold text-white/75">Explore the work</p><p className="mt-2 text-xs leading-relaxed text-white/38">Open any title to see its full cast, details, and available playback sources.</p></div></aside>
        </div>
      </div>
    </main>
  );
};

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex min-w-0 items-start gap-3"><span className="mt-0.5 text-white/45">{icon}</span><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">{label}</p><p className="mt-1 truncate text-sm text-white/75">{value}</p></div></div>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="flex items-center justify-between border-b border-white/[0.07] pb-3 last:border-0 last:pb-0"><span className="text-xs text-white/42">{label}</span><span className="font-mono text-sm font-semibold text-white/80">{value}</span></div>;
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return <button onClick={onClick} className={`relative inline-flex min-h-14 items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] transition ${active ? "text-white" : "text-white/38 hover:text-white/75"}`}>{icon}{children}{active && <motion.span layoutId="actor-tab-indicator" className="absolute inset-x-0 bottom-0 h-0.5 bg-white" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}</button>;
}

function CreditCard({ item, index, onOpen }: { item: Movie | TVShow & { media_type: string }; index: number; onOpen: () => void }) {
  const itemTitle = "title" in item ? item.title : item.name;
  const releaseDate = "release_date" in item ? item.release_date : item.first_air_date;
  const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342/${item.poster_path}` : "/not-found.png";
  return <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 10) * .025 }} onClick={onOpen} className="group min-w-0 text-left"><div className="relative aspect-[2/3] overflow-hidden rounded-[20px] border border-white/[0.08] bg-white/[0.04] transition duration-300 group-hover:-translate-y-1 group-hover:border-white/20 group-hover:shadow-[0_16px_32px_rgba(0,0,0,.35)]"><Image src={poster} alt={itemTitle} fill sizes="220px" className="object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-75" /><div className="absolute inset-x-3 bottom-3"><p className="line-clamp-2 text-sm font-semibold leading-tight text-white">{itemTitle}</p>{item.vote_average > 0 && <span className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-amber-200"><Star className="h-3 w-3 fill-current" />{item.vote_average.toFixed(1)}</span>}</div></div><p className="mt-3 truncate text-xs font-semibold text-white/65 group-hover:text-white">{itemTitle}</p><p className="mt-1 font-mono text-[10px] text-white/30">{releaseDate?.split("-")[0] || "—"}</p></motion.button>;
}

export default ActorClient;
