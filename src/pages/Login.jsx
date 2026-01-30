import { BACKEND_URL } from "../services/Api";
import { auth } from "../services/Firebase";
import { Input, Button, Card } from "@heroui/react";
import axios from "axios";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createToast } from "vercel-toast";

const TMDB_API_URL = `${BACKEND_URL}/api/backdrop/movie/27205`;
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

const useAuthListener = (navigate) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/");
      else setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);
  return loading;
};

const fetchBackdrop = async (setBackdrop) => {
  try {
    const { data } = await axios.get(TMDB_API_URL);
    setBackdrop(`${BACKDROP_BASE_URL}${data.backdrops[8].file_path}`);
  } catch (error) {
    console.error("Error fetching backdrop:", error);
  }
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [backdrop, setBackdrop] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const navigate = useNavigate();
  const loading = useAuthListener(navigate);
  const toggleVisibility = () => setIsVisible((prev) => !prev);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    try {
      setLoggedIn(true);
      await signInWithEmailAndPassword(auth, email, password);
      createToast("Welcome back!", { type: "success", timeout: 2000 });
      navigate("/");
    } catch (error) {
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

  useEffect(() => {
    fetchBackdrop(setBackdrop);
  }, []);

  return loading ? (
    <div className="flex justify-center items-center min-h-screen bg-bg-primary text-text-primary">
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-olive-drab"
          style={{ borderTopColor: "transparent" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  ) : (
    <div
      className="relative min-h-screen flex items-center justify-center px-6"
      style={{
        backgroundImage: backdrop ? `url(${backdrop})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {backdrop && (
        <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm" />
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >
        <Card className="bg-bg-secondary border border-border-default p-8 rounded-2xl shadow-xl space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-olive-drab rounded-full flex items-center justify-center mb-3">
              <LogIn className="text-floral-white h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-floral-white">
              Welcome Back
            </h1>
            <p className="text-text-tertiary mt-2">
              Sign in to continue watching
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              variant="bordered"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              radius="lg"
              classNames={{
                input: "text-floral-white",
                inputWrapper:
                  "bg-bg-tertiary border-border-default hover:border-border-hover",
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
                radius="lg"
                classNames={{
                  input: "text-floral-white",
                  inputWrapper:
                    "bg-bg-tertiary border-border-default hover:border-border-hover",
                }}
                isRequired
              />
              <button
                type="button"
                onClick={toggleVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-floral-white transition-colors"
              >
                {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl font-semibold bg-olive-drab text-floral-white hover:bg-olive-drab-hover"
              isLoading={loggedIn}
            >
              {loggedIn ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm text-text-tertiary space-y-2">
            <p>
              Forgot password?{" "}
              <button
                onClick={resetPassword}
                className="text-bone hover:text-bone-hover underline-offset-2 hover:underline transition-all"
              >
                Reset here
              </button>
            </p>
            <p>
              New here?{" "}
              <Link
                to="/signup"
                className="text-bone hover:text-bone-hover underline-offset-2 hover:underline transition-all"
              >
                Create account
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
