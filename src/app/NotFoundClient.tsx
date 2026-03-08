'use client';

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Film, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { tmdbService } from "../lib/tmdb";

const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";
const FITTING_MOVIE_ID = 1398; 

export default function NotFoundClient() {
  const [backdrop, setBackdrop] = useState("");

  useEffect(() => {
    const fetchBackdrop = async () => {
      try {
        const movie = await tmdbService.getMovieDetails(FITTING_MOVIE_ID);
        if (movie.backdrop_path) {
          setBackdrop(`${BACKDROP_BASE_URL}${movie.backdrop_path}`);
        }
      } catch (error) {
        console.error("Error fetching 404 backdrop:", error);
        setBackdrop("https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop");
      }
    };
    fetchBackdrop();
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] flex items-center justify-center overflow-hidden">
      {/* Cinematic Backdrop */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {backdrop && (
            <Image 
              src={backdrop.replace('/original/', '/w1280/')} 
              alt="" 
              fill
              priority
              className="object-cover opacity-40 grayscale-[0.5] contrast-125"
              sizes="100vw"
              quality={90}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-base)]/40 via-transparent to-transparent" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 container max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="t-label text-[var(--accent)] mb-6 block tracking-[0.4em]">Error 404</span>
          <h1 className="t-hero text-8xl md:text-[10rem] mb-8">LOST</h1>
          <p className="t-body text-xl md:text-2xl text-[var(--text-secondary)] mb-12 leading-relaxed">
            This scene seems to have been cut from the final edit. <br className="hidden md:block" />
            The page you are looking for has vanished into the void.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/" className="btn btn-primary h-14 px-10 text-sm uppercase tracking-widest font-bold w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4" />
              Return to Cinema
            </Link>
            <Link href="/search" className="btn btn-secondary h-14 px-10 text-sm uppercase tracking-widest font-bold w-full sm:w-auto">
              <Search className="w-4 h-4" />
              Search Library
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Brand Watermark */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 opacity-20">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4" />
          <span className="t-hero text-xl tracking-[0.2em] pt-1">NETFLYER</span>
        </div>
      </div>
    </div>
  );
}
