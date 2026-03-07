'use client';

import { auth, db } from "../../lib/firebase";
import { Input } from "@heroui/react";
import Filter from "bad-words";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "../../components/ToastProvider";
import { tmdbService } from "../../lib/tmdb";
import Loading from "../../components/Loading";

const checkForBadWords = (text: string) => {
  const filter = new Filter();
  return filter.isProfane(text);
};

const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

const SignUp = () => {
  const { createToast } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backdrop, setBackdrop] = useState("");
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

        // Fetch backdrop
        const data = await tmdbService.getMovieImages(27205);
        if (data.backdrops && data.backdrops.length > 0) {
          setBackdrop(`${BACKDROP_BASE_URL}${data.backdrops[Math.min(9, data.backdrops.length - 1)].file_path}`);
        }

        if (searchParams?.get("verified") === "true") {
          createToast("Your email has been verified.", {
            cancel: "Cancel",
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
        cancel: "Cancel",
        timeout: 3000,
        type: "error",
      });
    }

    if (checkForBadWords(username) || checkForBadWords(email)) {
      setFormLoading(false);
      return createToast(
        "Your username or email contains inappropriate words.",
        { cancel: "Cancel", timeout: 3000, type: "error" }
      );
    }

    if (password.length < 6) {
      setFormLoading(false);
      return createToast("Password must be at least 6 characters.", {
        cancel: "Cancel",
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

      createToast("We have sent you an email for verification.", {
        cancel: "Hide",
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
      createToast("The email is already in use.", {
        action: {
          text: "Login",
          callback(toast) {
            router.push("/login");
            toast.destroy();
          },
        },
        timeout: 3000,
        cancel: "Cancel",
        type: "dark",
      });
    } else {
      createToast(error.message, {
        cancel: "Cancel",
        timeout: 3000,
        type: "error",
      });
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
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
              <UserPlus className="text-white h-8 w-8 -rotate-3" />
            </div>
            <h1 className="heading-2 text-white uppercase tracking-widest">
              Create Account
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-2 font-medium">
              Join Netflyer today
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              type="text"
              variant="bordered"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              radius="md"
              classNames={{
                input: "text-white text-base",
                inputWrapper:
                  "bg-white/5 border-white/10 hover:border-white/30 focus-within:!border-[var(--color-accent-primary)] transition-colors h-14",
              }}
              isRequired
            />
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
                placeholder="Password (min 6 chars)"
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
              disabled={formLoading}
              className="btn btn-primary w-full h-14 text-base mt-2"
            >
              {formLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="text-center text-sm font-medium text-[var(--color-text-tertiary)] pt-4 border-t border-white/5">
            <p>
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[var(--color-accent-primary)] hover:text-white underline-offset-4 hover:underline transition-all font-bold tracking-wide uppercase text-xs ml-1"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
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
