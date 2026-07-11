'use client';

import { auth, db } from "../../lib/firebase";
import { isProfane } from "../../lib/profanity";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Eye, EyeSlash, ArrowLeft, FilmStrip, CaretRight, UserPlus } from "@phosphor-icons/react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "../../components/ToastProvider";
import { tmdbService } from "../../lib/tmdb";
import Loading from "../../components/Loading";

const checkForBadWords = (text: string) => {
  return isProfane(text);
};

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

const SignUp = () => {
  const { createToast } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backdrop, setBackdrop] = useState("");
  const [movieTitle, setMovieTitle] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const toggleVisibility = () => setIsVisible((prev) => !prev);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            router.push("/");
          } else {
            setLoading(false);
          }
        });

        const randomId = CURATED_FILMS[Math.floor(Math.random() * CURATED_FILMS.length)];
        const movie = await tmdbService.getMovieDetails(randomId);
        
        if (movie.backdrop_path) {
          setBackdrop(`${BACKDROP_BASE_URL}${movie.backdrop_path}`);
          setMovieTitle(movie.title);
        }

        if (searchParams?.get("verified") === "true") {
          createToast("Your email has been verified.", {
            timeout: 3000,
            type: "success",
          });
        }

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, [router, searchParams, createToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    if (!username || !email || !password) {
      setFormLoading(false);
      return createToast("Please fill in all the fields.", {
        timeout: 3000,
        type: "error",
      });
    }

    if (checkForBadWords(username) || checkForBadWords(email)) {
      setFormLoading(false);
      return createToast(
        "Your username or email contains inappropriate words.",
        { timeout: 3000, type: "error" }
      );
    }

    if (password.length < 6) {
      setFormLoading(false);
      return createToast("Password must be at least 6 characters.", {
        timeout: 3000,
        type: "error",
      });
    }

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCred.user;

      const colRef = doc(db, "users", user.uid);
      await setDoc(colRef, {
        username: username,
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || window.location.origin;
      await sendEmailVerification(user, {
        url: `${websiteUrl}/signup?verified=true`,
      });

      createToast("Verification email sent", {
        timeout: 3000,
        type: "success",
      });

      setUsername("");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      handleSignUpError(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSignUpError = (error: any) => {
    if (error.message.includes("email-already-in-use")) {
      createToast("Email already in use", {
        action: {
          text: "Login",
          callback(toast: any) {
            router.push("/login");
            toast.destroy();
          },
        },
        timeout: 3000,
        type: "dark",
      });
    } else {
      createToast(error.message, {
        timeout: 3000,
        type: "error",
      });
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[var(--bg-base)] overflow-y-auto lg:overflow-hidden">
      {/* Cinematic Backdrop - Full Screen on Mobile, Left Side on Desktop */}
      <div className="absolute inset-0 lg:relative lg:block border-r border-[var(--border-faint)] bg-[#050505] z-0">
        <div className="absolute inset-0 animate-fade-in" style={{ animationDuration: '0.8s' }}>
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
        </div>

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
          <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <span className="t-label text-[var(--accent)] mb-4 block">Joining Netflyer</span>
            <h2 className="t-hero text-6xl mb-4 line-clamp-2">{movieTitle}</h2>
            <p className="t-body max-w-md opacity-60">
              Create an account to start your journey through the history of cinema. Save your favorites and watch anywhere.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: SignUp Form */}
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
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <header className="mb-10">
              <h1 className="t-title text-5xl mb-3">Join Us</h1>
              <p className="t-body text-[var(--text-secondary)]">
                Start your cinematic experience today.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="t-label block ml-1" htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="cinephile_24"
                  className="w-full px-4 py-3.5 bg-white/[0.01] hover:bg-white/[0.03] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:bg-white/[0.02] rounded-[4px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-base focus:outline-none focus:shadow-[0_0_12px_rgba(229,9,20,0.15)] transition-all duration-300"
                  required
                />
              </div>

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
                <label className="t-label block ml-1" htmlFor="password">Password</label>
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
                <p className="t-meta text-[10px] ml-1 opacity-50">MINIMUM 6 CHARACTERS</p>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="btn btn-primary w-full py-4 text-sm uppercase tracking-widest font-bold mt-4"
              >
                {formLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account <CaretRight className="w-4 h-4" weight="bold" />
                  </span>
                )}
              </button>
            </form>

            <footer className="mt-12 pt-8 border-t border-[var(--border-faint)]">
              <p className="t-body text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-white font-bold hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1 group"
                >
                  Sign in instead
                  <CaretRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" weight="bold" />
                </Link>
              </p>
            </footer>
          </div>
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

export default function SignUpPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SignUp />
    </Suspense>
  );
}
