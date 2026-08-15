'use client';

import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../components/ToastProvider";
import Loading from "../../components/Loading";
import { tmdbService } from "../../lib/tmdb";
import AuthExperience from "../../components/AuthExperience";

const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";
const CURATED_FILMS = [503919, 531428, 335984, 120467, 70608, 1398, 490, 13475, 290098, 329865, 376867, 496243, 152601, 97370, 373023, 11059, 361292];

const Login = () => {
  const { createToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [backdrop, setBackdrop] = useState("");
  const [movieTitle, setMovieTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateInputs()) return;
    try {
      setSubmitting(true);
      await signInWithEmailAndPassword(auth, email, password);
      createToast("Welcome back", { type: "success", timeout: 2000 });
      router.push("/");
    } catch (error: any) {
      const message = error.message.includes("not-found") || error.message.includes("user-not-found")
        ? "Account not found"
        : error.message.includes("wrong-password") || error.message.includes("invalid-credential")
          ? "Incorrect password"
          : "Sign in failed. Please try again.";
      createToast(message, { type: "error" });
    } finally {
      setSubmitting(false);
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

  if (loading) return <Loading />;

  return <AuthExperience mode="login" backdrop={backdrop} movieTitle={movieTitle} email={email} setEmail={setEmail} password={password} setPassword={setPassword} isVisible={isVisible} toggleVisibility={() => setIsVisible((visible) => !visible)} submitting={submitting} onSubmit={handleSubmit} onResetPassword={resetPassword} />;
};

export default Login;
