'use client';

import { auth } from "../../lib/firebase";
import { Input } from "@heroui/react";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "../../components/ToastProvider";
import { tmdbService } from "../../lib/tmdb";

const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

const Login = () => {
  const { createToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [backdrop, setBackdrop] = useState("");
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
        const data = await tmdbService.getMovieImages(27205);
        if (data.backdrops && data.backdrops.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * Math.min(data.backdrops.length, 10)
          );
          setBackdrop(
            `${BACKDROP_BASE_URL}${data.backdrops[randomIndex].file_path}`
          );
        }
      } catch (error) {
        console.error("Error fetching backdrop:", error);
      }
    };
    fetchBackdrop();
  }, []);

  const validateInputs = () => {
    if (!email || !password) {
      createToast("Please fill in all the fields", {
        type: "error",
        timeout: 3000,
      });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      createToast("Please enter a valid email", {
        type: "error",
        timeout: 3000,
      });
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
      createToast("Welcome back!", { type: "success", timeout: 2000 });
      router.push("/");
    } catch (error: any) {
      setLoggedIn(false);
      const errorMessage = error.message.includes("not-found")
        ? "The user is not found"
        : error.message.includes("wrong-password")
        ? "The password is incorrect"
        : error.message;
      createToast(errorMessage, { type: "error", timeout: 3000 });
    }
  };

  const resetPassword = () => {
    if (!email) {
      createToast("Please enter your email", {
        type: "error",
        timeout: 3000,
      });
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() =>
        createToast("Password reset email sent", {
          type: "success",
          timeout: 3000,
        })
      )
      .catch(() =>
        createToast("Error sending password reset email", {
          type: "error",
          timeout: 3000,
        })
      );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--color-bg-primary)]">
        <div className="w-12 h-12 border-4 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-6"
    >
      {backdrop && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-40"
            style={{ backgroundImage: `url(${backdrop})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/80 to-[var(--color-bg-primary)]/30 backdrop-blur-sm" />
        </>
      )}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-panel p-10 rounded-2xl shadow-2xl border border-white/10 space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-accent-primary)] to-[#FF003C] rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(229,9,20,0.5)] transform rotate-3">
              <LogIn className="text-white h-8 w-8 -rotate-3" />
            </div>
            <h1 className="heading-2 text-white uppercase tracking-widest">
              Welcome Back
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-2 font-medium">
              Sign in to continue watching
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              variant="bordered"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              radius="md"
              classNames={{
                input: "text-white text-base",
                inputWrapper:
                  "bg-white/5 border-white/10 hover:border-white/30 focus-within:!border-[var(--color-accent-primary)] transition-colors h-14",
              }}
              isRequired
            />

            <div className="relative">
              <Input
                type={isVisible ? "text" : "password"}
                variant="bordered"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                radius="md"
                classNames={{
                  input: "text-white text-base",
                  inputWrapper:
                    "bg-white/5 border-white/10 hover:border-white/30 focus-within:!border-[var(--color-accent-primary)] transition-colors h-14",
                }}
                isRequired
              />
              <button
                type="button"
                onClick={toggleVisibility}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-white transition-colors"
              >
                {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loggedIn}
              className="btn btn-primary w-full h-14 text-base mt-2"
            >
              {loggedIn ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center text-sm font-medium text-[var(--color-text-tertiary)] space-y-3 pt-4 border-t border-white/5">
            <p>
              Forgot password?{" "}
              <button
                onClick={resetPassword}
                className="text-white hover:text-[var(--color-accent-primary)] underline-offset-4 hover:underline transition-all"
              >
                Reset here
              </button>
            </p>
            <p>
              New here?{" "}
              <Link
                href="/signup"
                className="text-[var(--color-accent-primary)] hover:text-white underline-offset-4 hover:underline transition-all font-bold tracking-wide uppercase text-xs ml-1"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
