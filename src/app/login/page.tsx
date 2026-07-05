'use client';

import { auth } from "../../lib/firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { motion } from "framer-motion";
import { Eye, EyeSlash, ArrowLeft, FilmStrip, CaretRight } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "../../components/ToastProvider";
import Loading from "../../components/Loading";
import { tmdbService } from "../../lib/tmdb";

const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";

const CURATED_FILMS = [
  503919, // The Lighthouse
  531428, // Portrait of a Lady on Fire
  335984, // Blade Runner 2049
  120467, // The Grand Budapest Hotel
  70608,  // Drive
  1398,   // Stalker
  490,    // The Seventh Seal
  13475,  // Mulholland Drive
  290098, // The Handmaiden
  329865, // Arrival
  376867, // Moonlight
  496243, // Parasite
  152601, // Her
  97370,  // Under the Skin
  373023, // Burning
  11059,  // Memories of Murder
  361292, // Suspiria (2018)
];

const Login = () => {
  const { createToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [backdrop, setBackdrop] = useState("");
  const [movieTitle, setMovieTitle] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const toggleVisibility = () => setIsVisible((prev) => !prev);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchBackdrop = async () => {
      try {
        const randomId = CURATED_FILMS[Math.floor(Math.random() * CURATED_FILMS.length)];
        const movie = await tmdbService.getMovieDetails(randomId);
        
        if (movie.backdrop_path) {
          setBackdrop(`${BACKDROP_BASE_URL}${movie.backdrop_path}`);
          setMovieTitle(movie.title);
        }
      } catch (error) {
        console.error("Error fetching backdrop:", error);
        setBackdrop(`${BACKDROP_BASE_URL}/s3TGo9h36S9DYpv7r0kvUrMwtZ4.jpg`);
        setMovieTitle("Inception");
      }
    };
    fetchBackdrop();
  }, []);

  const validateInputs = () => {
    if (!email || !password) {
      createToast("Please fill in all fields", { type: "error" });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      createToast("Please enter a valid email", { type: "error" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    try {
      setLoggedIn(true);
      await signInWithEmailAndPassword(auth, email, password);
      createToast("Welcome back", { type: "success", timeout: 2000 });
      router.push("/");
    } catch (error: any) {
      setLoggedIn(false);
      const errorMessage = error.message.includes("not-found") || error.message.includes("user-not-found")
        ? "Account not found"
        : error.message.includes("wrong-password") || error.message.includes("invalid-credential")
        ? "Incorrect password"
        : "Sign in failed. Please try again.";
      createToast(errorMessage, { type: "error" });
    }
  };

  const resetPassword = () => {
    if (!email) {
      createToast("Please enter your email first", { type: "error" });
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => createToast("Password reset email sent", { type: "success" }))
      .catch(() => createToast("Error sending reset email", { type: "error" }));
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[var(--bg-base)] overflow-y-auto lg:overflow-hidden">
      {/* Cinematic Backdrop - Full Screen on Mobile, Left Side on Desktop */}
      <div className="absolute inset-0 lg:relative lg:block border-r border-[var(--border-faint)] bg-[#050505] z-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {backdrop ? (
            <Image 
              src={backdrop.replace('/original/', '/w1280/')} 
              alt="" 
              fill
              priority
              className="object-cover opacity-40 lg:opacity-60 animate-kenburns"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
            />
          ) : (
            <div className="w-full h-full bg-[#050505]" />
          )}
          {/* Cinematic Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/80 lg:via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-base)] via-transparent to-transparent" />
        </motion.div>

        {/* Brand Overlay (Desktop) */}
        <div className="hidden lg:block absolute top-12 left-12 z-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[var(--accent)] rounded-[4px] flex items-center justify-center shadow-[0_0_20px_var(--accent-glow)]">
              <FilmStrip className="text-white w-5 h-5" weight="fill" />
            </div>
            <span className="t-hero text-2xl tracking-[0.2em] pt-1">NETFLYER</span>
          </Link>
        </div>

        {/* Editorial Text (Desktop) */}
        <div className="hidden lg:block absolute bottom-16 left-12 right-12 z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <span className="t-label text-[var(--accent)] mb-4 block">Now Featuring</span>
            <h2 className="t-hero text-6xl mb-4 line-clamp-2">{movieTitle}</h2>
            <p className="t-body max-w-md opacity-60">
              Stream the world&apos;s most curated cinema. Experience films as they were meant to be seen.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="relative z-10 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 overflow-y-auto">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-[4px] flex items-center justify-center">
              <FilmStrip className="text-white w-4 h-4" weight="fill" />
            </div>
            <span className="t-hero text-lg tracking-[0.15em] pt-1">NETFLYER</span>
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="mb-10">
              <h1 className="t-title text-5xl mb-3">Sign In</h1>
              <p className="t-body text-[var(--text-secondary)]">
                Welcome back to Netflyer.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="t-label block ml-1" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3.5 bg-white/[0.01] hover:bg-white/[0.03] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:bg-white/[0.02] rounded-[4px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-base focus:outline-none focus:shadow-[0_0_12px_rgba(229,9,20,0.15)] transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end px-1">
                  <label className="t-label" htmlFor="password">Password</label>
                  <button 
                    type="button" 
                    onClick={resetPassword}
                    className="t-meta hover:text-white transition-colors border-b border-transparent hover:border-white/20 pb-0.5"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={isVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 bg-white/[0.01] hover:bg-white/[0.03] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:bg-white/[0.02] rounded-[4px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-base focus:outline-none focus:shadow-[0_0_12px_rgba(229,9,20,0.15)] transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleVisibility}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
                  >
                    {isVisible ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loggedIn}
                className="btn btn-primary w-full py-4 text-sm uppercase tracking-widest font-bold mt-4"
              >
                {loggedIn ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <CaretRight className="w-4 h-4" weight="bold" />
                  </span>
                )}
              </button>
            </form>

            <footer className="mt-12 pt-8 border-t border-[var(--border-faint)]">
              <p className="t-body text-sm">
                New to Netflyer?{" "}
                <Link
                  href="/signup"
                  className="text-white font-bold hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1 group"
                >
                  Create an account
                  <CaretRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" weight="bold" />
                </Link>
              </p>
            </footer>
          </motion.div>
        </div>

        {/* Back to Home */}
        <Link 
          href="/"
          className="absolute bottom-8 left-8 lg:left-auto lg:right-12 flex items-center gap-2 t-meta hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" weight="bold" />
          Back to cinema
        </Link>
      </div>
    </div>
  );
};

export default Login;
