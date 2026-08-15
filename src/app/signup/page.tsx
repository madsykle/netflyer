'use client';

import { auth, db } from "../../lib/firebase";
import { isProfane } from "../../lib/profanity";
import { createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../../components/ToastProvider";
import { tmdbService } from "../../lib/tmdb";
import Loading from "../../components/Loading";
import { env } from "../../lib/env";
import AuthExperience from "../../components/AuthExperience";

const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";
const CURATED_FILMS = [503919, 531428, 335984, 120467, 70608, 1398, 490, 13475, 290098, 329865, 376867, 496243, 152601, 97370, 373023, 11059, 361292];

const SignUp = () => {
  const { createToast } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backdrop, setBackdrop] = useState("");
  const [movieTitle, setMovieTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/");
      else setLoading(false);
    });
    return unsubscribe;
  }, [router]);

  useEffect(() => {
    const fetchBackdrop = async () => {
      try {
        const movie = await tmdbService.getMovieDetails(CURATED_FILMS[Math.floor(Math.random() * CURATED_FILMS.length)]);
        if (movie.backdrop_path) {
          setBackdrop(`${BACKDROP_BASE_URL}${movie.backdrop_path}`);
          setMovieTitle(movie.title);
        }
      } catch (error) {
        console.error("Error fetching backdrop:", error);
      }
    };
    fetchBackdrop();
    if (searchParams?.get("verified") === "true") createToast("Your email has been verified.", { timeout: 3000, type: "success" });
  }, [searchParams, createToast]);

  const handleSignUpError = (error: any) => {
    if (error.message.includes("email-already-in-use")) {
      createToast("Email already in use", { action: { text: "Login", callback(toast: any) { router.push("/login"); toast.destroy(); } }, timeout: 3000, type: "dark" });
    } else {
      createToast(error.message, { timeout: 3000, type: "error" });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    if (!username || !email || !password) {
      setSubmitting(false);
      createToast("Please fill in all the fields.", { timeout: 3000, type: "error" });
      return;
    }
    if (isProfane(username) || isProfane(email)) {
      setSubmitting(false);
      createToast("Your username or email contains inappropriate words.", { timeout: 3000, type: "error" });
      return;
    }
    if (password.length < 6) {
      setSubmitting(false);
      createToast("Password must be at least 6 characters.", { timeout: 3000, type: "error" });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), { username, email: user.email, createdAt: new Date().toISOString() });
      const websiteUrl = env.NEXT_PUBLIC_WEBSITE_URL || window.location.origin;
      await sendEmailVerification(user, { url: `${websiteUrl}/signup?verified=true` });
      createToast("Verification email sent", { timeout: 3000, type: "success" });
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      handleSignUpError(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return <AuthExperience mode="signup" backdrop={backdrop} movieTitle={movieTitle} username={username} setUsername={setUsername} email={email} setEmail={setEmail} password={password} setPassword={setPassword} isVisible={isVisible} toggleVisibility={() => setIsVisible((visible) => !visible)} submitting={submitting} onSubmit={handleSubmit} />;
};

export default function SignUpPage() {
  return <Suspense fallback={<Loading />}><SignUp /></Suspense>;
}
